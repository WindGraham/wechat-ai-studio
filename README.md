# 📱 WeChat Article Skill

> **AI-Powered WeChat Official Account HTML Generator & Auto-Publisher**
>
> 面向 AI Agent 的微信公众号文章排版技能包 — 从 HTML 生成到自动发布，一站式解决。

---

## ✨ 核心功能

| 功能 | 说明 |
|:---|:---|
| 🎨 **智能排版** | 根据内容自动生成移动端优先（375px）的微信公众号 HTML |
| 📐 **精细组件** | 标题区、卡片、图片框、分割线、引用块、错落布局、三图皇冠等 |
| 🖼️ **图片处理** | 本地图片自动上传图床 / 微信 CDN，外部 URL 直接可用 |
| 🤖 **自动发布** | 通过微信公众号 API 直接创建/更新草稿箱，无需手动粘贴 |
| 🔄 **版本管理** | 本地 Git 追踪排版迭代，每轮调整都有记录 |
| 📸 **视觉检查** | 浏览器截图验证布局，防止重叠、溢出、空白 |

---

## 🚀 快速开始

### 方式一：手动粘贴（Manual Paste）

```text
使用 $wechat-article，把下面这篇文章排成公众号 HTML。主题色用绿色，正文 16px。
```

生成后：浏览器打开 → **Ctrl+A** → **Ctrl+C** → mp.weixin.qq.com → **Ctrl+V**

### 方式二：自动发布（Auto-Publish）

```text
使用 $wechat-article，自动发布这篇文章到公众号草稿箱。AppID: xxx, AppSecret: xxx
```

一键创建/更新草稿，图片自动上传微信 CDN，中文编码正确处理。

---

## 📊 能力对比

| 维度 | **本 Skill** | 现有方案 A<br>（在线编辑器） | 现有方案 B<br>（Markdown 转换器） | 现有方案 C<br>（通用 AI） |
|:---|:---|:---|:---|:---|
| **AI 智能排版** | ✅ 原生驱动，理解内容语义 | ❌ 手动拖拽组件 | ❌ 仅格式转换，无设计智能 | ⚠️ 通用能力，不懂微信规则 |
| **视觉精细度** | ✅ 层叠/错落/异形/阴影/圆角 | ⚠️ 模板固定，难以微调 | ⚠️ 基础布局，无设计感 | ❌ 无法保证移动端效果 |
| **组件丰富度** | ✅ 标题区/卡片/图片框/分割线/引用/落款/双栏/三栏/皇冠布局 | ✅ 丰富但需手动组合 | ⚠️ 仅基础元素 | ⚠️ 需反复调试 |
| **图片处理** | ✅ 自动上传微信 CDN，长期稳定 | ✅ 本地上传 | ❌ 依赖外部图床，易失效 | ⚠️ 需手动处理 |
| **中文编码** | ✅ UTF-8 原生，不乱码 | ✅ 正常 | ⚠️ 需手动处理 Unicode | ⚠️ 可能出现转义 |
| **自动发布** | ✅ API 直连草稿箱 | ❌ 需手动粘贴 | ❌ 仅生成 HTML | ❌ 无发布能力 |
| **移动端适配** | ✅ 375px 根容器，真机级还原 | ✅ 内置预览 | ⚠️ 需自行调整 | ⚠️ 无法保证 |
| **版本管理** | ✅ Git 本地追踪迭代 | ❌ 无 | ❌ 无 | ❌ 无 |
| **视觉检查** | ✅ 自动化截图验证 | ❌ 人工检查 | ❌ 人工检查 | ❌ 人工检查 |
| **使用成本** | ✅ 开源免费 | ❌ 会员/订阅制 | ✅ 开源免费 | ✅ 按 token 计费 |

### 🎨 排版优势详解

**为什么我们的排版更好看？**

| 我们的能力 | 效果 |
|:---|:---|
| **层叠布局** | 图片+文字卡片重叠，杂志级视觉冲击 |
| **错落网格** | 左高右低/左低右高，打破呆板对称 |
| **异形装饰** | 菱形、叶子形、圆形贴纸，细节精致 |
| **负边距重叠** | 标题压在大图上，节省空间有层次 |
| **纹理背景** | 色块+纹理，告别纯白单调 |
| **四角边框** | 图片四边有色条，复古又现代 |
| **渐变分割线** | 不是一条线，是视觉节奏点 |
| **阴影层次** | 卡片浮起感，阅读有呼吸感 |

**一句话总结**：

> 别人给的是「能用的排版」，我们给的是「好看的排版」。
>
> 别人是工具，我们是设计师。

---

## 📁 目录结构

```text
wechat-article/
  📄 SKILL.md                    # 主技能文档（工作流、规则、API）
  🤖 agents/openai.yaml          # OpenAI 兼容配置
  🎨 assets/
     └── template.html           # 起始模板
  📜 scripts/
     └── auto_publish.py         # 自动发布脚本
  📚 references/
     ├── auto-publish.md         # 自动发布文档
     ├── editor-features.md      # 编辑器能力说明
     ├── formatting-guide.md     # 排版规范
     ├── generation-checklist.md # 生成检查清单
     ├── image-url-workflow.md   # 图片处理流程
     ├── interaction-workflow.md # 用户协作流程
     ├── refined-layout-blocks.md # 精细排版组件
     ├── screenshot-check.md     # 截图检查流程
     ├── visual-patterns.md      # 视觉模式库
     └── wechat-rules.md         # 微信兼容性规则
```

---

## 🛠️ 安装

### 方式一：本地 Skills 目录

```bash
# Codex
 cp -R wechat-article "${CODEX_HOME:-$HOME/.codex}/skills/"

# OpenClaw
 cp -R wechat-article "${OPENCLAW_HOME:-$HOME/.openclaw}/skills/"
```

### 方式二：Skill Installer

```text
$skill-installer install https://github.com/WindGraham/wechat-article-skills/tree/main/wechat-article
```

### 方式三：Git Clone

```bash
git clone https://github.com/WindGraham/wechat-article-skills.git
cd wechat-article-skills
```

> ⚠️ 重启 CLI Agent 后 skill 元数据才会加载。

---

## 🔄 更新

```bash
cd wechat-article-skills
git pull
cp -R wechat-article "${SKILLS_DIR}/"
```

---

## 📝 使用示例

### 基础排版

```text
使用 $wechat-article，把下面这篇文章排成适合微信公众号编辑器粘贴的 HTML。
主题色用绿色，正文 16px，首行缩进 2em，图片先用占位 URL。
```

### 参考风格

```text
使用 $wechat-article，参考我上传的截图风格，把下面这篇文章排成公众号 HTML。
图片先用占位 URL，无法在微信里精确实现的效果请用兼容写法近似。
```

### 自动发布

```text
使用 $wechat-article，自动发布这篇文章到公众号草稿箱。
AppID: wx1234567890abcdef
AppSecret: your_appsecret_here
```

---

## ⚙️ 自动发布配置

### 前置条件

1. 微信公众号 AppID + AppSecret
2. 服务器 IP 加入白名单（微信公众平台 → 开发 → 基本配置 → IP 白名单）
3. 安装 `requests`：`pip install requests`

### 配置项

| 配置 | 说明 |
|:---|:---|
| `AppID` | 微信公众号应用 ID |
| `AppSecret` | 微信公众号应用密钥 |
| `DRAFT_ID_FILE` | `.wechat_draft_id`（自动保存草稿 ID） |

---

## 🎯 适用场景

- ✅ 文章草稿、通知、活动推送、图文内容 → 公众号 HTML
- ✅ 不打开可视化编辑器，直接生成移动端排版
- ✅ 在公众号富文本限制内做标题区、信息卡、金句卡、图片框
- ✅ 参考截图风格，生成相近的公众号排版
- ✅ CI/CD 自动化发布流程集成
- ✅ 批量内容生产，保持排版一致性

---

## 📋 输出规范

生成的 HTML 符合以下要求：

- ✅ 只使用内联样式（`style="..."`）
- ✅ 根容器 `max-width: 375px; margin: 0 auto`
- ✅ 优先用 `<section>` 做布局容器
- ✅ 避免 `<script>`、`<style>`、`<iframe>`、`<table>`
- ✅ 图片使用用户提供的 URL 或中性占位 URL
- ✅ 字号、行距、缩进、落款按用户习惯调整
- ✅ 不编造组织名称、作者姓名、邮箱、二维码

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

### 贡献方向

- 🎨 新的排版组件和视觉模式
- 🌍 多语言支持
- 📚 文档改进
- 🐛 Bug 修复
- ✨ 新功能（如：定时发布、多账号支持）

---

## 📄 开源协议

[MIT License](LICENSE)

```
MIT License

Copyright (c) 2025 WindGraham

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致谢

- 微信团队提供公众号平台
- 开源社区的各种排版灵感
- AI Agent 工具生态的建设者们

---

<p align="center">
  <sub>Made with ❤️ for WeChat content creators</sub>
</p>
