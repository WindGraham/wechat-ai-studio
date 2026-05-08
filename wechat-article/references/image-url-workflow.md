# Image URL Workflow

Use this workflow at the beginning and end of a WeChat article layout project.

## Principle

The WeChat editor needs image URLs that its backend can fetch. Public HTTPS image URLs can usually stay unchanged. Local image paths must be uploaded or replaced before final paste.

## First Pass: Preflight

Before the first layout draft:

1. Scan the source article and planned HTML for image references.
2. Classify every image:
   - Public HTTPS URL: keep unchanged.
   - Local file path: upload a temporary or working copy to the configured image host.
   - Missing path or inaccessible file: ask the user to provide the file.
3. Verify uploaded URLs with `curl -I`.
4. Use verified public URLs in the draft so screenshots and layout previews are realistic.

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

## SVG Image Special Rule

If the article uses **SVG `<image>` tags**, third-party image hosts (including 360) are **not usable**. SVG `<image>` only accepts WeChat CDN URLs (`mmbiz.qpic.cn`).

In this case:
1. Upload images to the third-party host as usual for HTML `<img>` preview/draft.
2. Before finalizing, additionally upload all SVG-bound images to WeChat CDN via the API (`POST /cgi-bin/media/uploadimg`).
3. Replace the third-party URLs inside `<image href="...">` with the returned WeChat CDN URLs.
4. HTML `<img>` tags can keep the third-party URLs; only SVG `<image>` needs WeChat CDN.

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
