---
name: stillmark
description: >-
  Single Stillmark entry: every CLI command and COVERAGE.md workflow through
  /stillmark, plus embedded design. Do not use a separate /coverage slash command.
---

# Stillmark

**Only entry point:** `/stillmark`. Follow shared Stillmark instructions. Run `stillmark … --json` from the project root.

**Talk to the user in their language, every time.** This skill and the CLI are in English, but every message to the user is in the language the user writes in: the first sentence before any tool call, progress updates, `AskUserQuestion` prompts and options, and the final report. Translate CLI summaries; keep commands, file names, IDs, and JSON fields as they are. File content follows the configured document language, not the chat language.

**Document language (mandatory).** `config status` returns `language.needsPrompt` and `language.resolved` per target (`roadmap`, `plan`, `coverage`, `changelog`, `docs`, `commits`). When `needsPrompt` is true, ask the language once before writing any file and record it with `stillmark config set --language=<tag> --json` (`pt-BR`, `en`, ...). Write every item, task, coverage case, document, and commit message in `language.resolved.<target>`; structure the CLI parses (headings, IDs, `status:`/`priority:` fields, coverage tags) stays as the CLI writes it. Per document: `config set --language=<tag> --module=<target>`; `--language=inherit` removes an override. When `commitLanguage` has no built-in summary, translate and pass `--message`.

**Caveman replies (optional, off by default).** `config status` returns `caveman` (`level`, `rules`, `ruleTokens`); when `rules` is not empty, follow them in every reply (terse, still in the user's language, commands/code/links/IDs/errors exact). This conversation only: `stillmark caveman on|off|lite|full|ultra --json` (returns `temporary: true` and `rules`; after `off`, drop them even if the saved setting is on). Saved: add `--save` or `config set --caveman=full|lite|ultra|off`. Context files (never ROADMAP, COVERAGE, plans, CHANGELOG): `caveman compress <file>` keeps the original and returns `instructions`; rewrite, then `caveman verify <file>` until clean, or `caveman restore <file>`. `stillmark caveman --json` shows rule cost per turn and tokens saved.

**README generator and refactorer.** Never write a README from memory. `stillmark readme plan [--file=<path>/README.md] --json` reads the real project (`facts.runCommands`, workspaces, bin, env var names, linkable files), backs up the current README, and returns `outline`, `factsToKeep`, and `instructions`. When `needsClarification` is true, ask which of the returned `templates` to use (suggested first), then `readme plan --template=<id>`. Write in `language` with only those facts, moving existing content into matching sections; then `readme check --json` until `issues` is empty. `readme restore` brings the previous version back; `readme templates` lists the layouts and sources.

**Clickable links are mandatory, every time.** Any reply that creates, changes, shows, or mentions a plan, findings, progress, roadmap, or coverage file must include a clickable markdown link to it: paste the JSON `link` field verbatim, or build `[TASK_PLAN.md](<absolute path, forward slashes>)` from `location`. Never only a path in backticks.

## CLI mirror

`/stillmark <args>` = `stillmark <args> --json`. Strip a duplicate leading `stillmark `. Verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `config`, `git`, `notify`, `caveman`, `readme`, `long-running`.

**Notifications.** Per user in `~/.stillmark/notify.json`, never in the repo. Telegram: bot from @BotFather, user messages it once, then `stillmark notify add telegram --token=<t> --json` (chat found by itself). Discord/Slack channel webhooks: `notify add discord|slack --url=<webhook>`; generic JSON: `notify add webhook --url=<https>`. Every finish: `stillmark notify hook install --agent=claude --json` (Stop and Notification hooks in `~/.claude/settings.json`; then do not also run `notify send`). Check with `notify test [<name>]`; `notify off|on`, `notify remove <name>`, `notify` lists (masked).

## Modes

| Pattern | Mode |
|---------|------|
| CLI verbs above | Run `stillmark <text> --json` |
| `coverage …` or COVERAGE/test checklist intent | `reference/coverage.md` (help, update, free text, or `stillmark coverage …`) |
| `design …`, browser selection, UI critique | Design; `reference/craft-floor.md` |
| Else | `stillmark classify "<text>" --json` |

Never use `/coverage`. Playbooks under `reference/` (`.claude/skills/stillmark/reference/`).

`stillmark <command> --help` prints usage only; unknown options are refused. Criteria: `plan add "<title>" --acceptance "<a>\n<b>" --verification "<check>"` instead of editing `(define)` by hand. Scope per plan (never reuse the previous one): `plan init "<objective>" --in-scope "<a>\n<b>" --out-of-scope "<c>"` or `plan scope ...` (appends; `--replace` overwrites). Priority: `--priority=critical|high|medium|low` on `plan add` / `roadmap add` / `add`, or `plan priority <task> <level>` later; default is `medium`. Plan progress: TASK_PLAN.md ends with a generated `## Checklist` (`- [ ] T-001 - Title`, or `- [ ] PHASE-1 / T-001 - Title` grouped by phase); never edit it by hand, run `plan status <task> in-progress` when starting and `plan done <task>` right after finishing each task. Phases: `plan add ... --phase=PHASE-1` or `plan phase <task> <phase>`. Finished work: `roadmap done "<item>"` for listed items, `roadmap add "<description>" --done` for past work (backfill from `git log`, one command per user-visible feature, with `--commit=<sha>` so `done:` gets the real delivery date). Dates (`added:` / `done:`) are on by default; off with `config set --roadmap-dates=false`.

Auto-update: start every `/stillmark` with `stillmark update --json` (hits npm at most once per `update.intervalHours`, default 24h). When `updateAvailable` is true, run `recommended`, tell the user in one line, re-read this skill if it changed, then continue. Ignore `error`. Never run `npm install` yourself. Controls: `config set --auto-update=false`, `config set --update-interval=<hours>`, `update --force`.

You are reading this skill, so Stillmark is already installed: never run `stillmark install` or copy skill files into the repo unless the user explicitly asks. Global install (`--global`): if the repo has no `stillmark.config.json` / `ROADMAP.md`, ask once before running `stillmark init --json` (planning files only).

First run: `stillmark config status --json`; when `needsFirstRunPrompt`, use `AskUserQuestion` to ask (1) the document language (mandatory; the user's chat language first, then English, then other), (2) whether to version `.stillmark/learnings/design/`, and (3) what to generate now (`multiSelect`: All, `DESIGN.md` if there is a UI, `PRODUCT.md`, `COVERAGE.md`, roadmap history from `git log` with `--commit`, code style learnings, Nothing). Record with `config set --language=<tag>` and `config set --design-system=true|false --prompted`, generate the picks from real code in that language, then ask whether to commit only those files, showing the list and the exact `proposedMessage` from `stillmark git setup-files --json` (options: commit with it, commit with a message the user types, skip; yes = `stillmark git setup-commit [--message "<msg>"] --json`, pushed right after when `git.autoPush` is on). Never add scopes or markers from your own rules (like `(t)`) to Stillmark commit messages; if a rule would change one, ask the user.

Detail level: `detail` in that payload says `compact` (item line only) or `extended` (indented details via `--details "<text>"`) per `coverage`, `roadmap`, `plan`. Defaults: coverage and roadmap compact, plan extended. "Deixa compacto/extenso" = `stillmark config set --detail=compact|extended [--module=coverage|roadmap|plan] --json`.

Git: never commit without user grant; `stillmark git message-style` for preview. Before a granted commit run `stillmark git hook install --json`: the `commit-msg` hook removes `Co-Authored-By: Claude`, "Generated with Claude Code", and Cursor trailers (default on; `config set --strip-attribution=false` turns it off). Commits the user asks for never carry agent markers such as `(t)` and are pushed right after (`git.autoPush`, default on; `config set --auto-push=false` turns it off, or skip when the user says not to push). `/stillmark git push` = `stillmark git push --json`: pushes local commits, never commits; when `uncommitted` is not empty, ask whether to commit them first, then run it again.
