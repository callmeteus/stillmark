# stillmark

One-line CLI for safe roadmap and task-plan updates from AI agents.

## Overview

Stillmark owns parsing, validating, and patching `ROADMAP.md`, `.stillmark/plans/TASK_PLAN.md`, and `COVERAGE.md` (test-case checklist). It does **not** replace your agent; it gives the agent a deterministic write path with structured JSON results.

## Install

From the latest [GitHub Release](https://github.com/callmeteus/stillmark/releases/latest):

```bash
npm install -g https://github.com/callmeteus/stillmark/releases/latest/download/stillmark.tgz
```

For local development in this monorepo, build `packages/cli` and use `npx stillmark` from that package.

## Run

```bash
stillmark init
stillmark init --todos --json
stillmark roadmap todos --json
stillmark roadmap todos --add --json
stillmark roadmap add "PostgreSQL support" --json
stillmark roadmap done "PostgreSQL support" --json
stillmark roadmap add "Login by QR code" --done --commit=a1b2c3d --json
stillmark config set --roadmap-dates=false --json
stillmark git setup-files --json
stillmark git setup-commit --json
stillmark git push --json
stillmark notify add telegram --token=<bot token> --json
stillmark notify add discord --url=https://discord.com/api/webhooks/<id>/<token> --json
stillmark notify add slack --url=https://hooks.slack.com/services/<path> --json
stillmark notify add desktop --json
stillmark notify hook install --agent=cursor --json
stillmark notify hook install --agent=codex --json
stillmark notify test --json
stillmark changelog --json
stillmark changelog sync --json
stillmark changelog add "Invoices download as PDF" --json
stillmark changelog add "Wrong totals on the invoice page" --group=fixed --json
stillmark changelog check --json
stillmark plan init "Billing export" --in-scope "CSV\nPDF" --out-of-scope "Excel" --json
stillmark plan scope --in-scope "Refunds" --json
stillmark plan add "Integration tests" --priority=high --phase=PHASE-1 --json --accept-scope-change
stillmark plan priority T-001 critical --json
stillmark plan status T-001 in-progress --json
stillmark plan done T-001 --json
stillmark classify "Add observability as a future milestone" --json
stillmark move "Dashboard" to plan --json --confirm
stillmark install --agent cursor
stillmark coverage validate --json
stillmark coverage update --json
stillmark config set --caveman=full --json
stillmark caveman on --json
stillmark caveman off --json
stillmark caveman compress AGENTS.md --json
stillmark caveman verify AGENTS.md --json
stillmark caveman --json
stillmark readme templates --json
stillmark readme plan --template=cli --file=packages/cli/README.md --json
stillmark readme check --file=packages/cli/README.md --json
stillmark readme restore --file=packages/cli/README.md --json
stillmark text check docs/launch-post.md --json
stillmark text rewrite docs/launch-post.md --json
stillmark text restore docs/launch-post.md --json
stillmark text rules --language=pt-BR --json
```

## Environment

| File | Purpose |
|------|---------|
| `ROADMAP.md` | Public roadmap (git) |
| `.stillmark/plans/TASK_PLAN.md` | Private execution plan (local); ends with a generated `## Checklist` of tasks, grouped by phase, checked by `plan done` |
| `.stillmark/plans/STATE.json` | Long-running recovery state (local) |
| `COVERAGE.md` | Checkbox test coverage checklist (public in git) |
| `CHANGELOG.md` | Public list of user-visible changes in the [Keep a Changelog](https://keepachangelog.com/) layout. `stillmark changelog sync` creates it from history: releases from version tags, or version bumps of the project `package.json` when there are no tags; entries from done roadmap items placed by their `done:` date, or `feat` / `fix` / `perf` commits for releases without roadmap items. Later syncs add only new entries and move Unreleased ones into a release when a new tag appears; released sections are never rewritten. `roadmap done` lists the item under Unreleased when the file exists; `changelog add "<text>" [--group=<group>]` adds anything else; `changelog check` validates structure and flags secrets, personal data, and technical wording; `changelog` previews a sync |
| `stillmark.config.json` | Optional git integration; when `git log` uses conventional commits, Stillmark writes `docs:` (planning) or `chore:` (setup) subjects for its own files and never copies types or scopes like `(t)` from history, unless `git.commitMessage` is set; for other changes (`git push`, `git message-style`) the type follows what changed (summary prefix, files of one kind, summary verb, new source files) and the subject is never cut; `detail` block picks compact or extended entries globally or per module (`stillmark config set --detail=compact\|extended\|inherit [--module=coverage\|roadmap\|plan]`); `update` block (`auto`, `intervalHours`, default on every 24h) controls how often `stillmark update` checks npm; `roadmap.dates` (default on) writes `added:` / `done:` dates on roadmap items, with `--date` or `--commit=<sha>` to set them from git (`stillmark config set --roadmap-dates=true\|false`); `git.stripAgentAttribution` (default on) installs a `commit-msg` hook that removes Cursor and Claude Code attribution trailers from commits, never replacing a hook it did not write (`stillmark config set --strip-attribution=true\|false`, `stillmark git hook [status\|install\|remove]`); `git.autoPush` (default on) pushes right after Stillmark commits and commits the user asks the agent for (`stillmark config set --auto-push=true\|false`); `language` block sets the language of written content, globally or per target (`roadmap`, `plan`, `coverage`, `changelog`, `docs`, `commits`), asked on first run and English until chosen (`stillmark config set --language=pt-BR\|inherit [--module=<target>]`); `caveman.level` (default `off`) turns on terse agent replies at `lite`, `full`, or `ultra`, and `stillmark config status` hands the agent the matching rules only while it is on (`stillmark config set --caveman=off\|lite\|full\|ultra`); `stillmark caveman on\|off\|<level>` switches it for the current conversation only without writing the config, and `--save` persists it |
| `~/.stillmark/notify.json` | Per-user notification channels (Telegram bot token and chat, Discord and Slack channel webhooks, generic JSON webhooks, desktop notifications), written with owner-only permissions and never inside a repository. `stillmark notify add telegram --token=<t>` finds the chat from the last message sent to the bot; `stillmark notify add desktop` shows a native notification (Windows toast through Windows PowerShell, `osascript` on macOS, `notify-send` on Linux); `stillmark notify hook install --agent=cursor\|claude\|codex` adds a finish hook (`~/.cursor/hooks.json` `stop`, `~/.claude/settings.json` `Stop` and `Notification`, or a top-level `notify` in `~/.codex/config.toml`, never replacing another program already there) that sends finished, failed, stopped, or waiting for you with the first lines of the final reply. `notify test`, `notify send "<text>" --status=<status>`, `notify on\|off`, `notify remove <name>`; `notify` lists channels with secrets masked |
| `.stillmark/plans/caveman/` | Local caveman data: the readable original of every context file shrunk with `stillmark caveman compress <file>` (rules, `AGENTS.md`, skills, learnings; Stillmark documents are refused) and `manifest.json` with token estimates. `caveman verify <file>` checks that code blocks, headings, frontmatter, inline code, URLs, and paths survived; `caveman restore <file>` puts the original back; `stillmark caveman` shows the rule cost per turn against the tokens saved |
| `.stillmark/plans/readme/` | Local README data: the README as it was before `stillmark readme plan` (kept until a passing `readme check` closes the rewrite) and the template chosen per file. `readme plan` returns real project facts (script commands for the detected package manager, workspaces, bin, engines, env var names from `.env.example`, linkable docs), the outline of one of 9 templates (`app-root`, `package`, `cli`, `standard`, `showcase`, `makeareadme`, `funnel`, `service`, `minimal`), and the URLs, ports, and env vars the current README states; `readme check` reports missing sections, empty sections, heading jumps, placeholders, scripts or make targets that do not exist, broken relative links, and facts lost from the previous version; `readme restore` puts the previous version back |
| `.stillmark/plans/text/` | Local text-clarity data: the original of a file opened with `stillmark text rewrite <file>`, kept until a passing `text check` accepts the rewrite. `text check` detects the language of each paragraph and reports the marks of generated text with the English or Portuguese catalog (other languages get the shared patterns); during a rewrite it also reports numbers, code, paths, and links lost or added. `text rules` returns the writing rules, which always include never inventing facts; `text restore` puts the original back |
| `stillmark install --agent <agent> --global` | Installs the skill in the home directory (`~/.cursor`, `~/.claude`, `~/.codex/prompts`) so every project can use it; auto-update refreshes it too (`~/.stillmark/UPDATE.json`) |
| `stillmark install --agent <agent> [--global] --link` | Dev mode: links the repository `templates/` (junction or symlink) instead of copying, so template edits apply right away. Install and auto-update never write through these links. Pair with `npm link` in `packages/cli` so the global `stillmark` runs the latest `npm run build` |
| `.stillmark/plans/UPDATE.json` | Local update cache: last check, latest known version (`latestChannel`: npm or GitHub), version that wrote the agent files. `stillmark update [--force]` checks npm then GitHub releases; JSON includes `install.githubLatest` and `recommended` |

See [../../ARCHITECTURE.md](../../ARCHITECTURE.md) for design details.
