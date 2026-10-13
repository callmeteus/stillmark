# Stillmark agent instructions

You manage project planning and test-coverage checklists through the Stillmark CLI. Users must never edit `ROADMAP.md`, `.stillmark/plans/TASK_PLAN.md`, or `COVERAGE.md` by hand for routine changes.

If you are reading these instructions, Stillmark is already installed for your agent. Setting up a repo is only `stillmark init --json`; never run `stillmark install` or copy skill files into the repo unless the user explicitly asks to install.

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
stillmark roadmap add "<description>" [--priority=critical|high|medium|low] --json
stillmark roadmap priority "<item>" critical|high|medium|low --json
stillmark roadmap done "<item>" [--date=YYYY-MM-DD|--commit=<sha>] --json
stillmark roadmap add "<finished work>" --done [--commit=<sha>] [--priority=high] --json
stillmark config set --roadmap-dates=true|false --json
stillmark config set --strip-attribution=true|false --json
stillmark git hook [status|install|remove] --json
stillmark git setup-files --json
stillmark git setup-commit [--message "<msg>"] --json
stillmark plan init "<objective>" [--in-scope "<a>\n<b>"] [--out-of-scope "<c>"] --json
stillmark plan scope [--objective "<text>"] [--in-scope "<a>\n<b>"] [--out-of-scope "<c>"] [--replace] --json
stillmark plan add "<description>" [--priority=critical|high|medium|low] [--acceptance "<criterion>\n<criterion>"] [--verification "<check>"] --json
stillmark plan priority <task> critical|high|medium|low --json
stillmark add "<description>" [--priority=critical|high|medium|low] --json
stillmark move "<item>" to plan --json
stillmark move "<item>" to roadmap --json
stillmark long-running apply "<description>" --json [--accept-scope-change]
stillmark install --agent cursor|claude|codex [--global]   # only when the user explicitly asks to install
stillmark coverage init
stillmark coverage validate --json
stillmark coverage update --json
stillmark coverage check "<case substring>" --json
stillmark coverage add "<### heading match>" "<case>" --tag=happy --json
stillmark config status --json
stillmark config set --design-system=true|false --prompted --json
stillmark config set --detail=compact|extended|inherit [--module=coverage|roadmap|plan] --json
stillmark config set --auto-update=true|false [--update-interval=<hours>] --json
stillmark update [--force] --json
stillmark update apply --json
```

Run `stillmark <command> --help` to see the options; unknown options are refused, never written as text. Pass acceptance criteria and verification through `--acceptance` / `--verification` (split lines with `\n`) instead of editing `(define)` by hand. A fresh plan with `(Not set)` / `(define)` scope does not block `plan add`.

Each new plan gets its own scope: set objective, in scope, and out of scope with `plan init ... --in-scope/--out-of-scope` or `plan scope` (appends; `--replace` overwrites; no flags shows the current scope). Never reuse the scope of a previous plan.

Finished work goes to `## Done` as a checked item with `status: done`: `roadmap done "<item>"` for an existing item, `roadmap add "<description>" --done` for work that was never on the roadmap. To backfill history ("add everything already done"), read `git log --date=short --format="%h %ad %s"` and the code, group commits into user-visible features, mark matching items with `roadmap done`, and add the rest with `--done` (one command per feature, no secrets or internal details). Pass `--commit=<sha>` of the commit that finished each feature (usually the last one in the group) so the delivery date is the real one; the CLI reads the date from git.

Roadmap dates are on by default (`roadmap.dates` in `stillmark.config.json`): new items get `added: YYYY-MM-DD`, finished items `done: YYYY-MM-DD`. `roadmap done` on an item already done with `--date` / `--commit` fixes its date. Turn dates off with `config set --roadmap-dates=false` when the user asks. Set priority with `--priority` when adding, or `plan priority` / `roadmap priority` afterwards; without the flag the task is `medium`.

## Auto-update

Start every `/stillmark` with `stillmark update --json`. It contacts the npm registry at most once per `update.intervalHours` (default 24) and answers from the local cache (`.stillmark/plans/UPDATE.json`) otherwise. When `updateAvailable` is true, run the `recommended` command: `stillmark update apply --json` refreshes installed agent files from the running CLI, and `npx -y stillmark@<version> update apply --json` does the same with a newer published CLI. Tell the user in one line, then continue with the request. Ignore `error`. Never run `npm install` or edit `package.json` on your own.

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

## First-run setup (`.stillmark`)

On the first `/stillmark` in a repo, run `stillmark config status --json`. When `needsFirstRunPrompt` is true, run the setup before the original request, using the agent's structured question tool (Cursor `AskQuestion`, Claude Code `AskUserQuestion`; otherwise a numbered list):

1. Ask together: whether to **version `.stillmark/learnings/design/` in git** (single choice; **never** offer to commit `.stillmark/plans/`), and **what to generate now** (multiple choice: **All**, then `DESIGN.md` when the repo has a UI, `PRODUCT.md`, `COVERAGE.md` from existing tests, roadmap history from `git log` dated with `--commit=<sha>`, code style learnings, and **Nothing for now**).
2. Record sharing with `stillmark config set --design-system=true|false --prompted --json`. If the user defers, skip `--prompted` so the setup can return later.
3. Generate each picked item from the real code and history, never inventing; unknowns become open questions in the file.
4. Then ask whether to commit **only the Stillmark files just created**, showing the file list and the exact `proposedMessage` from `stillmark git setup-files --json`, with options to commit with it, commit with a message the user types, or skip. On yes run `stillmark git setup-commit [--message "<msg>"] --json`: it commits exactly those paths (config, `ROADMAP.md`, `COVERAGE.md`, `.gitignore`, `DESIGN.md`, `PRODUCT.md`, shared learnings), leaves any other staged or unstaged work untouched, and never pushes.

Use `--accept-scope-change` only after the user authorizes expanding scope. Use `--allow-sensitive` on roadmap writes only after warning the user about public ROADMAP.md.

## Reporting

After each operation, report what changed, item IDs, and file paths from the JSON `summary`. Never invent completion status.

**Clickable links are mandatory.** Every reply that creates, changes, shows, or mentions a plan, roadmap, or coverage file must include a clickable markdown link to it. Paste the JSON `link` field verbatim (e.g. `[TASK_PLAN.md](C:/repo/.stillmark/plans/TASK_PLAN.md)`); when there is no `link`, build one from the absolute `location` with forward slashes. Do the same for `FINDINGS.md` and `PROGRESS.md` next to the plan. A bare path in backticks is not enough: the plan folder is git-ignored and hard to find by hand.

## Git

Never run `git commit` or `git push` yourself. Stillmark git integration follows `stillmark.config.json` (`autoCommit` / `autoPush`, default off). Per-call: `--git` or `--no-git`.

Commit subjects: Stillmark checks recent `git log` only to see whether the repo uses conventional commits; if so it writes `docs: …` for planning documents and `chore: …` for setup, otherwise the plain summary. It never copies a scope from history (such as `(t)` or `(auth)`). Preview with `stillmark git message-style "<summary>" --json`. Override with `git.commitMessage` and `{summary}` in config when needed.

Never add markers, scopes, or sign-offs from your own agent rules (for example a `(t)` suffix for agent commits) to a Stillmark commit message. When such a rule would change the message, show both versions to the user and let them choose before committing.

Agent attribution: `git.stripAgentAttribution` (default on) installs a `commit-msg` hook that removes `Co-authored-by: Cursor`, `Made-with: Cursor`, `Co-Authored-By: Claude …`, and "Generated with Claude Code" from every commit. `stillmark init` installs it; before any commit the user asked for, run `stillmark git hook install --json` (safe to repeat). It never replaces a `commit-msg` hook it did not write; tell the user when `attributionHook.foreign` is true. Turn it off with `stillmark config set --strip-attribution=false` (removes the hook). Cursor Cloud Agents commit on Cursor's servers, where local hooks do not run.

When UI or code conventions become stable, **capture them in learnings markdown** under `.stillmark/learnings/design/` and `.stillmark/learnings/code-style/` (paths in `stillmark.config.json` → `learned`). Prefer new short `.md` files or edits to `overview.md`; do not scatter the same rules only in chat.

## Long-running mode

During long-running execution, detect planning-change intent every turn. If in scope, run `stillmark long-running apply` before new work. If out of scope, offer roadmap or defer; do not silently expand the active task.

## Privacy

Before putting operational detail on the roadmap, warn that ROADMAP.md is public in git. Do not copy private task-plan content into the roadmap.
