# Refined Layout Capability Blocks

Use this file when the user asks for polished, rich, magazine-like, decorative, image-led, or reference-matched WeChat article layout.

These are reusable structural patterns — page skeletons and content arrangement blocks. For decorative flourishes (dividers, shapes, transforms, stickers), see `references/decorative-patterns.md`.

## General Rules

- Design one visual language before writing HTML: color, title style, card style, image frame style, divider style.
- Do not use every block. Rich layout means controlled rhythm, not maximum decoration.
- Do not default to a large opening image.
- Keep body reading comfortable: normal text should still use 15px-16px, line-height 1.7-1.9.
- Prefer safe normal-flow implementation: `section`, inline styles, `inline-block`, borders, background blocks, border radius, and moderate negative margins.

---

## Structural Patterns

### Text-First Header

Use when the article is reflective, formal, or text-led. Small meta row → main title → subtitle → decorative line.

```html
<section style="padding: 28px 22px 18px; text-align: left; background-color: rgb(248,248,246); box-sizing: border-box;">
  <p style="margin: 0; font-size: 12px; color: rgb(130,130,130); letter-spacing: 1px;">DATE / PLACE</p>
  <p style="margin: 12px 0 0; font-size: 26px; line-height: 1.35; color: rgb(45,55,50);"><strong>TITLE</strong></p>
  <section style="width: 42px; height: 2px; margin-top: 16px; background-color: rgb(80,105,92); box-sizing: border-box;"></section>
</section>
```

### Compact Image Header

Use when an image should introduce the article but not dominate the first screen: title block → medium framed image → small caption. Avoid as a tall cover unless requested.

### Numbered Section Title

Use for articles with clear parts, chapters, or stages. Large number + side-bordered title + short label.

```html
<section style="margin: 34px 20px 18px; text-align: left; box-sizing: border-box;">
  <p style="margin: 0; font-size: 34px; line-height: 1; color: rgb(185,195,180);"><strong>01</strong></p>
  <section style="margin-top: -10px; padding-left: 12px; border-left: 4px solid rgb(80,105,92); box-sizing: border-box;">
    <p style="margin: 0; font-size: 19px; line-height: 1.5; color: rgb(45,55,50);"><strong>SECTION TITLE</strong></p>
    <p style="margin: 4px 0 0; font-size: 12px; color: rgb(130,130,130); letter-spacing: 1px;">SHORT LABEL</p>
  </section>
</section>
```

### Circle Character Title

Split a short title (2-6 characters) into individual characters inside equal-size circles.

```html
<section style="text-align: center; margin: 12px 0 8px; box-sizing: border-box;">
  <section style="display: inline-block; width: 36px; height: 36px; line-height: 36px; vertical-align: top; margin: 0 4px; border-radius: 100%; background-color: rgb(134,96,71); box-sizing: border-box;">
    <span style="font-size: 18px; color: rgb(255,255,255);"><strong>标</strong></span>
  </section>
  <section style="display: inline-block; width: 36px; height: 36px; line-height: 36px; vertical-align: top; margin: 0 4px; border-radius: 100%; background-color: rgb(168,101,47); box-sizing: border-box;">
    <span style="font-size: 18px; color: rgb(255,255,255);"><strong>题</strong></span>
  </section>
  <!-- repeat for remaining characters -->
</section>
```

### Soft Text Card

Use for intro, editor note, context paragraphs. Left border accent + light background.

```html
<section style="margin: 22px 20px; padding: 18px; background-color: rgb(248,248,246); border-left: 4px solid rgb(80,105,92); box-sizing: border-box;">
  <p style="margin: 0; font-size: 15px; line-height: 1.8; color: rgb(70,70,70); text-align: justify;">TEXT</p>
</section>
```

### Text Background Cards

Use for body text on a card with bordered or letter-paper feel.

```html
<section style="background-color: rgb(255,255,255); padding: 20px; margin: 15px; box-sizing: border-box; border-left: 4px solid rgb(78,128,88); border: 1px solid rgb(220,220,220);">
  <p style="margin: 0; text-indent: 2em;">正文内容...</p>
</section>
```

### Shadow Card

Use for emphasis blocks, quotes, or feature cards that need to feel slightly elevated. `box-shadow` is safe on both mobile and PC WeChat.

```html
<section style="background-color: rgb(255,255,255); padding: 20px; margin: 15px; box-sizing: border-box; box-shadow: rgba(0,0,0,0.08) 0px 2px 12px; border-radius: 12px;">
  <p style="margin: 0; text-indent: 2em;">卡片内容...</p>
</section>
```

### Four-Corner Card

Use for quotes or highlighted paragraphs. Four small corner blocks + center text. **Critical**: place left/right corner marks on separate rows and pull the right mark up with negative margin — do NOT use `width: 50%` two-column.

```html
<section style="margin: 24px 20px; box-sizing: border-box;">
  <section style="line-height: 0; text-align: left; box-sizing: border-box;">
    <section style="display: inline-block; width: 14px; height: 14px; border-top: 2px solid rgb(80,105,92); border-left: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
  </section>
  <section style="line-height: 0; text-align: right; margin-top: -14px; box-sizing: border-box;">
    <section style="display: inline-block; width: 14px; height: 14px; border-top: 2px solid rgb(80,105,92); border-right: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
  </section>
  <section style="margin: 12px 16px; box-sizing: border-box;">
    <p style="margin: 0; font-size: 15px; line-height: 1.8; color: rgb(70,70,70); text-align: justify;">TEXT</p>
  </section>
  <section style="line-height: 0; text-align: left; box-sizing: border-box;">
    <section style="display: inline-block; width: 14px; height: 14px; border-bottom: 2px solid rgb(80,105,92); border-left: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
  </section>
  <section style="line-height: 0; text-align: right; margin-top: -14px; box-sizing: border-box;">
    <section style="display: inline-block; width: 14px; height: 14px; border-bottom: 2px solid rgb(80,105,92); border-right: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
  </section>
</section>
```

### Four-Corner Frame (Alternative)

Variant with thin outer border + four L-shaped corner marks.

```html
<section style="margin: 22px 10px 0; padding: 8px; border: 1px solid rgb(134,96,71); box-sizing: border-box;">
  <section style="text-align: left; height: 18px; line-height: 0; box-sizing: border-box;">
    <section style="display: inline-block; width: 16px; height: 16px; border-top: 3px solid rgb(134,96,71); border-left: 3px solid rgb(134,96,71); box-sizing: border-box;"></section>
    <section style="display: inline-block; width: 100%; max-width: 295px; height: 1px; box-sizing: border-box;"></section>
    <section style="display: inline-block; width: 16px; height: 16px; border-top: 3px solid rgb(134,96,71); border-right: 3px solid rgb(134,96,71); box-sizing: border-box;"></section>
  </section>
  <section style="padding: 22px 12px; box-sizing: border-box;"><!-- main content --></section>
  <section style="text-align: left; height: 18px; line-height: 0; box-sizing: border-box;">
    <section style="display: inline-block; width: 16px; height: 16px; border-bottom: 3px solid rgb(134,96,71); border-left: 3px solid rgb(134,96,71); box-sizing: border-box;"></section>
    <section style="display: inline-block; width: 100%; max-width: 295px; height: 1px; box-sizing: border-box;"></section>
    <section style="display: inline-block; width: 16px; height: 16px; border-bottom: 3px solid rgb(134,96,71); border-right: 3px solid rgb(134,96,71); box-sizing: border-box;"></section>
  </section>
</section>
```

### Multi-Layer Stack Card

Use for cover frames or hero banners needing depth via layered backgrounds.

**Option A: Nested color blocks (most compatible)**

```html
<section style="background-color: rgb(220,230,240); border-radius: 24px; padding: 5px; margin: 20px 15px; box-sizing: border-box;">
  <section style="background-color: rgb(0,61,106); border-radius: 20px; padding: 4px; box-sizing: border-box;">
    <section style="background: linear-gradient(135deg, rgb(0,61,106), rgb(9,108,181)); border-radius: 18px; padding: 36px 26px; box-sizing: border-box;">
      <p style="margin: 0; font-size: 22px; color: rgb(255,255,255); text-align: center;"><strong>标题</strong></p>
      <p style="margin: 10px 0 0; font-size: 14px; color: rgb(220,230,240); text-align: center;">副标题</p>
    </section>
  </section>
</section>
```

**Option B: Background wallpaper + frame + image**

```html
<section style="display: inline-block; width: 90%; vertical-align: top; background-color: rgb(255,183,77); padding: 15px; box-sizing: border-box;">
  <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 8px; overflow: hidden; box-sizing: border-box;">
    <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; box-sizing: border-box; display: block;">
  </section>
</section>
```

### Negative Margin Overlap

Create depth by pulling elements upward. Three scales: large (title over hero, -40 to -60px), medium (decoration over image, -20 to -30px), micro (dots, -10px).

```html
<!-- Large: Title over hero image -->
<section style="text-align: center; box-sizing: border-box;">
  <img src="hero.jpg" style="width: 100%; display: block;">
</section>
<section style="background-color: rgb(0,61,106); padding: 30px 20px; margin: -40px 15px 0; box-sizing: border-box; text-align: center;">
  <p style="margin: 0; font-size: 24px; color: rgb(255,255,255);"><strong>Title</strong></p>
</section>
```

Keep magnitude under ~120px to avoid editor clipping.

---

## Image Arrangement Patterns

### Framed Image

Use for important single photos. Outer padding block → inner framed image → caption.

```html
<section style="margin: 24px 18px; padding: 10px; background-color: rgb(238,242,238); box-sizing: border-box;">
  <section style="line-height: 0; border: 6px solid rgb(255,255,255); border-radius: 8px; overflow: hidden; box-sizing: border-box;">
    <img src="IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
  </section>
  <p style="margin: 8px 0 0; font-size: 12px; color: rgb(120,120,120); text-align: center;">CAPTION</p>
</section>
```

### Title Over Image

Title card overlaps the bottom of a hero image via negative margin.

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

### Image Over Image

Secondary detail image overlaps a larger base image. Use negative margin — never absolute positioning.

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

### Corner Image Over Text Card

Small image/decoration over text card corner. Card must reserve padding so text doesn't run under the image.

```html
<section style="margin: 25px 15px 0; box-sizing: border-box;">
  <section style="background-color: rgb(255,255,255); padding: 36px 18px 18px; border-left: 4px solid rgb(78,128,88); box-sizing: border-box;">
    <p style="margin: 0; font-size: 16px; line-height: 1.8; color: rgb(62,62,62); text-align: justify;">文本内容...</p>
  </section>
  <section style="text-align: right; margin-top: -92px; padding-right: 12px; box-sizing: border-box;">
    <section style="display: inline-block; width: 86px; line-height: 0; border: 4px solid rgb(255,255,255); border-radius: 8px; overflow: hidden; box-sizing: border-box;">
      <img src="CORNER_IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

### Two-Image Stagger

Paired images with vertical offset. Use inline-block columns; one image offset with `padding-top`.

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
</section>
```

### Staggered Image Grid (Interlaced)

Multiple rows with alternating left-right wide/narrow images at different vertical offsets.

```html
<!-- Row 1: Left large, Right small (pushed down) -->
<section style="text-align: center; padding: 0 15px; box-sizing: border-box;">
  <section style="display: inline-block; width: 52%; vertical-align: top; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 15px; overflow: hidden; box-sizing: border-box;">
      <img src="URL1" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 44%; vertical-align: top; padding-top: 25px; padding-left: 8px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="URL2" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

### Three-Image Rhythm

Three related photos in one row. Keep total width ≤ 92%.

```html
<section style="text-align: center; padding: 0 12px; margin: 24px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 30%; vertical-align: top; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_LEFT" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-left: 4px; padding-right: 4px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_CENTER" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-left: 4px; padding-right: 4px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_RIGHT" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

### Three-Image Crown Layout

Center image sits higher; left and right images pushed down with `padding-top`.

```html
<section style="text-align: center; padding: 0 12px; box-sizing: border-box;">
  <section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 24px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 12px; overflow: hidden; box-sizing: border-box;">
      <img src="URL_LEFT" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-left: 4px; padding-right: 4px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 16px; overflow: hidden; box-sizing: border-box; border: 3px solid rgb(78,128,88);">
      <img src="URL_CENTER" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 24px; padding-left: 4px; padding-right: 4px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 12px; overflow: hidden; box-sizing: border-box;">
      <img src="URL_RIGHT" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

### Side Image With Short Text

Narrow image beside short text — avoids a vertical image dominating full mobile width.

```html
<section style="margin: 18px 10px 0; padding: 28px 14px; border: 1px solid rgb(134,96,71); box-sizing: border-box; text-align: center;">
  <section style="display: inline-block; width: 34%; vertical-align: middle; padding: 4px; border: 4px double rgb(134,96,71); box-sizing: border-box; line-height: 0;">
    <img src="IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
  </section><!--
  --><section style="display: inline-block; width: 60%; vertical-align: middle; padding-left: 12px; box-sizing: border-box;">
    <p style="margin: 0; font-size: 14px; line-height: 1.9; color: rgb(74,58,46); text-align: justify;">短文字...</p>
  </section>
</section>
```

### Background Image with Overlay Text

Use for hero banners or atmospheric cards. Image as `background-image` on a section.

```html
<section style="background-image: url('BACKGROUND_IMAGE_URL'); background-size: cover; background-position: center; padding: 40px 20px; box-sizing: border-box; text-align: center;">
  <p style="margin: 0; font-size: 22px; color: rgb(255,255,255);"><strong>叠加标题</strong></p>
</section>
```

For better readability, add an opaque overlay layer inside:
```html
<section style="background-image: url('URL'); background-size: cover; background-position: center; padding: 40px 20px; box-sizing: border-box; text-align: center;">
  <section style="background-color: rgb(60,60,60); padding: 20px; box-sizing: border-box;">
    <p style="margin: 0; font-size: 22px; color: rgb(255,255,255);"><strong>带遮罩标题</strong></p>
  </section>
</section>
```

### Aspect Ratio Container (Padding Hack)

Maintain fixed aspect ratio (16:9, 1:1, etc.) regardless of source image size.

```html
<!-- 16:9 container -->
<section style="width: 100%; height: 0; padding-top: 56.25%; background-image: url('URL'); background-size: cover; background-position: center; box-sizing: border-box;"></section>

<!-- 1:1 square -->
<section style="width: 80%; margin: 0 auto; box-sizing: border-box;">
  <section style="width: 100%; height: 0; padding-top: 100%; overflow: hidden; border-radius: 12px; box-sizing: border-box;">
    <img src="URL" style="width: 100%; display: block; margin: -100% 0 0 0;">
  </section>
  <p style="margin: 8px 0 0; font-size: 14px; color: rgb(100,100,100); text-align: center;">图注</p>
</section>
```

---

## Text Effect Patterns

### Gradient Text

For headlines — always provide solid `color` fallback for PC clients.

```html
<p style="margin: 0; font-size: 24px; font-weight: bold; display: inline-block;">
  <span style="background-image: linear-gradient(90deg, rgb(0,61,106), rgb(9,108,181)); -webkit-background-clip: text; color: rgb(0,61,106); background-clip: text;">
    渐变标题文字
  </span>
</p>
```

### Text Stroke / Glow

For decorative numbers or large labels (20px+). `text-shadow` simulates a stroke. PC support weaker.

```html
<p style="margin: 0; font-size: 32px; color: rgb(255,255,255); text-shadow: rgb(0,61,106) 0px 1.4px 0px, rgb(0,61,106) 1px 1px 0px, rgb(0,61,106) -1px 0px 0px, rgb(0,61,106) 0px -1px 0px;">描边文字</p>
```

### Text Decoration

Use shorthand for underline/strikethrough.

```html
<span style="text-decoration: line-through rgb(180,180,180) 1px;">原价</span>
<span style="text-decoration: underline rgb(0,61,106) 2px;">重点文字</span>
```

---

## SVG Handling

Preferred approach: plain HTML/CSS unless user explicitly requests SVG. See `references/svg-compatibility.md` for full rules.

**Verified working**: SMIL animation (`<animate>`, `<animateTransform>`, `<animateMotion>`), 2D transforms, `<image>` with WeChat CDN URLs.

**Avoid**: `<foreignObject>`, filters, gradients, `clipPath`, CSS animation inside SVG.
