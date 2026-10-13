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

**Talk to the user in their language, every time.** This skill and the CLI are in English, but every message to the user is in the language the user writes in: the first sentence before any tool call, progress updates, `AskQuestion` prompts and options, and the final report. A user writing in Portuguese gets Portuguese from the first line, with correct accents. Translate CLI summaries; keep commands, file names, IDs, and JSON fields as they are. File content follows the configured document language (below), not the chat language.

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
- Supported top-level verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `config`, `git`, `notify`, `caveman`, `readme`, `update`, `long-running`.

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

1. **One `AskQuestion` form with three questions:**
   - **Document language** (single choice, mandatory): the language of everything Stillmark writes (roadmap, plans, coverage cases, changelog, DESIGN/PRODUCT, commit messages). First option the language the user is writing in, then English, then "Other" (the user types it). Mention that one document can use another language later.
   - **Sharing** (single choice): version `.stillmark/learnings/design/` in git or keep it local. Task plans **always** stay local; never offer to commit `.stillmark/plans/`.
   - **What to generate now** (`allow_multiple: true`). First option **All**, then each item on its own, then **Nothing for now**:
     - `DESIGN.md`: visual system read from the code (colors, type, spacing, components). Offer only when the repo has a UI.
     - `PRODUCT.md`: what the product is, who uses it, tone of voice.
     - `COVERAGE.md`: test checklist from the existing tests (`stillmark coverage init`, then fill).
     - Roadmap history: past deliveries from `git log`, dated by commit (`roadmap add --done --commit=<sha>`).
     - Code style learnings: conventions in `.stillmark/learnings/code-style/`.
2. Record the language with `stillmark config set --language=<tag> --json` (BCP-47 such as `pt-BR`, `en`, `es`), and sharing with `stillmark config set --design-system=true|false --prompted --json` (dismissed = skip `--prompted` so the setup can return).
3. Generate what was picked, in the chosen language, one item at a time, from the real code and history. Never invent: list unknowns as open questions inside the file. Link every file you write.
4. **Then ask (single choice)** whether to commit **only** the Stillmark files just created. Show the file list **and the exact commit message** (`proposedMessage`) from `stillmark git setup-files --json` in the question. Options: commit with that message, commit with another message (the user types it), don't commit. Commit runs `stillmark git setup-commit --json` (exactly those paths, other staged or unstaged work untouched, pushed right after when `git.autoPush` is on), with `--message "<msg>"` when the user typed one. No changes nothing.

## Document language (mandatory)

`config status` returns `language.needsPrompt` and `language.resolved` (per target: `roadmap`, `plan`, `coverage`, `changelog`, `docs`, `commits`). When `needsPrompt` is **true** in a repo that already finished the first run, ask the language question alone once, before writing any file, and record it with `stillmark config set --language=<tag> --json`.

Write every item title, detail, acceptance criterion, task, coverage case, document, and commit message in `language.resolved.<target>`, whatever language the chat uses. Structure the CLI parses stays as the CLI writes it (headings such as `## Backlog`, IDs, `status:`/`priority:` fields, coverage tags). When `proposedMessage` or `git message-style` returns a language different from `commitLanguage`, translate the summary and pass `--message`. Requests like "roadmap em inglês" or "tudo em português" map to `stillmark config set --language=<tag> [--module=<target>] --json` (`--language=inherit` removes an override).

**Commit messages are the user's call.** Use `proposedMessage` (or `git message-style`) as is: never add markers, scopes, or sign-offs that come from your own agent rules (for example a `(t)` suffix for agent commits). If a rule you follow would change the message, put both versions in the question and let the user pick.

## Detail level: compact or extended

The same status payload has `detail` (`coverage`, `roadmap`, `plan`). **compact** = item line only; **extended** = item line plus short indented details, written with `--details "<text>"` on `coverage add`, `roadmap add`, `plan add`, or `add`. Defaults: coverage and roadmap compact, plan extended. Requests like "deixa o coverage extenso" or "tudo compacto" map to `stillmark config set --detail=extended|compact [--module=coverage|roadmap|plan] --json` (omit `--module` for global; `--detail=inherit` removes an override).

## Caveman replies (optional, off by default)

`config status` also returns `caveman` (`level`, `rules`, `ruleTokens`). When `rules` is not empty, follow every rule in every reply of the session: terse answers, still in the user's language, with commands, code, file links, IDs, and errors exact.

- **Temporary (this conversation only):** `/stillmark caveman on|off|lite|full|ultra` runs `stillmark caveman <level> --json`; it returns `temporary: true` and the `rules` without touching the config. Follow them for the rest of the conversation, and after `off` drop them, even when the saved setting is on. "ativa o caveman agora" / "desliga o caveman" in chat mean this.
- **Saved (every conversation):** `stillmark caveman <level> --save --json` or `stillmark config set --caveman=<level> --json`; use it when the user says "sempre", "deixa ligado", or "salva".
- Tell the user the per-turn cost from `ruleTokens` when turning it on.

Compressing agent context (rules, `AGENTS.md`, skills, learnings; never ROADMAP, COVERAGE, plans, or CHANGELOG): `stillmark caveman compress <file> --json` keeps the readable original under `.stillmark/plans/caveman/` and returns `instructions`; rewrite the file following them, then `stillmark caveman verify <file> --json` and fix every listed issue (or `caveman restore <file>`). `stillmark caveman --json` reports the rule cost per turn and the tokens saved per load; quote both when the user asks whether it pays off.

## README generator and refactorer

"cria o README", "refaz o README", "melhora o README do pacote X" map to this flow. Never write a README from memory or guesses.

1. `stillmark readme plan [--file=<path>/README.md] --json` reads the real project next to the file: `facts.runCommands` (ready-to-paste script commands for the detected package manager), workspaces, `bin`, engines, env var names (never values), and linkable files. It backs up an existing README under `.stillmark/plans/readme/` and returns `factsToKeep` (URLs, local ports, env vars the current README states).
2. When `needsClarification` is true, ask (`AskQuestion`) which template to use from the returned `templates`, with the suggested one first and marked recommended; then run `readme plan --template=<id>` again. `stillmark readme templates --json` shows each layout with its source (Standard Readme, Best-README-Template, makeareadme.com, Art of README, internal service, workspace app/package/CLI, minimal).
3. Write the README in `language`, following `header`, the `outline` order, and each `hint`. When restructuring, move existing content into the matching section (`existing`) instead of rewriting it. Only state what `facts` or the current README support; skip an optional section rather than invent content.
4. `stillmark readme check [--file=...] --json` and fix every issue (missing title or required section, empty section, heading jump, TODO or placeholder text, script or make target that does not exist, broken relative link, fact lost from the previous version). `stillmark readme restore --json` puts the previous README back when the user asks.

## Notifications when the agent finishes

Channels are per user, stored in `~/.stillmark/notify.json` (never in the repo); sending goes out from the user's own computer. Never paste tokens or webhook URLs into repo files, roadmap items, or commit messages.

- **Telegram (bot):** the user creates a bot with @BotFather, sends any message to it, then `stillmark notify add telegram --token=<token> --json` (the chat is found by itself; `--chat-id` when it is a group or channel).
- **Discord / Slack (channel webhook):** `stillmark notify add discord --url=<webhook> --json` (channel settings, Integrations, Webhooks) or `stillmark notify add slack --url=https://hooks.slack.com/services/... --json`. Generic JSON: `notify add webhook --url=<https url>`. `--name=<name>` keeps several of the same type.
- **Every finish, automatically:** `stillmark notify hook install --agent=cursor --json` adds a `stop` hook to `~/.cursor/hooks.json` (Claude Code: `--agent=claude`, `Stop` and `Notification`). It sends finished, failed, stopped, or waiting for you (final reply ending in a question), with the first lines of the final reply. Do not also run `notify send` at the end when the hook is installed.
- After adding a channel, run `stillmark notify test [<name>] --json` and report what arrived. "pausa as notificações" = `notify off`, "volta" = `notify on`; `notify` lists channels (masked) and hooks; `notify remove <name>`.

When the user asks for notifications, ask (`AskQuestion`) which channels to set up and whether to notify on every finish (hook), then ask for each secret in chat.

## How `/stillmark` is parsed

Let `text` = message after `/stillmark` (trimmed). Strip optional leading `stillmark ` once.

| Input pattern | Mode | Action |
|---------------|------|--------|
| Starts with `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `config`, `git`, `notify`, `caveman`, `readme`, `update`, `long-running` | **CLI** | `stillmark <text> --json` |
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

`/stillmark git push` runs `stillmark git push --json`: it pushes local commits (setting `origin` as upstream on the first push) and never commits. When `uncommitted` is not empty, ask with `AskQuestion` whether to commit those files first, showing the proposed message (commit with it, commit with a message the user types, push only what is committed); after committing, run `stillmark git push --json` again.

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
