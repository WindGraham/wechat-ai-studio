---
name: wechat-article
description: Generate and iteratively refine WeChat Official Account (微信公众号) article HTML from user-provided content and images. Use when the user needs paste-ready WeChat rich-text HTML, mobile-first article layout, refined image/text typesetting, reference screenshot style matching, local image URL publication, local git versioning for layout drafts, or screenshot-based visual checks. Covers inline-style compatibility rules, reusable refined layout capability blocks, user collaboration workflow, image URL preflight/finalization, and paste-readiness checks.
---

# WeChat Push Article HTML Generator

Generate HTML that renders correctly in WeChat's rich-text editor and looks good on mobile (375px width).

## Task Scope

Use this skill to produce paste-ready HTML fragments for WeChat Official Account articles. The output should be self-contained HTML with inline styles, not a full standalone web app.

Do not attempt account login, WeChat material-library upload, automatic publishing, browser automation, or draft submission unless the user provides a separate tool/workflow for those tasks. This skill covers layout generation, public image URL handling, local draft versioning, visual checks, and compatibility rules.

## Execution Rule (Highest Priority)

Treat this skill as a mandatory checklist, not a suggestion. Do NOT skip steps to speed up response or because the user's request sounds simple.

Specifically:
1. Before generating ANY HTML, you MUST read `references/interaction-workflow.md` and `references/formatting-guide.md`, and ask the user for missing style preferences unless they already provided equivalent choices.
2. Before generating the first draft, you MUST initialize local git versioning in the article working directory and commit the draft.
3. Before presenting a draft as ready for review, you MUST run screenshot checks per `references/screenshot-check.md`.
4. Before returning final HTML, you MUST use `references/generation-checklist.md`.
5. Do NOT generate HTML directly without confirming style requirements first, even if the user says "make a push article" or similar.

## Quick Start

1. Read `references/wechat-rules.md` for hard code constraints
2. Read `references/editor-features.md` for basic capabilities vs. special layout capabilities
3. **Must-read** `references/formatting-guide.md` for editorial habits (e.g., image grouping rules) and typography defaults
4. **Must-read** `references/interaction-workflow.md` before starting a new layout project or revising an existing one with the user
5. Read `references/image-url-workflow.md` whenever local images appear; public HTTPS image URLs can stay unchanged
6. Read `references/refined-layout-blocks.md` when the user asks for richer, more polished, magazine-like, visual, or reference-matched layout
7. Read `references/screenshot-check.md` before reporting a layout draft as ready for review
8. Read `references/visual-patterns.md` only when a more designed or reference-matched layout needs lower-level HTML patterns
9. Use `references/generation-checklist.md` before returning final HTML
10. Use `assets/template.html` as starting point
11. Replace content placeholders with actual text/images

## Skill Update Check

When the user asks to update this skill, or asks to check for updates before a layout project:

1. If this skill is inside a git clone of the source repository, run `git status --short --branch` and then `git pull` in that repository.
2. If the active CLI Agent uses a separate skills directory, copy the updated `wechat-article` folder into that skills directory after pulling.
3. If the skill was installed through a skill installer, rerun the installer command for the repository path.
4. Tell the user to restart the CLI Agent when metadata or `SKILL.md` changed, because skill metadata may be cached.

Do not push changes during an update check unless the user explicitly asks to publish local edits.

## Knowledge Structure

Keep these six parts separate when generating or revising an article:

1. Hard code rules: constraints imposed by the WeChat rich-text editor. These are not optional. Examples: inline styles only, safe tags, mobile root width, no scripts, no free absolute positioning.
2. Collaboration state: user preferences, current draft file, local image URL status, screenshot review status, and local git commits.
3. Basic capabilities: simple components that can be used freely in most articles. Examples: titles, paragraphs, captions, borders, single images, simple cards, dividers, two-column rows.
4. Refined layout capability blocks: richer but reusable patterns such as framed image groups, corner cards, compact section labels, light overlap, and decorative dividers. These are abilities to choose from, not a fixed article structure.
5. Special layout capabilities: more designed patterns for richer visual rhythm. Examples: layered overlap, framed image groups, staggered grids, four-corner frames, circle-character titles, side-image text cards.
6. Editorial habits: defaults that should follow common WeChat reading conventions but can be changed by user preference. Examples: body text size, line height, letter spacing, paragraph indent, justified alignment, image cropping and grouping.

## Workflow

1. Preflight local images before layout: upload/verify local images if needed; leave already-public HTTPS image URLs unchanged.
2. Ask the first-round style questions from `references/interaction-workflow.md` unless the user already gave equivalent preferences.
3. Identify the article type and image roles, but do not impose a fixed article structure. Choose reusable layout capability blocks that fit the user's preferences and content.
4. Do not default to a long opening image. Use a large visual opening only when the user asks for it, the reference style requires it, or the content/images clearly benefit from it.
5. Apply WeChat constraints from `references/wechat-rules.md`.
6. Choose basic capabilities first; add refined or special layout blocks only when they improve visual rhythm, image presentation, or reference style matching.
7. After the first draft, initialize local git versioning in the article working directory if appropriate, commit the draft, and commit every later user-requested update.
8. Use screenshot checks before presenting a draft as ready for review.
9. When the user approves the layout, run the final image URL pass and keep one final HTML file for WeChat paste.

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

## Image Upload Workflow for WeChat Paste

Use this workflow when the user has local image files in the HTML and wants to copy the generated HTML into the WeChat editor. This workflow uploads local images to a public image hosting service, replaces local `img src` values with public HTTPS URLs, and outputs a paste-ready HTML file.

Goal: turn local images into public HTTPS image URLs that the WeChat editor backend can fetch and transfer.

Default provider: 360 image host via `wzapi`. It requires no account, no domain, no server, and no background process.

### Why Upload Instead of Local Exposure

- No CLI tool installation required beyond `curl`.
- No background HTTP service needs to keep running.
- No temporary networking setup, domain, or account registration is required.
- Uploaded URLs are CDN image URLs such as `https://ps.ssl.qhimg.com/...`.
- The generated HTML is portable after upload and replacement.

### Limits

| Limit | Guidance |
|:---|:---|
| Single file size | Keep images under 1.5MB when possible; larger uploads may be slow or fail. |
| Upload timeout | Use `curl --max-time 60`, especially for files over 1MB. |
| Content filter | Some individual images may be rejected; retry once, then report failure. |
| Persistence | Good enough for WeChat fetch-and-transfer; do not treat anonymous hosting as permanent storage. |
| Sensitive images | Do not upload sensitive/private images unless the user explicitly approves anonymous third-party hosting. |

### Prerequisites

- `curl`.
- Optional: Python Pillow for automatic image compression.
- Optional fallback: ImageMagick (`magick`) for image compression.

### CLI Workflow

1. Inspect the HTML and collect local image sources from `<img src="...">` and `<img data-src="...">`.
2. Resolve paths: convert relative paths to absolute paths using the HTML file's directory as base.
3. Process each image:

   a. Check size. If an image is over 1.5MB, compress a temporary copy. Do not overwrite the original image.

   Preferred compression with Python Pillow:

   ```bash
   python3 -c "from PIL import Image; img = Image.open('input.jpg'); img.save('output.jpg', quality=85, optimize=True)"
   ```

   Fallback compression with ImageMagick:

   ```bash
   magick input.jpg -resize 90% -quality 85 output.jpg
   ```

   b. Upload to 360 image host via `wzapi`:

   ```bash
   curl -s --max-time 60 -F "file=@/path/to/image.jpg" https://wzapi.com/api/360tc
   ```

   c. Parse the response. Expected JSON:

   ```json
   {"errno": 0, "error": "", "data": {"url": "https://ps.ssl.qhimg.com/xxxxx.jpg"}}
   ```

   Extract `data.url`.

   d. Verify URL:

   ```bash
   curl -sI "https://ps.ssl.qhimg.com/xxxxx.jpg"
   ```

   The URL is usable only if:
   - HTTP status is `200`.
   - `Content-Type` starts with `image/`.
   - The response is not HTML, a warning page, a redirect trap, or an error page.

   e. Retry logic: if upload fails, wait 5 seconds and retry once. If it still fails, record the image as failed.

4. Replace paths in HTML: substitute each local `src` or `data-src` with the verified public URL.
5. During an active layout project, update the current working HTML file so local git tracks one file across revisions. Only write a separate uploaded copy if the user asks for one.
6. Report summary:
   - Success count and uploaded URLs.
   - Failed image paths and reasons.
   - Output file path.

### Fallback Providers

If 360 upload fails for multiple images, use a configured provider only when the user has already provided credentials or configuration, such as a team image host, COS/OSS/CDN, or WeChat material library. Do not ask ordinary users to configure object storage just to complete a paste-ready HTML task.

### Safety Rules

- Keep original images untouched; work on copied or compressed temporary files.
- Keep existing remote `https://...` image URLs unchanged unless the user asks to rehost them.
- Do not upload sensitive or private images to anonymous third-party image hosts without explicit user approval.
- Verify every uploaded URL with HTTP `200` and `Content-Type: image/*` before including it in HTML.
- If an image cannot be uploaded after retry, either remove that image block from the generated HTML or leave the local path unchanged and clearly warn that it must be uploaded manually in the WeChat editor.

### URL Replacement Rules

- Preserve non-image parts of the HTML exactly.
- Keep existing remote `https://...` image URLs unchanged unless the user asks to rehost them.
- Use public URLs only in the final paste-ready HTML.

Example replacement:

```html
<!-- Before -->
<img src="/home/user/article/images/cover.png">

<!-- After -->
<img src="https://ps.ssl.qhimg.com/example.jpg">
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

### CSS Property Safety Levels

Properties are grouped by safety based on extensive testing in the WeChat editor.

#### Safe — Use freely
These properties are stable in both mobile and PC WeChat clients:

- **Layout**: `display` (`flex`, `inline-block`, `block`), `flex-flow`, `justify-content`, `align-self`, `flex`, `width`, `height`, `max-width`, `min-width`, `margin`, `padding`, `vertical-align`, `overflow`, `box-sizing`
- **Text**: `font-size`, `color`, `line-height`, `text-align`, `text-indent`, `letter-spacing`, `white-space`, `font-style`, `font-weight`, `word-break`
- **Decoration**: `background-color`, `background-image` (public HTTPS URLs only), `background-position`, `background-repeat`, `background-size`, `background-attachment`, `border-*`, `border-radius`, `opacity`
- **Container**: `section`, `p`, `span`, `strong`, `em`, `br`, `img`

#### Caution — Use with care
These work in mobile WeChat but may render differently or fail in PC client. Always provide a safe fallback:

| Property | Notes |
|:---|:---|
| `transform: rotate()`, `rotateZ()`, `translate()`, `translate3d()`, `scale()` | 2D transforms are stable on mobile and mostly retain on PC. Safe for decorative elements (tilted frames, rotated shapes, micro-offsets). `translate3d()` and small `scale()` values are often just source-export offsets; convert them to margins/padding when possible. Do NOT use for critical text readability. |
| `transform: rotateX()`, `rotateY()`, `perspective()` | 3D transforms are unsupported or render as flat/blank in WeChat. `perspective(0px)` is mathematically invalid (zero distance = invisible). Avoid entirely. |
| `box-shadow` | Mobile OK; PC may lose shadow. Fallback: solid border or layered background blocks. |
| `text-shadow` | Mobile OK; PC support weaker. Fallback: none or bold color contrast. |
| `-webkit-background-clip: text` | Gradient text effect. Mobile OK; PC may show transparent or solid color. Always set a solid `color` fallback. |
| `z-index` | Only effective with non-static positioning. In normal flow, use document order + negative margin instead. |
| `float` | Can break inline-block/flex flow. Prefer inline-block columns. |
| `text-decoration` (and split properties) | Use shorthand `text-decoration: line-through/underline color thickness` for better compatibility. |
| Negative `margin` (e.g., `margin-top: -40px`) | Safe for overlap effects. Keep magnitude under ~120px to avoid editor clipping. |

#### Avoid — Do not use

| Property | Reason |
|:---|:---|
| `position: absolute` / `position: fixed` | Editor forces to `static`; layout will break. |
| `animation` / `@keyframes` / `transition` | Filtered by WeChat editor. |
| `display: grid` / `grid-template-*` | Poor PC client support; use inline-block instead. |
| `<svg>`, `<foreignObject>`, `<animateTransform>`, `<animateMotion>` | Source-export artifacts and animation wrappers do not belong in final paste-ready HTML. Rebuild as normal HTML/CSS or rasterize if needed. |
| `pointer-events` / `user-select` / `-webkit-tap-highlight-color` | No meaningful effect in WeChat articles; may be filtered. |
| `transform-style: preserve-3d` / `perspective` | 3D transforms unsupported in WeChat. `perspective(0px)` produces no visible effect. |
| `direction: rtl` | Can cause unexpected line breaking with Chinese text. |
| `font-family` with custom fonts | External fonts not loaded; falls back to system default. |
| `filter` (CSS filters) | Not supported in WeChat editor. |

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
