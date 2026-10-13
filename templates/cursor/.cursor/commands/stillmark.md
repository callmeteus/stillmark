# Stillmark

Follow the **stillmark** skill. Text after `/stillmark` is the full instruction. **Do not use `/coverage`** - use `/stillmark coverage …` instead.

**Reply in the user's language.** Stillmark is in English, but every message to the user (first sentence, progress updates, questions, final report) is in the language of the text after `/stillmark`.

This command running means Stillmark is already installed. Setting up the repo is only `stillmark init --json`; never run `stillmark install` or copy skill files into the repo unless the user explicitly asks to install.

## CLI mirror

Any terminal command `stillmark <args>` works as `/stillmark <args>` with `--json` appended.

Verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `config`, `git`, `caveman`, `update`, `long-running`.

`/stillmark caveman on|off|lite|full|ultra` switches terse replies for this conversation only (add `--save` to keep it); follow the returned `rules` from now on, or drop them after `off`.

Start each run with `stillmark update --json`; when `updateAvailable` is true, run `recommended` first (see the skill).

## Coverage (embedded)

`/stillmark coverage` (help), `/stillmark coverage update`, `/stillmark coverage validate`, or `/stillmark coverage <free text>` / natural language about the test checklist. See `reference/coverage.md` in the stillmark skill.

## Design (embedded)

`design …`, browser selection on the **local dev preview**, or casual UI feedback. See `reference/craft-floor.md`.

## Report

**Always** give a clickable markdown link to every plan, roadmap, or coverage file you touch, show, or mention: paste the JSON `link` field verbatim (or build `[TASK_PLAN.md](<absolute path with forward slashes>)` from `location`). Never only a path in backticks.

CLI: JSON `summary`. Coverage: what changed in COVERAGE.md + validate result. Design: files touched and what you verified.
