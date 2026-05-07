---
name: wechat-article
description: Generate WeChat Official Account (微信公众号) article HTML. Use when the user needs to create paste-ready HTML content for WeChat public account articles, WeChat rich-text editor compatible layouts, mobile-first article pages, or temporary public image URLs for local images before pasting into the WeChat editor. Covers technical rules (tag whitelist, CSS restrictions), visual design patterns (borders, frames, dividers, decorations), adaptable formatting guidance, reference screenshot style matching, and short-lived local image publishing via CLI tunnel workflows.
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
7. If the article uses local image files and the user wants paste-ready WeChat editor HTML, use the temporary public image workflow before final output.

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

## Reference Screenshot Workflow

Use this workflow when the user provides a screenshot, reference image, or says they want "this style", "similar to this", "match this layout", or "generate a WeChat article in the style of this image".

1. Analyze the reference visually before writing HTML:
   - Overall structure: header, title area, intro card, body sections, image groups, footer.
   - Color palette: dominant background, theme color, accent color, text colors.
   - Typography hierarchy: title size, subtitle style, body size, caption size, weight, alignment.
   - Spacing rhythm: outer padding, card margins, paragraph spacing, section breaks.
   - Visual devices: borders, rounded corners, dividers, labels, icons, dots, frames, shadows, decorative shapes.
   - Image treatment: full-width, framed, rounded, staggered, overlapped, grid, captioned, or image-heavy.
2. Translate the style into WeChat-safe HTML:
   - Use `section` containers and inline styles only.
   - Use the required 375px mobile-first root container.
   - Use `inline-block` rows and negative margins instead of absolute positioning.
   - Replace unsupported effects with compatible approximations.
3. Preserve content separately from style:
   - Keep user-provided wording and facts unchanged unless rewriting is requested.
   - Use neutral placeholders for missing image URLs.
   - Do not invent authors, organizations, QR codes, dates, contacts, or publication metadata.
4. If exact replication is not possible in WeChat, preserve the visual intent first:
   - Approximate shadows with borders or layered background blocks.
   - Approximate complex positioning with normal-flow layers and negative margins.
   - Approximate complex shapes with border radius, small inline-block decorations, or image placeholders.
   - Drop animation, interactivity, filters, fixed/absolute positioning, and unsupported tags.
5. Return either:
   - One clean paste-ready HTML fragment when the task is clear.
   - A short style summary followed by the HTML when the user asks for explanation or when important visual compromises were made.

## Clarifying Style Requirements

If the user asks for a WeChat article but does not provide enough style direction, ask concise follow-up questions before generating HTML. Continue asking until either the key style choices are known or the user says to decide based on the article content.

Ask only for high-impact missing information. Prefer one compact question with grouped choices instead of a long questionnaire.

High-impact inputs:
- Article content: title, body text, section headings, required source notes.
- Article purpose and tone: formal, warm, lively, academic, promotional, event-oriented, newsletter-like, or minimalist.
- Color direction: brand color, preferred theme color, light/dark background, or "choose based on content".
- Image strategy: no images, placeholders, user-provided image URLs, image-heavy layout, single hero image, inline images, grid, staggered, or overlap.
- Layout density: clean text-first, card-based, magazine-like, lively decorative, or compact announcement.
- Footer fields: author, editor, source, organization, date, QR code/logo URL, or omit footer.

Recommended follow-up question format:

```text
Before I generate the WeChat HTML, I need a few style choices:
1. Tone: formal / warm / lively / minimalist / decide based on content
2. Theme color: provide a color / use brand color / decide based on content
3. Images: none / placeholders / use provided URLs / image-heavy
4. Layout: text-first / card-based / magazine-like / layered-overlap / decide based on content
```

Decision rule:
- If the user answers with concrete preferences, follow them.
- If the user says "you decide", "based on the content", "随你", "按内容定", or similar, choose a style that fits the article type and proceed without asking again.
- If the user provides only article text and asks for direct output, make reasonable defaults based on the content instead of blocking on minor style details.
- Ask again only when a missing input affects factual correctness or cannot be safely guessed, such as required footer names, real image URLs, event time/place, contact details, or official organization identity.

## Temporary Public Image URLs for WeChat Paste

Use this workflow when the user has local image files in the HTML and wants to copy the generated HTML into the WeChat editor so WeChat can fetch the images from public URLs.

Goal: create short-lived public HTTPS URLs for local images, replace local `img src` values in the HTML, and keep the local tunnel running until the user confirms the WeChat editor has loaded or transferred the images.

Preferred approach: local read-only static server bound to `127.0.0.1` plus a Cloudflare Quick Tunnel (`trycloudflare.com`). Quick Tunnels do not require a Cloudflare account, domain, DNS setup, or browser login, but they do require the `cloudflared` CLI to be installed.

### When to Use

Use this for short editing sessions only:
- The user wants to paste HTML into the WeChat editor.
- The HTML contains local image paths such as `/home/.../image.jpg`, `file:///.../image.jpg`, or relative image paths.
- The user only needs the public image URLs long enough for WeChat to fetch or transfer the images.

Do not present this as a permanent image hosting solution. For long-term hosting, recommend a proper object store/CDN or WeChat material library.

### CLI Workflow

1. Inspect the HTML and collect local image sources from `<img src="...">`.
2. Resolve relative paths against the HTML file's directory.
3. Create a temporary public directory containing only the images that need to be exposed. Do not expose the user's home directory, project root, source tree, credentials, or unrelated files.
4. Start a local static file server from that temporary image directory:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

5. Start a Cloudflare Quick Tunnel pointing at the local server:

```bash
cloudflared tunnel --url http://127.0.0.1:8000
```

6. Read the generated `https://...trycloudflare.com` URL from `cloudflared` output.
7. Replace each local image `src` in the HTML with the public tunnel URL plus the URL-encoded image filename.
8. Write a separate output HTML file, for example `original.public.html`. Do not overwrite the source unless the user explicitly asks.
9. Keep both the static server and tunnel process running while the user copies the HTML into WeChat and verifies that the images appear.
10. After confirmation, stop the server and tunnel.

### Safety Rules

- Bind the local HTTP server to `127.0.0.1`, not `0.0.0.0`.
- Serve only a temporary directory containing the intended image files.
- Prefer copied images with sanitized filenames such as `image-01.jpg`; avoid exposing original directories with private names.
- Keep the tunnel alive only for the current editing session.
- Tell the user that if the tunnel is closed before WeChat fetches the images, the images may fail to load.
- If `cloudflared` is missing, install it only with the user's approval when the environment requires installation or network access.

### URL Replacement Rules

- Encode filenames for URLs, especially spaces and non-ASCII characters.
- Preserve non-image parts of the HTML exactly.
- Keep existing remote `https://...` image URLs unchanged unless the user asks to rehost them.
- Use public URLs only in the final paste-ready HTML.

Example replacement:

```html
<!-- Before -->
<img src="/home/user/article/images/cover.png">

<!-- After -->
<img src="https://example.trycloudflare.com/image-01.png">
```

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
