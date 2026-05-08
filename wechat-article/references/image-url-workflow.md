# Image URL Workflow

Use this workflow at the beginning and end of a WeChat article layout project.

## Principle

The WeChat editor needs image URLs that its backend can fetch. Public HTTPS image URLs can usually stay unchanged. Local image paths must be uploaded or replaced before final paste.

**Critical distinction by workflow:**

| Workflow | Image Host | Behavior |
|:---|:---|:---|
| **Manual Paste** (copy HTML into editor) | Third-party host (360, etc.) | ✅ Works — browser loads directly |
| **Auto-Publish** (API `/cgi-bin/draft/add`) | Third-party host (360, etc.) | ⚠️ Risky — WeChat server pre-fetch may fail |
| **Auto-Publish** (API) | WeChat CDN (`mmbiz.qpic.cn`) | ✅ Reliable — native to WeChat |
| **SVG `<image>`** (any workflow) | WeChat CDN only | ✅ Required — third-party blocked |

## First Pass: Preflight

Before the first layout draft:

1. Scan the source article and planned HTML for image references.
2. Ask the user which workflow they will use:
   - **Manual Paste only** → third-party image host is sufficient.
   - **Auto-Publish** → prefer WeChat CDN; third-party may fail during server pre-fetch.
3. Classify every image:
   - Public HTTPS URL: keep unchanged.
   - Local file path: upload to the appropriate host (third-party for Manual Paste; WeChat CDN for Auto-Publish/SVG).
   - Missing path or inaccessible file: ask the user to provide the file.
4. Verify uploaded URLs with `curl -I`.
5. Use verified public URLs in the draft so screenshots and layout previews are realistic.

Do not upload sensitive/private images to anonymous image hosts without explicit user approval.

## Final Pass: Approved Layout

After the user approves the layout:

1. Rescan the final HTML.
2. Upload any new local images introduced during revisions.
3. Leave existing verified public HTTPS URLs unchanged.
4. Replace all local `src` or `data-src` values with verified public HTTPS URLs.
5. Verify every final URL returns HTTP `200` and `Content-Type: image/*`.
6. Commit the final HTML.

## Default Provider

The default zero-config provider is the existing 360 image host workflow via `wzapi`, unless the user has configured another provider.

Use temporary compressed copies for large images. Do not overwrite the user's original images.

## Workflow-Specific Image Source Strategy

### Manual Paste Workflow

When the user will **manually copy-paste** HTML into the WeChat editor:

- **Third-party image hosts (360, etc.) are fully usable.** The browser loads images directly; WeChat server pre-fetch is not involved.
- Upload local images to the third-party host as usual.
- HTML `<img>` tags can use any public HTTPS URL.
- **Exception**: SVG `<image>` still requires WeChat CDN (see below).

### Auto-Publish Workflow

When the user provides **AppID/AppSecret** and wants API-based draft creation:

- **Prefer WeChat CDN for all images.** WeChat server pre-fetches images during draft creation; third-party hosts may be blocked by anti-crawl or fail silently.
- Upload content images via `/cgi-bin/media/uploadimg` to get `mmbiz.qpic.cn` URLs.
- Replace all `<img src>` with WeChat CDN URLs before API call.
- WeChat CDN is **required** for SVG `<image>` tags.

## SVG Image Special Rule

If the article uses **SVG `<image>` tags**, third-party image hosts (including 360) are **not usable** in any workflow. SVG `<image>` only accepts WeChat CDN URLs (`mmbiz.qpic.cn`).

In this case:
1. Upload images to the third-party host for HTML `<img>` preview/draft (Manual Paste only).
2. Before finalizing, additionally upload all SVG-bound images to WeChat CDN via the API (`POST /cgi-bin/media/uploadimg`).
3. Replace the third-party URLs inside `<image href="...">` with the returned WeChat CDN URLs.
4. HTML `<img>` tags can keep third-party URLs for Manual Paste; Auto-Publish should use WeChat CDN for everything.

## Failure Handling

If upload or verification fails:

- retry once;
- record the failed image path and reason;
- ask the user whether to remove that image block, replace the image, or upload it manually;
- do not return final paste-ready HTML with local paths.

## Final HTML Rule

The final WeChat paste version should contain only:

- public HTTPS image URLs;
- no `file://` URLs;
- no absolute local paths;
- no relative local paths.
