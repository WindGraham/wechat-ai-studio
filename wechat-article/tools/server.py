#!/usr/bin/env python3
"""WebSocket server that proxies between xterm.js and local PTYs.

Architecture:
  Browser (xterm.js) ↔ ws://localhost:8090 ↔ server.py
    ├── shell/opencode process attached to a real PTY
    └── file watcher: polls article.html for changes every 2s

Message format:
  Browser→Server: plain text  → forwarded to PTY input
  Browser→Server: "TERM_RESIZE:cols:rows" → resizes PTY
  Server→Browser: plain text  ← PTY output
  Server→Browser: "SYSTEM:REFRESH"  ← article.html changed on disk
"""

from __future__ import annotations

import asyncio
import base64
import contextlib
import fcntl
import itertools
import json
import logging
import os
import pty
import shlex
import shutil
import signal
import struct
import subprocess
import sys
import termios
from pathlib import Path
from typing import Optional

import websockets
from websockets.asyncio.server import ServerConnection, serve

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

HOST = os.environ.get("WECHAT_EDITOR_HOST", "localhost")
PORT = int(os.environ.get("WECHAT_EDITOR_PORT", "8090"))
WORKSPACE_PATH = Path(os.environ.get("WECHAT_EDITOR_WORKSPACE", os.getcwd())).expanduser().resolve()
WORKSPACE = str(WORKSPACE_PATH)
ARTICLE_PATH = str(WORKSPACE_PATH / "article.html")
POLL_INTERVAL = 2.0  # seconds
DEFAULT_ALLOWED_ORIGINS = {
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
}

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


def resolve_terminal_command() -> list[str]:
    """Return the command to run inside the PTY.

    ``WECHAT_EDITOR_TERMINAL_CMD`` may be used for local overrides. Without it,
    use the user's shell; opencode is never launched implicitly.
    """
    override = os.environ.get("WECHAT_EDITOR_TERMINAL_CMD")
    if override:
        return shlex.split(override)

    shell = os.environ.get("SHELL") or shutil.which("bash") or "/bin/sh"
    return [shell]


def ensure_workspace() -> None:
    """Create workspace dir and initialise a git repo if missing."""
    os.makedirs(WORKSPACE, exist_ok=True)
    dot_git = os.path.join(WORKSPACE, ".git")
    if not os.path.isdir(dot_git):
        logger.info("Initialising git repo in %s", WORKSPACE)
        os.system(f"git init -q {WORKSPACE}")


def allowed_origins() -> set[str]:
    """Return allowed browser origins for the local WebSocket endpoint."""
    configured = os.environ.get("WECHAT_EDITOR_ALLOWED_ORIGINS")
    if configured:
        return {origin.strip() for origin in configured.split(",") if origin.strip()}
    return DEFAULT_ALLOWED_ORIGINS


def safe_workspace_file(filename: str) -> Path:
    """Resolve *filename* inside WORKSPACE and reject path traversal."""
    if not filename or "\x00" in filename:
        raise ValueError("invalid filename")
    path = (WORKSPACE_PATH / filename).resolve()
    if os.path.commonpath([str(WORKSPACE_PATH), str(path)]) != str(WORKSPACE_PATH):
        raise ValueError("path outside workspace")
    if path.is_dir():
        raise ValueError("path is a directory")
    return path

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
# PTY process management
# ---------------------------------------------------------------------------


class TerminalPty:
    """Manages one PTY-backed terminal process."""

    def __init__(self, session_id: str, title: str) -> None:
        self.id = session_id
        self.title = title
        self.status = "starting"
        self._proc: Optional[subprocess.Popen[bytes]] = None
        self._master_fd: Optional[int] = None
        self._reader_task: Optional[asyncio.Task] = None

    async def start(self, fanout: set[ServerConnection], cols: int = 80, rows: int = 24) -> None:
        """Spawn the terminal process inside the workspace."""
        if self.running:
            return

        args = resolve_terminal_command()
        env = os.environ.copy()
        env.update({
            "TERM": "xterm-256color",
            "COLORTERM": env.get("COLORTERM", "truecolor"),
            "COLUMNS": str(cols),
            "LINES": str(rows),
        })

        master_fd, slave_fd = pty.openpty()
        self._master_fd = master_fd
        os.set_blocking(master_fd, False)

        logger.info("Starting PTY %s: %s (cwd=%s)", self.id, " ".join(args), WORKSPACE)
        try:
            self._proc = subprocess.Popen(
                args,
                stdin=slave_fd,
                stdout=slave_fd,
                stderr=slave_fd,
                cwd=WORKSPACE,
                env=env,
                start_new_session=True,
                close_fds=True,
            )
        finally:
            os.close(slave_fd)

        self.resize(cols, rows)
        self.status = "running"
        self._reader_task = asyncio.create_task(self._relay_output(fanout))

    async def stop(self) -> None:
        """Terminate the PTY process and close the master fd."""
        if self._reader_task is not None and self._reader_task is not asyncio.current_task():
            self._reader_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._reader_task
            self._reader_task = None

        proc = self._proc
        if proc is not None and proc.poll() is None:
            logger.info("Terminating PTY %s process (pid=%s)", self.id, proc.pid)
            try:
                os.killpg(proc.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                await asyncio.wait_for(asyncio.to_thread(proc.wait), timeout=5.0)
            except TimeoutError:
                logger.warning("PTY process did not exit, killing")
                with contextlib.suppress(ProcessLookupError):
                    os.killpg(proc.pid, signal.SIGKILL)
                await asyncio.to_thread(proc.wait)

        if self._master_fd is not None:
            with contextlib.suppress(OSError):
                os.close(self._master_fd)
            self._master_fd = None
        self._proc = None
        if self.status != "exited":
            self.status = "closed"

    @property
    def running(self) -> bool:
        return self._proc is not None and self._proc.poll() is None and self._master_fd is not None

    def write(self, data: str) -> None:
        if self._master_fd is None:
            return
        payload = memoryview(data.encode("utf-8", errors="replace"))
        try:
            while len(payload) > 0:
                written = os.write(self._master_fd, payload)
                if written <= 0:
                    logger.warning("PTY input write returned no progress")
                    break
                payload = payload[written:]
        except BlockingIOError:
            logger.warning("PTY input dropped because fd is not ready")
        except OSError as exc:
            logger.warning("PTY write failed: %s", exc)

    def resize(self, cols: int, rows: int) -> None:
        if self._master_fd is None:
            return
        cols = max(1, int(cols))
        rows = max(1, int(rows))
        packed = struct.pack("HHHH", rows, cols, 0, 0)
        with contextlib.suppress(OSError):
            fcntl.ioctl(self._master_fd, termios.TIOCSWINSZ, packed)

    async def _relay_output(self, fanout: set[ServerConnection]) -> None:
        should_broadcast_exit = True
        try:
            while self.running and self._master_fd is not None:
                try:
                    chunk = os.read(self._master_fd, 4096)
                except BlockingIOError:
                    await asyncio.sleep(0.01)
                    continue
                except OSError:
                    break
                if not chunk:
                    break
                await broadcast_terminal_event({
                    "type": "output",
                    "id": self.id,
                    "data": base64.b64encode(chunk).decode("ascii"),
                })
        except asyncio.CancelledError:
            should_broadcast_exit = False
            raise
        finally:
            if self._reader_task is asyncio.current_task():
                self._reader_task = None

            proc = self._proc
            code = proc.poll() if proc else None
            if should_broadcast_exit and proc is not None and code is None:
                with contextlib.suppress(Exception):
                    code = await asyncio.wait_for(asyncio.to_thread(proc.wait), timeout=0.2)
                if code is None:
                    logger.warning("PTY output ended while process was still running; terminating pid=%s", proc.pid)
                    with contextlib.suppress(ProcessLookupError):
                        os.killpg(proc.pid, signal.SIGTERM)
                    with contextlib.suppress(Exception):
                        code = await asyncio.wait_for(asyncio.to_thread(proc.wait), timeout=1.0)
                if code is None:
                    with contextlib.suppress(ProcessLookupError):
                        os.killpg(proc.pid, signal.SIGKILL)
                    with contextlib.suppress(Exception):
                        code = await asyncio.to_thread(proc.wait)

            if should_broadcast_exit and proc is not None:
                if self._master_fd is not None:
                    with contextlib.suppress(OSError):
                        os.close(self._master_fd)
                    self._master_fd = None
                self._proc = None
                self.status = "exited"

            if should_broadcast_exit:
                await broadcast_terminal_event({"type": "exit", "id": self.id, "code": code})
                await broadcast_terminal_list()

# ---------------------------------------------------------------------------
# WebSocket handler
# ---------------------------------------------------------------------------

# Global state (single process on localhost – simplicity over DI)
_terminals: dict[str, TerminalPty] = {}
_terminal_counter = itertools.count(1)
_fanout: set[ServerConnection] = set()
_client_count = 0
_stop: Optional[asyncio.Event] = None
_watcher_task: Optional[asyncio.Task] = None


def terminal_snapshot() -> list[dict[str, object]]:
    return [
        {"id": term.id, "title": term.title, "status": term.status, "running": term.running}
        for term in _terminals.values()
    ]


async def broadcast_terminal_event(payload: dict[str, object]) -> None:
    await broadcast(_fanout, "TERM_EVENT:" + json.dumps(payload, ensure_ascii=False))


async def broadcast_terminal_list() -> None:
    await broadcast_terminal_event({"type": "list", "terminals": terminal_snapshot()})


async def create_terminal() -> str:
    number = next(_terminal_counter)
    session_id = f"term-{number}"
    title = Path(resolve_terminal_command()[0]).name or "shell"
    term = TerminalPty(session_id, f"{title} {number}")
    _terminals[session_id] = term
    await term.start(_fanout)
    await broadcast_terminal_list()
    return session_id


async def close_terminal(session_id: str) -> None:
    term = _terminals.pop(session_id, None)
    if term is None:
        return
    await term.stop()
    await broadcast_terminal_list()


async def close_all_terminals() -> None:
    for session_id in list(_terminals.keys()):
        await close_terminal(session_id)


def first_terminal_id() -> Optional[str]:
    return next(iter(_terminals), None)


async def handler(websocket: ServerConnection) -> None:
    """Handle one WebSocket client connection."""

    origin = websocket.request.headers.get("Origin") if websocket.request else None
    if origin not in allowed_origins():
        logger.warning("Rejected websocket origin: %s", origin)
        await websocket.close(code=1008, reason="origin not allowed")
        return

    # ------------------------------------------------------------------
    # First client → start PTY + watcher
    # ------------------------------------------------------------------
    global _client_count, _stop, _watcher_task

    _fanout.add(websocket)
    _client_count += 1
    active_terminal_id: Optional[str] = None

    if _client_count == 1:
        if _stop is None or _stop.is_set():
            _stop = asyncio.Event()
        _watcher_task = asyncio.create_task(file_watcher(_fanout, _stop))

    if not _terminals:
        active_terminal_id = await create_terminal()
    else:
        active_terminal_id = first_terminal_id()
        await broadcast_terminal_list()
    if active_terminal_id:
        await websocket.send("TERM_EVENT:" + json.dumps({"type": "active", "id": active_terminal_id}, ensure_ascii=False))

    try:
        # ---- Relay: browser → PTY stdin/control messages ----
        try:
            async for message in websocket:
                if isinstance(message, str):
                    # Intercept structured messages before forwarding to the PTY.

                    if message == "TERM_CREATE":
                        active_terminal_id = await create_terminal()
                        await websocket.send("TERM_EVENT:" + json.dumps({"type": "active", "id": active_terminal_id}, ensure_ascii=False))
                        continue

                    if message.startswith("TERM_SELECT:"):
                        session_id = message.split(":", 1)[1]
                        if session_id in _terminals:
                            active_terminal_id = session_id
                            await websocket.send("TERM_EVENT:" + json.dumps({"type": "active", "id": active_terminal_id}, ensure_ascii=False))
                        continue

                    if message.startswith("TERM_CLOSE:"):
                        session_id = message.split(":", 1)[1]
                        await close_terminal(session_id)
                        if active_terminal_id == session_id:
                            active_terminal_id = first_terminal_id()
                            if active_terminal_id:
                                await websocket.send("TERM_EVENT:" + json.dumps({"type": "active", "id": active_terminal_id}, ensure_ascii=False))
                        continue

                    if message.startswith("TERM_INPUT:"):
                        parts = message.split(":", 2)
                        if len(parts) == 3:
                            term = _terminals.get(parts[1])
                            if term is not None:
                                try:
                                    term.write(base64.b64decode(parts[2]).decode("utf-8", errors="replace"))
                                except Exception as exc:
                                    logger.warning("Invalid terminal input frame: %s", exc)
                        continue

                    if message.startswith("TERM_RESIZE:"):
                        parts = message.split(":")
                        if len(parts) == 4:
                            term = _terminals.get(parts[1])
                            if term is not None:
                                try:
                                    term.resize(int(parts[2]), int(parts[3]))
                                except ValueError:
                                    logger.warning("Invalid resize message: %s", message)
                        elif len(parts) == 3 and active_terminal_id:
                            term = _terminals.get(active_terminal_id)
                            if term is not None:
                                try:
                                    term.resize(int(parts[1]), int(parts[2]))
                                except ValueError:
                                    logger.warning("Invalid resize message: %s", message)
                        continue

                    if message.startswith("TERM_RESTART:"):
                        session_id = message.split(":", 1)[1]
                        old = _terminals.get(session_id)
                        if old is not None:
                            title = old.title
                            await old.stop()
                            term = TerminalPty(session_id, title)
                            _terminals[session_id] = term
                            try:
                                await term.start(_fanout)
                            finally:
                                await broadcast_terminal_list()
                        continue

                    # SAVE_FILE:filename:content
                    if message.startswith("SAVE_FILE:"):
                        parts = message.split(":", 2)
                        if len(parts) >= 3:
                            filename = parts[1]
                            content = parts[2]
                            try:
                                filepath = safe_workspace_file(filename)
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
                            try:
                                filepath = safe_workspace_file(filename)
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

                    if active_terminal_id and active_terminal_id in _terminals:
                        _terminals[active_terminal_id].write(message)
        except websockets.ConnectionClosed:
            pass

    finally:
        # ------------------------------------------------------------------
        # Last client disconnect → stop PTY + watcher
        # ------------------------------------------------------------------
        _fanout.discard(websocket)
        _client_count = max(0, _client_count - 1)

        if _client_count == 0:
            if _watcher_task is not None:
                if _stop is not None:
                    _stop.set()
                _watcher_task.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await _watcher_task
                _watcher_task = None
            await close_all_terminals()


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

    terminal_cmd = resolve_terminal_command()
    logger.info("Using terminal command: %s", " ".join(terminal_cmd))

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
    await close_all_terminals()
    logger.info("Server stopped.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
