#!/usr/bin/env python3
"""WeChat Official Account Auto-Publish Script"""

import requests
import json
import re
import os

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
    response = requests.get(url)
    data = response.json()
    return data.get("access_token")

def upload_thumb_image(access_token, thumb_source):
    """Upload user-provided thumbnail image (required)."""
    url = f"https://api.weixin.qq.com/cgi-bin/material/add_material?access_token={access_token}&type=thumb"

    if not thumb_source:
        raise ValueError("thumb_source is required; provide a local image path or HTTPS image URL.")

    if thumb_source.startswith(("http://", "https://")):
        response = requests.get(thumb_source)
        response.raise_for_status()
        with open("/tmp/wechat_thumb.jpg", "wb") as f:
            f.write(response.content)
        upload_path = "/tmp/wechat_thumb.jpg"
    else:
        upload_path = thumb_source

    if not os.path.exists(upload_path):
        raise FileNotFoundError(f"Thumbnail image not found: {upload_path}")

    with open(upload_path, "rb") as f:
        files = {"media": f}
        response = requests.post(url, files=files)
        data = response.json()
    
    return data.get("media_id")

def upload_content_image(access_token, image_url):
    """Upload content image to WeChat CDN"""
    response = requests.get(image_url)
    if response.status_code != 200:
        return None
    
    with open("/tmp/content_img.jpg", "wb") as f:
        f.write(response.content)
    
    url = f"https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token={access_token}"
    with open("/tmp/content_img.jpg", "rb") as f:
        files = {"media": f}
        response = requests.post(url, files=files)
        data = response.json()
    
    return data.get("url")

def process_html_images(access_token, html_content):
    """Replace all image URLs with WeChat CDN URLs"""
    img_pattern = r'<img[^>]+src="([^"]+)"'
    urls = re.findall(img_pattern, html_content)
    
    for original_url in urls:
        if original_url.startswith("http") and "mmbiz.qpic.cn" not in original_url:
            wechat_url = upload_content_image(access_token, original_url)
            if wechat_url:
                html_content = html_content.replace(original_url, wechat_url)
    
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
    result = response.json()
    
    if "media_id" in result:
        # Save draft ID
        with open(DRAFT_ID_FILE, "w") as f:
            f.write(result["media_id"])
        return result["media_id"]
    elif result.get("errcode") == 0:
        return media_id  # Update success
    else:
        print(f"Error: {result}")
        return None

def publish_article(appid, appsecret, title, html_content, thumb_source, author, digest=None):
    """Main entry point"""
    token = get_access_token(appid, appsecret)
    if not token:
        return None
    
    # Process images
    html_content = process_html_images(token, html_content)
    
    # Check for existing draft ID
    media_id = None
    if os.path.exists(DRAFT_ID_FILE):
        with open(DRAFT_ID_FILE, "r") as f:
            media_id = f.read().strip()
    
    # Create or update draft
    return create_or_update_draft(token, title, html_content, thumb_source, author, digest, media_id)
