# Auto-Publish Reference

微信公众号文章自动发布参考文档

## 功能

- 自动创建微信公众号草稿
- 自动更新已有草稿（保持同一个 Media ID）
- 自动处理图片上传（外部图片 → 微信 CDN）
- 中文编码正确处理（UTF-8，非 Unicode 转义）

## 关键实现点

### 1. 中文编码

```python
# 正确做法：ensure_ascii=False
response = requests.post(
    url,
    data=json.dumps(data, ensure_ascii=False).encode("utf-8"),
    headers={"Content-Type": "application/json; charset=utf-8"}
)

# 错误做法：默认 ensure_ascii=True，中文变成 \uXXXX
response = requests.post(url, json=data)  # ❌ 不要这样
```

### 2. 图片处理

```python
# 上传正文图片到微信 CDN
def upload_content_image(access_token, image_url):
    response = requests.get(image_url)
    # ... 保存到临时文件
    
    url = f"https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token={access_token}"
    with open("/tmp/img.jpg", "rb") as f:
        files = {"media": f}
        response = requests.post(url, files=files)
        data = response.json()
    
    return data.get("url")  # 微信 CDN URL

# 替换 HTML 中所有外部图片
html_content = process_html_images(token, html_content)
```

### 3. 缩略图（必填）

```python
# 上传缩略图（thumb_media_id 是必填字段）
url = f"https://api.weixin.qq.com/cgi-bin/material/add_material?access_token={access_token}&type=thumb"

with open("thumb.jpg", "rb") as f:
    files = {"media": f}
    response = requests.post(url, files=files)
    data = response.json()

thumb_media_id = data["media_id"]  # 创建/更新草稿时必须包含
```

### 4. 草稿 ID 持久化

```python
DRAFT_ID_FILE = ".wechat_draft_id"

# 创建后保存
with open(DRAFT_ID_FILE, "w") as f:
    f.write(media_id)

# 更新前读取
if os.path.exists(DRAFT_ID_FILE):
    with open(DRAFT_ID_FILE, "r") as f:
        media_id = f.read().strip()
```

## 错误码

| 错误码 | 含义 | 解决方案 |
|:---|:---|:---|
| 40001 | access_token 过期 | 重新获取 |
| 40007 | invalid media_id | thumb_media_id 缺失或无效 |
| 45004 | description size out of limit | digest 字段过长（最多120字） |
| 45009 | reach max api daily quota limit | 超出 API 调用限额 |

## 图床支持

如果用户已经使用图床（如七牛云、阿里云 OSS、自建图床等），且图片 URL 是公开可访问的 HTTPS 链接：

- **可以直接使用**，不需要上传到微信 CDN
- 跳过 `process_html_images` 步骤
- 确保图片域名不在微信黑名单中

## 使用示例

```python
from scripts.auto_publish import publish_article

media_id = publish_article(
    appid="wx1234567890abcdef",
    appsecret="your_appsecret_here",
    title="文章标题",
    html_content=html_string
)

if media_id:
    print(f"发布成功: {media_id}")
```

## 命令行用法

```bash
python scripts/auto_publish.py <appid> <appsecret> <title> <html_file>
```

## 文件位置

- 脚本：`scripts/auto_publish.py`
- 草稿 ID 文件：`.wechat_draft_id`（自动生成）
