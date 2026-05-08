#!/usr/bin/env python3
"""WeChat Official Account Auto-Publish Script"""

import requests
import json
import re
import os

DRAFT_ID_FILE = ".wechat_draft_id"

def get_access_token(appid, appsecret):
    url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={appsecret}"
    response = requests.get(url)
    data = response.json()
    return data.get("access_token")

def upload_thumb_image(access_token):
    """Upload thumbnail (required)"""
    url = f"https://api.weixin.qq.com/cgi-bin/material/add_material?access_token={access_token}&type=thumb"
    # Download and upload a 200x200 thumbnail
    thumb_url = "https://picsum.photos/200/200"
    response = requests.get(thumb_url)
    with open("/tmp/thumb.jpg", "wb") as f:
        f.write(response.content)
    
    with open("/tmp/thumb.jpg", "rb") as f:
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

def create_or_update_draft(access_token, title, content, media_id=None):
    """Create new draft or update existing"""
    thumb_media_id = upload_thumb_image(access_token)
    
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
                "author": "AI助手",
                "digest": "文章摘要",
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
                "author": "AI助手",
                "digest": "文章摘要",
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

def publish_article(appid, appsecret, title, html_content):
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
    return create_or_update_draft(token, title, html_content, media_id)
