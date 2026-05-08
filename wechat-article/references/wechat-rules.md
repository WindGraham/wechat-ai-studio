# WeChat Rich-Text Code Rules

This file contains hard compatibility rules for HTML that will be pasted into the WeChat Official Account rich-text editor. These rules are different from visual capability guidance and editorial habits: do not relax them unless the user is deliberately testing editor behavior.

## Safe HTML Contract

**Document Priority (when rules conflict):**
1. **wechat-rules.md** — Hard constraints. Never violate unless deliberately testing editor behavior.
2. **SKILL.md** — Workflow and scheduling. Follow the execution order and mandatory checks.
3. **visual-patterns.md** / **refined-layout-blocks.md** — Optional pattern libraries. Use when they improve visual rhythm; drop if they conflict with wechat-rules.md.

- Use one root `<section>` with `width: 100%; max-width: 375px; margin-left: auto; margin-right: auto;`.
- Use inline styles only. Do not emit `<style>` blocks or external CSS.
- Prefer `<section>` for layout containers.
- Use `<p>`, `<span>`, `<strong>`, `<em>`, `<br>`, and `<img>` for content.
- Avoid `<script>`, `<iframe>`, `<table>`, `<form>`, `<input>`, and interactive controls.
- Avoid `position: absolute`, `position: fixed`, CSS animation, CSS transition, `filter`, and layout that depends on JavaScript.
- **Default to `display: inline-block` for all column layouts.** Only use `display: flex` when the user explicitly requests it AND you include `flex: 0 0 auto` on every flex child with an inline-block fallback.
- Do not use CSS grid for final paste-ready HTML.
- `<svg>`, `<animate>`, `<animateTransform>`, and `<animateMotion>` are **verified working** in WeChat articles when used correctly. See `references/svg-compatibility.md` for the full compatibility matrix.
- **SVG is safe for**: basic shapes, SMIL animations (opacity, transform, path motion), and `<image>` with WeChat CDN URLs.
- **SVG is NOT safe for**: filters (`<filter>`), gradients (`<linearGradient>`, `<radialGradient>`), `clipPath`, `textPath`, CSS animations, `style` attributes inside SVG, `class`/`id`, or external/non-CDN image URLs.
- `<foreignObject>` embedding HTML/images remains high-risk; prefer plain HTML/CSS alternatives when possible.
- By default, if the user does not request SVG features, use normal HTML/CSS. If the user explicitly requests SVG-based visual effects, follow `references/svg-compatibility.md`.
- Every `<img>` should include `width: 100%; max-width: 100%; display: block; margin: 0 auto;` unless a narrower image is intentional.
- Use `box-sizing: border-box` on layout blocks when padding or borders are involved.
- Use `overflow: hidden` on image containers when `border-radius` clipping is needed.
- `background-image` is safe when the URL is a public HTTPS image (or WeChat material-library URL). It can be used for decorative backgrounds, hero banners, and texture fills.
- Use `overflow: hidden` on image containers when border-radius or clipping is needed.

## Background Color Limitations

WeChat rich-text editor **does not support custom article background colors**. Any `background-color` set on the root container will be overridden to white by the editor. This is a platform-level restriction, not a rendering bug.

### Rules

- **Do not rely on a dark or colored root background.** The editor forces the page background to white regardless of what the HTML specifies.
- **Dark themes must be built with dark card blocks.** Use explicit wrapper sections with solid dark `background-color` values so each content block carries its own color.
- **Avoid semi-transparent dark colors (`rgba`) for overlays or gradient end-stops.** On a browser with a dark background, `rgba(18,18,24,0.98)` looks nearly solid dark. On WeChat's forced-white background, the same value mixes with white and becomes a muddy light-gray/blue. Always use opaque `rgb()` for the final layer of any gradient or overlay that is meant to look dark.
- **Wrap related elements in a shared dark wrapper** when a section (cover, chapter header, content block) is meant to appear as one continuous dark area. This prevents white gaps from showing between the image and the text/card beneath it.

Example structure:

```html
<!-- The editor background is forced white; the outer section carries the dark block -->
<section style="background-color: rgb(28,28,36);">
  <img src="..." style="width: 100%; display: block; margin: 0 auto;">
  <section style="margin-top: -110px; padding: 50px 20px 25px; background: linear-gradient(to top, rgb(28,28,36), rgba(28,28,36,0));">
    <p>Title</p>
  </section>
  <section style="background-color: rgb(22,22,28); padding: 20px;">
    <p>Content...</p>
  </section>
</section>
```

## Alignment Rules (Critical for PC View)

WeChat mobile app width = 375px. WeChat PC client width > 375px. **Alignment must work in both.**

### Root Container (Must Be Centered)

```html
<section style="width: 100%; max-width: 375px; margin-left: auto; margin-right: auto; text-align: center;">
  <!-- all content -->
</section>
```

| Property | Value | Why |
|:---|:---|:---|
| `width` | `100%` | Fill available width on mobile |
| `max-width` | `375px` | Limit to mobile width on PC |
| `margin-left/right` | `auto` | Force centering (more reliable than `margin: 0 auto`) |
| `text-align` | `center` | Default all children to center |

For root container centering, we recommend `margin-left: auto; margin-right: auto;` over `margin: 0 auto` for better reliability in the WeChat PC client.

### Text Paragraphs (Override Root Center)

```html
<p style="text-align: left; text-indent: 2em;">
  正文内容...
</p>
```

Root container sets `text-align: center`. Paragraphs must explicitly override to `left` for proper reading.

### Text Alignment

Use `text-align` directly on the text block that owns the text:

| Alignment | Use For | Pattern |
|:---|:---|:---|
| `left` | Body paragraphs, explanations, source notes | `<p style="text-align: left;">...` |
| `center` | Titles, captions, short slogans, decorative labels | `<p style="text-align: center;">...` |
| `right` | Credits, dates, signatures | `<section style="text-align: right;">...` |
| `justify` | Formal long-form Chinese body text | `<p style="text-align: justify;">...` |

Rules:
- Root containers often use `text-align: center` to center inline-block children. Body paragraphs must override this with `text-align: left` or `text-align: justify`.
- Use `text-align: justify` only for multi-line prose. It can look odd on very short lines, captions, names, and headings.
- Use CSS `text-indent` for paragraph indentation. Do not add manual spaces before text.

### Images (Dual Centering)

Always use **both** methods:

```html
<!-- Method 1: Parent text-align:center + child inline-block -->
<section style="text-align: center;">
  <section style="display: inline-block; width: 100%; line-height: 0;">
    <img src="URL" style="width: 100%; display: block; margin: 0 auto;">
  </section>
</section>
```

| Method | Property | Purpose |
|:---|:---|:---|
| Parent | `text-align: center` | Horizontal centering |
| Image | `margin: 0 auto` | Backup centering (works when parent align fails) |
| Image | `display: block` | Required for margin:auto to work |

### Flex Layout Compatibility

**`display: flex` is NOT reliably supported in WeChat PC client.** Use `display: inline-block` instead.

### Overlap Without Absolute Positioning

For overlapping images, cards, titles, or decorations, keep elements in normal document flow and use negative margins. Do not use `position: absolute` or `position: fixed`.

Core method:
1. Render the base element first.
2. Render the overlapping element after it.
3. Move the overlapping element upward with `margin-top: -NNpx`.
4. Use the wrapper's `text-align: left`, `center`, or `right` to choose where the overlapping element sits horizontally.
5. If the overlap covers text, add enough `padding-top`, `padding-right`, or `padding-left` inside the text card so text does not sit under the overlapping image.

```html
<section style="text-align: center; padding: 0 15px; box-sizing: border-box;">
  <section style="line-height: 0; box-sizing: border-box;">
    <img src="BASE_IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
  </section>

  <section style="text-align: right; margin-top: -48px; padding-right: 12px; box-sizing: border-box;">
    <section style="display: inline-block; width: 42%; line-height: 0; border: 4px solid rgb(255,255,255); box-sizing: border-box;">
      <img src="OVERLAY_IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

Text card overlap rules:
- Put the text card before the overlapping image if the image should appear on top of the card.
- Give the text card extra top/side padding where the image overlaps.
- Use a small overlay image or decoration for corner overlaps; large overlaps can make the text hard to read.
- Use a white border around overlapping images when they sit on busy backgrounds.

### Gradient Overlay Rules

When a gradient is used to blend an image into a text card or background block:

- **The final color stop must be an opaque `rgb()` value** that exactly matches the background color of the element that follows. Do not use `rgba(..., 0.98)` or similar near-opaque values as the final stop, because the tiny remaining transparency will blend with WeChat's forced-white background and produce a visibly different, muddy color.
- **Prefer solid-color end-stops.** It is safe to start a gradient from a fully-transparent `rgba(..., 0)` and transition to a fully-opaque `rgb(...)`. It is not safe to end on a semi-transparent color when the intent is a solid dark surface.
- Example: use `linear-gradient(to top, rgb(28,28,36), rgba(28,28,36,0))` instead of `linear-gradient(to top, rgba(18,18,24,0.98), rgba(18,18,24,0))`.

### Multi-Element Row Alignment

When placing multiple elements in one row, use `inline-block` children inside a parent container. The parent's `text-align` controls the horizontal alignment of the row as a whole, while each child's `vertical-align` controls how the columns line up vertically.

```html
<section style="text-align: center; padding: 0 12px; box-sizing: border-box;">
  <section style="display: inline-block; width: 30%; vertical-align: top; box-sizing: border-box;">
    <!-- item 1 -->
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; box-sizing: border-box;">
    <!-- item 2 -->
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; box-sizing: border-box;">
    <!-- item 3 -->
  </section>
</section>
```

Parent alignment:
- `text-align: left` places the row at the left edge.
- `text-align: center` centers the row. This is the safest default for image groups.
- `text-align: right` places the row at the right edge.

Child vertical alignment:
- `vertical-align: top` aligns item tops. Use this for cards and images.
- `vertical-align: middle` aligns inline decorations or icons with text.
- `vertical-align: bottom` is useful for deliberate low/high visual rhythm, but `padding-top` is usually easier to control.

Spacing rules:
1. Use `<!-- -->` comments between inline-block children to remove whitespace gaps.
2. **Total rendered width must stay ≤ 92%** for reliable mobile safety. PC client tolerates up to 96%, but mobile WeChat counts inline-block whitespace differently and may add extra pixels, so design for 90%-92% total.
3. **Use `padding-left` on columns for gaps.** `padding` is absorbed inside `width` when `box-sizing: border-box` is used, so it does not increase total rendered width. Avoid `margin` for column gaps — margin adds to the total and can push the row over the mobile limit.
4. Avoid `padding-right` on a fixed-width left column when the row is close to 100%. Use `padding-left` on the right/adjacent column instead.
5. For staggered layouts, we recommend `padding-top` on selected columns over `position` or `transform`.
6. **Do not nest `display: inline-block`** — outer columns can be inline-block, but inner image wrappers should use plain `section` without `display: inline-block` to prevent mobile from treating them as block-level breaks.
7. **`box-sizing: border-box` is not fully reliable on mobile** — WeChat mobile editor sometimes adds padding outside the declared width. Leave a safety margin (≤ 92% total) rather than relying on exact box-sizing math.

### Inline-Block Two-Column (Safe Method)

```html
<section style="text-align: center; padding: 0 15px;">
  <section style="display: inline-block; width: 48%; vertical-align: top; box-sizing: border-box;">
    <!-- Left column -->
  </section><!--
  --><section style="display: inline-block; width: 44%; vertical-align: top; padding-left: 8px; box-sizing: border-box;">
    <!-- Right column -->
  </section>
</section>
```

**Critical rules:**
1. **Use `<!-- -->` comment** to eliminate whitespace between inline-block elements
2. **PC total width ≤ 96%**; **mobile total width ≤ 92%** (leave 8% safety margin for mobile)
3. **Use `padding-left` on right column** for spacing (not `padding-right` on left column)
4. **Never use `padding-right` + `width: 55%`** — it exceeds 100% with box-sizing

### Why `padding-right` Breaks Layout

```html
<!-- BAD: 55% + 8px padding-right = exceeds container width -->
<section style="width: 55%; padding-right: 8px;">...</section>
<section style="width: 45%;">...</section>

<!-- GOOD: 52% + 44% + 8px padding-left = safe -->
<section style="width: 52%;">...</section>
<section style="width: 44%; padding-left: 8px;">...</section>
```

With `box-sizing: border-box`, `padding-right` is added to the element's total width. Two columns with 55% + 8px + 45% = >100%, causing the right column to wrap to next line.

### Safe Two-Column Widths

| Left | Right | Gap | Total | Safe? |
|:---:|:---:|:---:|:---:|:---:|
| 50% | 50% | 0px | 100% | ⚠️ Risky (no gap) |
| 48% | 44% | 8px | 92% + 8px | ✅ Safe on both PC and mobile |
| 52% | 44% | 8px | 96% + 8px | ⚠️ Safe on PC; may wrap on mobile |
| 48% | 48% | 4% | 100% | ⚠️ Risky (gap by whitespace) |
| 100% | — | — | — | ✅ Single column (safest) |

**Recommendation**: For reliable cross-platform compatibility, use single-column layouts. Two-column only when necessary, with total width ≤ 92% on mobile.

### Inline-Block Three-Column (Safe Method)

Three columns are possible, but less forgiving than two columns. Keep widths conservative.

```html
<section style="text-align: center; padding: 0 12px; box-sizing: border-box;">
  <section style="display: inline-block; width: 30%; vertical-align: top; box-sizing: border-box;">
    <!-- Left column -->
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-left: 8px; box-sizing: border-box;">
    <!-- Center column -->
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-left: 8px; box-sizing: border-box;">
    <!-- Right column -->
  </section>
</section>
```

Safe three-column widths:

| Left | Center | Right | Gap | Total | Safe? |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 30% | 30% | 30% | 0 | 90% | ✅ Safe on both PC and mobile |
| 30% | 30% | 30% | 8px padding-left x2 | 90% | ✅ Recommended |
| 31% | 31% | 31% | 0 | 93% | ✅ Safe, tighter visuals |
| 33% | 33% | 33% | whitespace or margin | 99%+ | ⚠️ Risky |
| 33.33% | 33.33% | 33.33% | any gap | >100% | ❌ Avoid |
