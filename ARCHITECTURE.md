# Stillmark architecture

## Layers

```text
Agent skill / command  -->  stillmark CLI  -->  parsers + guards  -->  markdown + STATE.json
                                      |
                                      +--> COVERAGE.md validator + git hints
```

- **Agents** use a single `/stillmark` entry: it mirrors every CLI verb (including `coverage …`) with `--json`, plus embedded `design` (browser selection + free text) and natural-language routing via `classify`.
- **CLI** (`packages/cli/src/cli/Cli.ts`) dispatches `init`, `config`, `roadmap`, `plan`, `coverage`, `add`, `move`, `classify`, `install`, `long-running`.
- **Documents** parse `ROADMAP.md` and `TASK_PLAN.md` into line spans and splice edits without full regeneration.
- **Guards** enforce duplicates, plan scope, and roadmap privacy.
- **Coverage** (`packages/cli/src/coverage/`) validates checkbox-only `COVERAGE.md`, toggles cases, and surfaces git diff hints for `/stillmark coverage update` (playbook in `templates/.../stillmark/reference/coverage.md`).
- **Git** (`GitRunner`) optionally commits or pushes **only** `ROADMAP.md` when enabled in `stillmark.config.json`.
- **Long-running** persists `.stillmark/plans/STATE.json` and recomputes the next actionable task after authorized plan changes.
- **Caveman** (`packages/cli/src/caveman/`) holds the optional terse reply rules per level, handed to agents through `config status` only while `caveman.level` is not `off`, and the compress/verify/restore cycle for agent context files: the readable original and a token manifest stay in `.stillmark/plans/caveman/`, and verify compares frontmatter, fenced code, headings, inline code, URLs, and paths byte-exact before recording the savings.

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

## Testing

Vitest unit tests under `packages/cli/tests/unit/` cover incremental writes, classification, scope, privacy, git behavior, moves, long-running state, and adapter instructions.
