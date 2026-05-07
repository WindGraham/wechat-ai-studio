# WeChat Article Skills

面向 AI Agent 的微信公众号文章 HTML 排版技能包，用来生成可以粘贴到公众号富文本编辑器里的移动端文章 HTML。

这个 skill 汇总了微信公众号编辑器的 HTML/CSS 兼容规则、移动端排版方法、常见文章组件、精细排版能力块、图片 URL 处理流程和协作式排版工作流。AI Agent 读取这些规则后，可以根据文章内容、风格要求和参考图，产出更稳定的公众号 HTML。

适用的工具包括 Codex、Claude Code、Kimi Code、OpenCode、OpenClaw 等。只要你的 Agent 支持读取项目内的 skill 或规则文件，就可以复用这里的内容。

## Skill

- `wechat-article`：生成移动端优先、微信公众号编辑器兼容的文章 HTML。

## 功能

- 生成可直接复制到微信公众号编辑器的 HTML 片段
- 使用微信公众号编辑器更稳定的标签、内联 CSS 和 375px 移动端布局
- 提供标题区、正文段落、图片、注释、分割线、引用块、落款、双栏和三栏等常用组件
- 支持层叠图片、错落图片、异形装饰、三图皇冠布局、四角框、纹理背景等视觉版式
- 按用户习惯调整字号、行距、字间距、首行缩进、两端对齐、图片裁切和图片组合方式
- 根据参考截图或图片分析风格，并生成相近的公众号 HTML
- 在缺少主题色、图片数量、排版风格等关键偏好时，引导用户补充，或按文章内容自主决定
- 支持排版过程中的本地 git 版本管理，每轮调整保留一个本地版本
- 支持用浏览器截图检查明显的重叠、溢出、空白和图片加载问题
- 通过生成清单检查微信兼容性、版式稳定性和事实信息
- 在排版开始前预检本地图片上传，排版确认后再次生成最终在线图片 URL 版本
- 提供完整的起始模板 `assets/template.html`

## 适用场景

适合让 AI Agent 处理这些任务：

- 把文章草稿、通知、活动推送、图文内容转成公众号 HTML
- 不打开可视化编辑器，直接生成移动端排版
- 在公众号富文本限制内做标题区、信息卡、金句卡、图片框、注释、分割线和落款
- 参考截图风格，生成相近的公众号排版
- 在开发转换器、主题系统或发布流程前，先掌握公众号 HTML 的底层规则

这个 skill 专注于 HTML 生成和兼容规则。账号登录、微信素材库上传、草稿保存、自动发布、浏览器自动化和严格确定性的 Markdown 解析，需要由其他工具或工作流完成。

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

## 更新

如果你是通过 git clone 使用这个仓库，进入仓库目录后拉取最新版本：

```bash
git pull
cp -R wechat-article "${CODEX_HOME:-$HOME/.codex}/skills/"
```

如果你是通过 `$skill-installer` 安装，可以重新执行安装命令覆盖旧版本：

```text
$skill-installer install https://github.com/WindGraham/wechat-article-skills/tree/main/wechat-article
```

重启对应的 CLI Agent 后，更新后的 skill 元数据才会生效。也可以在每次正式排版前，让 Agent 先检查本仓库是否有更新。

## 使用方式

```text
使用 $wechat-article，把下面这篇文章排成适合微信公众号编辑器粘贴的 HTML。主题色用绿色，正文 16px，首行缩进 2em，图片先用占位 URL。
```

```text
阅读 wechat-article/SKILL.md，按其中规则把这篇推送排成公众号 HTML。风格简洁，主题色蓝色，包含标题区、信息卡片、正文段落和图片占位。
```

```text
使用这个仓库里的 wechat-article skill，生成一段可以复制进微信公众号编辑器的 HTML。正文左对齐，不要首行缩进，文末加一个来源说明。
```

```text
使用 $wechat-article，参考我上传的截图风格，把下面这篇文章排成微信公众号 HTML。图片先用占位 URL，无法在微信里精确实现的效果请用兼容写法近似。
```

```text
使用 $wechat-article，把下面这篇推送排成公众号 HTML。风格你根据内容决定；如果缺少会影响事实准确性的信息，再问我。
```

```text
使用 $wechat-article，把这个 HTML 处理成可以粘贴到微信公众号编辑器的版本：把里面的本地图片上传到 360 图床，验证返回的图片 URL，替换 img src，并输出新的 HTML 文件。
```

## 输出格式

skill 生成的结果通常是一段可以直接复制粘贴的 HTML 片段，根容器类似：

```html
<section style="width: 100%; max-width: 375px; margin-left: auto; margin-right: auto; ...">
  ...
</section>
```

生成的 HTML 应符合这些要求：

- 只使用内联样式
- 优先用 `<section>` 做布局容器
- 避免 `<script>`、`<style>`、`<iframe>`、`<table>`、表单和交互逻辑
- 图片使用用户提供的 URL 或中性占位 URL
- 如果用户明确要求处理本地图片，可先通过图床或已配置 provider 生成公网 HTTPS 图片 URL，再替换图片地址
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
    generation-checklist.md
    image-url-workflow.md
    interaction-workflow.md
    refined-layout-blocks.md
    screenshot-check.md
    visual-patterns.md
    wechat-rules.md
```

## License

MIT
