# Stillmark

Follow the **stillmark** skill. Text after `/stillmark` is the full instruction. **Do not use `/coverage`** - use `/stillmark coverage …` instead.

## CLI mirror

Any terminal command `stillmark <args>` works as `/stillmark <args>` with `--json` appended.

Verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `config`, `git`, `long-running`.

## Coverage (embedded)

`/stillmark coverage` (help), `/stillmark coverage update`, `/stillmark coverage validate`, or `/stillmark coverage <free text>` / natural language about the test checklist. See `reference/coverage.md` in the stillmark skill.

## Design (embedded)

`design …`, browser selection on the **local dev preview**, or casual UI feedback. See `reference/craft-floor.md`.

## Report

CLI: JSON `summary`. Coverage: what changed in COVERAGE.md + validate result. Design: files touched and what you verified.
