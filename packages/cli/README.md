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
stillmark plan add "Integration tests" --json --accept-scope-change
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
| `stillmark.config.json` | Optional git integration; commit style learned from `git log` unless `git.commitMessage` is set |

See [../../ARCHITECTURE.md](../../ARCHITECTURE.md) for design details.
