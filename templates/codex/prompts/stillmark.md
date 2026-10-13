# Stillmark (Codex)

Run `stillmark` from the project root with `--json` for all planning operations. ROADMAP.md is public; `.stillmark/plans/TASK_PLAN.md` is private and local. Classify ambiguous adds with `stillmark classify`. Record finished work with `stillmark roadmap done "<item>"` or `stillmark roadmap add "<description>" --done`; add `--commit=<sha>` when backfilling so the `done:` date comes from git (dates are on by default; `config set --roadmap-dates=false` turns them off). Do not run git yourself; use Stillmark config for optional roadmap commits.

**Clickable links (mandatory):** every reply that creates, changes, shows, or mentions a plan, findings, progress, roadmap, or coverage file must include a clickable markdown link to it. Paste the JSON `link` field verbatim, or build `[TASK_PLAN.md](<absolute path, forward slashes>)` from `location`. Never only a path in backticks.

**Auto-update:** start each `/stillmark` with `stillmark update --json` (npm is checked at most once per `update.intervalHours`, default 24h). When `updateAvailable` is true, run `recommended`, tell the user in one line, then continue. Ignore `error`.

**Global install:** if this repo has no `stillmark.config.json` / `ROADMAP.md`, ask once before running `stillmark init --json`.

**Agent entry:** `/stillmark <args>` mirrors `stillmark <args> --json`. Do not use `/coverage`; use `/stillmark coverage …` for COVERAGE.md (help, update workflow, or free text). Playbook: stillmark skill `reference/coverage.md`.

For UI work, use `/stillmark design` or `/stillmark` with browser selection and free-text feedback; follow the stillmark skill `reference/` playbooks.
