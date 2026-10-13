---
name: stillmark
description: >-
  Single Stillmark entry: every CLI command and COVERAGE.md workflow through
  /stillmark, plus embedded design (browser selection, UI feedback). Do not use
  a separate /coverage slash command.
---

# Stillmark

**Only entry point:** `/stillmark` (not `/coverage`, not `/stillmark-design`).

**You are reading this skill, so Stillmark is already installed.** Never run `stillmark install` and never copy skill, command, or prompt files into the repo unless the user explicitly asks to install. Setting a repo up is only `stillmark init --json`.

All file-backed operations run `stillmark … --json` from the **project root**. The text after `/stillmark` is the instruction.

**Talk to the user in their language, every time.** This skill and the CLI are in English, but every message to the user is in the language the user writes in: the first sentence before any tool call, progress updates, `AskQuestion` prompts and options, and the final report. A user writing in Portuguese gets Portuguese from the first line, with correct accents. Translate CLI summaries; keep commands, file names, IDs, and JSON fields as they are. File content keeps its own rules (COVERAGE.md cases stay in English).

**Clickable links are mandatory, every time.** Whenever a reply creates, changes, shows, or mentions `TASK_PLAN.md`, `FINDINGS.md`, `PROGRESS.md`, `ROADMAP.md`, or `COVERAGE.md`, include a clickable markdown link to the file. Paste the JSON `link` field verbatim; when there is none, build `[TASK_PLAN.md](C:/abs/path/.stillmark/plans/TASK_PLAN.md)` from the absolute `location` (forward slashes, spaces as `%20`). A path in backticks alone is not acceptable: `.stillmark/plans/` is git-ignored and greyed out in the explorer.

## CLI mirror rule

Anything valid on the terminal as `stillmark <args>` is valid as:

```text
/stillmark <args>
```

- If the user repeats the binary (`/stillmark stillmark plan add …`), strip one leading `stillmark ` and run the rest.
- Always append `--json` for CLI runs unless the user forbids it.
- `stillmark <command> --help` prints usage and changes nothing. Unknown options are refused; put text that starts with a dash after `--`.
- Task criteria go through flags, not hand edits: `plan add "<title>" --acceptance "<a>\n<b>" --verification "<check>"` (`--acceptance` also works on `roadmap add`).
- Scope per plan, never copied from the previous one: `plan init "<objective>" --in-scope "<a>\n<b>" --out-of-scope "<c>"`, or later `plan scope --in-scope "<d>"` (appends; `--replace` overwrites; no flags shows it).
- Plan progress: TASK_PLAN.md ends with a generated `## Checklist` (`- [ ] T-001 - Title`, or `- [ ] PHASE-1 / T-001 - Title` grouped by phase). Never edit it by hand: run `plan status <task> in-progress` when starting a task and `plan done <task>` right after finishing it. Phases: `plan add "<title>" --phase=PHASE-1` or `plan phase <task> <phase>`.
- Priority: `--priority=critical|high|medium|low` on `plan add`, `roadmap add`, and `add`; change later with `plan priority <task> <level>` or `roadmap priority "<item>" <level>`. Default is `medium`.
- Finished work: `roadmap done "<item>"` moves an existing item to `## Done` (checked, `status: done`); `roadmap add "<description>" --done` records work that was never listed. To backfill the past, read `git log --date=short --format="%h %ad %s"`, group commits into user-visible features, and run one command per feature with `--commit=<sha>` of the commit that finished it, so the `done:` date is the real delivery date.
- Dates: on by default, items get `added:` / `done:` (`YYYY-MM-DD`). `--date=YYYY-MM-DD` sets one by hand; `roadmap done` on an item already done with `--date`/`--commit` fixes its date. Off with `config set --roadmap-dates=false`.
- Supported top-level verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `config`, `git`, `update`, `long-running`.

## Auto-update (start of every `/stillmark`)

Before handling the request, run:

```bash
stillmark update --json
```

It contacts npm at most once per `update.intervalHours` (default 24h) and returns at once otherwise, so it is cheap to call every time. When `updateAvailable` is **true**, run the command in `recommended` (`stillmark update apply --json` or `npx -y stillmark@<version> update apply --json`), tell the user in one line what was updated, then re-read this skill if its files changed and continue with the original request. Ignore `error` (offline, registry down) and keep going. Do not run `npm install` or edit `package.json` yourself; if the summary says the installed CLI is older, just mention it.

User controls: "para de atualizar sozinho" = `stillmark config set --auto-update=false --json`; "verifica a cada 6 horas" = `stillmark config set --update-interval=6 --json`; "procura atualização agora" = `stillmark update --force --json`.

## Repo without Stillmark files (global install)

When the skill was installed with `--global`, a repository may have no `stillmark.config.json` or `ROADMAP.md` yet. Before the first file-backed command there, ask once whether to set Stillmark up in this repo; on yes run `stillmark init --json` (it creates the planning files only, no skill copy), on no answer without touching files.

## First run: setup

```bash
stillmark config status --json
```

When `sharing.needsFirstRunPrompt` is **true**, run the setup once, in the user's language, before the original request:

1. **One `AskQuestion` form with two questions:**
   - **Sharing** (single choice): version `.stillmark/learnings/design/` in git or keep it local. Task plans **always** stay local; never offer to commit `.stillmark/plans/`.
   - **What to generate now** (`allow_multiple: true`). First option **All**, then each item on its own, then **Nothing for now**:
     - `DESIGN.md`: visual system read from the code (colors, type, spacing, components). Offer only when the repo has a UI.
     - `PRODUCT.md`: what the product is, who uses it, tone of voice.
     - `COVERAGE.md`: test checklist from the existing tests (`stillmark coverage init`, then fill).
     - Roadmap history: past deliveries from `git log`, dated by commit (`roadmap add --done --commit=<sha>`).
     - Code style learnings: conventions in `.stillmark/learnings/code-style/`.
2. Record sharing with `stillmark config set --design-system=true|false --prompted --json` (dismissed = skip `--prompted` so the setup can return).
3. Generate what was picked, one item at a time, from the real code and history. Never invent: list unknowns as open questions inside the file. Link every file you write.
4. **Then ask (single choice)** whether to commit **only** the Stillmark files just created. Show the file list **and the exact commit message** (`proposedMessage`) from `stillmark git setup-files --json` in the question. Options: commit with that message, commit with another message (the user types it), don't commit. Commit runs `stillmark git setup-commit --json` (exactly those paths, other staged or unstaged work untouched, never pushes), with `--message "<msg>"` when the user typed one. No changes nothing.

**Commit messages are the user's call.** Use `proposedMessage` (or `git message-style`) as is: never add markers, scopes, or sign-offs that come from your own agent rules (for example a `(t)` suffix for agent commits). If a rule you follow would change the message, put both versions in the question and let the user pick.

## Detail level: compact or extended

The same status payload has `detail` (`coverage`, `roadmap`, `plan`). **compact** = item line only; **extended** = item line plus short indented details, written with `--details "<text>"` on `coverage add`, `roadmap add`, `plan add`, or `add`. Defaults: coverage and roadmap compact, plan extended. Requests like "deixa o coverage extenso" or "tudo compacto" map to `stillmark config set --detail=extended|compact [--module=coverage|roadmap|plan] --json` (omit `--module` for global; `--detail=inherit` removes an override).

## How `/stillmark` is parsed

Let `text` = message after `/stillmark` (trimmed). Strip optional leading `stillmark ` once.

| Input pattern | Mode | Action |
|---------------|------|--------|
| Starts with `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `config`, `git`, `update`, `long-running` | **CLI** | `stillmark <text> --json` |
| Starts with `coverage` | **Coverage** | See [Coverage mode](#coverage-mode-embedded) and `reference/coverage.md` |
| Starts with `design` | **Design** | Design pipeline; rest is brief |
| Browser element attached | **Design** | Map selection to project source |
| UI critique without planning intent | **Design** | Targeted visual fix |
| Mentions COVERAGE.md, checklist, "marca coberto", test cases, NOTFIXED | **Coverage** | `reference/coverage.md` free-text workflow |
| Obvious new roadmap/plan item | **CLI** | `stillmark classify` or `stillmark add` with full `text` |
| Otherwise ambiguous | **Classify** | `stillmark classify "<text>" --json`; one question if needed |

Do **not** tell users to run `/coverage`. Redirect: *"Use `/stillmark coverage …`"*.

Playbooks: `reference/coverage.md`, `reference/craft-floor.md`, etc. (`.cursor/skills/stillmark/reference/`).

## Coverage mode (embedded)

Load `reference/coverage.md` for full rules.

| `text` | Action |
|--------|--------|
| `coverage` only | Print help from reference **verbatim**; change nothing |
| `coverage update` | Update workflow (hints via `stillmark coverage update --json`, then reconcile) |
| `coverage validate`, `coverage summary`, `coverage check`, … | `stillmark coverage … --json` |
| `coverage <free text>` | Free-text COVERAGE.md edits per reference |
| Free text about tests/checklist (no `coverage` prefix) | Same free-text workflow |

After every COVERAGE.md edit: `stillmark coverage validate --json` until `ok`.

```text
/stillmark coverage
/stillmark coverage update
/stillmark coverage validate --json
/stillmark coverage adiciona casos happy path do login
/stillmark marca o fluxo de logout como coberto
```

## Design mode (embedded)

Triggered by `design …`, browser selection, or obvious UI critique. Load `reference/craft-floor.md` before edits.

1. **Project preview only** (not third-party sites).
2. Map DOM → source; fix scope the user described.
3. Run app; one inspection pass (desktop + narrow width).

```text
/stillmark design hero
/stillmark ta uma bosta arruma     (+ selection on local preview)
```

## Planning notes

- Design work in plans: `stillmark plan add` with acceptance criteria; long-horizon UI in `roadmap add`.
- Long-running: `stillmark long-running apply` when scope changes mid-run.

## Git

Never commit or push unless the user grants it. Preview subjects: `stillmark git message-style "<summary>" --json`.

Before a commit the user asked for, run `stillmark git hook install --json` (idempotent) so the `commit-msg` hook strips `Co-authored-by: Cursor`, `Made-with: Cursor`, and Claude attribution. On by default (`git.stripAgentAttribution`); off with `stillmark config set --strip-attribution=false`. If `attributionHook.foreign` is true, tell the user an existing hook was left alone.

Defaults for every commit the user asks for: no agent markers in the message (no `(t)`), no agent co-author, and push right after (`git.autoPush`, on by default; off with `stillmark config set --auto-push=false`, or skip when the user says not to push). `/stillmark git commit` means: stage the pending work, commit with a message from `git message-style`, then push.

## Examples (CLI via slash)

```text
/stillmark init
/stillmark config status --json
/stillmark roadmap add "Observability"
/stillmark plan init "Ship billing" --in-scope "Invoices\nRefunds" --out-of-scope "Tax reports"
/stillmark plan add "Refund webhook" --priority=high
/stillmark move "API keys" to plan --confirm --json
/stillmark git message-style "Add WAF rules" --json
```
