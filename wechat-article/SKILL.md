---
name: wechat-article
description: Generate and iteratively refine WeChat Official Account (微信公众号) article HTML from user-provided content and images. Use when the user needs paste-ready WeChat rich-text HTML, mobile-first article layout, refined image/text typesetting, reference screenshot style matching, local image URL publication, local git versioning for layout drafts, or screenshot-based visual checks. Covers inline-style compatibility rules, reusable refined layout capability blocks, user collaboration workflow, image URL preflight/finalization, and paste-readiness checks.
---

# WeChat Push Article HTML Generator

Generate HTML that renders correctly in WeChat's rich-text editor and looks good on mobile (375px width).

> **Language Rule**: All user-facing responses and generated article content must be in Chinese. Internal reasoning and code comments may remain in English, but every explanation, label, caption, and body paragraph delivered to the user must be Chinese.

## Task Scope

Use this skill to produce paste-ready HTML fragments for WeChat Official Account articles. The output should be self-contained HTML with inline styles, not a full standalone web app.

This skill also supports automatic draft publishing to WeChat Official Account when the user provides WeChat API credentials (AppID/AppSecret). See `scripts/auto_publish.py` for the implementation.

---

## Execution Rule (Highest Priority)

Treat this skill as a mandatory checklist, not a suggestion. Do NOT skip steps to speed up response. Follow the steps in order:

### Phase 0: Preflight

0. **Create todo list**: After reading the workflow and understanding the user's content, create a todo list that covers every phase and step below. Mark items as completed only after they are actually done. Do NOT skip steps.

1. **Read required references**: Before generating ANY HTML, read `references/interaction-workflow.md` and `references/formatting-guide.md`.

2. **Ask first-round style questions** (from `references/interaction-workflow.md`):
   - Color direction / theme
   - Refinement level
   - Image style
   - Opening style
   - Body text habit (indent / alignment)

   **Do NOT skip this step.** Even if the user says "you decide" in the first message, present the questions and wait for explicit answers. Once answered, briefly summarize your understanding and ask the user to confirm before proceeding.

2b. **Ask SVG usage**: Explicitly ask whether the user wants SVG-based visual effects (animations, interactive components). **If SVG is involved, Manual Paste (copy-paste) is strictly prohibited** — the content must be migrated via Auto-Publish (WeChat API) or browser extension injection. See `references/svg-compatibility.md`.

3. **Ask publish workflow**: ALWAYS ask whether to use Auto-Publish (WeChat API) or Manual Paste. Do not assume either path. **If SVG is involved, Manual Paste is NOT an option** — the user must choose Auto-Publish (WeChat API) or browser extension injection.

4. **Ask layout guidance**: After style preferences are confirmed, ask the layout structure question:
   ```text
   Do you want to arrange the layout yourself? You can:
   1. Open the visual drag-and-drop composer to place components
   2. Upload a reference screenshot / template for me to match
   3. Let me decide the layout based on the content
   ```
   - Option 1 → launch `wechat-article/tools/layout-composer.html`; follow `references/visual-layout-workflow.md`.
   - Option 2 → follow **Reference Screenshot Workflow** below.
   - Option 3 → proceed with AI-chosen layout; do not read `visual-layout-workflow.md`.

5. **Test image hosting immediately after receiving content**: Before ANY layout work, verify the image hosting solution:
   - Auto-Publish: test `access_token` + one image upload to WeChat CDN
   - Manual Paste + local images: upload one test image to the default provider (360 via `wzapi`) and verify with `curl -I`
   - External hosting provided by user: verify one URL is accessible
   - **If SVG is used**: test SVG `<image>` source URLs separately — 360图床 fails in API-published SVG but works in Manual Paste; WeChat CDN (`mmbiz.qpic.cn`) works in both. See `references/image-url-workflow.md`.

6. **Initialize git in WORK directory**: Before generating HTML, `git init` in the AI's working directory (the actual project folder where the article is being built — NOT inside the skill directory). This ensures version control from the very first draft. Copy any needed scripts from `wechat-article/scripts/` to the working directory before running them. Never modify files inside the skill directory.

### Phase 1: Layout & Generation

7. **Preflight local images**: Upload local images to appropriate host; leave already-public HTTPS URLs unchanged. See Image Upload Workflow below.

8. **Generate HTML**: Choose layout blocks that fit user preferences and content. Do not default to a long opening image unless the user asked for it. Apply WeChat constraints from `references/wechat-rules.md`. Use basic capabilities first; add refined layout blocks only when they improve the result. See `references/refined-layout-blocks.md`.

9. **Background color handling** (per `references/background-color-guide.md`):
   - Root container: no `background-color` (WeChat forces white)
   - Each section carries its own background via wrapper `<section>`
   - Use opaque `rgb()` — never `rgba()` for backgrounds or gradient end-stops
   - For full-article coverage: tile colored wrapper sections edge-to-edge

10. **Inline-block layout safety** (per `references/inline-block-safety.md`):
    - Total width ≤ 92% (recommend ≤ 90%) for mobile
    - Gap via `padding-left`, not `margin-right`
    - **Symmetric padding rule**: all columns in a row must have equal `padding-left + padding-right` sums so content areas are identical. Gap = left column's `padding-right` + right column's `padding-left`.
    - One row = one container; never stuff multiple rows into same parent
    - Use `<!-- -->` between inline-block elements
    - `vertical-align: top` for consistent alignment

### Phase 2: Verification

11. **Screenshot check**: Before presenting a draft as ready for review, capture a screenshot (viewport 430×1600) via `chromium --headless --screenshot`. If the current model lacks vision capability, skip visual screenshot analysis and tell the user to verify manually in browser.

12. **3-round self-check** (per `references/self-check-workflow.md`):
    - Round 1: Code Compliance (12 checks) — auto-check by AI
    - Round 2: Visual Consistency (10 checks) — auto-check + screenshot
    - Round 3: Content Integrity (8 checks) — auto-check + user confirm
    - Fix issues and re-check until all pass. Do NOT deliver until critical checks pass.

13. **Final image URL pass**: Rescan HTML; all `src` must be public HTTPS. Verify every URL with `curl -I`. No local paths, no file:// URLs.

14. **Run `references/generation-checklist.md`** before returning final HTML.

### Phase 3: Delivery

15. **Auto-Publish**: Run `scripts/auto_publish.py` with user's AppID/AppSecret.
16. **Manual Paste**: Instruct user: open HTML in browser → `Ctrl+A` → `Ctrl+C` → paste into mp.weixin.qq.com editor → `Ctrl+V` → verify mobile preview.

---

## Clarifying Style Requirements

**MANDATORY: Ask the first-round style questions before generating any HTML, unless the user has already explicitly answered all of them in the current conversation.**

Do not skip the questions even if the user says "you decide". The user must confirm or select from the choices.

Ask one compact question with grouped choices (from `references/interaction-workflow.md`):

```text
Before I typeset this WeChat article, I need a few layout choices:
1. Color direction: muted / warm / cool / bright / dark / use reference screenshot / provide theme color
2. Refinement level: clean basic / polished / rich visual / highly decorative
3. Image style: simple full-width / framed photos / staggered groups / text-image cards / follow reference screenshot
4. Opening style: text-first / compact image + title / large visual opening / follow reference screenshot
5. Body habit: first-line indent / no indent / left aligned / justified
```

Decision rule:
- **Step 1 (Ask):** Present the questions. "You decide" before being asked is NOT permission to skip.
- **Step 2 (Evaluate):** Follow concrete answers. If user says "you decide" AFTER being asked, choose reasonable defaults and state them.
- **Step 3 (Proceed):** Only generate HTML after Step 2 is resolved.
- Ask again only for factual items (names, URLs, dates, official identities).
- **Exception: do not repeat questions the user already answered earlier in the same thread.**

---

## Auto-Publish Workflow

When the user wants automatic draft publishing to WeChat Official Account (草稿箱), use `scripts/auto_publish.py`.

### Prerequisites

- WeChat Official Account AppID and AppSecret
- Server IP whitelisted in WeChat MP backend (IP白名单)
- `requests` library installed (`pip install requests`)

### API Endpoints

| Endpoint | Purpose |
|:---|:---|
| `POST /cgi-bin/token` | Get access_token |
| `POST /cgi-bin/media/uploadimg` | Upload content images to WeChat CDN |
| `POST /cgi-bin/material/add_material?type=thumb` | Upload thumbnail image |
| `POST /cgi-bin/draft/add` | Create new draft |
| `POST /cgi-bin/draft/update` | Update existing draft |
| `POST /cgi-bin/draft/batchget` | List drafts |

### Key Implementation Notes

1. **Unicode**: Always `json.dumps(data, ensure_ascii=False).encode('utf-8')`.
2. **Image upload**: Content images MUST go to WeChat CDN (`mmbiz.qpic.cn`). WeChat blocks external URLs.
3. **Thumbnail**: REQUIRED (200×200px recommended, `thumb_media_id`).
4. **Draft ID persistence**: Save to `.wechat_draft_id` for subsequent updates.
5. **Error codes**: `40007` (invalid media_id), `45004` (digest too long), `40001` (token expired).

### Usage

```python
from scripts.auto_publish import publish_article

media_id = publish_article(
    appid="your_appid",
    appsecret="your_appsecret",
    title="文章标题",
    html_content=html_string,
    thumb_source="/path/to/thumb.jpg",
    author="作者姓名",
    digest="可选摘要；不传时脚本会从正文自动生成"
)
```

### Image Hosting Note

If the user already has image hosting with public HTTPS URLs, skip WeChat CDN upload. WeChat CDN upload is only needed for local files, blocked external URLs, or long-term stability.

---

## Reference Screenshot Workflow

When the user provides a reference screenshot or asks to match a style:

1. **Analyze**: structure, color palette, typography hierarchy, spacing rhythm, visual devices, image treatment.
2. **Translate**: Use inline styles, 375px root, `inline-block` rows, negative margins — no absolute positioning.
3. **Preserve content**: Keep user wording unchanged unless rewriting is requested. Don't invent metadata.
4. **Approximate what can't be exact**: borders for shadows, normal flow for complex positioning, `border-radius` for shapes. Drop animations, filters, and unsupported tags.

---

## Image Upload Workflow

Turn local images into public HTTPS URLs for WeChat paste. Default provider: 360 image host via `wzapi` (no account required).

### Limits

| Limit | Guidance |
|:---|:---|
| File size | Keep under 1.5MB; larger may fail |
| Upload timeout | `curl --max-time 60` |
| Content filter | Some images may be rejected; retry once |
| Persistence | Good for WeChat fetch-and-transfer; not permanent storage |
| Sensitive images | Don't upload without explicit user approval |

### CLI Workflow

1. Collect local `src` paths from HTML.
2. For images >1.5MB, compress a temp copy (Pillow: `quality=85, optimize=True`).
3. Upload: `curl -s --max-time 60 -F "file=@/path/to/image.jpg" https://wzapi.com/api/360tc`
4. Parse `{"errno": 0, "data": {"url": "https://ps.ssl.qhimg.com/..."}}` → extract `data.url`.
5. Verify: `curl -sI "<url>"` → HTTP 200 + `Content-Type: image/*`.
6. Replace local paths in HTML with verified public URLs.
7. Retry once on failure; report failed images to user.

---

## Manual Paste Workflow

After generating final paste-ready HTML:

1. Open the HTML file in a browser.
2. `Ctrl+A` (select all).
3. `Ctrl+C` (copy).
4. Open mp.weixin.qq.com editor, click body area, `Ctrl+V` (paste).
5. Verify mobile preview before saving.

---

## Output Contract

- Root `<section>` with `width: 100%; max-width: 375px; margin-left: auto; margin-right: auto;`.
- Inline styles only.
- `<section>` for containers; `<p>`, `<span>`, `<strong>`, `<em>`, `<br>` for text; `<img>` for images.
- All images: `width: 100%; max-width: 100%; display: block; margin: 0 auto;` (unless intentionally narrower).
- No invented contact details, organization names, authors, QR codes, or publication metadata.
- Preserve user-provided wording and facts.

---

## Core Principles

### Mobile-First

Root container pattern:

```html
<section style="width: 100%; max-width: 375px; margin-left: auto; margin-right: auto; text-align: center;">
  <!-- all content -->
</section>
```

- Use `margin-left: auto; margin-right: auto` (not `margin: 0 auto`) for reliable PC centering.
- Root container does NOT set `background-color` — WeChat forces white. Use wrapper sections for colored backgrounds (see `references/background-color-guide.md`).

### Inline Styles Only

No `<style>` tags, no `class` attributes, no external CSS. All styles in `style=""`.

### Tag Whitelist

- **Containers**: `<section>`
- **Text**: `<p>`, `<span>`, `<strong>`, `<em>`, `<br>`
- **Images**: `<img>` (must have `width: 100%; max-width: 100%`)
- **FORBIDDEN**: `<script>`, `<style>`, `<iframe>`, `<h1-h6>`, `<table>`, `<ul>/<ol>`

### CSS Property Safety Levels

#### Safe — Use freely

**Layout**: `display` (`flex`, `inline-block`, `block`), `flex-flow`, `justify-content`, `align-self`, `flex`, `width`, `height`, `max-width`, `min-width`, `margin`, `padding`, `vertical-align`, `overflow`, `box-sizing`
**Text**: `font-size`, `color`, `line-height`, `text-align`, `text-indent`, `letter-spacing`, `white-space`, `font-style`, `font-weight`, `word-break`
**Decoration**: `background-color`, `background-image` (public HTTPS URLs), `background-position`, `background-repeat`, `background-size`, `background-attachment`, `border-*`, `border-radius`, `opacity`, `box-shadow`

#### Caution — Use with care

| Property | Notes |
|:---|:---|
| `transform: rotate()`, `rotateZ()`, `translate()`, `translate3d()`, `scale()` | Safe for decorative elements. For critical text, convert to margins/padding. |
| `transform: rotateX()`, `rotateY()`, `perspective()` | 3D transforms unsupported; avoid entirely. |
| `text-shadow` | Mobile OK; PC weaker. Provide fallback. |
| `-webkit-background-clip: text` | Mobile OK; PC may degrade. Always set solid `color` fallback. |
| `z-index` | Only with non-static positioning. Use document order + negative margin instead. |
| `float` | Can break inline-block flow. Prefer inline-block. |
| `text-decoration` | Use shorthand `text-decoration: line-through/underline color thickness`. |
| Negative `margin` | Safe for overlap; keep under ~120px. |
| SVG (`<svg>`, `<animate>`, `<animateTransform>`, `<animateMotion>`) | Conditionally supported. Use only when the user explicitly requests SVG effects, and follow `references/svg-compatibility.md`. No filters, no gradients, no CSS animation inside SVG. |

#### Avoid — Do not use

| Property | Reason |
|:---|:---|
| `position: absolute` / `position: fixed` | Editor forces to `static`. |
| `animation` / `@keyframes` / `transition` | Filtered by WeChat. |
| `display: grid` / `grid-template-*` | Poor PC support; use inline-block. |
| `pointer-events` / `user-select` / `-webkit-tap-highlight-color` | No meaningful effect. |
| `transform-style: preserve-3d` / `perspective` | 3D unsupported. |
| `direction: rtl` | Breaks Chinese line breaking. |
| `font-family` with custom fonts | Falls back to system default. |
| `filter` | Not supported. |

### Alignment Rules

- Root: `text-align: center` for centering inline-block children.
- Body paragraphs: explicitly override with `text-align: justify` or `text-align: left`, plus `text-indent: 2em` for Chinese prose.
- Images: both `text-align: center` on parent AND `display: block; margin: 0 auto` on `<img>`.
- Prefer `inline-block` rows over `flex` for cross-platform reliability.

---

## Layout Capability References

Instead of duplicating patterns here, use the reference files organized by capability level:

| Need | Reference File | When to Read |
|:---|:---|:---|
| Hard compatibility rules | `references/wechat-rules.md` | Always |
| Basic capabilities (headings, cards, dividers) | `references/editor-features.md` | Always |
| Refined layout blocks (structural patterns) | `references/refined-layout-blocks.md` | User wants polished/rich layout |
| Decorative patterns (dividers, shapes, transforms) | `references/decorative-patterns.md` | Adding visual flourishes |
| Background color / dark theme handling | `references/background-color-guide.md` | Colored backgrounds, dark themes |
| Inline-block layout safety | `references/inline-block-safety.md` | Multi-column layouts |
| SVG compatibility | `references/svg-compatibility.md` | User explicitly requests SVG effects |
| Visual layout composer | `references/visual-layout-workflow.md` | User chooses drag-and-drop composer |

---

## Formatting Defaults

Adaptable defaults (override with user preferences):

| Element | Default Size | Default Color | Alignment | Other |
|:---|:---:|:---|:---|:---|
| Body text | 16px | rgb(62,62,62) | justify | line-height: 1.8, text-indent: 2em |
| Image caption | 14px | rgb(100,100,100) | center | — |
| Footer text | 14px | rgb(128,128,128) | right | — |
| Section title | 20px | theme color | left | — |
| Header subtitle | 14px | rgb(200,200,200) | center | letter-spacing: 2px |
| Header title | 28px | rgb(255,255,255) | center | — |

For detailed editorial habits (image grouping, caption conventions, footer patterns), see `references/formatting-guide.md`.

---

## Testing

- **Browser preview**: Open HTML file, view at 375px width.
- **WeChat editor (ground truth)**: Copy → Paste into mp.weixin.qq.com editor → verify rendering.

---

## Image Requirements

- All images: `width: 100%; max-width: 100%; display: block; margin: 0 auto;`.
- Container: `line-height: 0` to remove gap below image.
- Image URLs must be public HTTPS. For Manual Paste, third-party hosts (360 etc.) are fine. For Auto-Publish, prefer WeChat CDN (`mmbiz.qpic.cn`). See `references/image-url-workflow.md` for details.

---

## SVG Support

> **Status**: ✅ Verified through 9 rounds of actual publishing (2026-05-08). Use only when the user explicitly requests SVG-based visual effects.

### Critical Rules

| # | Rule | Reason |
|:---|:---|:---|
| 1 | Images must use WeChat CDN (`mmbiz.qpic.cn`) | External/Base64/Data URI filtered |
| 2 | Animations must use SMIL | CSS animations unsupported |
| 3 | Styles must use inline attributes | `style` attributes and `<style>` filtered |
| 4 | No interaction events | `onclick`, `onmouseover` unsupported |
| 5 | 2D transforms only | `rotate()`, `translate()`, `scale()`, `skewX()` OK |
| 6 | No `class`/`id` | Removed by editor |
| 7 | No `<script>` | Prohibited |
| 8 | Auto-play only | `repeatCount="indefinite"` for loops |
| 9 | No filters | `<filter>`, `<feGaussianBlur>` filtered |
| 10 | No gradients | `<linearGradient>`, `<radialGradient>` filtered |
| 11 | No clipping | `clipPath` filtered |
| 12 | Use `href` not `xlink:href` | `xlink:href` filtered |

### Verified Working

- SMIL tags: `<animate>`, `<animateTransform>`, `<animateMotion>`, `<set>`
- 2D transforms: `translate()`, `scale()`, `rotate()`, `skewX()` / `skewY()`

Full compatibility matrix in `references/svg-compatibility.md`.

---

## Quick Start

1. Read `references/wechat-rules.md` — hard code constraints
2. Read `references/editor-features.md` — basic vs. special capabilities
3. Read `references/formatting-guide.md` — editorial habits and typography defaults
4. Read `references/interaction-workflow.md` — collaboration and iteration workflow
5. Read `references/image-url-workflow.md` — whenever local images are involved
6. Read `references/refined-layout-blocks.md` — structural patterns (headers, cards, image grids)
7. Read `references/decorative-patterns.md` — decorative patterns (dividers, shapes, transforms)
7. Read `references/screenshot-check.md` — before presenting draft as ready
10. Read `references/background-color-guide.md` — colored backgrounds or dark themes
11. Read `references/inline-block-safety.md` — multi-column layouts
12. Read `references/self-check-workflow.md` — mandatory 3-round self-check before delivery
11. Read `references/generation-checklist.md` — before returning final HTML
12. Read `references/svg-compatibility.md` — only when user explicitly requests SVG effects
13. Read `references/visual-layout-workflow.md` — only when user chooses drag-and-drop composer

---

## Skill Update Check

**Source repository:** `git@github.com:WindGraham/wechat-ai-publisher.git` (GitHub)

When updating this skill: `git status --branch` → `git pull` → copy updated `wechat-article/` folder into the active skills directory. Restart the CLI Agent if `SKILL.md` changed (metadata may be cached).
