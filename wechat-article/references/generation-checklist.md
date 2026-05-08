# WeChat Article Generation Checklist

Use this checklist before returning paste-ready HTML. It is a practical self-check, not a style guide.

## Before Generating

- Confirm the output is a WeChat rich-text HTML fragment, not a full web page.
- Separate the task into these concerns:
  - Hard code rules from `wechat-rules.md`.
  - Basic capabilities from `editor-features.md`.
  - Collaboration and local versioning from `interaction-workflow.md`.
  - Image URL preflight/finalization from `image-url-workflow.md`.
  - Refined capability blocks from `refined-layout-blocks.md` when requested.
  - Optional special layout patterns from `visual-patterns.md`.
  - Adaptable typography and image habits from `formatting-guide.md`.
- Use special layout patterns only when they improve the layout structure. Do not add complex decoration by default.
- Preserve user-provided facts, names, dates, captions, and source notes. Do not invent missing metadata.
- If required facts are missing, ask. If only style choices are missing, choose reasonable defaults.
- Do not default to a long opening image. Use one only when the user asks, the reference requires it, or the content clearly benefits from it.
- Before first draft, ask for color direction, refinement level, image style, opening style, and body text habit unless already specified.

## Code Compatibility

- Root container uses `width: 100%; max-width: 375px; margin-left: auto; margin-right: auto;`.
- All styles are inline. No `<style>`, classes required for styling, external CSS, or scripts.
- Layout containers use `<section>`.
- Text uses `<p>`, `<span>`, `<strong>`, `<em>`, and `<br>`.
- Images use `<img>` with `width: 100%; max-width: 100%; display: block; margin: 0 auto;` unless intentionally narrower.
- Do not use final-output `display: grid`, `position: absolute`, `position: fixed`, animation, forms, tables, or JavaScript.
- Do not use final-output `<foreignObject>` or complex nested SVG structures; prefer plain HTML/CSS when possible.
- If the user requests SVG features, ensure they comply with `references/svg-compatibility.md`: no filters, no gradients, no `clipPath`, no CSS animation, WeChat CDN images only, inline attributes only.
- Prefer `inline-block` rows over flex. Use `<!-- -->` between inline-block columns.
- Keep two-column and three-column total widths conservative; **mobile total width must be ≤ 92%** (recommend 90%).
- **Three-column gaps use `padding-left`** (absorbed by `box-sizing: border-box`), not `margin`, so the total rendered width does not exceed the limit.
- **Do not rely on root `background-color`.** WeChat editor forces the article background to white. Any dark theme must be built with explicit dark wrapper sections.
- **Gradient overlays must end on an opaque `rgb()` color**, not `rgba(..., 0.98)` or other semi-transparent values. Semi-transparent dark colors blend with the forced-white background and become muddy gray.

## Layout And Typography

- Body paragraphs explicitly override root centering with `text-align: justify` or `text-align: left`.
- Normal Chinese body text defaults to `text-indent: 2em`, `line-height: 1.7-1.9`, and `font-size: 15px-16px`.
- Captions, labels, short slogans, and titles may be centered; long body text should not inherit center alignment.
- Letter spacing stays modest, normally `0px-1px` for body text.
- Repeated blocks use consistent margins, padding, border width, radius, and theme colors.
- Text does not run under overlapping images or decorations; reserve padding where overlaps occur.

## Image Strategy

- Horizontal images can be full width when useful.
- Vertical images should not usually appear alone at full width.
- Reduced vertical images should be paired with other images, placed in a grid/staggered group, or paired with short text.
- Image groups use similar aspect ratios when possible.
- Decorative images are small and do not compete with primary content.

## Public Image URLs

- Local image paths were preflighted before the first layout draft when possible.
- Local image paths have been replaced before the final paste-ready HTML is returned.
- The default zero-config provider is 360 image host via `wzapi` unless the user configured another provider.
- Every uploaded image URL was checked with `curl -I`.
- Every final image URL returns HTTP `200` and `Content-Type: image/*`.
- No final image URL points to a warning page, tunnel reminder page, HTML page, redirect trap, or local file path.
- Large images were compressed or resized as temporary copies before upload when required by the provider.
- Anonymous image hosts were not used for sensitive/private images unless the user explicitly approved.

## Final Pass

- HTML starts with one clear root `<section>` and has balanced tags.
- Local git contains a commit for the current draft when the article is being iterated in a working directory.
- Screenshot check was run for visually complex drafts, reference-matched layouts, or any update that changes spacing, overlap, or image grouping.
- Placeholder text and placeholder URLs are obvious and neutral.
- No private contact details, organizations, QR codes, or publication metadata were invented.
- No unsupported source-editor artifacts remain, such as SVG wrappers, animation wrappers, grid coordinates, 3D flips, or transform-heavy positioning.
- If the source used an SVG image stack, confirm it was downgraded to normal-flow HTML, a static image, or a plain decorative block.
- Desktop preview should remain centered; mobile width should remain readable at 375px.
