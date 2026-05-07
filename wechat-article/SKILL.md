---
name: wechat-article
description: Generate WeChat Official Account (微信公众号) article HTML. Use when the user needs to create paste-ready HTML content for WeChat public account articles, WeChat rich-text editor compatible layouts, or mobile-first article pages. Covers technical rules (tag whitelist, CSS restrictions), visual design patterns (borders, frames, dividers, decorations), and adaptable formatting guidance for typography, spacing, alignment, and footer blocks.
---

# WeChat Push Article HTML Generator

Generate HTML that renders correctly in WeChat's rich-text editor and looks good on mobile (375px width).

## Task Scope

Use this skill to produce paste-ready HTML fragments for WeChat Official Account articles. The output should be self-contained HTML with inline styles, not a full standalone web app.

Do not attempt account login, media upload, automatic publishing, browser automation, or draft submission unless the user provides a separate tool/workflow for those tasks. This skill covers layout generation and compatibility rules only.

## Quick Start

1. Read `references/wechat-rules.md` for technical constraints
2. Read `references/visual-patterns.md` for visual design patterns
3. Read `references/formatting-guide.md` for adaptable formatting guidance
4. Read `references/editor-features.md` for feature capability matrix
5. Use `assets/template.html` as starting point
6. Replace content placeholders with actual text/images

## Workflow

1. Identify the article type: essay, announcement, event recap, profile, guide, newsletter, or image-heavy post.
2. Ask for missing high-impact inputs only when necessary: title, body text, image URLs, theme color, required footer fields.
3. Choose a layout structure:
   - Text-heavy: header, intro, section titles, body paragraphs, quote/highlight blocks, footer.
   - Image-heavy: hero image, framed images, captions, staggered grid, short text cards.
   - Event/announcement: header, key info card, body sections, callout block, optional contact/source note.
4. Apply WeChat constraints from `references/wechat-rules.md`.
5. Use `references/formatting-guide.md` for defaults, but override typography and spacing with user preferences.
6. Use `references/visual-patterns.md` only when the user wants a more designed, magazine-like layout.
7. Return one clean HTML fragment. Avoid explanatory prose unless the user asks for it.

## Output Contract

The final HTML should:

- Start with a root `<section>` using `width: 100%; max-width: 375px; margin-left: auto; margin-right: auto;`.
- Use inline styles only.
- Use `<section>` for layout containers.
- Use `<p>`, `<span>`, `<strong>`, `<em>`, `<br>`, and `<img>` for content.
- Keep all image tags at `width: 100%; max-width: 100%; display: block; margin: 0 auto;` unless a narrower image is intentional.
- Use neutral placeholders for unknown images, names, credits, source notes, or brand fields.
- Avoid inventing private contact details, organization names, authors, QR codes, or publication metadata.
- Preserve user-provided wording and factual content unless the user asks for rewriting.

## Core Principles

### Mobile-First (Default)
**All HTML files must include `max-width: 375px; margin: 0 auto;` on the root container.**

This ensures:
- Browser preview looks like mobile (not stretched to full screen width)
- Content is centered with gray margins on desktop
- Matches WeChat editor's actual rendering width

Root container pattern:
```html
<section style="max-width: 375px; margin: 0 auto; background-color: rgb(255,255,255);">
  <!-- all content -->
</section>
```

- Target width: 375px (iPhone standard)
- All elements use percentage widths or `width: 100%`
- Background color should be white (not transparent)

### Inline Styles Only
- NO `<style>` tags
- NO `class` attributes
- ALL styles in `style=""` attributes

### Tag Whitelist
- **Containers**: `<section>` (NOT `<div>`)
- **Text**: `<p>`, `<span>`, `<strong>`, `<em>`, `<br>`
- **Images**: `<img>` (must have `width: 100%; max-width: 100%`)
- **FORBIDDEN**: `<script>`, `<style>`, `<iframe>`, `<h1-h6>`, `<table>`, `<ul>/<ol>`

### CSS Safe List
- **Layout**: `display: flex`, `display: inline-block`, `flex-flow`, `justify-content`, `align-self`
- **Sizing**: `width`, `height`, `max-width`, `margin`, `padding`
- **Text**: `font-size`, `color`, `line-height`, `text-align`, `text-indent`, `letter-spacing`
- **Decoration**: `background-color`, `border-*`, `border-radius`, `opacity`
- **FORBIDDEN**: `position: absolute/fixed`, `animation`, `transform` (use with caution), `grid`

### Flex Two-Column Layout (Critical)

WeChat editor handles flex differently from browsers. Prefer inline-block columns for compatibility. If flex is necessary, include:

```html
<section style="display: flex; flex-flow: row;">
  <section style="display: inline-block; width: 50%; 
                  vertical-align: top;
                  align-self: flex-start;
                  flex: 0 0 auto;        ← CRITICAL!
                  height: auto;
                  box-sizing: border-box;">
    <!-- content -->
  </section>
  <section style="display: inline-block; width: 50%; 
                  vertical-align: top;
                  align-self: flex-start;
                  flex: 0 0 auto;        ← CRITICAL!
                  height: auto;
                  box-sizing: border-box;">
    <!-- content -->
  </section>
</section>
```

Missing `flex: 0 0 auto` can cause images to expand to original size in WeChat editor.

## Design Patterns

### Basic Patterns

#### 1. Header Block
```html
<section style="text-align: center; padding: 30px 10px; background-color: rgb(0,61,106);">
  <p style="margin: 0; font-size: 14px; color: rgb(200,200,200);">栏目名称 | 文章说明</p>
  <p style="margin: 15px 0 0; font-size: 28px; color: rgb(255,255,255);">
    <strong>文章标题</strong>
  </p>
  <section style="width: 50px; height: 2px; background: rgb(255,209,131); margin: 20px auto 0;"></section>
</section>
```

#### 2. Left-Border Quote
```html
<section style="border-left: 7px solid rgb(0,61,106); padding: 0 0 0 20px; margin: 20px 10px;">
  <p style="margin: 0; font-size: 16px; color: rgb(0,61,106);"><strong>编者按</strong></p>
  <p style="margin: 10px 0 0; text-indent: 2em;">引言内容...</p>
</section>
```

#### 3. Image with Frame
```html
<section style="text-align: center; margin: 15px 0; padding: 0 10px;">
  <section style="display: inline-block; width: 100%; line-height: 0; 
                  border: 8px solid rgb(0,61,106); box-sizing: border-box;">
    <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; display: block;">
  </section>
  <p style="margin: 8px 0 0; font-size: 14px; color: rgb(100,100,100); text-align: center;">
    图1 | 图片注释
  </p>
</section>
```

#### 4. Divider Lines
```html
<!-- Dashed -->
<section style="border-top: 1px dashed rgb(200,200,200); margin: 20px 10px;"></section>

<!-- Solid -->
<section style="border-bottom: 1px solid rgb(0,61,106); margin: 20px 10px;"></section>
```

#### 5. Circular Decoration
```html
<section style="text-align: center; margin: 25px 0;">
  <section style="display: inline-block; width: 40px; height: 40px; 
                  background-color: rgb(0,61,106); border-radius: 100%;
                  line-height: 40px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 18px;">✦</span>
  </section>
</section>
```

#### 6. Footer
```html
<!-- Two blank lines -->
<section style="padding: 0 10px;"><p style="margin: 0;"><br></p></section>
<section style="padding: 0 10px;"><p style="margin: 0;"><br></p></section>

<!-- Credits -->
<section style="text-align: right; padding: 0 10px;">
  <p style="margin: 0; font-size: 14px; color: rgb(128,128,128);">文案 | 姓名</p>
  <p style="margin: 5px 0 0; font-size: 14px; color: rgb(128,128,128);">排版 | 姓名</p>
</section>

<!-- Brand logo -->
<section style="text-align: center; margin-top: 25px; padding: 0 10px;">
  <section style="display: inline-block; width: 60px; height: 60px;
                  background-color: rgb(0,61,106); border-radius: 100%;
                  line-height: 60px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 14px;">品牌</span>
  </section>
</section>
```

### Alignment Rules (Critical)

WeChat PC client width > 375px. Must work on both mobile and PC.

#### Root Container
```html
<section style="width: 100%; max-width: 375px; margin-left: auto; margin-right: auto; text-align: center;">
  <!-- all content -->
</section>
```

**Key**: Use `margin-left: auto; margin-right: auto` (not `margin: 0 auto`) for reliable centering in WeChat PC client.

#### Text Paragraphs
```html
<p style="text-align: left; text-indent: 2em;">正文...</p>
```

Root container uses `text-align: center`. Paragraphs must explicitly set `text-align: left`.

#### Images (Dual Centering)
Always use both methods:
```html
<section style="text-align: center;">
  <img src="URL" style="width: 100%; display: block; margin: 0 auto;">
</section>
```
- Parent `text-align: center` — primary centering
- Image `margin: 0 auto` — backup when parent fails

### Advanced Patterns

#### 7. Layered Stack (Multi-layer Overlap)
Background wallpaper + frame + image layers.
```html
<section style="display: inline-block; width: 90%; background-color: rgb(255,183,77); padding: 15px; box-sizing: border-box;">
  <section style="display: inline-block; width: 100%; line-height: 0; border-radius: 8px; overflow: hidden; box-sizing: border-box;">
    <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; display: block;">
  </section>
</section>
```

#### 8. Negative Margin Overlap
```html
<!-- Large: Title over hero image -->
<section style="background-color: rgb(0,61,106); padding: 30px 20px; margin: -40px 15px 0; box-sizing: border-box;">
  <p style="margin: 0; font-size: 24px; color: rgb(255,255,255);"><strong>Title</strong></p>
</section>

<!-- Medium: Decor over image bottom -->
<section style="line-height: 0; margin: -24px 0px 0px; box-sizing: border-box; text-align: center;">
  <section style="display: inline-block; width: 50px; height: 50px; background-color: rgb(0,61,106); border-radius: 100%; line-height: 50px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 20px;">✦</span>
  </section>
</section>

<!-- Micro: Dot decoration -->
<section style="text-align: center; margin: -10px 0px 0px; box-sizing: border-box;">
  <section style="display: inline-block; width: 14px; height: 14px; border-radius: 100%; background-color: rgb(0,61,106); box-sizing: border-box;"></section>
</section>
```

#### 9. Staggered Image Grid (Safe for PC)
```html
<section style="text-align: center; padding: 0 15px;">
  <section style="display: inline-block; width: 52%; vertical-align: top; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; line-height: 0; border-radius: 15px; overflow: hidden; box-sizing: border-box;">
      <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 44%; vertical-align: top; padding-top: 25px; padding-left: 8px; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```
**Critical**: 
- Do NOT use `display: flex` — not supported on WeChat PC
- Use `<!-- -->` comment to eliminate inline-block whitespace gap
- Total width ≤ 96% (52% + 44% = 96%)
- Use `padding-left` on right column for spacing (not `padding-right` on left)
- Different `padding-top` values create vertical stagger

#### 10. Image or Card Overlap
Use normal document flow plus negative margin for overlaps. Avoid `position: absolute`.

```html
<!-- Image over image -->
<section style="text-align: center; padding: 0 15px; box-sizing: border-box;">
  <section style="line-height: 0;"><img src="BASE_IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;"></section>
  <section style="text-align: right; margin-top: -50px; padding-right: 12px; box-sizing: border-box;">
    <section style="display: inline-block; width: 44%; line-height: 0; border: 5px solid rgb(255,255,255); border-radius: 8px; overflow: hidden; box-sizing: border-box;">
      <img src="OVERLAY_IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

For image-over-text-card layouts, add extra padding inside the text card where the overlay sits, then render the overlay block after the card with negative `margin-top` and `text-align: left/center/right`.

#### 11. Asymmetric Shapes
```html
<!-- Diamond -->
<section style="display: inline-block; width: 10px; height: 10px; background-color: rgb(255,183,77); border-radius: 2px; transform: rotate(45deg); box-sizing: border-box;"></section>

<!-- Leaf shape -->
<section style="display: inline-block; width: 24px; height: 24px; background-color: rgb(78,128,88); border-radius: 0 100% 0 100%; box-sizing: border-box; line-height: 24px; text-align: center;">
  <span style="color: rgb(255,255,255); font-size: 12px;">🌿</span>
</section>
```

#### 12. Three-Image Crown Layout
Use this for one row of three images where the left and right images sit lower and the center image sits higher. Prefer `inline-block`; keep total width ≤ 96%.

```html
<section style="text-align: center; padding: 0 12px; box-sizing: border-box;">
  <section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 24px; box-sizing: border-box;">
    <img src="URL_LEFT" style="max-width: 100%; width: 100%; display: block; margin: 0 auto;">
  </section><!--
  --><section style="display: inline-block; width: 32%; vertical-align: top; margin: 0 2%; box-sizing: border-box;">
    <img src="URL_CENTER" style="max-width: 100%; width: 100%; display: block; margin: 0 auto;">
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 24px; box-sizing: border-box;">
    <img src="URL_RIGHT" style="max-width: 100%; width: 100%; display: block; margin: 0 auto;">
  </section>
</section>
```

#### 13. Text Background Cards
```html
<!-- Card with colored borders -->
<section style="background-color: rgb(255,255,255); padding: 20px; margin: 10px 15px; box-sizing: border-box; border-top: 3px solid rgb(255,183,77); border-bottom: 3px solid rgb(78,128,88);">
  <p style="margin: 0; text-indent: 2em;">正文内容...</p>
</section>

<!-- Card with shadow and left border -->
<section style="background-color: rgb(255,255,255); padding: 20px; margin: 15px; box-sizing: border-box; border-left: 4px solid rgb(78,128,88); box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
  <p style="margin: 0; text-indent: 2em;">正文内容...</p>
</section>
```

#### 14. Decorative Divider with Stickers
```html
<section style="text-align: center; margin: 20px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(78,128,88); border-radius: 0 100% 0 100%; box-sizing: border-box; line-height: 24px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 12px;">🌿</span>
  </section>
  <section style="display: inline-block; width: 80px; height: 2px; vertical-align: middle; background-color: rgb(78,128,88); margin: 0 10px; box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(255,183,77); border-radius: 100% 0 100% 0; box-sizing: border-box; line-height: 24px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 12px;">🍁</span>
  </section>
</section>
```

## Formatting Defaults

These values are safe defaults, not mandatory standards. Adapt them to the user's brand, column, audience, and source material.

| Element | Default Size | Default Color | Alignment | Other |
|:---|:---:|:---|:---|:---|
| Body text | 16px | rgb(62,62,62) | justify | line-height: 1.8, text-indent: 2em |
| Image caption | 14px | rgb(100,100,100) | center | — |
| Footer text | 14px | rgb(128,128,128) | right | Optional credits or brand notes |
| Section title | 20px | theme color | left | — |
| Header subtitle | 14px | rgb(200,200,200) | center | letter-spacing: 2px |
| Header title | 28px | rgb(255,255,255) | center | — |

## Content Structure

```
标题区（背景色块 + 居中）
  ↓
编者按（左边框引用）
  ↓
虚线分割
  ↓
正文段落1（按用户偏好设置字号、缩进和行距）
  ↓
图片（带相框 + 注释）
  ↓
正文段落2
  ↓
金句引用块（背景色 + 居中）
  ↓
实线分割
  ↓
图文双栏（优先 inline-block，必要时谨慎使用 flex）
  ↓
正文段落3
  ↓
图片（圆角相框）
  ↓
圆形装饰分隔
  ↓
...更多段落...
  ↓
结语（大色块 + 反白文字）
  ↓
补充信息区（可选）
  ↓
空行×2
  ↓
落款或来源说明（可选）
  ↓
尾图（品牌标识）
```

## Testing

### Browser Preview (Approximate)
```html
<section style="max-width: 375px; margin: 0 auto; background: white;">
  <!-- article content -->
</section>
```

### Chrome DevTools
Press F12 → Toggle device toolbar → Select iPhone (375×667)

### WeChat Editor (Ground Truth)
Copy HTML → Paste into mp.weixin.qq.com editor → Verify rendering

## Image Requirements
- Use `width: 100%; max-width: 100%;` on ALL images
- Container must have `line-height: 0` to remove gap
- Image URLs must be from your own domain (WeChat blocks external hotlinking)
- Recommended: Upload to WeChat material library first, then use WeChat CDN URLs
