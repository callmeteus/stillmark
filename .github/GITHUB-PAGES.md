# GitHub Pages for Stillmark

## Root cause of the Jekyll / `.astro` errors

The automatic workflow **pages build and deployment** runs **Jekyll** on whatever GitHub Pages publishes. Your logs showed:

`Source: /github/workspace/.`

That means **master root** is the site source. Jekyll then scans `packages/landing-page/src/**/*.astro` and dies on `---` front matter.

Changing Astro or adding tests does **not** stop that job. You either:

1. **Disable Jekyll** on the published root (this repo), or  
2. Change Pages to publish only a static folder (`/docs` or `gh-pages`).

This repo uses **(1) + CI**.

## How this repository deploys

1. **`.nojekyll`** at the **repository root** tells GitHub Pages **not to run Jekyll** on the published branch root.
2. [`.github/workflows/pages.yml`](workflows/pages.yml) builds Astro and commits `packages/landing-page/dist` outputs into **master root** (`index.html`, `_astro/`, `pt-br/`, …) via `git push` (not `peaceiris`, which forbids `master` → `master`).
3. Pages can stay **Deploy from a branch → `master` → `/ (root)`** — the setting that was failing before is OK **after** `.nojekyll` is on `master`.

Site URL: `https://callmeteus.github.io/stillmark/`

## After merging

1. Push to `master` (must include root `.nojekyll`).
2. Run **Deploy GitHub Pages** if needed (or wait for the push workflow).
3. **pages build and deployment** should no longer run Jekyll (or should pass without parsing `.astro`).
4. Open `https://callmeteus.github.io/stillmark/`.

## Local checks

```bash
npm run build -w @stillmark/landing-page
npm run verify -w @stillmark/landing-page
npm run test:workflows
```
