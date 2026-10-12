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

First run: `stillmark config status --json` when `needsFirstRunPrompt`.

Git: never commit without user grant; `stillmark git commit-style` for preview.
