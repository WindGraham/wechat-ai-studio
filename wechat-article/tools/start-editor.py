#!/usr/bin/env python3
"""Start the WeChat editor, AI terminal backend, and browser together."""

from __future__ import annotations

import argparse
import functools
import http.server
import json
import os
import signal
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path
from urllib.parse import quote, unquote, urlencode


TOOLS_DIR = Path(__file__).resolve().parent
SERVER_SCRIPT = TOOLS_DIR / "server.py"
LOCAL_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}


class WechatEditorHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Serve editor assets plus a workspace-local image folder."""

    def __init__(self, *args: object, directory: str | None = None, workspace: Path | None = None, **kwargs: object) -> None:
        self.workspace = (workspace or Path.cwd()).resolve()
        self.project_data_dir = self.workspace / ".wechat-ai-publisher"
        self.local_images_dir = self.project_data_dir / "local-images"
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == "/local-images.json":
            self._send_local_images_index()
            return
        super().do_GET()

    def translate_path(self, path: str) -> str:
        request_path = path.split("?", 1)[0].split("#", 1)[0]
        if request_path.startswith("/local-images/"):
            name = unquote(request_path.rsplit("/", 1)[-1])
            safe_name = Path(name).name
            candidate = (self.local_images_dir / safe_name).resolve()
            try:
                if os.path.commonpath([str(self.local_images_dir.resolve()), str(candidate)]) == str(self.local_images_dir.resolve()):
                    return str(candidate)
            except ValueError:
                pass
        return super().translate_path(path)

    def _send_local_images_index(self) -> None:
        self.local_images_dir.mkdir(parents=True, exist_ok=True)
        items = []
        for path in sorted(self.local_images_dir.iterdir(), key=lambda item: item.name.lower()):
            if not path.is_file() or path.suffix.lower() not in LOCAL_IMAGE_EXTENSIONS:
                continue
            stat = path.stat()
            items.append({
                "name": path.name,
                "url": "/local-images/" + quote(path.name),
                "size": stat.st_size,
                "mtime": int(stat.st_mtime),
            })
        payload = json.dumps({"directory": str(self.local_images_dir), "items": items}, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Start editor.html plus the local AI terminal backend.",
    )
    parser.add_argument("--host", default="localhost", help="Bind host for both services. Default: localhost")
    parser.add_argument("--http-port", type=int, default=8080, help="Static editor HTTP port. Default: 8080")
    parser.add_argument("--terminal-port", type=int, default=8090, help="Terminal WebSocket port. Default: 8090")
    parser.add_argument("--workspace", default=".", help="Article workspace for terminals and file sync. Default: current directory")
    parser.add_argument("--terminal-cmd", help="Override the terminal command, for example: opencode")
    parser.add_argument("--opencode", action="store_true", help="Start new terminals with opencode instead of the default shell")
    parser.add_argument("--no-browser", action="store_true", help="Do not open the browser automatically")
    return parser.parse_args()


def port_is_free(host: str, port: int) -> bool:
    probe_host = "127.0.0.1" if host in {"localhost", "0.0.0.0"} else host
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        return sock.connect_ex((probe_host, port)) != 0


def kill_process_on_port(port: int) -> bool:
    """Kill any process listening on *port*. Return True if something was killed."""
    killed = False
    # Try lsof first (most common on macOS/Linux)
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True, text=True, timeout=2
        )
        if result.returncode == 0:
            for line in result.stdout.strip().splitlines():
                pid = line.strip()
                if pid.isdigit():
                    try:
                        os.kill(int(pid), signal.SIGTERM)
                        killed = True
                    except (OSError, ProcessLookupError):
                        pass
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    if killed:
        time.sleep(0.6)
        # Check again — if still occupied, SIGKILL
        try:
            result = subprocess.run(
                ["lsof", "-ti", f":{port}"],
                capture_output=True, text=True, timeout=2
            )
            if result.returncode == 0:
                for line in result.stdout.strip().splitlines():
                    pid = line.strip()
                    if pid.isdigit():
                        try:
                            os.kill(int(pid), signal.SIGKILL)
                        except (OSError, ProcessLookupError):
                            pass
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        return True

    # Fallback: fuser (Linux only)
    try:
        subprocess.run(
            ["fuser", "-k", f"{port}/tcp"],
            capture_output=True, timeout=2
        )
        return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    return False


def require_free_port(host: str, port: int, label: str) -> None:
    if not port_is_free(host, port):
        print(f"{label} port {port} is already in use. Trying to stop the existing process...")
        if kill_process_on_port(port):
            time.sleep(0.5)
        if not port_is_free(host, port):
            raise SystemExit(f"{label} port {port} is still in use after attempting to stop. Choose another port or stop it manually.")


def editor_url(host: str, http_port: int, terminal_port: int) -> str:
    display_host = "localhost" if host == "0.0.0.0" else host
    query = ""
    if terminal_port != 8090:
        query = "?" + urlencode({"terminalPort": str(terminal_port)})
    return f"http://{display_host}:{http_port}/editor.html{query}"


def allowed_origins(host: str, http_port: int) -> str:
    hosts = {host, "localhost", "127.0.0.1"}
    hosts.discard("0.0.0.0")
    return ",".join(sorted(f"http://{item}:{http_port}" for item in hosts))


def start_http_server(host: str, port: int, workspace: Path) -> http.server.ThreadingHTTPServer:
    handler = functools.partial(WechatEditorHTTPRequestHandler, directory=str(TOOLS_DIR), workspace=workspace)
    httpd = http.server.ThreadingHTTPServer((host, port), handler)
    thread = threading.Thread(target=httpd.serve_forever, name="wechat-editor-http", daemon=True)
    thread.start()
    return httpd


def start_terminal_server(args: argparse.Namespace) -> subprocess.Popen[str]:
    env = os.environ.copy()
    workspace = Path(args.workspace).expanduser().resolve()
    workspace.mkdir(parents=True, exist_ok=True)
    env["WECHAT_EDITOR_HOST"] = args.host
    env["WECHAT_EDITOR_PORT"] = str(args.terminal_port)
    env["WECHAT_EDITOR_WORKSPACE"] = str(workspace)
    env["WECHAT_EDITOR_ALLOWED_ORIGINS"] = allowed_origins(args.host, args.http_port)
    if args.opencode:
        env["WECHAT_EDITOR_TERMINAL_CMD"] = "opencode"
    elif args.terminal_cmd:
        env["WECHAT_EDITOR_TERMINAL_CMD"] = args.terminal_cmd

    return subprocess.Popen(
        [sys.executable, str(SERVER_SCRIPT)],
        cwd=str(TOOLS_DIR),
        env=env,
        text=True,
        start_new_session=True,
    )


def stop_process(proc: subprocess.Popen[str]) -> None:
    if proc.poll() is not None:
        return
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    except OSError:
        proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except OSError:
            proc.kill()
        proc.wait(timeout=5)


def main() -> int:
    args = parse_args()
    workspace = Path(args.workspace).expanduser().resolve()
    workspace.mkdir(parents=True, exist_ok=True)
    (workspace / ".wechat-ai-publisher" / "local-images").mkdir(parents=True, exist_ok=True)
    require_free_port(args.host, args.http_port, "HTTP")
    require_free_port(args.host, args.terminal_port, "Terminal WebSocket")

    httpd = start_http_server(args.host, args.http_port, workspace)
    terminal_proc = start_terminal_server(args)
    url = editor_url(args.host, args.http_port, args.terminal_port)

    print("WeChat editor is running.")
    print(f"Editor:   {url}")
    print(f"Terminal: ws://{args.host}:{args.terminal_port}")
    print(f"Workspace: {workspace}")
    print(f"Local images: {workspace / '.wechat-ai-publisher' / 'local-images'}")
    print("Press Ctrl+C here to stop both services.")

    if not args.no_browser:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()

    try:
        while terminal_proc.poll() is None:
            time.sleep(0.5)
        return terminal_proc.returncode or 0
    except KeyboardInterrupt:
        print("\nStopping editor services...")
        return 0
    finally:
        httpd.shutdown()
        httpd.server_close()
        stop_process(terminal_proc)


if __name__ == "__main__":
    raise SystemExit(main())
