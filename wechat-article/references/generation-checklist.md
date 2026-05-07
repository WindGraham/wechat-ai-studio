# WeChat Article Generation Checklist

Use this checklist before returning paste-ready HTML. It is a practical self-check, not a style guide.

## Before Generating

- Confirm the output is a WeChat rich-text HTML fragment, not a full web page.
- Separate the task into four concerns:
  - Hard code rules from `wechat-rules.md`.
  - Basic capabilities from `editor-features.md`.
  - Optional special layout patterns from `visual-patterns.md`.
  - Adaptable typography and image habits from `formatting-guide.md`.
- Use special layout patterns only when they improve the layout structure. Do not add complex decoration by default.
- Preserve user-provided facts, names, dates, captions, and source notes. Do not invent missing metadata.
- If required facts are missing, ask. If only style choices are missing, choose reasonable defaults.

## Code Compatibility

- Root container uses `width: 100%; max-width: 375px; margin-left: auto; margin-right: auto;`.
- All styles are inline. No `<style>`, classes required for styling, external CSS, or scripts.
- Layout containers use `<section>`.
- Text uses `<p>`, `<span>`, `<strong>`, `<em>`, and `<br>`.
- Images use `<img>` with `width: 100%; max-width: 100%; display: block; margin: 0 auto;` unless intentionally narrower.
- Do not use final-output `display: grid`, `position: absolute`, `position: fixed`, animation, forms, tables, or JavaScript.
- Prefer `inline-block` rows over flex. Use `<!-- -->` between inline-block columns.
- Keep two-column and three-column total widths conservative, normally at or below 96%.

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

- Local image paths have been replaced before the final paste-ready HTML is returned.
- The default zero-config provider is 360 image host via `wzapi` unless the user configured another provider.
- Every uploaded image URL was checked with `curl -I`.
- Every final image URL returns HTTP `200` and `Content-Type: image/*`.
- No final image URL points to a warning page, tunnel reminder page, HTML page, redirect trap, or local file path.
- Large images were compressed or resized as temporary copies before upload when required by the provider.
- Anonymous image hosts were not used for sensitive/private images unless the user explicitly approved.

## Final Pass

- HTML starts with one clear root `<section>` and has balanced tags.
- Placeholder text and placeholder URLs are obvious and neutral.
- No private contact details, organizations, QR codes, or publication metadata were invented.
- No unsupported source-editor artifacts remain, such as SVG animation wrappers, grid coordinates, or transform-heavy positioning.
- Desktop preview should remain centered; mobile width should remain readable at 375px.
