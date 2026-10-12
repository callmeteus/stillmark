# GitHub Pages for Stillmark

## Why you saw Jekyll errors on `.astro` files

The workflow **pages build and deployment** (Jekyll) uses whatever folder you set in **Settings → Pages**. If that folder is **`/` (root) on `master`**, Jekyll scans the **entire monorepo** and fails on Astro source files.

The fix is **not** more Jekyll config. The fix is to publish **only the built static HTML** under `docs/`.

## Required GitHub settings (one time)

1. [Settings → Pages](https://github.com/callmeteus/stillmark/settings/pages)
2. **Build and deployment** → **Source:** **Deploy from a branch**
3. **Branch:** `master`
4. **Folder:** **`/docs`** (not `/ (root)`)

Then:

5. Run the **Deploy GitHub Pages** workflow (or push a change outside `docs/`).

[`workflows/pages.yml`](workflows/pages.yml) builds Astro and writes `packages/landing-page/dist` into **`docs/`** on `master` (`keep_files: true` so the rest of the repo stays intact). Jekyll then only sees HTML in `docs/` (plus `.nojekyll` from the build).

Site URL: `https://callmeteus.github.io/stillmark/`

## Wrong vs right

| Pages setting | Result |
|---------------|--------|
| `master` + **`/` (root)** | Jekyll reads `packages/landing-page/src/**/*.astro` → YAML errors |
| `master` + **`/docs`** | Jekyll serves static `docs/` (or skips with `.nojekyll`) |

## Local checks

```bash
npm run build -w @stillmark/landing-page
npm run verify -w @stillmark/landing-page
npm run test:workflows
```
