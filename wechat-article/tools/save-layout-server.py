#!/usr/bin/env python3
"""Mini CORS-enabled HTTP server to receive layout JSON from the composer."""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

SAVE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "layout-draft.json")

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8")
        data = json.loads(body)
        with open(SAVE_PATH, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"saved": True, "path": SAVE_PATH}).encode())
        print(f"Layout saved to {SAVE_PATH} ({len(data.get('components', []))} components)")

    def log_message(self, fmt, *args):
        # suppress default logging noise
        pass

if __name__ == "__main__":
    server = HTTPServer(("localhost", 8081), Handler)
    print(f"Layout receiver running at http://localhost:8081")
    print(f"Will save to: {SAVE_PATH}")
    server.serve_forever()
