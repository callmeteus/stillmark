---
name: stillmark
description: >-
  Single Stillmark entry: every CLI command and COVERAGE.md workflow through
  /stillmark, plus embedded design. Do not use a separate /coverage slash command.
---

# Stillmark

**Only entry point:** `/stillmark`. Follow shared Stillmark instructions. Run `stillmark … --json` from the project root.

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

Auto-update: start every `/stillmark` with `stillmark update --json` (hits npm at most once per `update.intervalHours`, default 24h). When `updateAvailable` is true, run `recommended`, tell the user in one line, re-read this skill if it changed, then continue. Ignore `error`. Never run `npm install` yourself. Controls: `config set --auto-update=false`, `config set --update-interval=<hours>`, `update --force`.

First run: `stillmark config status --json` when `needsFirstRunPrompt`.

Detail level: `detail` in that payload says `compact` (item line only) or `extended` (indented details via `--details "<text>"`) per `coverage`, `roadmap`, `plan`. Defaults: coverage and roadmap compact, plan extended. "Deixa compacto/extenso" = `stillmark config set --detail=compact|extended [--module=coverage|roadmap|plan] --json`.

Git: never commit without user grant; `stillmark git commit-style` for preview.
