#!/usr/bin/env python3
"""
WeChat Official Account Auto-Publish Script
自动发布微信公众号文章到草稿箱
"""

import requests
import json
import re
import os

DRAFT_ID_FILE = ".wechat_draft_id"

def get_access_token(appid, appsecret):
    """获取 access_token"""
    url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={appsecret}"
    response = requests.get(url)
    data = response.json()
    return data.get("access_token")

def upload_thumb_image(access_token):
    """上传缩略图到微信素材库（必填）"""
    url = f"https://api.weixin.qq.com/cgi-bin/material/add_material?access_token={access_token}&type=thumb"
    
    # 下载一张缩略图（200x200）
    thumb_url = "https://picsum.photos/200/200"
    response = requests.get(thumb_url)
    if response.status_code != 200:
        return None
    
    with open("/tmp/thumb.jpg", "wb") as f:
        f.write(response.content)
    
    with open("/tmp/thumb.jpg", "rb") as f:
        files = {"media": f}
        response = requests.post(url, files=files)
        data = response.json()
    
    return data.get("media_id")

def upload_content_image(access_token, image_url):
    """上传正文图片到微信素材库"""
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
    """处理 HTML 中的所有图片，替换为微信 CDN 链接"""
    img_pattern = r'<img[^>]+src="([^"]+)"'
    urls = re.findall(img_pattern, html_content)
    
    for original_url in urls:
        if original_url.startswith("http") and "mmbiz.qpic.cn" not in original_url:
            wechat_url = upload_content_image(access_token, original_url)
            if wechat_url:
                html_content = html_content.replace(original_url, wechat_url)
    
    return html_content

def create_or_update_draft(access_token, title, content, media_id=None):
    """创建新草稿或更新现有草稿"""
    thumb_media_id = upload_thumb_image(access_token)
    
    if media_id:
        # 更新现有草稿
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
        # 创建新草稿
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
    
    # 关键：使用 ensure_ascii=False 防止中文变 Unicode
    response = requests.post(
        url,
        data=json.dumps(data, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"}
    )
    result = response.json()
    
    if "media_id" in result:
        # 保存草稿 ID
        with open(DRAFT_ID_FILE, "w") as f:
            f.write(result["media_id"])
        return result["media_id"]
    elif result.get("errcode") == 0:
        return media_id  # 更新成功
    else:
        print(f"Error: {result}")
        return None

def publish_article(appid, appsecret, title, html_content):
    """
    主入口函数
    
    Args:
        appid: 微信公众号 AppID
        appsecret: 微信公众号 AppSecret
        title: 文章标题
        html_content: 文章 HTML 内容
    
    Returns:
        media_id: 草稿 ID，失败返回 None
    """
    token = get_access_token(appid, appsecret)
    if not token:
        return None
    
    # 处理图片（上传到微信 CDN）
    html_content = process_html_images(token, html_content)
    
    # 检查是否有已保存的草稿 ID
    media_id = None
    if os.path.exists(DRAFT_ID_FILE):
        with open(DRAFT_ID_FILE, "r") as f:
            media_id = f.read().strip()
    
    # 创建或更新草稿
    return create_or_update_draft(token, title, html_content, media_id)


if __name__ == "__main__":
    # 示例用法
    import sys
    
    if len(sys.argv) < 4:
        print("Usage: python auto_publish.py <appid> <appsecret> <title> <html_file>")
        sys.exit(1)
    
    appid = sys.argv[1]
    appsecret = sys.argv[2]
    title = sys.argv[3]
    html_file = sys.argv[4]
    
    with open(html_file, "r", encoding="utf-8") as f:
        html_content = f.read()
    
    media_id = publish_article(appid, appsecret, title, html_content)
    
    if media_id:
        print(f"✅ 草稿发布成功: {media_id}")
    else:
        print("❌ 发布失败")
