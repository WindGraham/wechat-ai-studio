# wechat-html-skills

Agent-readable skills for generating WeChat Official Account article HTML that can be pasted into the WeChat rich-text editor.

This repository is not a web editor, Markdown converter, or publishing platform. It is a compact skill package that teaches a coding/writing agent how to write WeChat-compatible HTML: which tags survive, which CSS patterns are reliable, how to structure mobile-first article layouts, and how to avoid common editor rendering problems.

## Skill

- `wechat-html`: Generate mobile-first, WeChat-compatible HTML for Official Account articles.

## Why This Exists

WeChat Official Account articles are not normal web pages. The editor filters tags, strips or rewrites styles, handles desktop and mobile widths differently, and breaks some browser-valid layouts after pasting.

Most tools solve this by providing a full editor or converter. This repository takes a different approach: it packages the compatibility rules, layout patterns, and reusable templates as an agent skill, so Codex, Claude Code, or another coding agent can generate correct HTML directly from your article content and style requirements.

## What It Covers

- WeChat editor-safe HTML tags and inline CSS rules.
- Mobile-first 375px article layout.
- PC and mobile centering compatibility.
- Image, caption, divider, quote, footer, and two-column patterns.
- Visual article patterns such as layered blocks, staggered image grids, asymmetric shapes, and decorative dividers.
- General typography and footer guidance that users can adapt to their own account style.
- A complete starter HTML template.

## When To Use It

Use this skill when you want an agent to:

- Turn prose, notes, or article drafts into WeChat Official Account HTML.
- Create a mobile-first article layout without using a browser editor.
- Follow WeChat rich-text editor constraints while still producing designed content.
- Reuse reliable sections such as headers, editor's notes, image frames, captions, quote blocks, dividers, and footer credits.
- Learn the rules before building a separate converter, theme system, or publishing workflow.

Do not use this skill when you need:

- A WYSIWYG editor.
- Automatic WeChat draft publishing.
- Image upload to WeChat media library.
- A deterministic Markdown parser.
- Account login or browser automation.

## Install

Copy the skill folder into your Codex skills directory:

```bash
cp -R wechat-html "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Restart Codex after installing so the skill metadata is reloaded.

You can also install from the GitHub directory URL with `$skill-installer`:

```text
$skill-installer install https://github.com/WindGraham/wechat-html-skills/tree/main/wechat-html
```

## Usage

Ask Codex for WeChat Official Account article HTML:

```text
Use $wechat-html to turn this article into WeChat public account HTML with a clean mobile layout.
```

More examples:

```text
Use $wechat-html to create a WeChat article layout for this event announcement. Keep the style minimal, use blue as the theme color, and include image placeholders.
```

```text
Use $wechat-html to convert this article into paste-ready WeChat HTML. Use 15px body text, no first-line indent, and include a simple source note at the end.
```

```text
Use $wechat-html to design a magazine-like article layout with a hero image, editor's note, section dividers, staggered image grid, and optional credits.
```

The skill will load its core rules first, then pull detailed references only when needed.

## Expected Output

The generated output should be a single paste-ready HTML fragment, usually rooted at:

```html
<section style="width: 100%; max-width: 375px; margin-left: auto; margin-right: auto; ...">
  ...
</section>
```

The HTML should:

- Use inline styles only.
- Prefer `<section>` for containers.
- Avoid scripts, tables, iframes, forms, and unsupported interactive behavior.
- Use image placeholders or user-provided image URLs.
- Keep typography and footer fields adaptable to the user's own account style.

## Repository Layout

```text
wechat-html/
  SKILL.md
  agents/openai.yaml
  assets/template.html
  references/
    editor-features.md
    formatting-guide.md
    wechat-rules.md
    visual-patterns.md
```

## Positioning

This is a tutorial-and-rule oriented skill. Its main value is not a runtime, API, or UI; it is the distilled knowledge needed for agents to write WeChat editor-safe HTML consistently.

Use it when you want reusable instructions and templates. Use a full editor such as doocs/md, WeMD, MD2WE, or mdnice when you need an interactive browser UI.

## Privacy

The skill intentionally contains no private organization names, account credentials, email addresses, personal names, or platform tokens. Do not add private publishing credentials to this repository.

## License

MIT
