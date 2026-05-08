# WeChat Layout Interaction Workflow

Use this workflow when starting a new article layout project or iterating with the user.

## Goal

The user provides content and images. The agent collaborates with the user to choose style, generate one working HTML file, revise it through local git commits, and produce a final paste-ready WeChat HTML version.

## First-Round Questions

**MANDATORY: Ask one compact question before the first layout. Do not generate any HTML until the user has responded.**

```text
Before I typeset this WeChat article, I need a few layout choices:
1. Color direction: muted / warm / cool / bright / dark / use reference screenshot / provide theme color
2. Refinement level: clean basic / polished / rich visual / highly decorative
3. Image style: simple full-width / framed photos / staggered groups / text-image cards / follow reference screenshot
4. Opening style: text-first / compact image + title / large visual opening / follow reference screenshot
5. Body habit: first-line indent / no indent / left aligned / justified
```

Only after the user has answered (or explicitly skipped by choosing from the options) may the agent proceed.

**Critical ordering rule:**
- If the user's **first** message already includes "you decide", "随你", or "based on content", the agent MUST still present the questions. Pre-emptive delegation does not bypass the asking requirement.
- If the user **still** insists on "you decide" / "随你" / "based on content" **after seeing the questions**, only then may the agent choose reasonable defaults and briefly state them before generating HTML.
- The agent must NEVER assume "default to auto-decide" when the user simply has not been asked yet.

## Second-Round Question: Layout Guidance

**MANDATORY: After style preferences are confirmed, ask whether the user wants layout guidance.**

```text
Do you want to arrange the layout yourself? You can:
1. Open the visual drag-and-drop composer to place components
2. Upload a reference screenshot / template for me to match
3. Let me decide the layout based on the content
```

- Option 1 (composer) → launch `wechat-article/tools/layout-composer.html`; see `references/visual-layout-workflow.md`.
- Option 2 (reference screenshot) → follow the Reference Screenshot Workflow in SKILL.md.
- Option 3 (AI decides) or no preference → proceed with AI-chosen layout.

## Opening Image Rule

Do not default to a long or dominant opening image. Use a large visual opening only when:

- the user asks for it;
- the reference screenshot clearly uses it;
- the article is image-led and has a strong cover image;
- the visual opening improves the reading experience.

Otherwise use a text-first title, compact image title, date/location label, or short visual header.

## Local Git Versioning

Use local git for article draft history. No remote is required.

Recommended behavior:

1. Work in the article's output directory.
2. Keep one working HTML file, usually `article.html`.
3. If the directory is not inside a git repository, run `git init`.
4. Commit the first generated draft.
5. After each user-requested revision, edit the same HTML file and commit again.
6. Do not push unless the user explicitly asks.

Commit messages should describe layout changes:

```text
Initial WeChat layout draft
Adjust section title style
Refine image grouping
Tone down decorative blocks
Finalize public image URLs
```

If the article directory is already inside another project repository, use that repository. Do not create a nested git repository unless the user approves.

## Iteration Loop

For each user revision:

1. Restate the specific requested changes in one short sentence.
2. Update only the requested parts unless a compatibility fix is necessary.
3. Keep existing content facts unchanged.
4. Run a quick screenshot or browser check when visual layout changed.
5. Commit the updated HTML.
6. Report the new commit hash and the visible changes.

## Finalization

When the user approves:

1. Run the final image URL pass from `image-url-workflow.md`.
2. Ensure the final HTML still contains only public HTTPS image URLs.
3. Run `generation-checklist.md`.
4. Commit the final version.
5. Return the final HTML path and mention that it is ready for WeChat editor paste.
