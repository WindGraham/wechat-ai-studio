# WeChat SVG Compatibility Matrix

> **Test date**: 2026-05-08  
> **Test account**: Subscription account wx1234567890abcdef (example)  
> **Test method**: Create draft via WeChat Official Account API, verify in editor  
> **Test rounds**: 4 historical + 5 today = 9 verified rounds  
> **Status**: ✅ Verified through actual publishing

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
| `textPath` | ❌ | Text path is filtered |
| `visibility` | ❌ | Layout attribute is filtered |
| `matrix()` / `matrix` SMIL | ❌ | Matrix transform is filtered |
| Base64 / Data URI | ❌ | Encoded images are filtered |
| `xlink:href` | ❌ | Filtered by WeChat editor |
| `href` (SVG2) | ✅ | Replacement for xlink:href, works |
| `style` attribute | ❌ | Filtered |
| `class` / `id` | ❌ | Removed |
| `rotateX()` / `rotateY()` / `rotateZ()` | ❌ | 3D transforms unsupported |
| CSS `@keyframes` / `animation` | ❌ | Completely filtered |
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

1. **Images MUST use WeChat CDN** — any external URL, Base64, Data URI will be filtered
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

*Document version: v2.1*  
*Last updated: 2026-05-08*  
*Test verification: ✅ Passed 9 rounds of SVG actual publishing verification + `box-shadow`专项验证*
