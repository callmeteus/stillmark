# Stillmark (Codex)

Run `stillmark` from the project root with `--json` for all planning operations. ROADMAP.md is public; `.stillmark/plans/TASK_PLAN.md` is private and local. Classify ambiguous adds with `stillmark classify`. Do not run git yourself; use Stillmark config for optional roadmap commits.

**Auto-update:** start each `/stillmark` with `stillmark update --json` (npm is checked at most once per `update.intervalHours`, default 24h). When `updateAvailable` is true, run `recommended`, tell the user in one line, then continue. Ignore `error`.

**Agent entry:** `/stillmark <args>` mirrors `stillmark <args> --json`. Do not use `/coverage`; use `/stillmark coverage …` for COVERAGE.md (help, update workflow, or free text). Playbook: stillmark skill `reference/coverage.md`.

For UI work, use `/stillmark design` or `/stillmark` with browser selection and free-text feedback; follow the stillmark skill `reference/` playbooks.
