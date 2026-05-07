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

Skeleton:

```html
<section style="margin: 24px 20px; box-sizing: border-box;">
  <section style="height: 14px; line-height: 0; text-align: left; box-sizing: border-box;">
    <section style="display: inline-block; width: 50%; text-align: left; box-sizing: border-box;">
      <section style="display: inline-block; width: 14px; height: 14px; border-top: 2px solid rgb(80,105,92); border-left: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
    </section><!--
    --><section style="display: inline-block; width: 50%; text-align: right; box-sizing: border-box;">
      <section style="display: inline-block; width: 14px; height: 14px; border-top: 2px solid rgb(80,105,92); border-right: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
    </section>
  </section>
  <section style="padding: 12px 16px; box-sizing: border-box;">
    <p style="margin: 0; font-size: 15px; line-height: 1.8; color: rgb(70,70,70); text-align: justify;">TEXT</p>
  </section>
  <section style="height: 14px; line-height: 0; text-align: left; box-sizing: border-box;">
    <section style="display: inline-block; width: 50%; text-align: left; box-sizing: border-box;">
      <section style="display: inline-block; width: 14px; height: 14px; border-bottom: 2px solid rgb(80,105,92); border-left: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
    </section><!--
    --><section style="display: inline-block; width: 50%; text-align: right; box-sizing: border-box;">
      <section style="display: inline-block; width: 14px; height: 14px; border-bottom: 2px solid rgb(80,105,92); border-right: 2px solid rgb(80,105,92); box-sizing: border-box;"></section>
    </section>
  </section>
</section>
```

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

Use for three related photos. Keep total width at or below 96%.

Use similar aspect ratios. If the images differ too much, use a vertical stack or two-image group instead.

Skeleton:

```html
<section style="text-align: center; padding: 0 12px; margin: 24px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 22px; box-sizing: border-box;">
    <section style="line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_LEFT" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 32%; vertical-align: top; margin: 0 2%; box-sizing: border-box;">
    <section style="line-height: 0; border: 3px solid rgb(255,255,255); border-radius: 14px; overflow: hidden; box-sizing: border-box;">
      <img src="IMAGE_CENTER" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 22px; box-sizing: border-box;">
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

Use only after the static layout is accepted or when reference matching requires it.

Allowed first:

- small `rotate()` on a label or decorative image;
- small `translate()` for sticker-like accents;
- do not use transform for core text readability.

Avoid transform-heavy layout for the first draft.

## Capability: SVG Or Motion

Treat SVG and motion as advanced capability blocks. Do not use them by default.

Use only when:

- the user explicitly asks for motion or SVG;
- the static layout is already approved;
- the effect has a fallback or can be safely removed;
- the output is tested in the WeChat editor or at least by browser screenshot.

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
- Mobile WeChat renders `box-shadow` well; PC client may lose it. Always pair with a subtle border or background-color difference so the card still works without shadow.
- Keep shadow values conservative: small blur, low opacity.

```html
<section style="background-color: rgb(255,255,255); padding: 20px; margin: 15px; box-sizing: border-box; border-left: 4px solid rgb(78,128,88); box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
  <p style="margin: 0; text-indent: 2em;">卡片内容...</p>
</section>
```

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

With dark overlay for better text readability:
```html
<section style="background-image: url('BACKGROUND_IMAGE_URL'); background-size: cover; background-position: center; padding: 40px 20px; box-sizing: border-box; text-align: center;">
  <section style="background-color: rgba(0,0,0,0.4); padding: 20px; box-sizing: border-box;">
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
