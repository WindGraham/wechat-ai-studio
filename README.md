# WeChat Article Skills

面向 AI Agent 的微信公众号文章 HTML 排版技能包。

这个仓库不是网页编辑器、Markdown 转换器，也不是自动发布工具。它的核心价值是把微信公众号富文本编辑器的 HTML/CSS 兼容规则、移动端排版方法、常见版式和可复用模板整理成一个 skill，让各类 CLI AI Agent 稳定生成可以粘贴到公众号编辑器里的 HTML。

适用的工具包括但不限于 Codex、Claude Code、Kimi Code、OpenCode、OpenClaw 等。只要你的 Agent 支持读取项目内的 skill/规则文件，就可以复用这里的内容。

## Skill

- `wechat-article`：生成移动端优先、微信公众号编辑器兼容的文章 HTML。

## 为什么需要它

微信公众号文章不是普通网页。公众号编辑器会过滤标签、改写样式，在手机端和 PC 端的宽度表现也不完全一致。很多浏览器里看起来正常的 HTML，粘贴到公众号编辑器后可能出现图片错位、列布局换行、居中失效、样式丢失等问题。

很多项目选择做完整编辑器或转换器。这个仓库选择另一条路：不做 UI，不做发布，只把规则、教程、版式和模板交给 AI Agent，让 Agent 根据你的文章内容和风格要求直接生成兼容 HTML。

## 包含什么

- 微信公众号编辑器安全的 HTML 标签和内联 CSS 规则
- 375px 移动端优先布局
- 手机端和 PC 端都尽量稳定的居中规则
- 图片、注释、分割线、引用块、落款、双栏和三栏布局
- 层叠、错落图片、异形装饰、三图皇冠布局等视觉版式
- 可按用户习惯调整的字号、行距、缩进、页边距和尾部信息
- 一个完整的 HTML 模板 `assets/template.html`

## 适合什么时候用

适合让 AI Agent：

- 把文章草稿、通知、活动推送、图文内容转成公众号 HTML
- 不打开浏览器编辑器，直接生成移动端排版
- 在遵守公众号富文本限制的前提下做一些设计感
- 复用标题区、编者按、图片框、注释、金句卡、分割线、落款等常见结构
- 在开发转换器、主题系统或发布流程前，先掌握公众号 HTML 的底层规则

不适合用来做：

- 可视化 WYSIWYG 编辑器
- 自动登录公众号
- 自动上传图片到微信素材库
- 自动保存草稿或自动发布
- 严格确定性的 Markdown 解析器
- 浏览器自动化或账号操作

## 安装

如果你的 CLI Agent 支持本地 skills 目录，可以把 `wechat-article` 文件夹复制进去。以 Codex 为例：

```bash
cp -R wechat-article "${CODEX_HOME:-$HOME/.codex}/skills/"
```

重启对应的 CLI Agent 后，新的 skill 元数据才会被加载。不同工具的 skills 目录和加载方式可能不同，也可以直接让 Agent 阅读本仓库里的 `wechat-article/SKILL.md` 和 `references/`。

也可以用 `$skill-installer` 从 GitHub 安装：

```text
$skill-installer install https://github.com/WindGraham/wechat-article-skills/tree/main/wechat-article
```

## 使用方式

```text
使用 $wechat-article，把下面这篇文章排成适合微信公众号编辑器粘贴的 HTML。主题色用绿色，正文 16px，首行缩进 2em，图片先用占位 URL。
```

```text
阅读 wechat-article/SKILL.md，按其中规则把这篇活动推送排成公众号 HTML。风格简洁，主题色蓝色，包含标题区、活动信息卡片、正文段落和图片占位。
```

```text
使用这个仓库里的 wechat-article skill，生成一段可以复制进微信公众号编辑器的 HTML。正文左对齐，不要首行缩进，文末加一个来源说明。
```

## 输出应该是什么样

skill 生成的结果通常是一段可以直接复制粘贴的 HTML 片段，根容器类似：

```html
<section style="width: 100%; max-width: 375px; margin-left: auto; margin-right: auto; ...">
  ...
</section>
```

生成的 HTML 应该：

- 只使用内联样式
- 优先用 `<section>` 做布局容器
- 避免 `<script>`、`<style>`、`<iframe>`、`<table>`、表单和交互逻辑
- 图片使用用户提供的 URL 或中性占位 URL
- 字号、行距、缩进、落款字段都按用户自己的公众号习惯调整
- 不编造组织名称、作者姓名、邮箱、二维码、账号信息或发布元数据

## 目录结构

```text
wechat-article/
  SKILL.md
  agents/openai.yaml
  assets/template.html
  references/
    editor-features.md
    formatting-guide.md
    visual-patterns.md
    wechat-rules.md
```

## 定位

这是一个偏“教程 + 规则库”的 skill。它最重要的不是运行时、API 或 UI，而是帮助 AI Agent 稳定理解并执行微信公众号 HTML 排版规则。

如果你需要的是可视化编辑器，可以使用完整的公众号 Markdown/富文本编辑器。如果你需要的是让 Agent 在你的工作流里直接产出 HTML，这个 skill 更合适。

## 隐私

仓库中不包含私人组织名称、账号凭证、邮箱、个人姓名、平台 token 或发布密钥。也不建议把这些信息提交到仓库里。

## License

MIT
