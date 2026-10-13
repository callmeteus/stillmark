# CLI and operations

- Layers: `documents/` parses markdown and keeps line spans; `operations/` applies edits; `cli/` maps argv to operations; `results/` shapes output.
- Edits are span-preserving: use `insertAfterLine` / `spliceLines` (0-based, end exclusive) instead of rewriting whole files.
- Every operation returns an `OperationResult` (`ok`, `changed`, `summary`, `location`, `itemId`); the CLI adds a clickable `link` for single-file locations. Failures return `ok: false` with a summary, they do not throw.
- TASK_PLAN.md writes go through `writeTaskPlan` so the generated `## Checklist` stays in sync.
- New flags must be registered in `ParseFlags.ts` (unknown options are refused) and documented in `Help.ts`, the shared `INSTRUCTIONS.md`, the agent skills, the CLI README, and the landing command table (en-US and pt-BR).
- Never name a subcommand with the words `git commit` together: Cursor rewrites such shell commands and injects a `--trailer` flag.
- Agent-facing text (skills, instructions) is English; user-facing landing copy is plain language in both locales.
