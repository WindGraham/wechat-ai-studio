# General WeChat Article Formatting Guide

Use this file for adaptable formatting guidance. The values below are defaults, not hard requirements. If the user provides brand guidelines, column conventions, font sizes, spacing, or footer rules, follow the user's requirements instead.

This file describes common editorial habits, not hard compatibility rules. Hard HTML/CSS limits belong in `wechat-rules.md`; component capability belongs in `editor-features.md`; richer visual patterns belong in `visual-patterns.md`.

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

For normal multi-paragraph Chinese body text, the common default is left reading flow with `text-align: justify` and `text-indent: 2em`. This gives a clean article feel while keeping paragraph starts easy to scan. Use centered text only for titles, captions, slogans, short quotes, and decorative labels.

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
| Letter spacing | 0px-1px | Keep long body text tight; large tracking makes paragraphs harder to read. |
| Line height | 1.7-1.9 | Match content density and audience. |
| Alignment | justify | Use `justify` for normal prose, `left` for short notes or list-like text. |
| First-line indent | 2em | Use `0` only for captions, cards with very short text, or user-preferred modern layouts. |

Do not simulate indentation with spaces. Use CSS `text-indent` when indentation is needed.

## Captions

Default image caption:

```html
<p style="white-space: normal; margin: 8px 0 0; padding: 0; font-size: 14px; color: rgb(100,100,100); text-align: center;">
  图1 | 图片注释
</p>
```

Captions are optional. Keep them concise and centered unless the user asks for another style.

## Image Selection and Cropping

For ordinary article flow, wide horizontal images are usually safer than tall un-cropped portraits. Avoid placing a single vertical image by itself as a full-width section: it can become too long; if simply reduced, it often leaves the page feeling empty.

Guidance:
- Use horizontal or lightly cropped images for full-width hero and section images.
- Use vertical images in narrower columns, framed cards, or staggered groups instead of full-width single placement.
- Pair several reduced vertical images together when the article has multiple related photos.
- Use image-text side-by-side layouts when one vertical image needs context; pair it with a short quote, poem, note, event info, or caption block.
- If a single vertical image is unavoidable, place it in a 60%-75% width centered frame with a short caption and enough surrounding text.
- Do not pair a narrow vertical image with long paragraphs; long text beside a narrow image becomes cramped on mobile.
- Preserve user-provided images, but choose framing and width based on aspect ratio.

### Image Grouping Habits

When multiple images are placed side-by-side (e.g., two-column, three-column) or arranged in a staggered/overlapping layout:

- **Same height is preferred**: Images in the same row or adjacent group should ideally share the same rendered height. Uneven heights make the layout look accidental and break visual rhythm.
- **Same height and width is ideal**: When possible, crop or scale images so they are identical in both dimensions. This produces the cleanest, most intentional look.
- **Achieve through cropping or HTML bounds**: To make images uniform, either crop the source images to the same aspect ratio beforehand, or constrain their rendered bounds with fixed-height containers (`height` + `overflow: hidden`) or matching `width`/`height` inline styles in HTML.
- **At minimum, align the edges**: If exact same-size is not possible due to source aspect ratios, aim for consistent top or bottom alignment so the group still feels cohesive.

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
