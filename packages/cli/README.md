# stillmark

One-line CLI for safe roadmap and task-plan updates from AI agents.

## Overview

Stillmark owns parsing, validating, and patching `ROADMAP.md`, `.stillmark/plans/TASK_PLAN.md`, and `COVERAGE.md` (test-case checklist). It does **not** replace your agent; it gives the agent a deterministic write path with structured JSON results.

## Install

From the latest [GitHub Release](https://github.com/callmeteus/stillmark/releases/latest):

```bash
npm install -g https://github.com/callmeteus/stillmark/releases/latest/download/stillmark.tgz
```

For local development in this monorepo, build `packages/cli` and use `npx stillmark` from that package.

## Run

```bash
stillmark init
stillmark roadmap add "PostgreSQL support" --json
stillmark roadmap done "PostgreSQL support" --json
stillmark roadmap add "Login by QR code" --done --commit=a1b2c3d --json
stillmark config set --roadmap-dates=false --json
stillmark plan init "Billing export" --in-scope "CSV\nPDF" --out-of-scope "Excel" --json
stillmark plan scope --in-scope "Refunds" --json
stillmark plan add "Integration tests" --priority=high --json --accept-scope-change
stillmark plan priority T-001 critical --json
stillmark classify "Add observability as a future milestone" --json
stillmark move "Dashboard" to plan --json --confirm
stillmark install --agent cursor
stillmark coverage validate --json
stillmark coverage update --json
```

## Environment

| File | Purpose |
|------|---------|
| `ROADMAP.md` | Public roadmap (git) |
| `.stillmark/plans/TASK_PLAN.md` | Private execution plan (local) |
| `.stillmark/plans/STATE.json` | Long-running recovery state (local) |
| `COVERAGE.md` | Checkbox test coverage checklist (public in git) |
| `stillmark.config.json` | Optional git integration; commit style learned from `git log` unless `git.commitMessage` is set; `detail` block picks compact or extended entries globally or per module (`stillmark config set --detail=compact\|extended\|inherit [--module=coverage\|roadmap\|plan]`); `update` block (`auto`, `intervalHours`, default on every 24h) controls how often `stillmark update` checks npm; `roadmap.dates` (default on) writes `added:` / `done:` dates on roadmap items, with `--date` or `--commit=<sha>` to set them from git (`stillmark config set --roadmap-dates=true\|false`) |
| `stillmark install --agent <agent> --global` | Installs the skill in the home directory (`~/.cursor`, `~/.claude`, `~/.codex/prompts`) so every project can use it; auto-update refreshes it too (`~/.stillmark/UPDATE.json`) |
| `stillmark install --agent <agent> [--global] --link` | Dev mode: links the repository `templates/` (junction or symlink) instead of copying, so template edits apply right away. Install and auto-update never write through these links. Pair with `npm link` in `packages/cli` so the global `stillmark` runs the latest `npm run build` |
| `.stillmark/plans/UPDATE.json` | Local update cache: last check, latest known version, version that wrote the agent files. `stillmark update [--force]` checks, `stillmark update apply` refreshes installed agent files |

See [../../ARCHITECTURE.md](../../ARCHITECTURE.md) for design details.
