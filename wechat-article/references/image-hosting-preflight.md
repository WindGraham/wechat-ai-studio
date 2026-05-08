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
