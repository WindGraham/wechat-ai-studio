
## Pattern 17: Multi-Layer Stack (Layered Overlap)

Multiple layers stacked with negative margins. Common pattern: background wallpaper + frame + image.

Structure formula: `outer color block -> inner frame/image wrapper -> image`.

```html
<!-- Layer 1: Background "wallpaper" block -->
<section style="display: inline-block; width: 90%; vertical-align: top; background-color: rgb(255, 183, 77); padding: 15px; box-sizing: border-box;">
  <!-- Layer 2: Image (inset creates frame effect) -->
  <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 8px; overflow: hidden; box-sizing: border-box;">
    <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; box-sizing: border-box; display: block;">
  </section>
</section>
```

## Pattern 18: Negative Margin Overlap (Layering)

Create depth by overlapping elements upward.

Structure formula: `base block -> following overlay block with negative top margin -> optional spacer/decoration`.

### Large Overlap (-40px to -60px)
```html
<!-- Previous element -->
<section style="text-align: center; box-sizing: border-box;">
  <img src="hero.jpg" style="width: 100%; display: block;">
</section>

<!-- Title block overlaps upward -->
<section style="background-color: rgb(0, 61, 106); padding: 30px 20px; margin: -40px 15px 0; box-sizing: border-box; text-align: center;">
  <p style="margin: 0; font-size: 24px; color: rgb(255,255,255);"><strong>Title</strong></p>
</section>
```

### Medium Overlap (-20px to -30px)
```html
<section style="line-height: 0; margin: -24px 0px 0px; box-sizing: border-box; text-align: center;">
  <section style="display: inline-block; width: 50px; height: 50px; vertical-align: top; overflow: hidden; background-color: rgb(0, 61, 106); border-radius: 100%; box-sizing: border-box; line-height: 50px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 20px;">✦</span>
  </section>
</section>
```

### Micro Overlap (-10px): Decorative Dots
```html
<section style="text-align: center; margin: -10px 0px 0px; box-sizing: border-box;">
  <section style="display: inline-block; width: 14px; height: 14px; vertical-align: top; overflow: hidden; border-radius: 100%; background-color: rgb(0, 61, 106); box-sizing: border-box;">
  </section>
</section>
```

**Key rule**: Use `height: 0` for pure decoration layers to prevent them from taking up document flow space.

## Pattern 19: Image Over Image

Place one image visually on top of another by rendering it after the base image and pulling it upward with negative margin. Use `text-align` on the overlay wrapper to choose left, center, or right placement.

Structure formula: `base image -> overlay wrapper with negative margin -> smaller image`.

```html
<section style="text-align: center; padding: 0 15px; box-sizing: border-box;">
  <section style="line-height: 0; box-sizing: border-box;">
    <img src="BASE_IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
  </section>

  <section style="text-align: right; margin-top: -50px; padding-right: 12px; box-sizing: border-box;">
    <section style="display: inline-block; width: 44%; line-height: 0; border: 5px solid rgb(255,255,255); border-radius: 8px; overflow: hidden; box-sizing: border-box;">
      <img src="OVERLAY_IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

Rules:
- Use `margin-top: -NNpx` on the overlay wrapper, not `position: absolute`.
- Use wrapper `text-align: left`, `center`, or `right` to place the overlay.
- Use `width` on the overlay inner block to control image size.
- Add a border when the overlay image needs separation from the base image.

## Pattern 20: Corner Image Over Text Card

Place a small image or decoration over a text card corner. The text card must reserve space with padding so text does not run under the image.

Structure formula: `padded text card -> corner overlay wrapper -> small image/decoration`.

```html
<section style="margin: 25px 15px 0; box-sizing: border-box;">
  <section style="background-color: rgb(255,255,255); padding: 36px 18px 18px; border-left: 4px solid rgb(78,128,88); box-sizing: border-box;">
    <p style="white-space: normal; margin: 0; padding: 0; font-size: 16px; line-height: 1.8; color: rgb(62,62,62); text-align: justify;">
      这里是文本框内容。文本框顶部或侧边需要留出额外内边距，避免被角上的图片遮挡。
    </p>
  </section>

  <section style="text-align: right; margin-top: -92px; padding-right: 12px; box-sizing: border-box;">
    <section style="display: inline-block; width: 86px; line-height: 0; border: 4px solid rgb(255,255,255); border-radius: 8px; overflow: hidden; box-sizing: border-box;">
      <img src="CORNER_IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

Rules:
- Use text card `padding-top` when the image overlaps the top edge.
- Use text card `padding-right` or `padding-left` when the image overlaps a side.
- Use overlay wrapper `text-align: right` for top-right, `left` for top-left, and `center` for top-center.
- Keep the corner image small enough that the card still reads as a text block.

## Pattern 21: Staggered Image Grid (Interlaced Layout)

Multiple images arranged in staggered left-right positions with different vertical offsets.

Structure formula: `row of inline-block columns -> selected columns get padding-top -> repeat with alternate widths`.

**⚠️ WeChat PC client does NOT support `display: flex`. Use `display: inline-block` instead.**

```html
<!-- Row 1: Left large, Right small (pushed down) -->
<section style="text-align: center; box-sizing: border-box; padding: 0 15px;">
  <section style="display: inline-block; width: 52%; vertical-align: top; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-top-left-radius: 30px; border-bottom-right-radius: 30px; overflow: hidden; box-sizing: border-box; border: 4px solid rgb(0, 61, 106);">
      <img src="URL1" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 44%; vertical-align: top; padding-top: 25px; padding-left: 8px; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 15px; overflow: hidden; box-sizing: border-box;">
      <img src="URL2" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>

<!-- Row 2: Left small (pushed down), Right large -->
<section style="text-align: center; box-sizing: border-box; padding: 0 15px; margin-top: 10px;">
  <section style="display: inline-block; width: 40%; vertical-align: top; padding-top: 20px; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
      <img src="URL3" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 56%; vertical-align: top; padding-left: 8px; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-top-right-radius: 40px; border-bottom-left-radius: 10px; overflow: hidden; box-sizing: border-box; border: 3px solid rgb(255, 183, 77);">
      <img src="URL4" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

**Critical rules:**
1. Use `<!-- -->` comment between columns to eliminate inline-block whitespace gap
2. Total width ≤ 96% (e.g., 52% + 44% = 96%)
3. Use `padding-left` on right column for gap (NOT `padding-right` on left column)
4. Different `padding-top` values create vertical offset/stagger effect

## Pattern 22: Three-Image Crown Layout

One row with three images where the left and right images sit lower and the center image sits higher. This is useful for activity photos, portrait groups, product details, and visual rhythm between text sections.

Structure formula: `left narrow image with top padding -> center emphasized image -> right narrow image with top padding`.

**Use inline-block, not flex.** Three columns are tight on a 375px WeChat canvas, so keep total width at or below 96%.

```html
<section style="text-align: center; padding: 0 12px; box-sizing: border-box;">
  <section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 24px; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 12px; overflow: hidden; box-sizing: border-box;">
      <img src="URL_LEFT" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 32%; vertical-align: top; margin: 0 2%; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 16px; overflow: hidden; box-sizing: border-box; border: 3px solid rgb(78, 128, 88);">
      <img src="URL_CENTER" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section><!--
  --><section style="display: inline-block; width: 30%; vertical-align: top; padding-top: 24px; box-sizing: border-box;">
    <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 12px; overflow: hidden; box-sizing: border-box;">
      <img src="URL_RIGHT" style="vertical-align: middle; max-width: 100%; width: 100%; display: block; margin: 0 auto;">
    </section>
  </section>
</section>
```

**Alignment rules:**
1. Parent `text-align: center` centers the three inline-block columns as a row.
2. Each column uses `vertical-align: top` so `padding-top` creates the visible stagger.
3. Left and right columns use `padding-top: 20px-28px`; center column uses no top padding.
4. Use `<!-- -->` comments between columns to remove inline-block whitespace.
5. Keep total width safe: `30% + 32% + 30% + 2% + 2% = 96%`.

**Visual guidance:**
- Use images with similar aspect ratios. Mixed ratios can make the layout look accidental instead of designed.
- Make the center image slightly larger or framed to emphasize the high point.
- If the images are too small for the content, switch to a two-column stagger or single-column image stack.

## Pattern 23: Asymmetric Shapes (Beyond Rectangles)

Structure formula: `small inline-block shape -> asymmetric radius or light transform -> optional inner symbol`.

### Diamond (Rotated Square)
```html
<section style="display: inline-block; width: 10px; height: 10px; vertical-align: middle; background-color: rgb(255, 183, 77); border-radius: 2px; transform: rotate(45deg); box-sizing: border-box;">
</section>
```

### Leaf Shape (Asymmetric Radius)
```html
<section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(78, 128, 88); border-radius: 0 100% 0 100%; box-sizing: border-box; line-height: 24px; text-align: center;">
  <span style="color: rgb(255,255,255); font-size: 12px;">🌿</span>
</section>
```

### Inverted Leaf
```html
<section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(255, 183, 77); border-radius: 100% 0 100% 0; box-sizing: border-box; line-height: 24px; text-align: center;">
  <span style="color: rgb(255,255,255); font-size: 12px;">🍁</span>
</section>
```

## Pattern 24: Text Background Cards (Letter Paper Feel)

Structure formula: `card container with background/border -> paragraph block with body text rules`.

### Card with Colored Top/Bottom Borders
```html
<section style="background-color: rgb(255, 255, 255); padding: 20px; margin: 10px 15px; box-sizing: border-box; border-top: 3px solid rgb(255, 183, 77); border-bottom: 3px solid rgb(78, 128, 88);">
  <p style="white-space: normal; margin: 0; padding: 0; text-indent: 2em;">正文内容...</p>
</section>
```

### Card with Shadow
```html
<section style="background-color: rgb(255, 255, 255); padding: 20px; margin: 15px 15px; box-sizing: border-box; border-left: 4px solid rgb(78, 128, 88); box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
  <p style="white-space: normal; margin: 0; padding: 0; text-indent: 2em;">正文内容...</p>
</section>
```

## Pattern 25: Tilted Elements (Transform)

Use `transform: rotate()` sparingly. WeChat editor support is partial.

Structure formula: `slightly rotated outer frame -> counter-rotated inner image/content wrapper`.

```html
<!-- Tilted frame with counter-rotated image -->
<section style="display: inline-block; width: 100%; vertical-align: top; background-color: rgb(168, 213, 168); padding: 12px; box-sizing: border-box; transform: rotate(-2deg);">
  <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 6px; overflow: hidden; box-sizing: border-box; transform: rotate(2deg);">
    <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; display: block;">
  </section>
</section>
```

**Note**: Counter-rotate the inner element to keep the image straight while the frame is tilted. Small angles (1-3deg) work best.

## Pattern 26: Decorative Divider with Stickers

Structure formula: `inline decoration -> short line -> inline decoration`.

### Diamond + Line + Diamond
```html
<section style="text-align: center; margin: 20px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 8px; height: 8px; vertical-align: middle; background-color: rgb(255, 183, 77); border-radius: 2px; transform: rotate(45deg); box-sizing: border-box;">
  </section>
  <section style="display: inline-block; width: 60px; height: 2px; vertical-align: middle; background-color: rgb(78, 128, 88); margin: 0 10px; box-sizing: border-box;">
  </section>
  <section style="display: inline-block; width: 8px; height: 8px; vertical-align: middle; background-color: rgb(255, 183, 77); border-radius: 2px; transform: rotate(45deg); box-sizing: border-box;">
  </section>
</section>
```

### Leaf Stickers + Line
```html
<section style="text-align: center; margin: 20px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(78, 128, 88); border-radius: 0 100% 0 100%; box-sizing: border-box; line-height: 24px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 12px;">🌿</span>
  </section>
  <section style="display: inline-block; width: 80px; height: 2px; vertical-align: middle; background-color: rgb(78, 128, 88); margin: 0 10px; box-sizing: border-box;">
  </section>
  <section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(255, 183, 77); border-radius: 100% 0 100% 0; box-sizing: border-box; line-height: 24px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 12px;">🍁</span>
  </section>
</section>
```

### Dot + Thick Line + Dot (Bold)
```html
<section style="text-align: center; margin: 20px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 30px; height: 3px; vertical-align: middle; background-color: rgb(255, 183, 77); box-sizing: border-box;">
  </section>
  <section style="display: inline-block; width: 10px; height: 10px; vertical-align: middle; background-color: rgb(78, 128, 88); border-radius: 100%; margin: 0 8px; box-sizing: border-box;">
  </section>
  <section style="display: inline-block; width: 30px; height: 3px; vertical-align: middle; background-color: rgb(255, 183, 77); box-sizing: border-box;">
  </section>
</section>
```

## Pattern 27: Whole-Page Background

Some article designs use a unified background color for the entire page, with content blocks layered on top.

Structure formula: `root background container -> repeated content blocks/cards -> optional full-color section`.

```html
<!-- Root container with page background (NOT pure white) -->
<section style="max-width: 375px; margin: 0 auto; background-color: rgb(245, 245, 235); box-sizing: border-box;">
  
  <!-- Content blocks use white cards on top of the background -->
  <section style="background-color: rgb(255, 255, 255); padding: 20px; margin: 15px; box-sizing: border-box;">
    <p style="margin: 0; text-indent: 2em;">正文...</p>
  </section>
  
  <!-- Colored section directly on page background -->
  <section style="background-color: rgb(78, 128, 88); padding: 30px; margin: 15px; box-sizing: border-box;">
    <p style="margin: 0; color: rgb(255,255,255); text-align: center;">结语...</p>
  </section>
  
</section>
```

## Pattern 28: Textured Paper Background

Use a low-contrast repeat texture as the page background, with solid or near-solid content blocks above it so text remains readable.

Structure formula: `root texture background -> readable solid content block -> text/image content`.

```html
<section style="width: 100%; max-width: 375px; margin-left: auto; margin-right: auto; background-color: rgb(248, 245, 238); background-image: url('TEXTURE_URL'); background-repeat: repeat; background-size: auto; padding: 24px 10px; box-sizing: border-box; text-align: center;">
  <section style="background-color: rgb(255, 253, 248); padding: 18px 14px; box-sizing: border-box;">
    <p style="margin: 0; padding: 0; font-size: 15px; line-height: 1.9; color: rgb(74, 58, 46); text-align: justify; text-indent: 2em;">
      正文内容...
    </p>
  </section>
</section>
```

Rules:
- Keep the root centered with both `width: 100%` and `max-width: 375px`.
- Use `background-color` as a fallback in case the texture image fails.
- Avoid dark, busy, or photographic textures behind long text.
- Do not depend on `background-attachment` or complex background positioning.

## Pattern 29: Circle Character Title

Split a short title into individual characters inside equal-size circles.

Structure formula: `centered row -> repeated fixed-size circle -> one character per circle`.

```html
<section style="text-align: center; margin: 12px 0 8px; box-sizing: border-box;">
  <section style="display: inline-block; width: 36px; height: 36px; line-height: 36px; vertical-align: top; margin: 0 4px; border-radius: 100%; background-color: rgb(134, 96, 71); box-sizing: border-box;">
    <span style="font-size: 18px; color: rgb(255,255,255);"><strong>标</strong></span>
  </section>
  <section style="display: inline-block; width: 36px; height: 36px; line-height: 36px; vertical-align: top; margin: 0 4px; border-radius: 100%; background-color: rgb(168, 101, 47); box-sizing: border-box;">
    <span style="font-size: 18px; color: rgb(255,255,255);"><strong>题</strong></span>
  </section>
  <section style="display: inline-block; width: 36px; height: 36px; line-height: 36px; vertical-align: top; margin: 0 4px; border-radius: 100%; background-color: rgb(134, 96, 71); box-sizing: border-box;">
    <span style="font-size: 18px; color: rgb(255,255,255);"><strong>文</strong></span>
  </section>
  <section style="display: inline-block; width: 36px; height: 36px; line-height: 36px; vertical-align: top; margin: 0 4px; border-radius: 100%; background-color: rgb(168, 101, 47); box-sizing: border-box;">
    <span style="font-size: 18px; color: rgb(255,255,255);"><strong>字</strong></span>
  </section>
</section>
```

Rules:
- Use only for short titles, usually 2-6 Chinese characters.
- Set equal `width`, `height`, and `line-height` to keep circles stable.
- Keep each circle as `inline-block`; do not use `grid`.
- Add a simple divider below when the title area needs balance.

## Pattern 30: Four-Corner Frame

Create a framed container with a thin outer border and four L-shaped corner marks. This is a safe replacement for absolute-positioned corner decorations.

Structure formula: `outer border -> top corner row -> padded content -> bottom corner row`.

```html
<section style="margin: 22px 10px 0; padding: 8px; border: 1px solid rgb(134, 96, 71); box-sizing: border-box;">
  <section style="text-align: left; height: 18px; line-height: 0; box-sizing: border-box;">
    <section style="display: inline-block; width: 16px; height: 16px; border-top: 3px solid rgb(134, 96, 71); border-left: 3px solid rgb(134, 96, 71); box-sizing: border-box;"></section>
    <section style="display: inline-block; width: 100%; max-width: 295px; height: 1px; box-sizing: border-box;"></section>
    <section style="display: inline-block; width: 16px; height: 16px; border-top: 3px solid rgb(134, 96, 71); border-right: 3px solid rgb(134, 96, 71); box-sizing: border-box;"></section>
  </section>

  <section style="padding: 22px 12px; box-sizing: border-box;">
    <!-- main content -->
  </section>

  <section style="text-align: left; height: 18px; line-height: 0; box-sizing: border-box;">
    <section style="display: inline-block; width: 16px; height: 16px; border-bottom: 3px solid rgb(134, 96, 71); border-left: 3px solid rgb(134, 96, 71); box-sizing: border-box;"></section>
    <section style="display: inline-block; width: 100%; max-width: 295px; height: 1px; box-sizing: border-box;"></section>
    <section style="display: inline-block; width: 16px; height: 16px; border-bottom: 3px solid rgb(134, 96, 71); border-right: 3px solid rgb(134, 96, 71); box-sizing: border-box;"></section>
  </section>
</section>
```

Rules:
- Keep the frame inside the 375px root; use `margin: 0 10px` or similar side padding.
- Use inner padding so text and images do not touch the corner marks.
- If exact corner alignment matters, prefer four normal-flow rows/columns over `position: absolute`.

## Pattern 31: Side Image With Short Text

Place one narrow image beside a short text block. This is safer than a free-positioned collage and avoids making a vertical image dominate the full mobile width.

Structure formula: `inline-block narrow image column -> inline-block short text column`.

```html
<section style="margin: 18px 10px 0; padding: 28px 14px; border: 1px solid rgb(134, 96, 71); box-sizing: border-box; text-align: center;">
  <section style="display: inline-block; width: 34%; vertical-align: middle; padding: 4px; border: 4px double rgb(134, 96, 71); box-sizing: border-box; line-height: 0;">
    <img src="IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto; box-sizing: border-box;">
  </section><!--
  --><section style="display: inline-block; width: 58%; vertical-align: middle; padding-left: 18px; box-sizing: border-box; text-align: left;">
    <p style="margin: 0; padding: 0; font-size: 18px; line-height: 1.85; color: rgb(168, 101, 47); text-align: left;">
      <strong>短句第一行<br>短句第二行<br>短句第三行<br>短句第四行</strong>
    </p>
    <p style="margin: 12px 0 0; padding: 0; font-size: 18px; line-height: 1.8; color: rgb(168, 101, 47); text-align: right;">
      <strong>右对齐信息</strong>
    </p>
    <p style="margin: 4px 0 0; padding: 0; font-size: 18px; line-height: 1.8; color: rgb(168, 101, 47); text-align: right;">
      <strong>补充信息</strong>
    </p>
  </section>
</section>
```

Rules:
- Use this only when the image is narrow enough to sit beside text.
- Keep total column width conservative: about `34% + 58% + padding-left`.
- Use `vertical-align: middle` for balanced card-like layouts; use `top` when the text block is taller than the image.
- Keep text lines short and avoid long paragraphs in the side column.

## Pattern 32: Reference Layout Translation Rules

When using copied article-editor HTML as a reference, preserve the visual idea but rewrite the implementation into WeChat-safe normal flow.

Structure formula: `reference visual intent -> compatible normal-flow blocks -> simplified decoration`.

Translation rules:
- `display: grid` stacked scenes -> normal-flow sections with negative margins.
- `display: flex` rows -> `inline-block` rows with `<!-- -->` between columns.
- `transform: translate3d(...)` -> margins, padding, or text alignment.
- `position: static; z-index: ...` wrappers -> ordinary section order; render the lower layer first, then the upper layer.
- SVG decorations -> ignore, replace with simple HTML/CSS dots, lines, circles, corner marks, or use exported PNG images if the SVG is essential.
- `box-shadow` -> border, double border, offset color block, or a very subtle shadow only when tested.
- Gradient text/backgrounds -> solid theme colors unless the user specifically asks for the gradient and accepts possible degradation.

## Pattern 33: Two-Corner Quote Block

Use only a top-left and bottom-right corner mark around a text block. This is lighter than a full four-corner frame.

Structure formula: `top-left corner mark -> center text block -> bottom-right corner mark`.

```html
<section style="text-align: center; margin: 18px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 5%; vertical-align: top; height: 18px; border-top: 1px solid rgb(127, 22, 3); border-left: 1px solid rgb(127, 22, 3); margin-top: -2px; box-sizing: border-box;"></section><!--
  --><section style="display: inline-block; width: 84%; vertical-align: top; padding: 8px 10px; box-sizing: border-box;">
    <p style="white-space: normal; margin: 0; padding: 0; font-size: 15px; line-height: 1.9; color: rgb(73,73,73); text-align: justify; text-indent: 2em;">
      这里是文本内容...
    </p>
  </section><!--
  --><section style="display: inline-block; width: 5%; vertical-align: bottom; height: 18px; border-bottom: 1px solid rgb(127, 22, 3); border-right: 1px solid rgb(127, 22, 3); margin-bottom: -2px; box-sizing: border-box;"></section>
</section>
```

Rules:
- Keep the center content width around 80%-86% so the side corner marks have space.
- Use this for repeated short text blocks; it gives rhythm without making every paragraph a heavy card.
- For long body sections, use a normal text card or plain paragraph instead.

## Pattern 34: Labeled Dotted Divider

Use a short label or small sticker with a dotted line to separate sections.

Structure formula: `short label -> dotted/dashed line -> small dot/sticker`.

```html
<section style="text-align: center; margin: 22px 0 14px; box-sizing: border-box;">
  <section style="display: inline-block; width: 52px; vertical-align: middle; box-sizing: border-box;">
    <p style="white-space: normal; margin: 0; padding: 0; font-size: 14px; line-height: 1.4; color: rgb(134, 96, 71); text-align: left;">
      标签
    </p>
  </section><!--
  --><section style="display: inline-block; width: 180px; vertical-align: middle; border-top: 2px dotted rgb(134, 96, 71); box-sizing: border-box;"></section><!--
  --><section style="display: inline-block; width: 34px; vertical-align: middle; text-align: right; box-sizing: border-box;">
    <section style="display: inline-block; width: 18px; height: 18px; border-radius: 100%; background-color: rgb(134, 96, 71); box-sizing: border-box;"></section>
  </section>
</section>
```

Rules:
- Keep label text short, usually 2-4 Chinese characters or a compact English word.
- Use dotted or dashed borders instead of image-based divider textures.
- If a sticker image is required, use a small `<img>` inside the right wrapper.

## Pattern 35: Tab Header Card

Use a small rounded-top tab connected to a content card.

Structure formula: `small top tab -> connected bordered content card`.

```html
<section style="margin: 22px 15px 0; box-sizing: border-box; text-align: left;">
  <section style="display: inline-block; padding: 6px 16px; background-color: rgb(240, 112, 32); border: 2px solid rgb(240, 112, 32); border-bottom: none; border-top-left-radius: 14px; border-top-right-radius: 14px; box-sizing: border-box;">
    <p style="white-space: normal; margin: 0; padding: 0; font-size: 15px; line-height: 1.4; color: rgb(255,255,255); text-align: center;">
      <strong>标签标题</strong>
    </p>
  </section>
  <section style="margin-top: -1px; padding: 16px 14px; border: 2px solid rgb(240, 112, 32); border-radius: 0 8px 8px 8px; background-color: rgb(255,255,255); box-sizing: border-box;">
    <p style="white-space: normal; margin: 0; padding: 0; font-size: 15px; line-height: 1.8; color: rgb(62,62,62); text-align: justify; text-indent: 2em;">
      卡片正文内容...
    </p>
  </section>
</section>
```

Rules:
- Use one tab per section; repeated tabs should share the same color system.
- Keep tab labels short so they do not wrap.
- Use `margin-top: -1px` to visually connect the tab and card border.

## Visual Design Principles

### Layering Creates Depth
- **Large overlap** (-40px to -60px): Title over hero image
- **Medium overlap** (-20px to -30px): Decorative elements between sections
- **Micro overlap** (-10px): Small dots embedding into edges
- **Height: 0 trick**: Pure decoration layers don't affect document flow

### Stagger Creates Rhythm
- Use `padding-top` differences on inline-block columns
- Alternate large/small images left/right
- Vary border-radius patterns between images

### Unified Palette
Polished article layouts usually use 2-3 colors:
- **Primary**: Main theme color (rgb(0,61,106) blue, rgb(78,128,88) green)
- **Secondary**: Accent color (rgb(255,209,131) gold, rgb(255,183,77) orange)
- **Background**: Page base (rgb(245,245,235) beige, rgb(255,255,255) white)
- **Text**: rgb(62,62,62) body, rgb(128,128,128) caption

### Every Element is Designed
- Even simple dividers have shapes (diamonds, leaves, dots)
- Small stickers (15-24px) add personality
- Text blocks have subtle backgrounds/borders (not plain)
- Negative space is actively controlled via margins
