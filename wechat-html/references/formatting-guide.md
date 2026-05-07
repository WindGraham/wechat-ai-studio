# General WeChat Article Formatting Guide

Use this file for adaptable formatting guidance. The values below are defaults, not hard requirements. If the user provides brand guidelines, column conventions, font sizes, spacing, or footer rules, follow the user's requirements instead.

## Title Area

Common title metadata formats:

```text
Column Name | Article Title
Article Title | Issue Label
Article Title
```

Guidance:
- Keep title metadata short on mobile.
- Use full-width Chinese punctuation only when the user's content style requires it.
- Avoid hard-coding organization names, issue numbers, email addresses, or private account details.

## Body Text

Default body paragraph:

```html
<section style="margin: 0; padding: 0 10px; box-sizing: border-box;">
  <p style="white-space: normal; margin: 0; padding: 0; font-size: 16px; color: rgb(62,62,62); line-height: 1.8; text-align: justify; text-indent: 2em;">
    正文内容...
  </p>
</section>
```

Adaptable defaults:

| Property | Default | Notes |
|:---|:---|:---|
| Font size | 15px-16px | Use the user's preference when provided. |
| Color | rgb(62,62,62) | Theme colors are fine for emphasis. |
| Page padding | 10px-15px | Increase padding for card layouts. |
| Letter spacing | 0px | Avoid large tracking for long body text. |
| Line height | 1.7-1.9 | Match content density and audience. |
| Alignment | justify or left | Use `justify` for formal prose, `left` for short paragraphs. |
| First-line indent | 0 or 2em | Use only when it fits the article style. |

Do not simulate indentation with spaces. Use CSS `text-indent` when indentation is needed.

## Captions

Default image caption:

```html
<p style="white-space: normal; margin: 8px 0 0; padding: 0; font-size: 14px; color: rgb(100,100,100); text-align: center;">
  图1 | 图片注释
</p>
```

Captions are optional. Keep them concise and centered unless the user asks for another style.

## Footer and Credits

Footer blocks are optional. Include only the fields the user provides.

```html
<section style="text-align: right; padding: 0 10px; box-sizing: border-box;">
  <p style="white-space: normal; margin: 0; padding: 0; font-size: 14px; color: rgb(128,128,128);">作者 | 姓名</p>
  <p style="white-space: normal; margin: 5px 0 0; padding: 0; font-size: 14px; color: rgb(128,128,128);">排版 | 姓名</p>
</section>
```

Guidance:
- Do not invent names, departments, email addresses, QR codes, or account identities.
- If credits are unknown, omit the footer or use neutral placeholders.
- If the user provides a brand logo URL, place it at the end with centered image styling.

## Optional Content Blocks

Use optional sections only when they match the article:

| Block | Use When |
|:---|:---|
| Editor's note | The article needs context before the body. |
| Author bio | The user provides author information. |
| Submission notice | The user explicitly requests it and provides contact details. |
| Event info | The article is an event announcement with time/place/registration details. |
| Source note | The article references external material. |

## Summary

Default article structure:

```text
Header
Optional intro/editor's note
Body sections
Images with optional captions
Optional quote or highlight cards
Optional closing note
Optional credits/footer
Optional brand image
```

Always prefer user-provided style requirements over these defaults.
