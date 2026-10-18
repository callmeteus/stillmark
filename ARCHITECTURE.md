# Stillmark architecture

## Layers

```text
Agent skill / command  -->  stillmark CLI  -->  parsers + guards  -->  markdown + STATE.json
                                      |
                                      +--> COVERAGE.md validator + git hints
```

- **Agents** use a single `/stillmark` entry: it mirrors every CLI verb (including `coverage …`) with `--json`, plus embedded `design` (browser selection + free text) and natural-language routing via `classify`.
- **CLI** (`packages/cli/src/cli/Cli.ts`) dispatches `init`, `config`, `roadmap`, `plan`, `coverage`, `changelog`, `add`, `move`, `classify`, `install`, `long-running`.
- **Documents** parse `ROADMAP.md` and `TASK_PLAN.md` into line spans and splice edits without full regeneration.
- **Guards** enforce duplicates, plan scope, and roadmap privacy.
- **Coverage** (`packages/cli/src/coverage/`) validates checkbox-only `COVERAGE.md`, toggles cases, and surfaces git diff hints for `/stillmark coverage update` (playbook in `templates/.../stillmark/reference/coverage.md`).
- **Git** (`GitRunner`) optionally commits or pushes **only** `ROADMAP.md` when enabled in `stillmark.config.json`.
- **Long-running** persists `.stillmark/plans/STATE.json` and recomputes the next actionable task after authorized plan changes.
- **Notify** (`packages/cli/src/notify/`) keeps per-user channels in `~/.stillmark/notify.json` (owner-only file, secrets masked on output), posts to Telegram (`sendMessage`, chat discovered with `getUpdates`), Discord and Slack channel webhooks, or a generic JSON webhook in parallel with a 10s timeout, shows desktop notifications without extra dependencies (`DesktopToast`: WinRT toast through Windows PowerShell with the text in environment variables, `osascript` arguments on macOS, `notify-send` elsewhere), and manages user-level finish hooks: Cursor `stop` in `~/.cursor/hooks.json`, Claude Code `Stop`/`Notification` in `~/.claude/settings.json`, and Codex top-level `notify` in `~/.codex/config.toml` (`CodexNotify` edits only that key and refuses to replace another program, since Codex runs a single one; on Windows it points at Node and the CLI script because Codex starts the program without a shell). The hook runs `stillmark notify run-hook`, which reads the payload on stdin (Cursor, Claude Code) or from the last argument (Codex), derives the status and a short summary from the end of the transcript or the Codex `last-assistant-message`, always prints `{}`, and exits 0.
- **Changelog** (`packages/cli/src/changelog/`) keeps `CHANGELOG.md` in the Keep a Changelog layout. `ChangelogDocument` splits the file into a preamble and raw release sections so untouched releases are written back byte for byte; `ChangelogSources` reads releases from version tags (or version bumps of the project `package.json`) and fills each one with done roadmap items by `done:` date, falling back to `feat`/`fix`/`perf` commits in that range; `syncChangelog` inserts only missing releases and entries, moves Unreleased entries into a newly tagged release, and never rewrites a released section. `roadmap done` appends to Unreleased when the file exists, and `ValidateChangelog` checks structure, personal data, and technical wording.
- **Caveman** (`packages/cli/src/caveman/`) holds the optional terse reply rules per level, handed to agents through `config status` only while `caveman.level` is not `off`, and the compress/verify/restore cycle for agent context files: the readable original and a token manifest stay in `.stillmark/plans/caveman/`, and verify compares frontmatter, fenced code, headings, inline code, URLs, and paths byte-exact before recording the savings.
- **README** (`packages/cli/src/readme/`) holds the section catalog (headings with English, Portuguese, and Spanish aliases, longest alias wins) and 9 templates drawn from Standard Readme, Best-README-Template, makeareadme.com, Art of README, internal service runbooks, and the workspace app, package, and CLI conventions. `ProjectFacts` reads only what is on disk next to the README (manifest, scripts as commands for the detected package manager, workspaces, Makefile targets, env var names, linkable docs) and suggests a template; `ReadmeCheck` compares the written README against those facts and the backup in `.stillmark/plans/readme/`, so the agent writes the prose while the CLI keeps commands, links, and old facts honest.
- **Text** (`packages/cli/src/text/`) checks prose for the marks of generated text. `TextLanguage` guesses the language from common short words, for the whole text and again per paragraph, so a mixed file gets the right catalog; `TextPatterns` holds the shared patterns (em dash, emoji, quotes) and the structural ones (long sentences, title-case headings), while `TextPatternsEn` and `TextPatternsPt` hold each language's phrases, written for this project after Wikipedia's "Signs of AI writing" guide and the humanizer skills built on it. `TextRules` returns the writing rules per language, always ending with the no-invention rules. `TextCheck` masks code, URLs, tables, and frontmatter before matching, and `compareFacts` checks a rewrite against the original kept in `.stillmark/plans/text/` for lost or added numbers, code, paths, and links. Markdown token regexes shared with Caveman live in `packages/cli/src/markdown/`.

## Configuration

`stillmark.config.json` at the project root:

```json
{
    "git": {
        "autoCommit": false,
        "autoPush": true
    },
    "sharing": {
        "firstRunPrompted": false,
        "shareDesignSystem": false
    }
}
```

`.stillmark/plans/` is always gitignored. `.stillmark/learnings/design/` is gitignored until `stillmark config set --design-system=true` (usually after the first `/stillmark` prompt). Code-style learnings live in `.stillmark/learnings/code-style/` as markdown. Agents check `stillmark config status --json` for `needsFirstRunPrompt`.

The `detail` block in `stillmark.config.json` (`global`, `coverage`, `roadmap`, `plan`) picks `compact` (item line only) or `extended` (item line plus indented detail lines written with `--details`). Resolution is module override, then `global`, then the module default: coverage and roadmap compact, plan extended. Parsers keep detail lines inside the item span so moves and splices carry them, and the coverage validator rejects detail lines when coverage is compact.

Auto-update lives in `src/update/`. Agents start every `/stillmark` with `stillmark update --json`; it asks the npm registry for `stillmark@latest` at most once per `update.intervalHours` (default 24, `update.auto` turns it off) and caches the answer in `.stillmark/plans/UPDATE.json` with `templatesVersion`, the CLI version that last wrote the agent files. Installed agent files count as outdated only when `templatesVersion` is older than the running CLI and the content differs, so local edits survive until a real version bump. The result carries a `recommended` command: `stillmark update apply` for a local refresh, or `npx -y stillmark@<latest> update apply` when npm has a newer CLI. Once the templates already match the latest version, an older installed CLI stops recommending the same update.

When `git.commitMessage` is omitted, auto-commits check recent `git log` only for the conventional-commit format: if most subjects follow it, Stillmark uses its own type (`docs:` for planning documents, `chore:` for setup); otherwise the plain summary. Types and scopes from history (such as `(t)`) are never copied, since they describe who or what made a specific change (`stillmark git message-style --json` previews the template). Set `commitMessage` with a `{summary}` placeholder to pin a fixed format.

Per-call overrides: `--git`, `--no-git`.

## Templates

Root `templates/` is copied into `packages/cli/dist/templates` at build time. Design playbooks live under `stillmark/reference/` inside the Cursor and Claude skill trees. `stillmark install --agent <id>` copies the matching subtree into the target project.

**Agent migrations** (`packages/cli/src/migrations/`) run before each template copy on install and on `update apply`. Each migration has a stable `id`, targets specific agents, and is idempotent (safe to re-run). Add new one-way cleanups to the chain in `AgentMigrationRunner.ts` (for example `RemoveSplitStillmarkAgentFiles` drops legacy `/coverage` and `/design` command files and split skills).

## Testing

Vitest unit tests under `packages/cli/tests/unit/` cover incremental writes, classification, scope, privacy, git behavior, moves, long-running state, and adapter instructions.
