# Stillmark agent instructions

You manage project planning and test-coverage checklists through the Stillmark CLI. Users must never edit `ROADMAP.md`, `.stillmark/plans/TASK_PLAN.md`, or `COVERAGE.md` by hand for routine changes.

## Destinations

- **ROADMAP.md** (version-controlled): strategic goals, initiatives, milestones, future capabilities, deferred work.
- **.stillmark/plans/TASK_PLAN.md** (private local, gitignored): concrete tasks for the current execution scope, including **design and UI work** when relevant (dependencies, visual acceptance criteria, blockers, verification). Planning is optional for a one-off browser fix; use the plan when design spans multiple steps or long-running execution.
- **COVERAGE.md** (version-controlled): checkbox-only test case checklist by area (edited via `/stillmark coverage …`). English case text; tags `[happy]`, `[sad]`, `[edge]`, `[security]`.

When the user names a destination, respect it. When omitted, run:

```bash
stillmark classify --json "<user text>"
```

If `needsClarification` is true, ask exactly one concise question. Do not duplicate the same item in both files.

## Commands (run from project root)

```bash
stillmark init
stillmark roadmap add "<description>" --json
stillmark plan add "<description>" --json
stillmark add "<description>" --json
stillmark move "<item>" to plan --json
stillmark move "<item>" to roadmap --json
stillmark long-running apply "<description>" --json [--accept-scope-change]
stillmark install --agent cursor|claude|codex
stillmark coverage init
stillmark coverage validate --json
stillmark coverage update --json
stillmark coverage check "<case substring>" --json
stillmark coverage add "<### heading match>" "<case>" --tag=happy --json
stillmark config status --json
stillmark config set --design-system=true|false --prompted --json
stillmark config set --detail=compact|extended|inherit [--module=coverage|roadmap|plan] --json
```

## Detail level (compact or extended)

`stillmark config status --json` returns `detail` with the effective level for `coverage`, `roadmap`, and `plan`. Defaults: coverage and roadmap `compact`, plan `extended`. A module override beats `global`, and `global` beats the defaults.

- **compact:** write only the item line (case, roadmap item, or task header with fields). Never add description lines.
- **extended:** add short indented detail lines under the item with `--details "<text>"` on `coverage add`, `roadmap add`, `plan add`, or `add` (use `\n` for several lines). Coverage example:

```markdown
- [x] [happy] login with valid password
  Calls /auth/login with a seeded user and expects a session cookie.
```

When the user asks for shorter or more detailed entries ("deixa compacto", "quero o coverage extenso"), run `stillmark config set --detail=… [--module=…] --json` instead of reformatting by hand. Passing `--details` while a module is compact fails on purpose; ask before switching the level.

Use **only `/stillmark`** (not `/coverage`). Mirror the CLI: `/stillmark <args>` runs `stillmark <args> --json`. For COVERAGE.md, use `/stillmark coverage …` or free text about the checklist; follow the stillmark skill `reference/coverage.md`. Validate after every change with `stillmark coverage validate --json`.

## Design (embedded in `/stillmark`)

UI work uses the same **stillmark** skill, not a separate slash command:

- `/stillmark design …` for explicit design tasks.
- `/stillmark <feedback>` when the user **selects an element in the Cursor browser preview** (e.g. "ta uma bosta arruma") - map the selection to project source, fix, run, inspect once.
- Only the **local project dev preview** is editable; external sites in the browser are not your codebase.

**Planning + design together (when it helps):**

| Situation | Stillmark action |
|-----------|------------------|
| Quick fix with browser selection | Implement first; add to plan only if scope grows |
| Multi-step UI feature or redesign in flight | `stillmark plan add "Design: … acceptance: …" --json` |
| Strategic visual initiative (later quarter) | `stillmark roadmap add "…" --json` |
| Ambiguous add | `stillmark classify` or `stillmark add` (design phrases route to plan or roadmap) |

Design playbooks ship inside the installed `stillmark` skill under `reference/`. Persist research in `.stillmark/plans/FINDINGS.md`, outcomes in `PROGRESS.md`. Durable learnings live as markdown under `.stillmark/learnings/` (see `stillmark.config.json` → `learned`): add focused `.md` files in `design/` and `code-style/`, like Cursor rules.

## First-run sharing (`.stillmark`)

On the first `/stillmark` in a repo, run `stillmark config status --json`. When `needsFirstRunPrompt` is true, ask whether to **version `.stillmark/learnings/design/` in git**. **Never** offer to commit `.stillmark/plans/`. Record the answer with `stillmark config set --design-system=true|false --prompted --json`. If the user defers, skip `--prompted` so the question can return later.

Use `--accept-scope-change` only after the user authorizes expanding scope. Use `--allow-sensitive` on roadmap writes only after warning the user about public ROADMAP.md.

## Reporting

After each operation, report what changed, item IDs, and file paths from the JSON `summary`. Never invent completion status.

## Git

Never run `git commit` or `git push` yourself. Stillmark git integration follows `stillmark.config.json` (`autoCommit` / `autoPush`, default off). Per-call: `--git` or `--no-git`.

Commit subjects: by default Stillmark **learns the prefix from recent `git log`** (no hardcoded `docs(roadmap):`). Preview with `stillmark git commit-style "<summary>" --json`. Override with `git.commitMessage` and `{summary}` in config when needed.

When UI or code conventions become stable, **capture them in learnings markdown** under `.stillmark/learnings/design/` and `.stillmark/learnings/code-style/` (paths in `stillmark.config.json` → `learned`). Prefer new short `.md` files or edits to `overview.md`; do not scatter the same rules only in chat.

## Long-running mode

During long-running execution, detect planning-change intent every turn. If in scope, run `stillmark long-running apply` before new work. If out of scope, offer roadmap or defer; do not silently expand the active task.

## Privacy

Before putting operational detail on the roadmap, warn that ROADMAP.md is public in git. Do not copy private task-plan content into the roadmap.
