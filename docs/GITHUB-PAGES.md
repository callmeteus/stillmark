# GitHub Pages for Stillmark

The landing site is **Astro static HTML** in `packages/landing-page/dist`. It must **not** be built with Jekyll from the `master` branch (Jekyll will try to parse `.astro` files and fail).

## Correct setup (required once)

1. Open [Settings → Pages](https://github.com/callmeteus/stillmark/settings/pages).
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
3. **Branch:** `gh-pages` / **Folder:** `/ (root)`  
   **Not** `master`. Publishing `master` triggers the automatic **pages build and deployment** Jekyll job on the whole monorepo.
4. Push to `master` (or run the **Deploy GitHub Pages** workflow). It builds Astro and pushes **only** `dist/` to the `gh-pages` branch via [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

Site URL: `https://callmeteus.github.io/stillmark/` (Astro `base: /stillmark`).

## If you see Jekyll errors on `.astro` files

| Symptom | Cause | Fix |
|---------|--------|-----|
| Workflow **pages build and deployment** → **Build with Jekyll** | Pages source is `master` (or `/docs` on master) | Switch source to **`gh-pages`** branch |
| YAML errors in `packages/landing-page/src/**` | Jekyll is scanning source, not the Astro build | Run **Deploy GitHub Pages** and use `gh-pages` as above |

## CI checks

- `npm run test -w @stillmark/landing-page` builds Astro and validates `dist/`.
- `npm run test:workflows` asserts the Pages workflow publishes `packages/landing-page/dist` to `gh-pages` with Jekyll disabled.
