#!/usr/bin/env python3
"""Mini CORS-enabled HTTP server to receive layout JSON from the composer."""

import json
import os
import re
from http.server import HTTPServer, BaseHTTPRequestHandler

PROJECT_ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
LAYOUT_PATH = os.path.join(PROJECT_ROOT, "layout-draft.json")
TEMPLATE_PATH = os.path.join(PROJECT_ROOT, "template-source.html")
TEMPLATE_META_PATH = os.path.join(PROJECT_ROOT, "template-meta.json")


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

        if self.path == "/save-template":
            self._handle_save_template(data)
        else:
            self._handle_save_layout(data)

    def _handle_save_layout(self, data):
        with open(LAYOUT_PATH, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        self._respond({"saved": True, "path": LAYOUT_PATH})
        print(f"Layout saved to {LAYOUT_PATH} ({len(data.get('components', []))} components)")

    def _handle_save_template(self, data):
        html = data.get("html", "")
        title = data.get("title", "")
        save_path = data.get("savePath", "")

        # use user-configured path if valid, else fall back to project root
        if save_path and os.path.isdir(save_path):
            out_dir = save_path
        else:
            out_dir = PROJECT_ROOT

        # auto-increment: find next 排版N folder
        n = self._next_paiban(out_dir)
        folder_name = f"排版{n}"
        folder_path = os.path.join(out_dir, folder_name)
        os.makedirs(folder_path, exist_ok=True)

        template_file = os.path.join(folder_path, "template-source.html")
        meta_file = os.path.join(folder_path, "template-meta.json")

        # build a standalone HTML file from the captured fragment
        doc = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{self._esc(title) or "Template Source"}</title>
</head>
<body style="margin:0; padding:0; background:#fff;">
{html}
</body>
</html>"""

        with open(template_file, "w") as f:
            f.write(doc)

        meta = {
            "title": title,
            "sourceUrl": data.get("sourceUrl", ""),
            "capturedAt": data.get("capturedAt", ""),
            "sizeBytes": len(html),
            "desc": data.get("desc", ""),
            "wxAuthor": data.get("wxAuthor", "")
        }
        with open(meta_file, "w") as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)

        self._respond({"saved": True, "path": template_file, "folder": folder_name, "sizeBytes": len(html)})
        print(f"Template saved to {template_file} ({len(html)} chars)")

    def _next_paiban(self, base_dir):
        """Find next available 排版N number."""
        max_n = 0
        if os.path.isdir(base_dir):
            for name in os.listdir(base_dir):
                m = re.match(r"^排版(\d+)$", name)
                if m and os.path.isdir(os.path.join(base_dir, name)):
                    max_n = max(max_n, int(m.group(1)))
        return max_n + 1

    def _respond(self, data):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())

    @staticmethod
    def _esc(s):
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    server = HTTPServer(("localhost", 8081), Handler)
    print(f"Layout receiver running at http://localhost:8081")
    print(f"  Layout save path: {LAYOUT_PATH}")
    print(f"  Template save path: {TEMPLATE_PATH}")
    server.serve_forever()
