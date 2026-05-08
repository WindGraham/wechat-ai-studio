# Image Hosting Preflight Test

图片托管预检测试流程

## 为什么要在排版前测试图床？

- 避免排版完成后发现图片无法上传/显示
- 提前发现 API 凭证、IP 白名单、网络等问题
- 确认图片 URL 格式是否符合微信要求

## 测试流程

### 方式一：WeChat API 测试（自动发布）

```python
import requests

# 1. 测试 access_token
APPID = "your_appid"
APPSECRET = "your_appsecret"

url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={APPID}&secret={APPSECRET}"
response = requests.get(url)
data = response.json()

if "access_token" in data:
    print("✅ access_token 获取成功")
    token = data["access_token"]
    
    # 2. 测试图片上传
    upload_url = f"https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token={token}"
    
    # 准备一张测试图片（任意小图片）
    with open("test_image.jpg", "rb") as f:
        files = {"media": f}
        response = requests.post(upload_url, files=files)
        result = response.json()
    
    if "url" in result:
        print(f"✅ 图片上传成功: {result['url']}")
        print("🎉 图床测试通过！可以开始排版")
    else:
        print(f"❌ 图片上传失败: {result}")
else:
    print(f"❌ access_token 获取失败: {data}")
```

### 方式二：外部图床测试

```python
import requests

# 测试图片 URL 是否可访问
test_url = "https://your-image-host.com/path/to/test.jpg"

response = requests.head(test_url, timeout=10)

if response.status_code == 200:
    content_type = response.headers.get("Content-Type", "")
    if content_type.startswith("image/"):
        print("✅ 图床 URL 可访问且是图片")
        print("🎉 图床测试通过！可以开始排版")
    else:
        print(f"⚠️ URL 可访问但 Content-Type 不是图片: {content_type}")
else:
    print(f"❌ 图床 URL 不可访问: {response.status_code}")
```

### 方式三：本地服务器测试

如果用户使用自己的服务器托管图片：

```bash
# 1. 确认服务器可访问
curl -I http://your-server.com:port/

# 2. 上传测试图片
curl -X POST -F "file=@test.jpg" http://your-server.com:port/upload

# 3. 验证返回的 URL
curl -I http://your-server.com:port/images/test.jpg
```

## 测试检查清单

- [ ] 图片上传接口可访问
- [ ] 返回的 URL 是 HTTPS（微信要求）
- [ ] URL 返回 Content-Type: image/*
- [ ] 图片在浏览器中可正常显示
- [ ] 如果是微信 API，access_token 获取正常
- [ ] 如果是微信 API，IP 白名单已配置

## 常见问题

| 问题 | 原因 | 解决 |
|:---|:---|:---|
| access_token 获取失败 | AppID/AppSecret 错误或 IP 未白名单 | 检查凭证，添加服务器 IP 到白名单 |
| 图片上传失败 | 图片太大或格式不支持 | 压缩图片到 1MB 以下，使用 JPG/PNG |
| URL 返回 403 | 防盗链或权限问题 | 配置正确的 CORS 或 Referer 策略 |
| URL 是 HTTP | 微信要求 HTTPS | 配置 SSL 证书 |
| Content-Type 错误 | 服务器配置问题 | 检查 MIME 类型配置 |

## 通过标准

只有图床测试完全通过后，才能开始 HTML 排版工作。

## 图片失败处理流程

当图片上传或处理失败时，必须向用户说明情况并提供选择：

### 1. 失败检测

```python
# 上传后检查
if "url" not in result:
    print(f"❌ 图片上传失败: {result}")
    # 记录失败信息
    failed_images.append({
        "path": image_path,
        "error": result,
        "type": "upload_failed"
    })
```

### 2. 用户沟通模板

```text
⚠️ 图片处理异常

以下图片上传失败：
1. [图片1.jpg] - 原因：文件过大（2.3MB > 1MB限制）
2. [图片2.png] - 原因：网络超时

请选择处理方式：

A. 替换图片
   - 提供新的图片文件或URL
   - 我将重新上传

B. 删除图片占位
   - 保留图片位置但显示占位符
   - 您可在微信编辑器中手动替换

C. 跳过该图片
   - 从文章中移除该图片
   - 调整周围文字排版

D. 压缩重试
   - 自动压缩图片至1MB以下
   - 重新上传（可能降低画质）

请输入选项（A/B/C/D）或描述您的需求：
```

### 3. 处理选项实现

#### 选项 A：替换图片
```python
new_image_url = input("请提供新的图片路径或URL: ")
# 重新上传新图片
wechat_url = upload_content_image(access_token, new_image_url)
if wechat_url:
    html_content = html_content.replace(old_url, wechat_url)
```

#### 选项 B：保留占位
```python
# 保留 img 标签但添加占位样式
placeholder_html = f'''
<section style="text-align: center; margin: 15px 0; padding: 20px; 
                background: #f5f5f5; border: 2px dashed #ccc;">
  <p style="margin: 0; color: #999; font-size: 14px;">📷 图片占位</p>
  <p style="margin: 5px 0 0; color: #bbb; font-size: 12px;">{original_filename}</p>
</section>
'''
html_content = html_content.replace(img_tag, placeholder_html)
```

#### 选项 C：删除图片
```python
# 移除整个图片块（包括 figcaption）
# 查找图片所在的 section 并移除
import re
# 移除 <img> 及其父级 section
pattern = r'<section[^>]*>\s*<img[^>]*src="' + re.escape(old_url) + r'"[^>]*>.*?</section>'
html_content = re.sub(pattern, '', html_content, flags=re.DOTALL)
```

#### 选项 D：压缩重试
```python
from PIL import Image
import io

# 压缩图片
img = Image.open(image_path)
# 转换为RGB（去除透明通道）
if img.mode in ('RGBA', 'LA', 'P'):
    img = img.convert('RGB')

# 保存为压缩后的JPG
output = io.BytesIO()
img.save(output, format='JPEG', quality=70, optimize=True)
compressed_path = "/tmp/compressed.jpg"
with open(compressed_path, 'wb') as f:
    f.write(output.getvalue())

# 重新上传
wechat_url = upload_content_image(access_token, compressed_path)
```

### 4. 批量失败处理

如果多张图片失败：

```text
⚠️ 检测到 3 张图片上传失败

失败清单：
1. cover.jpg (2.5MB) - 超出大小限制
2. chart.png - 格式不支持
3. photo.jpg - 网络错误

统一处理选项：

[1] 全部替换 - 请提供新图片（可批量上传）
[2] 全部占位 - 保留位置，稍后手动替换
[3] 智能处理 - 大图自动压缩，其他保留占位
[4] 逐张处理 - 每张图片单独决定

建议：选择 [3] 智能处理，大图自动压缩，其他保留占位

请输入选项（1/2/3/4）：
```

### 5. 最终确认

无论选择哪种处理方式，完成后必须向用户确认：

```text
✅ 图片处理完成

处理结果：
- 成功上传：5 张
- 压缩重传：2 张（画质轻微降低）
- 保留占位：1 张（chart.png，可在微信编辑器替换）

文章现在可以继续排版。

是否继续？[Y/n]
```

### 6. 记录与追踪

```python
# 保存处理记录
processing_log = {
    "total_images": 10,
    "success": 5,
    "compressed": 2,
    "placeholder": 1,
    "failed": 2,
    "details": [
        {"file": "a.jpg", "status": "success", "url": "https://mmbiz.qpic.cn/..."},
        {"file": "b.jpg", "status": "compressed", "original_size": "2.5MB", "new_size": "0.8MB"},
        {"file": "c.png", "status": "placeholder", "reason": "format_not_supported"}
    ]
}

# 保存到日志文件
import json
with open("image_processing_log.json", "w") as f:
    json.dump(processing_log, f, ensure_ascii=False, indent=2)
```

## 用户选择权原则

- **绝不擅自决定**：即使只有一张图片失败，也要告知用户
- **提供明确选项**：A/B/C/D 清晰可选
- **解释原因**：说明为什么失败（大小/格式/网络）
- **建议但不强制**：给出推荐选项，但尊重用户选择
- **确认后再继续**：处理完成后必须得到用户确认
