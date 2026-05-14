#!/usr/bin/env python3
"""WeChat Official Account Auto-Publish Script"""

import requests
import json
import re
import os
import tempfile

DRAFT_ID_FILE = ".wechat_draft_id"
DIGEST_MAX_LENGTH = 120

def build_digest(html_content, digest=None):
    """Use the provided digest, or derive one from article text."""
    if digest:
        return digest[:DIGEST_MAX_LENGTH]

    text = re.sub(r"<[^>]+>", "", html_content)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:DIGEST_MAX_LENGTH]

def get_access_token(appid, appsecret):
    url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={appsecret}"
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    data = response.json()
    token = data.get("access_token")
    if not token:
        raise ValueError(f"Failed to get WeChat access_token: {data}")
    return token

def upload_thumb_image(access_token, thumb_source):
    """Upload user-provided thumbnail image (required)."""
    url = f"https://api.weixin.qq.com/cgi-bin/material/add_material?access_token={access_token}&type=thumb"

    if not thumb_source:
        raise ValueError("thumb_source is required; provide a local image path or HTTPS image URL.")

    tmp_path = None
    if thumb_source.startswith(("http://", "https://")):
        response = requests.get(thumb_source, timeout=30)
        response.raise_for_status()
        suffix = os.path.splitext(thumb_source.split("?", 1)[0])[1] or ".jpg"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(response.content)
            tmp_path = tmp.name
        upload_path = tmp_path
    else:
        upload_path = thumb_source

    if not os.path.exists(upload_path):
        raise FileNotFoundError(f"Thumbnail image not found: {upload_path}")

    try:
        with open(upload_path, "rb") as f:
            files = {"media": f}
            response = requests.post(url, files=files, timeout=30)
            response.raise_for_status()
            data = response.json()
        media_id = data.get("media_id")
        if not media_id:
            raise ValueError(f"Failed to upload thumbnail to WeChat: {data}")
        return media_id
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

def upload_content_image(access_token, image_url):
    """Upload content image to WeChat CDN"""
    response = requests.get(image_url, timeout=30)
    if response.status_code != 200:
        return None

    suffix = os.path.splitext(image_url.split("?", 1)[0])[1] or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(response.content)
        tmp_path = tmp.name

    try:
        url = f"https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token={access_token}"
        with open(tmp_path, "rb") as f:
            files = {"media": f}
            response = requests.post(url, files=files, timeout=30)
            response.raise_for_status()
            data = response.json()
        return data.get("url")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

def process_html_images(access_token, html_content):
    """Replace HTML img src and SVG image href URLs with WeChat CDN URLs."""
    def replace_url_parts(prefix, url, suffix, original):
        url = (url or "").strip()
        normalized = url.lower()
        if not url:
            return original
        if normalized.startswith("data:") or normalized.startswith("file:") or normalized.startswith("//"):
            raise ValueError(f"Unsupported embedded/local image URL for WeChat API publish: {url[:40]}")
        if "mmbiz.qpic.cn" in normalized:
            if not normalized.startswith("https://"):
                raise ValueError(f"WeChat CDN image URL must be HTTPS: {url}")
            return original
        if normalized.startswith(("http://", "https://")) and "mmbiz.qpic.cn" not in normalized:
            wechat_url = upload_content_image(access_token, url)
            if not wechat_url:
                raise ValueError(f"Failed to upload content image to WeChat CDN: {url}")
            return f"{prefix}{wechat_url}{suffix}"
        raise ValueError(f"Image URL must be public HTTP(S) or WeChat CDN before API publish: {url}")

    def replace_url(match):
        prefix, url, suffix = match.groups()
        return replace_url_parts(prefix, url, suffix, match.group(0))

    html_content = re.sub(
        r'(<img\b[^>]*?\ssrc\s*=\s*["\'])([^"\']+)(["\'])',
        replace_url,
        html_content,
        flags=re.IGNORECASE,
    )

    def replace_svg_xlink(match):
        before, quote, url, suffix = match.groups()
        return replace_url_parts(before + "href=" + quote, url, suffix, match.group(0))

    html_content = re.sub(
        r'(<image\b[^>]*?\s)xlink:href\s*=\s*(["\'])([^"\']+)(["\'])',
        replace_svg_xlink,
        html_content,
        flags=re.IGNORECASE,
    )
    html_content = re.sub(
        r'(<image\b[^>]*?\shref\s*=\s*["\'])([^"\']+)(["\'])',
        replace_url,
        html_content,
        flags=re.IGNORECASE,
    )
    return html_content

def create_or_update_draft(access_token, title, content, thumb_source, author, digest=None, media_id=None):
    """Create new draft or update existing"""
    if not author:
        raise ValueError("author is required; ask the user for the article author before publishing.")

    thumb_media_id = upload_thumb_image(access_token, thumb_source)
    article_digest = build_digest(content, digest)
    
    if media_id:
        # Update existing
        url = f"https://api.weixin.qq.com/cgi-bin/draft/update?access_token={access_token}"
        data = {
            "media_id": media_id,
            "index": 0,
            "articles": {
                "title": title,
                "content": content,
                "thumb_media_id": thumb_media_id,
                "author": author,
                "digest": article_digest,
                "need_open_comment": 1,
                "only_fans_can_comment": 0
            }
        }
    else:
        # Create new
        url = f"https://api.weixin.qq.com/cgi-bin/draft/add?access_token={access_token}"
        data = {
            "articles": [{
                "title": title,
                "content": content,
                "thumb_media_id": thumb_media_id,
                "author": author,
                "digest": article_digest,
                "need_open_comment": 1,
                "only_fans_can_comment": 0
            }]
        }
    
    response = requests.post(
        url,
        data=json.dumps(data, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"}
    )
    response.raise_for_status()
    result = response.json()
    
    if "media_id" in result:
        # Save draft ID
        with open(DRAFT_ID_FILE, "w") as f:
            f.write(result["media_id"])
        return result["media_id"]
    elif result.get("errcode") == 0:
        return media_id  # Update success
    else:
        raise ValueError(f"WeChat draft API failed: {result}")

def publish_article(appid, appsecret, title, html_content, thumb_source, author, digest=None):
    """Main entry point"""
    token = get_access_token(appid, appsecret)
    
    # Process images
    html_content = process_html_images(token, html_content)
    
    # Check for existing draft ID
    media_id = None
    if os.path.exists(DRAFT_ID_FILE):
        with open(DRAFT_ID_FILE, "r") as f:
            media_id = f.read().strip()
    
    # Create or update draft
    return create_or_update_draft(token, title, html_content, thumb_source, author, digest, media_id)
