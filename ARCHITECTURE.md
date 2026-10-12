# Stillmark architecture

## Layers

```text
Agent skill / command  -->  stillmark CLI  -->  parsers + guards  -->  markdown + STATE.json
                                      |
                                      +--> COVERAGE.md validator + git hints
```

- **Agents** map `/stillmark` (planning, embedded `design`, browser selection + free text), `/coverage`, and natural language to CLI invocations with `--json`.
- **CLI** (`packages/cli/src/cli/Cli.ts`) dispatches `init`, `config`, `roadmap`, `plan`, `coverage`, `add`, `move`, `classify`, `install`, `long-running`.
- **Documents** parse `ROADMAP.md` and `TASK_PLAN.md` into line spans and splice edits without full regeneration.
- **Guards** enforce duplicates, plan scope, and roadmap privacy.
- **Coverage** (`packages/cli/src/coverage/`) validates checkbox-only `COVERAGE.md`, toggles cases, and surfaces git diff hints for `/coverage update` (aligned with luckymaker-workspace coverage skill).
- **Git** (`GitRunner`) optionally commits or pushes **only** `ROADMAP.md` when enabled in `stillmark.config.json`.
- **Long-running** persists `.stillmark/plans/STATE.json` and recomputes the next actionable task after authorized plan changes.

## Configuration

`stillmark.config.json` at the project root:

```json
{
    "git": {
        "autoCommit": false,
        "autoPush": false
    },
    "sharing": {
        "firstRunPrompted": false,
        "shareDesignSystem": false
    }
}
```

`.stillmark/plans/` is always gitignored. `.stillmark/design-system/` is gitignored until `stillmark config set --design-system=true` (usually after the first `/stillmark` prompt). Agents check `stillmark config status --json` for `needsFirstRunPrompt`.

When `git.commitMessage` is omitted, auto-commits infer the subject prefix from recent `git log` (`stillmark git commit-style --json` previews the template). Set `commitMessage` with a `{summary}` placeholder to pin a fixed format.

Per-call overrides: `--git`, `--no-git`.

## Templates

Root `templates/` is copied into `packages/cli/dist/templates` at build time. `skills/stillmark-design/` is synced into Cursor and Claude template trees on the same build step. `stillmark install --agent <id>` copies the matching subtree into the target project.

## Testing

Vitest unit tests under `packages/cli/tests/unit/` cover incremental writes, classification, scope, privacy, git behavior, moves, long-running state, and adapter instructions.
