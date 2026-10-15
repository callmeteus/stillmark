# Stillmark

Follow the **stillmark** skill. Text after `/stillmark` is the full instruction. **Do not use `/coverage`** - use `/stillmark coverage …` instead.

**Reply in the user's language.** Stillmark is in English, but every message to the user (first sentence, progress updates, questions, final report) is in the language of the text after `/stillmark`.

This command running means Stillmark is already installed. Setting up the repo is only `stillmark init --json`; never run `stillmark install` or copy skill files into the repo unless the user explicitly asks to install.

## CLI mirror

Any terminal command `stillmark <args>` works as `/stillmark <args>` with `--json` appended.

Verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `design`, `changelog`, `config`, `git`, `notify`, `caveman`, `readme`, `update`, `long-running`.

`/stillmark notify ...` sets up Telegram, Discord, Slack, webhook, or desktop notifications when the agent finishes (see the skill); secrets stay in the user's home, never in the repo.

`/stillmark caveman on|off|lite|full|ultra` switches terse replies for this conversation only (add `--save` to keep it); follow the returned `rules` from now on, or drop them after `off`.

`/stillmark readme` creates or restructures a README from the real project: `readme plan`, ask which template when `needsClarification`, write it, then `readme check` until clean (see the skill).

`/stillmark git push` pushes local commits. When `needsCommit` is true, ask with `AskQuestion` and show `proposedMessage`; after the user agrees, `stillmark git push --with-commit` (optional summary or `--message`).

Start each run with `stillmark update --json` (npm, then GitHub releases); when `updateAvailable` is true, run `recommended` first (see the skill).

## Coverage (embedded)

`/stillmark coverage` (help), `/stillmark coverage update`, `/stillmark coverage validate`, or `/stillmark coverage <free text>` / natural language about the test checklist. See `reference/coverage.md` in the stillmark skill.

## Design (embedded)

`/stillmark design …` (not a separate `/design` slash). Run `stillmark design … --json` first; load JSON `playbooks`. `design create` = new UI; `design review|critique|audit` = diagnosis only; other text = mixed. Browser selection on the **local dev preview** uses mixed mode. See `reference/design-pipeline.md`.

## Report

**Always** give a clickable markdown link to every plan, roadmap, or coverage file you touch, show, or mention: paste the JSON `link` field verbatim (or build `[TASK_PLAN.md](<absolute path with forward slashes>)` from `location`). Never only a path in backticks.

CLI: JSON `summary`. Coverage: what changed in COVERAGE.md + validate result. Design: files touched and what you verified.
