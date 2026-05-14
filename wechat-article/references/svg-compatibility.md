# WeChat SVG Compatibility Matrix

> **Test date**: 2026-05-08  
> **Test account**: Subscription account wx1234567890abcdef (example)  
> **Test method**: Create draft via WeChat Official Account API, verify in editor  
> **Test rounds**: 4 historical + 5 today = 9 verified rounds  
> **Status**: ✅ Verified through actual publishing

---

## Static Contract Summary

This section is the contract used by `tests/wechat-svg-compatibility-contract.test.js`.
When guidance below changes, update the test in the same change so agents do not
regress WeChat SVG assumptions silently.

| ID | Feature | WeChat Status | Contract |
|:---|:---|:---:|:---|
| `SVG-SMIL-ANIMATE` | `<animate>` | ✅ Supported | Use for attribute animation such as `opacity`, `r`, `fill`, `stroke-width`, `stroke-dashoffset`, `x`, `y`, `cx`, and `cy`. |
| `SVG-SMIL-ANIMATE-TRANSFORM` | `<animateTransform>` | ✅ Supported | Use only with 2D transform types `translate`, `scale`, `rotate`, `skewX`, and `skewY`. |
| `SVG-FOREIGNOBJECT` | `<foreignObject>` | ❌ Blocked | Do not embed HTML inside SVG. Build the layout as normal article HTML instead. |
| `SVG-FILTER` | `<filter>` and `<fe*>` | ❌ Blocked | No blur, shadow, blend, color matrix, component transfer, merge, offset, flood, tile, or composite effects inside SVG. |
| `SVG-GRADIENT` | `<linearGradient>`, `<radialGradient>`, `<stop>` | ❌ Blocked | Replace gradients with solid fills, layered shapes, or pre-rendered bitmap assets uploaded to WeChat CDN. |
| `SVG-CLIP-MASK-TEXTPATH` | `<clipPath>`, `clip-path`, `<mask>`, `mask`, `<textPath>` | ❌ Blocked | Do not rely on clipping, masking, or text-on-path. Use viewBox cropping, simple shapes, or pre-rendered images. |
| `SVG-XLINK-HREF` | `xlink:href` | ❌ Blocked | Use SVG2 `href` on `<image>`. Auto-publish may rewrite `<image xlink:href>` to `href`, but generated source should not use it. |
| `SVG-DATA-URI` | `data:` / Base64 URLs | ❌ Blocked | Never use data URIs in `<img src>`, `<image href>`, CSS `url()`, or SVG attributes. |
| `SVG-MATRIX-3D` | `matrix()`, matrix SMIL, `matrix3d()`, `rotateX/Y/Z`, `translateZ`, `perspective` | ❌ Blocked | Use simple 2D `translate`, `scale`, `rotate`, `skewX`, or `skewY` only. |
| `SVG-CSS-ANIMATION` | CSS `@keyframes`, `animation`, `transition` | ❌ Blocked | Use SMIL animation attributes instead of CSS animation or transition. |
| `SVG-IMAGE-CDN` | SVG `<image href>` | ⚠️ Workflow dependent | For API publish, image URLs must already be WeChat CDN (`https://mmbiz.qpic.cn/...`) or be uploaded and rewritten before draft creation. Manual paste can render some public HTTPS external images, but external SVG image links are not a safe contract. |

### Static Fixture Rules

Allowed fixture:

```svg
<svg width="100%" height="80" viewBox="0 0 375 80">
  <image x="0" y="0" width="120" height="80" href="https://mmbiz.qpic.cn/example.jpg">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="translate" values="0,0;20,0;0,0" dur="2s" repeatCount="indefinite"/>
  </image>
</svg>
```

Blocked fixture patterns include:

```svg
<foreignObject/>
<filter><feGaussianBlur/></filter>
<linearGradient><stop/></linearGradient>
<clipPath/><mask/><textPath/>
<image xlink:href="https://example.com/a.png"/>
<image href="data:image/png;base64,AAA"/>
<g transform="matrix(1 0 0 1 0 0)"/>
<g style="animation: spin 1s linear infinite; transition: opacity 1s;"/>
```

---

## Green Zone — Confirmed Working

### 1. Basic Shapes

| Tag | Status | Notes |
|:---|:---:|:---|
| `<svg>` | ✅ | Root tag works |
| `<g>` | ✅ | Grouping tag works |
| `<rect>` | ✅ | Rectangle, supports rx/ry rounding |
| `<circle>` | ✅ | Circle |
| `<ellipse>` | ✅ | Ellipse |
| `<line>` | ✅ | Line, supports stroke-linecap |
| `<polyline>` | ✅ | Polyline |
| `<polygon>` | ✅ | Polygon |
| `<path>` | ✅ | Path, supports d attribute animation |
| `<text>` | ✅ | Text |
| `<tspan>` | ✅ | Text span, supports color change |
| `<foreignObject>` | ❌ | Filtered/blocked; do not embed HTML inside SVG |

### 2. Basic Attributes

| Attribute | Status | Notes |
|:---|:---:|:---|
| `fill` | ✅ | Fill color |
| `stroke` | ✅ | Stroke color |
| `stroke-width` | ✅ | Stroke width, supports animation |
| `opacity` | ✅ | Opacity, supports animation |
| `rx` / `ry` | ✅ | Corner radius |
| `stroke-dasharray` | ✅ | Dashed line |
| `stroke-dashoffset` | ✅ | Offset, can be used for draw animation |
| `stroke-linecap` / `stroke-linejoin` | ✅ | Line cap/join styles |
| `fill-rule` | ✅ | Fill rule |

### 3. 2D Transforms (Attributes)

| Transform | Status | Notes |
|:---|:---:|:---|
| `translate()` | ✅ | Translation |
| `scale()` | ✅ | Scaling |
| `rotate()` | ✅ | Rotation |
| `skewX` / `skewY` | ✅ | Skew |

### 4. SMIL Animation

| Animation | Status | Notes |
|:---|:---:|:---|
| `<animate>` | ✅ | Attribute animation (opacity/r/fill/stroke-width etc.) |
| `<animateTransform>` | ✅ | Transform animation (translate/scale/rotate/skewX) |
| `<animateMotion>` | ✅ | Path motion |
| `<set>` | ✅ | Set animation |
| `repeatCount` | ✅ | Auto loop |
| `begin` | ✅ | Delayed start |

### 5. Layout

| Feature | Status | Notes |
|:---|:---:|:---|
| `viewBox` | ✅ | Viewport scaling |
| `preserveAspectRatio` | ✅ | Aspect ratio preservation |
| `width` / `height` | ✅ | Dimensions |
| `x` / `y` / `cx` / `cy` / `r` | ✅ | Position and radius |

### 6. Images

| Source | Status | Notes |
|:---|:---:|:---|
| WeChat CDN (`mmbiz.qpic.cn`) | ✅ | Required for API publish; recommended for all SVG |
| Third-party image hosts (e.g. `ps.ssl.qhimg.com`) | ✅ | **Manual Paste only** — works in SVG `<image>` |
| Third-party image hosts | ❌ | **API publish** — blocked by server pre-fetch |
| `<image>` tag | ✅ | Usable with `href` |

**Workflow distinction:**

| Workflow | HTML `<img>` | SVG `<image>` |
|:---|:---:|:---:|
| Manual Paste | ✅ Any public HTTPS | ✅ Any public HTTPS (including 360) |
| API publish | ⚠️ Prefer WeChat CDN | ✅ WeChat CDN only (third-party blocked) |

**Important**: SVG SMIL animations do not play in the WeChat **PC editor preview**, regardless of workflow or image source. This is an editor limitation, not a failure. Animations typically play on **mobile devices** when the article is actually viewed.

---

## Red Zone — Confirmed Broken

### 1. Filters (All filtered)

| Filter | Status |
|:---|:---:|
| `<feGaussianBlur>` | ❌ |
| `<feComponentTransfer>` | ❌ |
| `<feBlend>` | ❌ |
| `<feComposite>` | ❌ |
| `<feOffset>` | ❌ |
| `<feMerge>` | ❌ |
| `<feFlood>` | ❌ |
| `<feTile>` | ❌ |
| `<filter>` tag overall | ❌ |

### 2. Gradients (All filtered)

| Gradient | Status |
|:---|:---:|
| `<linearGradient>` | ❌ |
| `<radialGradient>` | ❌ |
| `<stop>` | ❌ |
| `gradientUnits` | ❌ |
| `spreadMethod` | ❌ |

### 3. Other

| Feature | Status | Notes |
|:---|:---:|:---|
| `clipPath` / `clip-path` | ❌ | Clipping is filtered |
| `mask` / `<mask>` | ❌ | Masking is filtered |
| `textPath` | ❌ | Text path is filtered |
| `visibility` | ❌ | Layout attribute is filtered |
| `matrix()` / `matrix` SMIL | ❌ | Matrix transform is filtered |
| Base64 / Data URI | ❌ | Encoded images are filtered |
| `xlink:href` | ❌ | Filtered by WeChat editor |
| `href` (SVG2) | ✅ | Replacement for xlink:href, works |
| `style` attribute | ❌ | Filtered |
| `class` / `id` | ❌ | Removed |
| `matrix()` / `matrix3d()` | ❌ | Matrix transforms unsupported |
| `rotateX()` / `rotateY()` / `rotateZ()` / `translateZ()` / `perspective()` | ❌ | 3D transforms unsupported |
| CSS `@keyframes` / `animation` / `transition` | ❌ | Completely filtered |
| `<script>` / events | ❌ | Completely prohibited |

---

## Image Effect Workarounds

Since filters and clipping are unavailable, **image effects in WeChat SVG are limited to**:

| Effect | Implementation | Verified |
|:---|:---|:---:|
| Rotate | `transform="rotate(angle)"` or `<animateTransform type="rotate">` | ✅ Verified on images |
| Scale | `transform="scale(factor)"` or `<animateTransform type="scale">` | ✅ Verified on images |
| Translate | `transform="translate(x,y)"` or `<animateTransform type="translate">` | ✅ Verified on images |
| Skew | `transform="skewX(angle)"` or `<animateTransform type="skewX">` | ✅ Verified on images |
| Opacity | `opacity="value"` or `<animate attributeName="opacity">` | ✅ Verified on images |
| Fade in/out | opacity animation | ✅ Verified on images |
| Slide in | translate animation | ✅ Verified on images |
| Path motion | `<animateMotion>` | ✅ Verified on images |
| Combined effects | Multiple animations on `<image>` simultaneously | ✅ Verified on images |
| Blur | `feGaussianBlur` | ❌ |
| Clip | `clipPath` | ❌ |
| Mask | `mask` | ❌ |
| Color adjust | `feComponentTransfer` / `feColorMatrix` | ❌ |
| Shadow | `feOffset` + `feMerge` | ❌ |

---

## HTML/CSS Supplement: `box-shadow`

> Although `box-shadow` is not an SVG feature, it is frequently used alongside SVG in WeChat article layouts, so it is included here for unified verification.

| Feature | Status | Notes |
|:---|:---:|:---|
| Basic shadow (size variation) | ✅ | `2px` / `6px` / `16px` blur all work |
| Shadow color (solid) | ✅ | Black, red, blue all work |
| Semi-transparent shadow (`rgba`) | ✅ | `rgba(0,0,0,0.5)` etc. work on both mobile and PC |
| Inset shadow | ✅ | `inset` shadows display correctly |
| Multiple shadows | ✅ | Two-layer, three-layer, glow effects all work |
| Spread radius | ✅ | `-4px` / `0` / `+4px` all work |

**Conclusion**: `box-shadow` is **fully usable** in the WeChat editor, including `rgba()` transparent shadows, `inset`, multiple shadows, and `spread` radius. The previous documentation warning "PC client may lose shadow" has been **disproven**.

---

## Mandatory Rules

1. **API-published images MUST use WeChat CDN** — external SVG image URLs are not a safe API contract; Base64/Data URI is always disallowed
2. **Animations MUST use SMIL** — CSS animation completely unsupported
3. **Styles MUST use inline attributes** — `style` tags/attributes filtered
4. **Do NOT use class/id** — will be removed
5. **Do NOT use script** — completely prohibited
6. **Filters, gradients, clipping unavailable** — WeChat editor filters these tags entirely
7. **3D transforms unavailable** — `rotateX/Y/Z`, `matrix()` unsupported

---

## Recommended Stack

```
SVG tags: <svg>, <g>, <rect>, <circle>, <path>, <text>, <image>
Animation: <animate>, <animateTransform> (translate/scale/rotate/skewX), <animateMotion>
Styles: fill, stroke, stroke-width, opacity
Transforms: translate(), scale(), rotate(), skewX()
Images: WeChat CDN (mmbiz.qpic.cn)
```

---

## Usage Guide — Practical Examples

The following 7 patterns have been verified in WeChat articles. Replace image URLs with your own WeChat CDN URLs. All examples use inline SVG attributes only (no `style`, `class`, or `id`).

### Example 1: Image Carousel (Slide + Indicators)

Three images slide horizontally with bottom dot indicators.

```svg
<svg width="100%" height="200" viewBox="0 0 375 200">
  <rect x="0" y="0" width="375" height="200" rx="8" fill="rgb(245,245,247)"/>
  <g>
    <image x="0" y="0" width="375" height="200" href="WECHAT_CDN_URL_1"/>
    <image x="375" y="0" width="375" height="200" href="WECHAT_CDN_URL_2"/>
    <image x="750" y="0" width="375" height="200" href="WECHAT_CDN_URL_3"/>
    <animateTransform attributeName="transform" type="translate"
      values="0,0;-375,0;-750,0;0,0" dur="6s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
      keyTimes="0;0.33;0.66;1"/>
  </g>
  <!-- Indicator dots -->
  <circle cx="165" cy="185" r="4" fill="rgba(255,255,255,0.5)">
    <animate attributeName="fill"
      values="rgba(255,255,255,1);rgba(255,255,255,0.5);rgba(255,255,255,0.5);rgba(255,255,255,1)"
      dur="6s" repeatCount="indefinite" keyTimes="0;0.33;0.66;1"/>
  </circle>
  <circle cx="187" cy="185" r="4" fill="rgba(255,255,255,0.5)">
    <animate attributeName="fill"
      values="rgba(255,255,255,0.5);rgba(255,255,255,1);rgba(255,255,255,0.5);rgba(255,255,255,0.5)"
      dur="6s" repeatCount="indefinite" keyTimes="0;0.33;0.66;1"/>
  </circle>
  <circle cx="209" cy="185" r="4" fill="rgba(255,255,255,0.5)">
    <animate attributeName="fill"
      values="rgba(255,255,255,0.5);rgba(255,255,255,0.5);rgba(255,255,255,1);rgba(255,255,255,0.5)"
      dur="6s" repeatCount="indefinite" keyTimes="0;0.33;0.66;1"/>
  </circle>
</svg>
```

### Example 2: Crossfade Transition

Two images fade in and out alternately.

```svg
<svg width="100%" height="200" viewBox="0 0 375 200">
  <rect x="0" y="0" width="375" height="200" rx="8" fill="rgb(245,245,247)"/>
  <image x="0" y="0" width="375" height="200" href="WECHAT_CDN_URL_1">
    <animate attributeName="opacity" values="1;1;0;0;1" dur="5s"
      repeatCount="indefinite" keyTimes="0;0.4;0.5;0.9;1"/>
  </image>
  <image x="0" y="0" width="375" height="200" href="WECHAT_CDN_URL_2" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0" dur="5s"
      repeatCount="indefinite" keyTimes="0;0.4;0.5;0.9;1"/>
  </image>
</svg>
```

### Example 3: Slide Reveal

Top image slides away to reveal the bottom image.

```svg
<svg width="100%" height="200" viewBox="0 0 375 200">
  <rect x="0" y="0" width="375" height="200" rx="8" fill="rgb(245,245,247)"/>
  <image x="0" y="0" width="375" height="200" href="WECHAT_CDN_URL_1"/>
  <image x="0" y="0" width="375" height="200" href="WECHAT_CDN_URL_2">
    <animateTransform attributeName="transform" type="translate"
      values="0,0;-375,0;-375,0;0,0" dur="4s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
      keyTimes="0;0.4;0.6;1"/>
  </image>
</svg>
```

### Example 4: Decorative Line Draw

A horizontal line draws itself repeatedly. Good for section dividers.

```svg
<svg width="100%" height="40" viewBox="0 0 375 40">
  <line x1="37" y1="20" x2="337" y2="20"
    stroke="rgb(30,100,160)" stroke-width="2" stroke-linecap="round"
    stroke-dasharray="300" stroke-dashoffset="300">
    <animate attributeName="stroke-dashoffset" values="300;0" dur="2s"
      repeatCount="indefinite"/>
  </line>
</svg>
```

### Example 5: Rotating Corner Badge

A star-shaped badge rotates in the corner. Good for labels like NEW or HOT.

```svg
<svg width="100%" height="80" viewBox="0 0 375 80">
  <rect x="50" y="10" width="275" height="60" rx="8" fill="rgb(245,245,247)"/>
  <text x="187" y="48" text-anchor="middle" font-size="16" fill="rgb(62,62,62)">
    Content Card
  </text>
  <g transform="translate(310, 10)">
    <polygon points="0,-15 4,-4 15,0 4,4 0,15 -4,4 -15,0 -4,-4"
      fill="rgb(255,183,77)">
      <animateTransform attributeName="transform" type="rotate"
        values="0;360" dur="4s" repeatCount="indefinite"/>
    </polygon>
  </g>
</svg>
```

### Example 6: Floating Dots

Three dots float up and down in sequence. Good for loading indicators.

```svg
<svg width="100%" height="60" viewBox="0 0 375 60">
  <circle cx="150" cy="30" r="6" fill="rgb(30,100,160)">
    <animate attributeName="cy" values="30;20;30" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="187" cy="30" r="6" fill="rgb(30,100,160)">
    <animate attributeName="cy" values="30;20;30" dur="2s" begin="0.3s"
      repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.3s"
      repeatCount="indefinite"/>
  </circle>
  <circle cx="224" cy="30" r="6" fill="rgb(30,100,160)">
    <animate attributeName="cy" values="30;20;30" dur="2s" begin="0.6s"
      repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.6s"
      repeatCount="indefinite"/>
  </circle>
</svg>
```

### Example 7: Breathing Border

A rectangle border pulses. Good for highlighting important content.

```svg
<svg width="100%" height="100" viewBox="0 0 375 100">
  <rect x="50" y="15" width="275" height="70" rx="12"
    fill="none" stroke="rgb(30,100,160)" stroke-width="2">
    <animate attributeName="stroke-width" values="2;4;2" dur="2s"
      repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.6;1" dur="2s"
      repeatCount="indefinite"/>
  </rect>
  <text x="187" y="58" text-anchor="middle" font-size="16" fill="rgb(62,62,62)">
    Important Section
  </text>
</svg>
```

---

*Document version: v3.0*  
*Last updated: 2026-05-08*  
*Test verification: ✅ Passed 9 rounds of SVG actual publishing verification + box-shadow verification + practical usage template verification*
