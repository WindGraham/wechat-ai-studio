# Decorative Patterns

Use this file for visual flourishes — dividers, shapes, stickers, transforms, and ornament arrangements. For page structure patterns (headers, cards, image grids), see `references/refined-layout-blocks.md`.

These patterns are decorative, not structural. The layout must still work if a decoration is dropped by the WeChat editor.

---

## Divider Patterns

### Line + Dot + Line

```html
<section style="text-align: center; margin: 28px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 72px; height: 1px; vertical-align: middle; background-color: rgb(180,190,180); box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 8px; height: 8px; vertical-align: middle; margin: 0 10px; border-radius: 100%; background-color: rgb(80,105,92); box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 72px; height: 1px; vertical-align: middle; background-color: rgb(180,190,180); box-sizing: border-box;"></section>
</section>
```

### Diamond + Line + Diamond

```html
<section style="text-align: center; margin: 20px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 8px; height: 8px; vertical-align: middle; background-color: rgb(255,183,77); border-radius: 2px; transform: rotate(45deg); box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 60px; height: 2px; vertical-align: middle; background-color: rgb(78,128,88); margin: 0 10px; box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 8px; height: 8px; vertical-align: middle; background-color: rgb(255,183,77); border-radius: 2px; transform: rotate(45deg); box-sizing: border-box;"></section>
</section>
```

### Sticker + Line + Sticker

```html
<section style="text-align: center; margin: 20px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(78,128,88); border-radius: 0 100% 0 100%; box-sizing: border-box; line-height: 24px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 12px;">🌿</span>
  </section>
  <section style="display: inline-block; width: 80px; height: 2px; vertical-align: middle; background-color: rgb(78,128,88); margin: 0 10px; box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(255,183,77); border-radius: 100% 0 100% 0; box-sizing: border-box; line-height: 24px; text-align: center;">
    <span style="color: rgb(255,255,255); font-size: 12px;">🍁</span>
  </section>
</section>
```

### Dot + Thick Line + Dot

```html
<section style="text-align: center; margin: 20px 0; box-sizing: border-box;">
  <section style="display: inline-block; width: 30px; height: 3px; vertical-align: middle; background-color: rgb(255,183,77); box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 10px; height: 10px; vertical-align: middle; background-color: rgb(78,128,88); border-radius: 100%; margin: 0 8px; box-sizing: border-box;"></section>
  <section style="display: inline-block; width: 30px; height: 3px; vertical-align: middle; background-color: rgb(255,183,77); box-sizing: border-box;"></section>
</section>
```

---

## Shape Patterns

### Diamond (Rotated Square)

```html
<section style="display: inline-block; width: 10px; height: 10px; vertical-align: middle; background-color: rgb(255,183,77); border-radius: 2px; transform: rotate(45deg); box-sizing: border-box;"></section>
```

### Leaf Shape (Asymmetric Radius)

```html
<section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(78,128,88); border-radius: 0 100% 0 100%; box-sizing: border-box; line-height: 24px; text-align: center;">
  <span style="color: rgb(255,255,255); font-size: 12px;">🌿</span>
</section>
```

### Inverted Leaf

```html
<section style="display: inline-block; width: 24px; height: 24px; vertical-align: middle; background-color: rgb(255,183,77); border-radius: 100% 0 100% 0; box-sizing: border-box; line-height: 24px; text-align: center;">
  <span style="color: rgb(255,255,255); font-size: 12px;">🍁</span>
</section>
```

---

## Transform Patterns

### Rotated Decoration

Apply `transform: rotate()` only to decorative elements, never to body text. Mobile supports rotation well; PC may ignore it.

```html
<!-- Slightly tilted frame -->
<section style="display: inline-block; width: 120px; height: 120px; overflow: hidden; transform: rotate(3deg); box-sizing: border-box;">
  <img src="URL" style="width: 100%; display: block; margin: 0 auto;">
</section>
```

### Tilted Frame with Counter-Rotated Content

Rotate outer frame, counter-rotate inner element to keep content straight.

```html
<section style="display: inline-block; width: 100%; background-color: rgb(168,213,168); padding: 12px; box-sizing: border-box; transform: rotate(-2deg);">
  <section style="display: inline-block; width: 100%; line-height: 0; border-radius: 6px; overflow: hidden; box-sizing: border-box; transform: rotate(2deg);">
    <img src="URL" style="vertical-align: middle; max-width: 100%; width: 100%; display: block;">
  </section>
</section>
```

Rules:
- Small angles (1-5deg) for polished layouts; larger (10-15deg) for playful posters only.
- Use `transform-origin` to pivot from a corner instead of center.
- `scale(0.95-0.97)` can create subtle inset effects.
- Only 2D transforms (`rotate`, `rotateZ`, `translate`, `scale`). Avoid `rotateX`, `rotateY`, `perspective`.
- Never apply to body text.

### Mirror Ornament (No 3D Flip)

When source uses `rotateX(180deg)` to mirror a decoration, duplicate the HTML instead with a matching shape.

```html
<!-- Left ornament -->
<section style="text-align: left; line-height: 0;">
  <section style="display: inline-block; width: 24px; height: 24px; background-color: rgb(80,105,92); border-radius: 0 100% 0 100%;"></section>
</section>
<!-- Right ornament (mirrored border-radius pattern) -->
<section style="text-align: right; line-height: 0; margin-top: -24px;">
  <section style="display: inline-block; width: 24px; height: 24px; background-color: rgb(80,105,92); border-radius: 100% 0 100% 0;"></section>
</section>
```

---

## 2D Transform Reference

Typical source-export transform values and their safe handling:

| Value | Visual Intent | Safe Replacement |
|:---|:---|:---|
| `translate3d(1px, 0, 0)` | 1px micro-nudge | `margin-left: 1px` or drop |
| `translate3d(10px~25px, 0, 0)` | Small horizontal shift | `margin-left/right` |
| `translate3d(60px~70px, 0, 0)` | Large offset for mirrored pair | Duplicate ornament + `text-align` wrapper |
| `scale(0.97)` | Inset frame feel | Keep; nest inside larger block |
| `rotateZ(6deg)` | Playful tilt on frame | Keep for decorative wrappers only |
| `rotateZ(315deg)` / `rotateZ(342deg)` | Near-complete rotation | Rebuild with `rotate(45deg)` or asymmetric `border-radius` |

---

## Safe Usage Guidelines

- Apply transforms only to decorative elements or image containers, never body text.
- Keep rotation angles small for frames (under 20°).
- Do not combine multiple transform functions in one declaration.
- `matrix(...)` should be rewritten as explicit `rotate` or `scale`.
- `perspective(0px)` is mathematically invalid — delete it.
- If a decoration relies on rotation for meaning, ensure the layout still reads correctly if rotation is dropped by PC WeChat.
