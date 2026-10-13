---
name: stillmark
description: >-
  Single Stillmark entry: every CLI command and COVERAGE.md workflow through
  /stillmark, plus embedded design. Do not use a separate /coverage slash command.
---

# Stillmark

**Only entry point:** `/stillmark`. Follow shared Stillmark instructions. Run `stillmark … --json` from the project root.

**Clickable links are mandatory, every time.** Any reply that creates, changes, shows, or mentions a plan, findings, progress, roadmap, or coverage file must include a clickable markdown link to it: paste the JSON `link` field verbatim, or build `[TASK_PLAN.md](<absolute path, forward slashes>)` from `location`. Never only a path in backticks.

## CLI mirror

`/stillmark <args>` = `stillmark <args> --json`. Strip a duplicate leading `stillmark `. Verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `config`, `git`, `long-running`.

## Modes

| Pattern | Mode |
|---------|------|
| CLI verbs above | Run `stillmark <text> --json` |
| `coverage …` or COVERAGE/test checklist intent | `reference/coverage.md` (help, update, free text, or `stillmark coverage …`) |
| `design …`, browser selection, UI critique | Design; `reference/craft-floor.md` |
| Else | `stillmark classify "<text>" --json` |

Never use `/coverage`. Playbooks under `reference/` (`.claude/skills/stillmark/reference/`).

`stillmark <command> --help` prints usage only; unknown options are refused. Criteria: `plan add "<title>" --acceptance "<a>\n<b>" --verification "<check>"` instead of editing `(define)` by hand. Scope per plan (never reuse the previous one): `plan init "<objective>" --in-scope "<a>\n<b>" --out-of-scope "<c>"` or `plan scope ...` (appends; `--replace` overwrites). Priority: `--priority=critical|high|medium|low` on `plan add` / `roadmap add` / `add`, or `plan priority <task> <level>` later; default is `medium`.

Auto-update: start every `/stillmark` with `stillmark update --json` (hits npm at most once per `update.intervalHours`, default 24h). When `updateAvailable` is true, run `recommended`, tell the user in one line, re-read this skill if it changed, then continue. Ignore `error`. Never run `npm install` yourself. Controls: `config set --auto-update=false`, `config set --update-interval=<hours>`, `update --force`.

Global install (`--global`): if the repo has no `stillmark.config.json` / `ROADMAP.md`, ask once before running `stillmark init --json`.

First run: `stillmark config status --json` when `needsFirstRunPrompt`.

Detail level: `detail` in that payload says `compact` (item line only) or `extended` (indented details via `--details "<text>"`) per `coverage`, `roadmap`, `plan`. Defaults: coverage and roadmap compact, plan extended. "Deixa compacto/extenso" = `stillmark config set --detail=compact|extended [--module=coverage|roadmap|plan] --json`.

Git: never commit without user grant; `stillmark git commit-style` for preview.
