# Stillmark

Follow the **stillmark** skill. Text after `/stillmark` is the full instruction. **Do not use `/coverage`** - use `/stillmark coverage …` instead.

## CLI mirror

Any terminal command `stillmark <args>` works as `/stillmark <args>` with `--json` appended.

Verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `config`, `git`, `update`, `long-running`.

Start each run with `stillmark update --json`; when `updateAvailable` is true, run `recommended` first (see the skill).

## Coverage (embedded)

`/stillmark coverage` (help), `/stillmark coverage update`, `/stillmark coverage validate`, or `/stillmark coverage <free text>` / natural language about the test checklist. See `reference/coverage.md` in the stillmark skill.

## Design (embedded)

`design …`, browser selection on the **local dev preview**, or casual UI feedback. See `reference/craft-floor.md`.

## Report

**Always** give a clickable markdown link to every plan, roadmap, or coverage file you touch, show, or mention: paste the JSON `link` field verbatim (or build `[TASK_PLAN.md](<absolute path with forward slashes>)` from `location`). Never only a path in backticks.

CLI: JSON `summary`. Coverage: what changed in COVERAGE.md + validate result. Design: files touched and what you verified.
