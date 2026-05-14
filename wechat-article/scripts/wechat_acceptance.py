#!/usr/bin/env python3
"""Local acceptance checks for WeChat article HTML."""

import argparse
import json
import re
import sys
from html.parser import HTMLParser


class WeChatHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.images = []
        self.svg_images = []

    def handle_starttag(self, tag, attrs):
        attrs = {name.lower(): value or "" for name, value in attrs}
        tag = tag.lower()
        self.tags.append((tag, attrs))
        if tag == "img":
            self.images.append(attrs.get("src", ""))
        if tag == "image":
            self.svg_images.append(attrs.get("href") or attrs.get("xlink:href") or "")


def issue(severity, code, message):
    return {"severity": severity, "code": code, "message": message}


def validate_wechat_html(html, mode="manual-paste"):
    parser = WeChatHTMLParser()
    parser.feed(html)
    issues = []
    checks = [
        ("error", "forbidden-script", r"<script\b|javascript:"),
        ("error", "forbidden-iframe", r"<iframe\b"),
        ("warn", "interactive-control", r"<(form|input|button|textarea|select)\b"),
        ("warn", "class-or-id", r"\s(class|id)\s*="),
        ("warn", "absolute-position", r"position\s*:\s*(absolute|fixed)"),
        ("warn", "flex-layout", r"display\s*:\s*flex"),
        ("error", "grid-layout", r"display\s*:\s*grid"),
        ("warn", "css-animation", r"(animation|transition)\s*:"),
        ("error", "svg-foreign-object", r"<foreignObject\b"),
        ("error", "svg-filter", r"<(filter|fe[A-Z][A-Za-z]*)\b"),
        ("error", "svg-gradient", r"<(linearGradient|radialGradient|stop)\b"),
        ("error", "svg-clip-mask-path", r"<(clipPath|textPath|mask)\b"),
        ("error", "svg-xlink", r"\sxlink:href\s*="),
        ("error", "matrix-or-3d-transform", r"(matrix\s*\(|rotate[XYZ]\s*\(|perspective\s*\()"),
        ("error", "svg-animate-transform-matrix", r"<animateTransform\b[^>]*\btype=['\"]?(matrix|matrix3d|rotateX|rotateY|rotateZ|translateZ|perspective)"),
        ("error", "data-uri", r"(src|href)\s*=\s*['\"]data:"),
    ]
    for severity, code, pattern in checks:
        if re.search(pattern, html, re.IGNORECASE):
            issues.append(issue(severity, code, f"Matched unsupported WeChat pattern: {code}"))

    for index, src in enumerate(parser.images, start=1):
        value = (src or "").strip()
        if not value:
            issues.append(issue("error", "empty-img-src", f"img #{index} has empty src"))
        elif value.startswith(("data:", "file:", "//")) or not re.match(r"https?://", value, re.I):
            issues.append(issue("error", "non-public-img-src", f"img #{index} is not public HTTP(S): {value[:80]}"))
        elif mode == "api-draft" and "mmbiz.qpic.cn" not in value.lower():
            issues.append(issue("error", "api-img-not-wechat-cdn", f"img #{index} is not on WeChat CDN"))

    for index, href in enumerate(parser.svg_images, start=1):
        value = (href or "").strip()
        if not value:
            issues.append(issue("error", "empty-svg-image-href", f"svg image #{index} has empty href"))
        elif not value.lower().startswith("https://"):
            issues.append(issue("error", "svg-image-not-https", f"svg image #{index} is not HTTPS"))
        elif mode == "api-draft" and "mmbiz.qpic.cn" not in value.lower():
            issues.append(issue("error", "api-svg-image-not-wechat-cdn", f"svg image #{index} is not on WeChat CDN"))

    return issues


def build_report(html, mode):
    issues = validate_wechat_html(html, mode)
    return {
        "ok": not any(item["severity"] == "error" for item in issues),
        "mode": mode,
        "issue_count": len(issues),
        "issues": issues,
    }


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("html_file")
    parser.add_argument("--mode", choices=["manual-paste", "api-draft"], default="manual-paste")
    args = parser.parse_args(argv)
    with open(args.html_file, "r", encoding="utf-8") as f:
        html = f.read()
    report = build_report(html, args.mode)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
