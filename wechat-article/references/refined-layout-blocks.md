# Refined Layout Capability Blocks

Use this file when the user asks for polished, rich, magazine-like, decorative, image-led, or reference-matched WeChat article layout.

These are reusable capability blocks. They do not define a fixed article structure. Choose only the blocks that fit the user's content and preference.

## General Rules

- Design one visual language before writing HTML: color, title style, card style, image frame style, divider style.
- Do not use every block. Rich layout means controlled rhythm, not maximum decoration.
- Do not default to a large opening image.
- Keep body reading comfortable: normal text should still use 15px-16px, line-height 1.7-1.9.
- Prefer safe normal-flow implementation: `section`, inline styles, `inline-block`, borders, background blocks, border radius, and moderate negative margins.
- Avoid default use of SVG, animation, grid, absolute positioning, or heavy transform. Treat these as advanced experimental effects after static layout is accepted.

## Capability: Text-First Header

Use when the article is reflective, formal, or text-led.

Structure:

- small meta row
- main title
- subtitle or short intro
- decorative line or dot

Skeleton:

```html
<section style="padding: 28px 22px 18px; text-align: left; background-color: rgb(248,248,246); box-sizing: border-box;">
  <p style="margin: 0; font-size: 12px; color: rgb(130,130,130); letter-spacing: 1px;">DATE / PLACE</p>
  <p style="margin: 12px 0 0; font-size: 26px; line-height: 1.35; color: rgb(45,55,50);"><strong>TITLE</strong></p>
  <section style="width: 42px; height: 2px; margin-top: 16px; background-color: rgb(80,105,92); box-sizing: border-box;"></section>
</section>
```

## Capability: Compact Image Header

Use when an image should introduce the article but should not dominate the first screen.

Structure:

- title block
- medium image with frame
- small caption/meta

Avoid using this as a tall cover unless requested.

## Capability: Framed Image

Use for important single photos.

Structure:

- outer margin/padding
- optional background color block
- inner image wrapper with border/radius
- caption

Skeleton:

```html
<section style="margin: 24px 18px; padding: 10px; background-color: rgb(238,242,238); box-sizing: border-box;">
  <section style="line-height: 0; border: 6px solid rgb(255,255,255); border-radius: 8px; overflow: hidden; box-sizing: border-box;">
    <img src="IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
  </section>
  <p style="margin: 8px 0 0; font-size: 12px; color: rgb(120,120,120); text-align: center;">CAPTION</p>
</section>
```

## Capability: Numbered Section Title

Use for articles with clear parts, locations, stages, or topics.

Structure:

- small number or label
- main section title
- short divider or side rule

Skeleton:

```html
<section style="margin: 34px 20px 18px; text-align: left; box-sizing: border-box;">
  <p style="margin: 0; font-size: 34px; line-height: 1; color: rgb(185,195,180);"><strong>01</strong></p>
  <section style="margin-top: -10px; padding-left: 12px; border-left: 4px solid rgb(80,105,92); box-sizing: border-box;">
    <p style="margin: 0; font-size: 19px; line-height: 1.5; color: rgb(45,55,50);"><strong>SECTION TITLE</strong></p>
    <p style="margin: 4px 0 0; font-size: 12px; color: rgb(130,130,130); letter-spacing: 1px;">SHORT LABEL</p>
  </section>
</section>
```

## Capability: Soft Text Card

Use for intro, editor note, travel note, important context, or transition paragraphs.

Skeleton:

```html
<section style="margin: 22px 20px; padding: 18px; background-color: rgb(248,248,246); border-left: 4px solid rgb(80,105,92); box-sizing: border-box;">
  <p style="margin: 0; font-size: 15px; line-height: 1.8; color: rgb(70,70,70); text-align: justify;">TEXT</p>
</section>
```

## Capability: Four-Corner Card

Use for quotes, testimonials, notes, or highlighted paragraphs.

Implement with four small corner blocks and a center text area. Avoid overusing it.

**Critical layout rule**: Do not use `width: 50%` two-column rows for left/right corner marks — this causes misalignment in WeChat mobile editor. Instead, place left and right corner marks on separate rows and pull the right mark upward with negative margin.

Skeleton:

```html
<section style="margin: 24px 20px; box-sizing: border-box;">
  <!-- Top-left corner -->
  <section style="line-height: 0; text-align: left; box-sizing: border-box;">
    <section style="display: inline-block; width: 14px; height: 14px; border-top: 2px solid rgb(80,105,92); border-left: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
  </section>

  <!-- Top-right corner (pulled up to align with top-left) -->
  <section style="line-height: 0; text-align: right; margin-top: -14px; box-sizing: border-box;">
    <section style="display: inline-block; width: 14px; height: 14px; border-top: 2px solid rgb(80,105,92); border-right: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
  </section>

  <!-- Center text -->
  <section style="margin: 12px 16px; box-sizing: border-box;">
    <p style="margin: 0; font-size: 15px; line-height: 1.8; color: rgb(70,70,70); text-align: justify;">TEXT</p>
  </section>

  <!-- Bottom-left corner -->
  <section style="line-height: 0; text-align: left; box-sizing: border-box;">
    <section style="display: inline-block; width: 14px; height: 14px; border-bottom: 2px solid rgb(80,105,92); border-left: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
  </section>

  <!-- Bottom-right corner (pulled up to align with bottom-left) -->
  <section style="line-height: 0; text-align: right; margin-top: -14px; box-sizing: border-box;">
    <section style="display: inline-block; width: 14px; height: 14px; border-bottom: 2px solid rgb(80,105,92); border-right: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
  </section>
</section>
```

Rules:
- Each corner mark lives in its own row. Left marks use `text-align: left`; right marks use `text-align: right` + `margin-top: -14px` to pull them up to the same baseline as the left mark.
- Center text uses `margin: 12px 16px` for whitespace instead of relying on outer padding.
- Do not nest `display: inline-block` inside the corner-mark rows unnecessarily.

## Capability: Two-Image Stagger

Use for paired scenes or related images.

Structure:

- two inline-block columns
- one image offset with top padding
- same image frame style
- one shared caption

Skeleton:

```html
<section style="text-align: center; padding: 0 14px; margin: 24px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 51%; vertical-align: top; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_A" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 43%; vertical-align: top; padding-top: 28px; padding-left: 8px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_B" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
  <p style="margin: 8px 0 0; font-size: 12px; color: rgb(130,130,130); text-align: center;">CAPTION</p>
</section>
```

## Capability: Three-Image Rhythm

Use for three related photos. Keep total width at or below 92% for mobile safety.

Use similar aspect ratios. If the images differ too much, use a vertical stack or two-image group instead.

Skeleton:

```html
<section style="text-align: center; padding: 0 12px; margin: 24px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 22px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_LEFT" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-left: 8px; box-sizing: border-box;">
    <section style="line-height: 0; border: 3px solid rgb(255,255,255); border-radius: 14px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_CENTER" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 22px; padding-left: 8px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_RIGHT" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

## Capability: Image Over Image

Use when a secondary detail image supports a larger scene.

Structure:

- base image
- following overlay wrapper
- `margin-top: -NNpx`
- inner width 35%-48%
- border for separation

Avoid absolute positioning.

Skeleton:

```html
<section style="text-align: center; margin: 24px 0; padding: 0 16px; box-sizing: border-box;">
  <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
    <img src="BASE_IMAGE" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
  </section>
  <section style="text-align: right; margin-top: -48px; padding-right: 12px; box-sizing: border-box;">
    <section style="display: inline-block; width: 42%; line-height: 0; border: 5px solid rgb(255,255,255); border-radius: 8px; overflow: hidden; box-sizing: border-box;">
      <img src="DETAIL_IMAGE" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

## Capability: Title Over Image

Use when the title should connect directly to a photo.

Structure:

- image
- following title card with `margin-top: -30px` to `-50px`
- title card uses solid background or translucent-looking color block

Reserve enough margin below the card so following text does not collide.

Skeleton:

```html
<section style="margin: 26px 0; box-sizing: border-box;">
  <section style="line-height: 0; box-sizing: border-box;">
    <img src="IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
  </section>
  <section style="margin: -36px 20px 0; padding: 16px 18px; background-color: rgb(80,105,92); box-sizing: border-box;">
    <p style="margin: 0; font-size: 18px; line-height: 1.5; color: rgb(255,255,255); text-align: center;"><strong>TITLE</strong></p>
    <p style="margin: 6px 0 0; font-size: 12px; color: rgb(220,230,220); text-align: center;">SUBTITLE</p>
  </section>
</section>
```

## Capability: Decorative Divider

Use between sections or before endings.

Safe forms:

- short line + dot
- double thin line
- label inside a small color block
- small diamond or circle made with CSS

Avoid complex icons unless the user supplied them as images.

Skeleton:

```html
<section style="text-align: center; margin: 28px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 72px; height: 1px; vertical-align: middle; background-color: rgb(180,190,180); box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 8px; height: 8px; vertical-align: middle; margin: 0 10px; border-radius: 100%; background-color: rgb(80,105,92); box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 72px; height: 1px; vertical-align: middle; background-color: rgb(180,190,180); box-sizing: border-box;"></section>
</section>
```

## Capability: Light Transform

2D transforms (`rotate`, `rotateZ`, `translate`, `translate3d`, `scale`) are safe for decorative effects. Use freely for:

- small `rotate(45deg)` on decorative shapes (diamonds, corner accents);
- `rotateZ(5deg~20deg)` on image frames or cards for a dynamic feel;
- `translate3d(1px~70px, 0, 0)` for pixel-perfect alignment adjustments;
- `scale(0.95~1.05)` for subtle zoom effects.

Typical values seen in source exports and their intended effects:

| Value | Visual Intent | Safe Replacement |
|:---|:---|:---|
| `translate3d(1px, 0, 0)` | 1px micro-nudge | `margin-left: 1px` or drop |
| `translate3d(10px~25px, 0, 0)` | Small horizontal shift of ornament | `margin-left/right` |
| `translate3d(60px~70px, 0, 0)` | Large offset for mirrored ornament pair | Duplicate ornament + `text-align` wrapper |
| `translate3d(-2.5%, 0, 0)` | Percentage-level center correction | Adjust parent `padding` or child `width` |
| `scale(0.97)` | Slight shrink to create inset frame feel | Keep; nest inside a larger background block |
| `rotateZ(6deg)` | Playful tilt on frame or card | Keep for decorative wrappers only |
| `rotateZ(315deg)` / `rotateZ(342deg)` | Near-complete rotation of diamond/leaf shape | Rebuild with `rotate(45deg)` or asymmetric `border-radius` |

Rules:
- Only apply to decorative elements or image containers, never to body text.
- Avoid `rotateX()`, `rotateY()`, and `perspective()` — these are 3D transforms that either render poorly or produce no visible effect (`perspective(0px)` is mathematically invalid).
- Keep angles small for frames (under 20°); large tilts hurt readability.
- Do not combine multiple transform functions in one declaration; use nested wrappers if needed.
- `matrix(...)` should be rewritten as explicit `rotate` or `scale` for clarity.

### Mirror Ornament (Static Replacement for 3D Flip)

When a source uses `rotateX(180deg)` or `rotateY(180deg)` to mirror a decoration on the opposite side, do not preserve the 3D transform. Instead, duplicate the ornament HTML and place it in the correct position with normal flow.

```html
<!-- Left ornament -->
<section style="text-align: left; line-height: 0;">
  <section style="display: inline-block; width: 24px; height: 24px; background-color: rgb(80,105,92); border-radius: 0 100% 0 100%;"></section>
</section>

<!-- Right ornament -->
<section style="text-align: right; line-height: 0; margin-top: -24px;">
  <section style="display: inline-block; width: 24px; height: 24px; background-color: rgb(80,105,92); border-radius: 100% 0 100% 0;"></section>
</section>
```

Note: The right ornament uses a different `border-radius` pattern to achieve the mirrored look without any transform.

## Capability: SVG As Container

SVG in WeChat articles serves best as a **static container** or **background image carrier**, not as animated or vector-drawing content.

What works:
- Simple `<svg>` wrapper with `background-image` for texture or decorative fills.
- Static SVG icons or shapes (basic `<rect>`, `<circle>`) — likely retained by the editor.

What works (verified through actual publishing):
- **SMIL animation** (`<animateTransform>`, `<animate>`, `<animateMotion>`) works in WeChat. See `references/svg-compatibility.md`.
- Basic shapes (`<rect>`, `<circle>`, `<path>`, `<text>`) and 2D transforms (`translate`, `scale`, `rotate`, `skewX`) are safe.
- `<image>` with WeChat CDN URLs (`mmbiz.qpic.cn`) works when using `href` attribute.

What fails:
- **`<foreignObject>`** embedding HTML/images is high-risk; the wrapper may be stripped, causing layout collapse.
- Filters (`<filter>`), gradients (`<linearGradient>`, `<radialGradient>`), `clipPath`, `textPath` are filtered.
- CSS animations, `style` attributes, `class`/`id` inside SVG are removed.

Guidance:
- If the user does not request SVG, prefer plain HTML/CSS.
- If the user explicitly requests SVG-based visual effects, follow `references/svg-compatibility.md`.
- For SVG-like static effects (rotating badges, geometric shapes), CSS `transform` + `border-radius` is still the simpler alternative.
- Never rely on SVG animation for critical content without a static fallback.

### SVG Background-Image Container Downgrade

When a source block uses `<svg style="background-image: url(...)">` as a static image holder, replace it with a plain `<section>` or `<img>`.

Source intent:
```html
<svg viewBox="0 0 528 1426" style="width: 100%; background-image: url('URL'); background-size: 100%;"></svg>
```

Rewrite target:
```html
<section style="width: 100%; line-height: 0;">
  <img src="URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
</section>
```

Or, if the aspect ratio must be preserved and cropping is intentional:
```html
<section style="width: 100%; height: 0; padding-top: 270%; overflow: hidden; box-sizing: border-box;">
  <img src="URL" style="width: 100%; display: block; margin: 0 auto;">
</section>
```

### SVG Carousel / Slideshow Downgrade

When a source uses SVG with `<animateTransform>` and multiple `<foreignObject>` frames to create a sliding image gallery, the animation will be lost in WeChat. Downgrade to one of these static alternatives:

**Option A: Single featured image** — Keep only the first frame image.
**Option B: Static image group** — Arrange the gallery images as a normal-flow multi-image grid.
**Option C: Vertical stack** — If the gallery was tall, stack images with captions between them.

Key downgrade steps:
1. Extract each image URL from the `<foreignObject>` / inner `<svg>` backgrounds.
2. Discard all `<animate>`, `<animateTransform>`, and timing attributes.
3. Rebuild as static `<img>` tags inside normal-flow `<section>` containers.
4. Preserve any outer frame, border, or `overflow: hidden` wrapper that gave the gallery its shape.

## Capability: Gradient Text

Use for headlines, slogans, or short emphasized text where a color gradient adds visual impact.

Requirements:
- Always provide a solid `color` fallback for PC WeChat clients that do not support `-webkit-background-clip: text`.
- Keep the text short; gradient effects lose impact on long paragraphs.
- Use `display: inline-block` on the text wrapper so the gradient fills the text width.

```html
<section style="text-align: center; margin: 20px 0; box-sizing: border-box;">
  <p style="margin: 0; font-size: 24px; font-weight: bold; display: inline-block;">
    <span style="background-image: linear-gradient(90deg, rgb(0,61,106), rgb(9,108,181)); -webkit-background-clip: text; color: rgb(0,61,106); background-clip: text;">
      渐变标题文字
    </span>
  </p>
</section>
```

Fallback rule: the `color` property (here `rgb(0,61,106)`) is the solid color shown when `-webkit-background-clip: text` is not supported.

## Capability: Shadow Card

Use for emphasis blocks, quotes, or feature cards that need to feel slightly elevated.

Requirements:
- **Do not use `box-shadow` or `rgba()` transparency.** PC client may drop shadows entirely, and `rgba` blends with WeChat's forced-white background producing muddy gray. Use a solid `border` or layered background-color blocks instead.
- If depth is needed, simulate it with nested sections and slightly offset background colors.

```html
<section style="background-color: rgb(255,255,255); padding: 20px; margin: 15px; box-sizing: border-box; border-left: 4px solid rgb(78,128,88); border: 1px solid rgb(220,220,220);">
  <p style="margin: 0; text-indent: 2em;">卡片内容...</p>
</section>
```

## Capability: Multi-Layer Stack Card

Use for cover frames, hero banners, or prominent intro cards that need visible depth through layered shadows or nested color blocks.

Requirements:
- **Do not use `box-shadow` or `rgba()` transparency.** Use nested background-color blocks to create depth instead.
- The layout must read clearly without any shadow effects.

### Option A: Nested Background Blocks (Safe)

Create depth by layering slightly offset solid-color sections. This works reliably on both mobile and PC WeChat.

```html
<!-- Outer frame -->
<section style="background-color: rgb(0,50,90); border-radius: 24px; padding: 40px 30px; margin: 20px 15px; box-sizing: border-box; border: 2px solid rgb(9,108,181);">
  <p style="margin: 0; font-size: 22px; color: rgb(255,255,255); text-align: center;"><strong>标题</strong></p>
  <p style="margin: 10px 0 0; font-size: 14px; color: rgb(220,230,240); text-align: center;">副标题</p>
</section>
```

Rules:
- List shadows from tight/blur-small to loose/blur-large.
- Keep opacity low (0.06~0.15) to avoid muddy edges on mobile.
- Pair with a solid `background` or `background-color` so the card does not vanish if shadows are lost.

### Option B: Nested Background Blocks (More Compatible)

Simulate depth with nested sections and slightly offset background colors. This works even when PC client drops `box-shadow`.

```html
<!-- Outer layer (shadow color) -->
<section style="background-color: rgb(220,230,240); border-radius: 24px; padding: 5px; margin: 20px 15px; box-sizing: border-box;">
  <!-- Middle layer (accent frame) -->
  <section style="background-color: rgb(0,61,106); border-radius: 20px; padding: 4px; box-sizing: border-box;">
    <!-- Inner layer (content surface) -->
    <section style="background: linear-gradient(135deg, rgb(0,61,106), rgb(9,108,181)); border-radius: 18px; padding: 36px 26px; box-sizing: border-box;">
      <p style="margin: 0; font-size: 22px; color: rgb(255,255,255); text-align: center;"><strong>标题</strong></p>
      <p style="margin: 10px 0 0; font-size: 14px; color: rgb(220,230,240); text-align: center;">副标题</p>
    </section>
  </section>
</section>
```

Rules:
- Outer layer provides the "shadow" color; keep it close to the page background.
- Middle layer can be a solid accent color or omitted for a simpler 2-layer stack.
- Inner layer holds the actual gradient or content background.
- Each layer reduces `border-radius` by 2~4px so borders nest cleanly.
- On very narrow mobile screens, reduce outer `padding` to 3~4px to save space.

## Capability: Text Stroke / Glow

Use for decorative numbers, large initial letters, or short labels.

Requirements:
- `text-shadow` with multiple directional offsets simulates a stroke. Mobile OK; PC support is weaker. Do not rely on it for critical information.
- Keep the effect on large text (20px+) so the stroke is visible.

```html
<p style="margin: 0; font-size: 32px; color: rgb(255,255,255); text-shadow: rgb(0,61,106) 0px 1.4px 0px, rgb(0,61,106) 1px 1px 0px, rgb(0,61,106) -1px 0px 0px, rgb(0,61,106) 0px -1px 0px;">
  描边文字
</p>
```

## Capability: Text Decoration (Underline / Strikethrough)

Use for price comparisons, emphasis, or editorial annotation.

Requirements:
- Use the shorthand `text-decoration` with color and thickness for better compatibility than split properties.

```html
<!-- Strikethrough -->
<p style="margin: 0; font-size: 16px;">
  <span style="text-decoration: line-through rgb(180,180,180) 1px;">原价 ¥199</span>
  <span style="color: rgb(200,50,50); font-weight: bold;"> ¥99</span>
</p>

<!-- Underline -->
<p style="margin: 0; font-size: 16px;">
  <span style="text-decoration: underline rgb(0,61,106) 2px;">重点标注文字</span>
</p>
```

## Capability: Background Image with Overlay Text

Use for hero banners, section headers, or atmospheric cards where a background image sets the mood.

Requirements:
- Image must be a public HTTPS URL (or WeChat material-library URL).
- Use `background-size: cover` or `100%` to fill the container.
- Place text over the image only if contrast is sufficient; otherwise add a semi-transparent overlay layer.

```html
<section style="background-image: url('BACKGROUND_IMAGE_URL'); background-size: cover; background-position: center; padding: 40px 20px; box-sizing: border-box; text-align: center;">
  <p style="margin: 0; font-size: 22px; color: rgb(255,255,255);"><strong>叠加在背景图上的标题</strong></p>
</section>
```

With dark overlay for better text readability (use opaque `rgb()`, not `rgba()`):
```html
<section style="background-image: url('BACKGROUND_IMAGE_URL'); background-size: cover; background-position: center; padding: 40px 20px; box-sizing: border-box; text-align: center;">
  <section style="background-color: rgb(60,60,60); padding: 20px; box-sizing: border-box;">
    <p style="margin: 0; font-size: 22px; color: rgb(255,255,255);"><strong>带遮罩的标题</strong></p>
  </section>
</section>
```

## Capability: Rotated Decoration

Use for playful, dynamic, or reference-matched layouts.

Requirements:
- Apply `transform: rotate()` only to decorative elements (small shapes, corner labels, accent images), never to body text.
- Mobile supports rotation well; PC may ignore it. The layout must still work if rotation is not applied.

```html
<!-- Diamond accent -->
<section style="display: inline-block; width: 10px; height: 10px; background-color: rgb(255,183,77); transform: rotate(45deg); box-sizing: border-box;"></section>

<!-- Rotated image frame -->
<section style="display: inline-block; width: 120px; height: 120px; overflow: hidden; transform: rotate(5deg); box-sizing: border-box;">
  <img src="URL" style="width: 100%; display: block; margin: 0 auto;">
</section>
```

## Capability: Aspect Ratio Container (Padding Hack)

Use when an image or container must maintain a fixed aspect ratio (e.g., 16:9, 1:1, 4:3) regardless of source image dimensions.

Requirements:
- Set `height: 0` and use `padding-top` as a percentage of width to create the ratio.
- Place the actual content inside with `position: relative` if needed, but since absolute positioning is avoided, use `margin-top: -NN%` tricks carefully or simply place content after the ratio container.

```html
<!-- 1:1 square container -->
<section style="width: 100%; height: 0; padding-top: 100%; background-image: url('URL'); background-size: cover; background-position: center; box-sizing: border-box;"></section>

<!-- 16:9 container -->
<section style="width: 100%; height: 0; padding-top: 56.25%; background-image: url('URL'); background-size: cover; background-position: center; box-sizing: border-box;"></section>
```

For image + caption inside a fixed-ratio frame, wrap the padding container and place the caption after it:
```html
<section style="width: 80%; margin: 0 auto; box-sizing: border-box;">
  <section style="width: 100%; height: 0; padding-top: 75%; overflow: hidden; border-radius: 12px; box-sizing: border-box;">
    <img src="URL" style="width: 100%; display: block; margin: -75% 0 0 0;">
  </section>
  <p style="margin: 8px 0 0; font-size: 14px; color: rgb(100,100,100); text-align: center;">图注</p>
</section>
```
