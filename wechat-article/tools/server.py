#!/usr/bin/env python3
"""WebSocket server that proxies between xterm.js and an opencode process.

Architecture:
  Browser (xterm.js) ↔ ws://localhost:8090 ↔ server.py
    ├── opencode subprocess (stdin/stdout pipe)
    └── file watcher: polls article.html for changes every 2s

Message format:
  Browser→Server: plain text  → forwarded to opencode stdin
  Server→Browser: plain text  ← opencode stdout
  Server→Browser: "SYSTEM:REFRESH"  ← article.html changed on disk
"""

from __future__ import annotations

import asyncio
import contextlib
import logging
import os
import shutil
import signal
import sys
from typing import Optional

import websockets
from websockets.asyncio.server import ServerConnection, serve

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

HOST = "localhost"
PORT = 8090
WORKSPACE = "/tmp/wechat-editor-workspace"
ARTICLE_PATH = os.path.join(WORKSPACE, "article.html")
POLL_INTERVAL = 2.0  # seconds

logger = logging.getLogger("wechat-server")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def resolve_opencode() -> Optional[str]:
    """Find the opencode binary.  Returns the command name or full path.

    Checks (in order):
      1. ``opencode`` on PATH
      2. ``npx opencode`` as fallback
    """
    if shutil.which("opencode"):
        return "opencode"
    if shutil.which("npx"):
        return "npx"
    return None


def ensure_workspace() -> None:
    """Create workspace dir and initialise a git repo if missing."""
    os.makedirs(WORKSPACE, exist_ok=True)
    dot_git = os.path.join(WORKSPACE, ".git")
    if not os.path.isdir(dot_git):
        logger.info("Initialising git repo in %s", WORKSPACE)
        os.system(f"git init -q {WORKSPACE}")

# ---------------------------------------------------------------------------
# File watcher (polling)
# ---------------------------------------------------------------------------


async def file_watcher(fanout: set[ServerConnection], stop: asyncio.Event) -> None:
    """Poll *ARTICLE_PATH* every *POLL_INTERVAL* seconds.

    When the mtime changes, broadcast ``"SYSTEM:REFRESH"`` to every connected
    client in *fanout*.
    """
    last_mtime: Optional[float] = None
    while not stop.is_set():
        try:
            mtime = os.path.getmtime(ARTICLE_PATH) if os.path.isfile(ARTICLE_PATH) else None
        except OSError:
            mtime = None

        if last_mtime is not None and mtime is not None and mtime > last_mtime:
            logger.info("article.html changed → broadcasting SYSTEM:REFRESH")
            await broadcast(fanout, "SYSTEM:REFRESH")

        last_mtime = mtime

        # Sleep in small chunks so we can react to stop quickly
        try:
            await asyncio.wait_for(stop.wait(), timeout=POLL_INTERVAL)
        except TimeoutError:
            pass


async def broadcast(clients: set[ServerConnection], message: str) -> None:
    """Send *message* to every client, ignoring disconnects."""
    if not clients:
        return
    snapshot = list(clients)
    results = await asyncio.gather(
        *(client.send(message) for client in snapshot),
        return_exceptions=True,
    )
    for client, result in zip(snapshot, results):
        if isinstance(result, Exception):
            logger.debug("Broadcast to %s failed: %s", client.remote_address, result)

# ---------------------------------------------------------------------------
# opencode process management
# ---------------------------------------------------------------------------


class OpencodeProcess:
    """Manages a single opencode subprocess."""

    def __init__(self) -> None:
        self._proc: Optional[asyncio.subprocess.Process] = None
        self.client_count = 0

    async def start(self) -> None:
        """Spawn the opencode process inside the workspace."""
        cmd = resolve_opencode()
        if cmd is None:
            logger.warning("opencode not found in PATH and npx not available")
            return

        if cmd == "npx":
            args = ["npx", "opencode"]
        else:
            args = [cmd]

        logger.info("Starting: %s (cwd=%s)", " ".join(args), WORKSPACE)
        self._proc = await asyncio.create_subprocess_exec(
            *args,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            cwd=WORKSPACE,
        )

    async def stop(self) -> None:
        """Terminate the subprocess (if running)."""
        proc = self._proc
        if proc is None:
            return
        logger.info("Terminating opencode (pid=%s)", proc.pid)
        try:
            proc.terminate()
            try:
                await asyncio.wait_for(proc.wait(), timeout=5.0)
            except TimeoutError:
                logger.warning("opencode did not exit, killing")
                proc.kill()
                await proc.wait()
        except ProcessLookupError:
            pass  # already dead
        finally:
            self._proc = None

    @property
    def running(self) -> bool:
        return self._proc is not None and self._proc.returncode is None

    @property
    def stdin(self):
        return self._proc.stdin if self._proc else None

    @property
    def stdout(self):
        return self._proc.stdout if self._proc else None

    @property
    def returncode(self):
        return self._proc.returncode if self._proc else None

# ---------------------------------------------------------------------------
# WebSocket handler
# ---------------------------------------------------------------------------

# Global state (single process on localhost – simplicity over DI)
_opencode = OpencodeProcess()
_fanout: set[ServerConnection] = set()
_stop: Optional[asyncio.Event] = None
_watcher_task: Optional[asyncio.Task] = None


async def handler(websocket: ServerConnection) -> None:
    """Handle one WebSocket client connection."""

    # ------------------------------------------------------------------
    # First client → start opencode + watcher
    # ------------------------------------------------------------------
    global _stop, _watcher_task

    _fanout.add(websocket)
    _opencode.client_count += 1

    if _opencode.client_count == 1:
        if _stop is None or _stop.is_set():
            _stop = asyncio.Event()
        _watcher_task = asyncio.create_task(file_watcher(_fanout, _stop))
        await _opencode.start()

    try:
        # ---- Relay: opencode stdout → browser ----
        async def relay_stdout() -> None:
            if _opencode.stdout is None:
                return
            try:
                while True:
                    chunk = await _opencode.stdout.read(4096)
                    if not chunk:
                        break
                    try:
                        await websocket.send(chunk.decode("utf-8", errors="replace"))
                    except websockets.ConnectionClosed:
                        break
            except asyncio.CancelledError:
                pass
            except Exception:
                logger.exception("relay_stdout error")

        relay_task = asyncio.create_task(relay_stdout())

        # ---- Relay: browser → opencode stdin ----
        try:
            async for message in websocket:
                if isinstance(message, str):
                    # Intercept structured messages before forwarding to opencode

                    # SAVE_FILE:filename:content
                    if message.startswith("SAVE_FILE:"):
                        parts = message.split(":", 2)
                        if len(parts) >= 3:
                            filename = parts[1]
                            content = parts[2]
                            filepath = os.path.join(WORKSPACE, filename)
                            try:
                                with open(filepath, "w", encoding="utf-8") as f:
                                    f.write(content)
                                logger.info("Saved file: %s (%d bytes)", filename, len(content))
                                await websocket.send(f"OK:SAVED:{filename}")
                            except Exception as exc:
                                logger.error("Failed to save %s: %s", filename, exc)
                                await websocket.send(f"ERROR:SAVE:{filename}:{exc}")
                        continue

                    # LOAD_FILE:filename
                    if message.startswith("LOAD_FILE:"):
                        parts = message.split(":", 1)
                        if len(parts) >= 2:
                            filename = parts[1]
                            filepath = os.path.join(WORKSPACE, filename)
                            try:
                                if os.path.isfile(filepath):
                                    with open(filepath, "r", encoding="utf-8") as f:
                                        content = f.read()
                                    await websocket.send(f"FILE:{filename}\n{content}")
                                    logger.info("Loaded file: %s (%d bytes)", filename, len(content))
                                else:
                                    await websocket.send(f"ERROR:NOT_FOUND:{filename}")
                                    logger.warning("File not found: %s", filepath)
                            except Exception as exc:
                                logger.error("Failed to load %s: %s", filename, exc)
                                await websocket.send(f"ERROR:LOAD:{filename}:{exc}")
                        continue

                    # Forward to opencode
                    if _opencode.stdin is not None:
                        _opencode.stdin.write(message.encode("utf-8"))
                        await _opencode.stdin.drain()
        except websockets.ConnectionClosed:
            pass
        finally:
            relay_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await relay_task

    finally:
        # ------------------------------------------------------------------
        # Last client disconnect → stop opencode + watcher
        # ------------------------------------------------------------------
        _fanout.discard(websocket)
        _opencode.client_count = max(0, _opencode.client_count - 1)

        if _opencode.client_count == 0:
            if _watcher_task is not None:
                if _stop is not None:
                    _stop.set()
                _watcher_task.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await _watcher_task
                _watcher_task = None
            await _opencode.stop()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def _setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stdout,
    )


async def main() -> None:
    _setup_logging()

    # Warn if opencode is missing
    cmd = resolve_opencode()
    if cmd is None:
        logger.warning("opencode not found in PATH and npx not available – terminal will be blank")
    else:
        display = cmd if cmd != "npx" else "npx opencode"
        logger.info("Using opencode via: %s", display)

    ensure_workspace()

    stop_server = asyncio.Event()

    # Graceful shutdown on SIGINT / SIGTERM
    def _schedule_shutdown(*args: object) -> None:
        logger.info("Shutting down...")
        stop_server.set()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _schedule_shutdown)
        except NotImplementedError:
            # Windows / some event loops don't support add_signal_handler
            signal.signal(sig, _schedule_shutdown)

    logger.info("WebSocket server: ws://%s:%d", HOST, PORT)
    logger.info("Workspace: %s", WORKSPACE)

    async with serve(handler, HOST, PORT) as server:
        try:
            await stop_server.wait()
        except asyncio.CancelledError:
            pass

    # Cleanup
    global _watcher_task, _stop
    if _stop is not None:
        _stop.set()
    if _watcher_task is not None:
        _watcher_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await _watcher_task
    await _opencode.stop()
    logger.info("Server stopped.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
