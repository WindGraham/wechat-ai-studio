# Screenshot Check

Use this before telling the user a visual draft is ready.

## Goal

Catch obvious layout failures before the user reviews the HTML: unloaded images, text overlap, excessive blank space, horizontal overflow, clipped titles, or unreadable dense blocks.

## Browser Screenshot

For local HTML files, use a 430px-wide viewport to simulate a WeChat/mobile reading width:

```bash
chromium --headless --disable-gpu --screenshot=/tmp/wechat-layout.png --window-size=430,1600 "file:///absolute/path/article.html"
```

If the page is long, capture multiple scroll positions or use a taller viewport.

## What To Check Visually

- No large blank first screen unless intentionally caused by an unloaded remote image.
- Images load; broken image icons are not present.
- Text does not overlap images, labels, corner decorations, or cards.
- Section titles are visible and not clipped.
- Captions stay close to the correct images.
- Two-column and three-column image groups fit within 375px.
- Negative margins do not hide important text.
- Decorative elements do not dominate body content.
- The layout does not require horizontal scrolling.

## If A Problem Appears

- Fix the smallest affected block.
- Prefer reducing overlap, padding, image width, or decoration size.
- If a remote image fails only in the browser but is expected to work in WeChat, verify it with `curl -I` before proceeding.
- Re-capture the screenshot after the fix.

## Final Review Note

Browser screenshots are approximate. The WeChat editor remains the final ground truth, but screenshot checks should catch common layout mistakes before paste testing.
