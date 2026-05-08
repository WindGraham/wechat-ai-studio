# Editor Features → HTML Implementation Reference

> Based on reverse-analysis of mainstream article editor feature sets, documenting what can be reliably implemented in the WeChat rich-text editor.

## Capability Levels

| Icon | Meaning |
|:---:|:---|
| ✅ | Fully usable, pure HTML/CSS implementation |
| ⚠️ | Partially usable, with limitations or fallback required |
| ❌ | Not usable, WeChat editor does not support |

## Capability Tiers

| Tier | Meaning | Usage Principle |
|:---|:---|:---|
| Basic capabilities | Stable layout abilities for regular Official Account articles | Use by default, suitable for most articles |
| Advanced layout capabilities | More complex, visually designed composite styles | Only use when reference images, column style, event atmosphere, or image assets demand it |
| Unsupported capabilities | Effects the WeChat rich-text editor cannot reliably receive or publish | Do not generate directly; use fallback alternatives |

---

## I. Basic Capabilities: Headings & Text

| Feature | Status | HTML/CSS Implementation |
|:---|:---:|:---|
| Basic heading | ✅ | `<p style="font-size:20px"><strong>Heading</strong></p>` |
| Minimal heading | ✅ | Remove decoration, plain text only |
| Bordered heading | ✅ | `border: 2px solid rgb(0,61,106)` |
| Background heading | ✅ | `background-color` + `padding` |
| Symbol heading | ✅ | Prefix decorative element (dot, line, emoji) |
| Heading + subheading | ✅ | Two `<p>` tags with different font sizes |
| Numbered heading | ✅ | Large number + heading text combination |
| Vertical heading | ⚠️ | `writing-mode: vertical-rl`; WeChat support unknown, avoid if possible |
| Gradient heading | ✅ | `-webkit-background-clip: text` + `linear-gradient`; PC may degrade to solid color, always set `color` fallback |
| Animated heading | ❌ | `animation` is filtered by WeChat |
| Text texture | ❌ | Complex textures not achievable |
| Text shadow | ⚠️ | `text-shadow` partially supported, limited effect |

---

## II. Basic Capabilities: Image-Text Cards

| Feature | Status | HTML/CSS Implementation |
|:---|:---:|:---|
| Solid color card | ✅ | `background-color` + `padding` + `border-radius` |
| Bordered card | ✅ | `border` + `padding` |
| Left accent card | ✅ | `border-left` |
| Top-bottom border card | ✅ | `border-top` + `border-bottom` |
| Shadow card | ✅ | `box-shadow` supported on both mobile and PC |
| Rounded card | ✅ | `border-radius` |
| Side-by-side card | ✅ | inline-block two-column |

---

## III. Basic Capabilities: Image Layout

| Feature | Status | HTML/CSS Implementation |
|:---|:---:|:---|
| Full-width image | ✅ | `width: 100%` |
| Rounded image | ✅ | `border-radius` |
| Bordered image | ✅ | Outer section with `border` |
| Double-line / frame image | ✅ | Outer section with `border-style: double` or double-layer border |
| Asymmetric radius | ✅ | `border-top-left-radius` + `border-bottom-right-radius` |
| Image shadow | ✅ | `box-shadow` supported on both mobile and PC |
| Two images side-by-side | ✅ | inline-block two-column (see Alignment Rules) |
| Image filter | ❌ | `filter` not supported |
| Image clipping shape | ⚠️ | Only `border-radius` rectangular clipping supported; complex shapes not supported |

---

## IV. Basic Capabilities: Layout System

| Feature | Status | HTML/CSS Implementation |
|:---|:---:|:---|
| Single column | ✅ | Standard block stacking |
| Two-column | ✅ | inline-block two-column |
| Three-column | ✅ | inline-block three-column (~31% each) |
| Image left text right | ✅ | inline-block two-column |
| Image top text bottom | ✅ | Block stacking |
| Nested frames | ✅ | Outer background color + inner white card |
| Table | ❌ | `<table>` is filtered by WeChat |
| Scrollable area | ❌ | `overflow: scroll` does not support interactive scrolling |
| Free positioning | ❌ | `position: absolute/fixed` forced to static |

---

## V. Basic Capabilities: Dividers & Decorations

| Feature | Status | HTML/CSS Implementation |
|:---|:---:|:---|
| Solid divider | ✅ | `border-bottom: 1px solid` |
| Dashed divider | ✅ | `border-top: 1px dashed` |
| Thick divider | ✅ | `height: 3px; background-color` |
| Dot decoration | ✅ | `width: 8px; height: 8px; border-radius: 100%` |
| Diamond decoration | ✅ | `transform: rotate(45deg)` + small size |
| Sticker decoration | ✅ | Circle / irregular background + emoji/text |
| Composite separator | ✅ | Dot + short line + dot combination |

---

## VI. Advanced Layout Capabilities: Composite Styles

These are not mandatory. They are suitable for reference-image replication, column packaging, event-poster-style articles, or image-heavy pushes. For regular body text, prioritize basic capabilities.

| Feature | Status | HTML/CSS Implementation |
|:---|:---:|:---|
| Image-title overlay | ✅ | Place image first, then pull up title block with negative margin |
| Layered layout | ✅ | Normal document flow + negative margin; avoid absolute |
| Staggered multi-image | ✅ | inline-block multi-column + different `padding-top` |
| Left-image right-text poem card | ✅ | inline-block two-column + border/texture background |
| Four-corner frame / certificate frame | ✅ | Plain border + four L-shaped corner mark sections |
| Circular character heading | ✅ | Each character in fixed-size circular `inline-block` |
| Image heading | ✅ | Background image + centered text; fallback to title below image when needed |
| Textured paper background | ✅ | Light repeat background image + solid color fallback |
| Corner-badge image over card | ✅ | Small image after + negative margin; text card预留内边距 |
| Three-image crown / staggered group | ✅ | Three inline-block columns + center突出 or两侧下沉 |
| Double-corner quote block | ✅ | Top-left / bottom-right corner marks + body text in middle |
| Tag-dot-line separator | ✅ | Short tag + dotted/dashed line + small dot or image |
| Tab title card | ✅ | Rounded top tab + bordered content card |

---

## VII. Interactive Components & Unsupported Capabilities

| Feature | Status | Notes |
|:---|:---:|:---|
| Follow prompt | ⚠️ | Plain text + link, no auto-follow capability |
| QR code | ✅ | Insert QR code image with `<img>` |
| Video | ⚠️ | WeChat supports `<video>` tag, but must upload to WeChat media library |
| Audio | ⚠️ | WeChat supports audio component, but must upload |
| Form / Survey | ❌ | `<input>`, `<form>` not supported |
| Click to expand | ❌ | Requires JS |
| Carousel | ❌ | Requires JS + CSS animation |
| Lottery / Draw | ❌ | Requires JS |
| Danmaku | ❌ | Requires JS + animation |
| Quiz | ❌ | Requires JS |
| Typewriter effect | ❌ | Requires animation |
| Click to change image | ❌ | Requires JS |
| Click to popup | ❌ | Requires JS |

---

## VIII. Animation Effects

| Feature | Status | Notes |
|:---|:---:|:---|
| Fade in | ❌ | `animation`/`transition` filtered |
| Slide in | ❌ | Same as above |
| Scale up | ❌ | Same as above |
| Rotate | ❌ | Same as above |
| Bounce | ❌ | Same as above |
| Continuous loop | ❌ | Same as above |
| SVG SMIL animation | ✅ | `<animate>` / `<animateTransform>` / `<animateMotion>` verified working through actual publishing |
| GIF animation | ✅ | Insert GIF with `<img>` |

---

## IX. Basic Capabilities: Formatting

| Feature | Status | HTML/CSS Implementation |
|:---|:---:|:---|
| Font size | ✅ | `font-size` |
| Letter spacing | ✅ | `letter-spacing` |
| Line height | ✅ | `line-height` |
| Paragraph spacing | ✅ | `margin` |
| Page margin | ✅ | `padding` |
| Text color | ✅ | `color` |
| Background color | ✅ | `background-color` |
| Full-bleed background image | ✅ | `background-image` |
| Section background image | ✅ | `background-image` on local section |
| Theme color switch | ⚠️ | Can globally replace color values during AI generation |
| Bold | ✅ | `<strong>` |
| Italic | ✅ | `<em>` |
| Underline | ✅ | `text-decoration: underline color thickness` |
| Strikethrough | ✅ | `text-decoration: line-through color thickness` |
| Superscript / Subscript | ⚠️ | WeChat support unknown |

---

## X. Basic Capabilities: Header & Footer

| Feature | Status | HTML/CSS Implementation |
|:---|:---:|:---|
| Top header | ✅ | First-screen section, can use large image/color block |
| Bottom brand area | ✅ | Footer image + brand text |
| Follow prompt | ⚠️ | Plain text + link form |
| QR code display | ✅ | `<img>` |
| Source link | ✅ | End-of-article text link |

---

## XI. Summary of Unachievable Features

The following require JavaScript, CSS animation, or complex interaction, and are **completely unsupported** by the WeChat editor:

- All CSS animations (fade in, slide in, scale up, rotate, etc.)
- All CSS-driven SVG effects (WeChat does not support CSS `@keyframes` / `animation` / `transition`)
- SVG filters, gradients, clipping paths (`clipPath`), text paths (`textPath`)
- Scrollable areas (vertical/horizontal scroll)
- Tables (`<table>` is filtered)
- Forms (`<input>`, `<form>` not supported)
- Free positioning (`position: absolute/fixed` forced to static)
- Click interactions (expand, toggle, popup, quiz, etc.)
- Video/audio autoplay
- Typewriter text effects
- Complex image filters

---

## Usage Recommendations

**Safe to use freely**: Basic layout, heading styles, image-text cards, image processing, divider decorations, nested layouts, formatting, headers/footers.

**Use with caution**: Vertical text, gradient text, text shadow, video/audio (must upload to WeChat media library).

**Avoid entirely**: All animations, all interactions, tables, forms, scrollable areas, free positioning.

---

## Appendix: Transform Function Compatibility Quick Reference

The following functions commonly appear in third-party editor export code, categorized by WeChat editor compatibility:

| Function | Status | Notes |
|:---|:---:|:---|
| `rotate(deg)` / `rotateZ(deg)` | ✅ | 2D rotation, stable on mobile; usually retained on PC |
| `translate(x, y)` | ✅ | 2D translation; can be replaced with `margin` |
| `translate3d(x, y, 0)` | ⚠️ | Usable but recommended to rewrite as `margin/padding` |
| `scale(s)` | ✅ | Scaling, for subtle inset/outset effects |
| `matrix(a, b, c, d, e, f)` | ⚠️ | Equivalent to rotate/scale/translate combination; recommended to expand into separate functions |
| `rotateX(180deg)` / `rotateY(180deg)` | ❌ | 3D flip, used for mirror decoration; use static duplicated ornament instead |
| `rotateX(67deg)` | ❌ | 3D tilt,接近平面透视；视觉效果不可靠 |
| `perspective(px)` | ❌ | `perspective(0px)` mathematically invalid; other values unsupported in WeChat |
