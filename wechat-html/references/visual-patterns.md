
## Pattern 17: Multi-Layer Stack (Layered Overlap)

Multiple layers stacked with negative margins. Common pattern: background wallpaper + frame + image.

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

## Pattern 19: Staggered Image Grid (Interlaced Layout)

Multiple images arranged in staggered left-right positions with different vertical offsets.

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

## Pattern 20: Three-Image Crown Layout

One row with three images where the left and right images sit lower and the center image sits higher. This is useful for activity photos, portrait groups, product details, and visual rhythm between text sections.

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

## Pattern 21: Asymmetric Shapes (Beyond Rectangles)

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

## Pattern 22: Text Background Cards (Letter Paper Feel)

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

## Pattern 23: Tilted Elements (Transform)

Use `transform: rotate()` sparingly. WeChat editor support is partial.

```html
<!-- Tilted frame with counter-rotated image -->
<section style="display: inline-block; width: 100%; vertical-align: top; background-color: rgb(168, 213, 168); padding: 12px; box-sizing: border-box; transform: rotate(-2deg);">
  <section style="display: inline-block; width: 100%; vertical-align: top; line-height: 0; border-radius: 6px; overflow: hidden; box-sizing: border-box; transform: rotate(2deg);">
    <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; display: block;">
  </section>
</section>
```

**Note**: Counter-rotate the inner element to keep the image straight while the frame is tilted. Small angles (1-3deg) work best.

## Pattern 24: Decorative Divider with Stickers

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

## Pattern 25: Whole-Page Background

Some article designs use a unified background color for the entire page, with content blocks layered on top.

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

## Visual Design Principles

### Layering Creates Depth
- **Large overlap** (-40px to -60px): Title over hero image
- **Medium overlap** (-20px to -30px): Decorative elements between sections
- **Micro overlap** (-10px): Small dots embedding into edges
- **Height: 0 trick**: Pure decoration layers don't affect document flow

### Stagger Creates Rhythm
- Use `padding-top` differences on flex columns
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
