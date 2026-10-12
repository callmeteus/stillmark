# GitHub Pages for Stillmark

## How deployment works

The site is **not** committed to `master`. CI builds Astro and publishes **`packages/landing-page/dist`** as a [GitHub Pages workflow artifact](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Workflow: [`.github/workflows/pages.yml`](workflows/pages.yml)

1. `npm run build -w @stillmark/landing-page`
2. `npm run verify -w @stillmark/landing-page` (includes `.nojekyll` in `dist`)
3. `actions/upload-pages-artifact` + `actions/deploy-pages`

Site URL: `https://callmeteus.github.io/stillmark/` (`base: /stillmark` in `astro.config.mjs`).

## One-time repository setting

In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Disable or ignore the legacy **pages build and deployment** job that reads the branch root. It is not used when the source is **GitHub Actions**.

## Remove old static files from git (if present)

If `master` still contains `index.html`, `_astro/`, `pt-br/`, etc. at the repo root, delete them from the tree after switching Pages to Actions:

```bash
git rm -r --cached index.html install.md .nojekyll _astro pt-br sitemap-index.xml sitemap-0.xml 2>/dev/null || true
git commit -m "chore: remove arquivos estáticos do Pages da branch master"
```

Root entries are listed in `.gitignore` so they are not re-committed.

## Local checks

```bash
npm run build -w @stillmark/landing-page
npm run verify -w @stillmark/landing-page
npm run test:workflows
```
