# Visual Editor Workflow

Use this workflow when the user wants browser-based layout control, drag/drop editing, local image selection, or the embedded terminal.

The current visual editor is `wechat-article/tools/editor.html`, launched by `wechat-article/tools/start-editor.py`. The old `layout-composer.html` was an early draft tool and should not be used as the primary workflow.

## Positioning

The editor is a local workbench for editable WeChat article layout. It can use browser-only capabilities while editing, but final exported WeChat HTML must still obey `references/wechat-rules.md`.

Use `references/workbench-html-spec.md` as the canonical bridge between:

- AI-generated editable drafts
- Document-flow rendering
- Free-canvas fine tuning
- Final WeChat export

## Launch

Start the service from the active article workspace, not from the skill directory:

```bash
python3 wechat-article/tools/start-editor.py --workspace "<WORK_DIR>" --no-browser
```

Then tell the user to open:

```text
http://127.0.0.1:8080/editor.html
```

If ports are occupied, choose alternate ports with `--http-port` and `--terminal-port`.

## Local Image Directory

Local draft images belong in:

```text
<WORK_DIR>/.wechat-ai-publisher/local-images/
```

The editor exposes them as:

```text
/local-images/<filename>
```

These paths are allowed in Workbench HTML only. Final WeChat HTML must replace them with public HTTPS or WeChat CDN URLs.

## Recommended Flow

1. Read `references/workbench-html-spec.md` before generating editable HTML.
2. Generate or normalize content as Workbench HTML when the draft is intended for the visual editor.
3. Open the editor service and let the user visually adjust layout, images, and text.
4. Export or save the edited draft from the editor.
5. Compile/clean Workbench HTML into final WeChat HTML only at delivery.
6. Run the normal verification checklist, including image URL finalization.

## Component Semantics

Prefer these Workbench block types in editor-bound drafts:

| Type | Use |
|:---|:---|
| `title`, `subtitle` | Article title, section title, metadata labels. |
| `paragraph` | Body prose. |
| `image`, `gallery` | Single image or grouped images. |
| `card`, `quote` | Highlighted text/image content. |
| `divider`, `badge`, `decoration`, `spacer` | Visual rhythm and ornaments. |
| `row`, `column` | Side-by-side compositions. |
| `hero`, `poster` | Opening visual sections and layered compositions. |
| `svg`, `raw-html` | Explicit high-risk fallback blocks. |

## Fitting Canvas Layout To WeChat HTML

When interpreting canvas edits, convert spatial intent to WeChat-safe normal flow:

| Canvas Intent | WeChat-Safe Fit |
|:---|:---|
| Vertical stacking | Normal document-flow blocks ordered by `data-flow-order`. |
| Side-by-side objects | `row` with inline-block `column` children. |
| Boundary overlap | Normal flow plus negative `margin-top`. |
| Large background container | `section` or `card` with background color/image and internal padding. |
| Poster-like layer stack | `poster` with `data-layout="layer"`; compile to normal-flow approximation if possible. |
| Unsupported interactive/animated fragment | `svg` or `raw-html` with risk marker and publish-path verification. |

## Overlap Rules

Do not export `position: absolute` or `position: fixed` to final WeChat HTML.

For overlap effects:

1. Render the base element in document flow.
2. Render the overlapping element after it.
3. Pull the overlapping element with negative `margin-top`.
4. Add padding to the text/card area so readable content does not sit underneath the decoration.

Example:

```html
<section style="line-height: 0; box-sizing: border-box;">
  <img src="IMAGE_URL" style="width: 100%; max-width: 100%; display: block; margin: 0 auto;">
</section>
<section style="margin: -40px 20px 0; padding: 18px; background-color: rgb(255,255,255); box-sizing: border-box;">
  <p style="margin: 0; font-size: 18px; line-height: 1.6; text-align: center;"><strong>Title</strong></p>
</section>
```

## External Assets

External icon/image search results may be inserted into drafts only as HTTPS images and must be marked as external-risk material in Workbench HTML.

Before final publication:

1. Replace local `/local-images/...` paths.
2. Verify all final `src` URLs.
3. Upload content images to WeChat CDN for Auto-Publish workflows.
4. Remove editor-only data, handles, selection boxes, grids, and terminal UI artifacts.

## Stopping The Service

Keep the service running only while visual editing is active. Stop it when the task is complete, when the user asks to stop, or before ending the session if the AI started it.
