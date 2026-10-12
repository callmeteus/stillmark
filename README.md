<div align="center">

# Stillmark

> Interactive roadmap and execution plan management for AI agents

**A deterministic CLI plus agent adapters so users never hand-edit planning markdown for routine changes.**

[CLI package](packages/cli/README.md) • [Architecture](ARCHITECTURE.md) • [Site](https://callmeteus.github.io/stillmark/)

</div>

---

## What Is Stillmark?

Stillmark separates **public strategic planning** (`ROADMAP.md`) from **private execution planning** (`.stillmark/plans/TASK_PLAN.md`, local) and maintains a **test coverage companion** (`COVERAGE.md`). Agents interpret natural language; the CLI performs safe, incremental file updates with scope, privacy, validation, and optional git guards.

## Repository layout

| Path | Role |
|------|------|
| `packages/cli` | Published `stillmark` npm package (engine + bin) |
| `packages/landing-page` | Astro marketing site (`en` + `pt-br`) |
| `templates/` | Cursor, Claude Code, and Codex install templates (stillmark skill includes `reference/` design playbooks) |

## Get started

```bash
cd packages/cli
npm install
npm run build
npx stillmark init
```

Install agent templates from a project root:

```bash
stillmark install --agent cursor
```

## Development

```bash
npm install
npm run ci
```

Local landing preview (served under `/stillmark` like GitHub Pages):

```bash
npm run build -w @stillmark/landing-page
npm run preview -w @stillmark/landing-page
```

## Deploy and releases

| Surface | How |
|---------|-----|
| **GitHub Pages** | Push to `master` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml). In the repo, set **Settings → Pages → Build and deployment → GitHub Actions** once. |
| **CLI download** | Push a tag `vX.Y.Z` matching `packages/cli/package.json` runs [`.github/workflows/release.yml`](.github/workflows/release.yml) and uploads `stillmark.tgz` on the GitHub Release. The landing install guide uses `releases/latest/download/stillmark.tgz`. |

## License

MIT
