# Stillmark Design skill

Canonical agent skill for autonomous UI research, direction, implementation, and bounded visual verification. Shipped inside the Stillmark monorepo and installed into consumer projects via `stillmark install --agent cursor|claude`.

## Layout

| Path | Role |
|------|------|
| `SKILL.md` | Agent skill entry (Cursor / Claude Code) |
| `reference/craft-floor.md` | Quality floor before UI edits |
| `reference/research-template.md` | Reference analysis checklist |
| `reference/external-tools.md` | Optional tools and licenses |

## External references (not vendored)

This skill is **inspired by** public workflows and standards. It does not bundle their source files.

| Resource | License (verify at source) | How to use |
|----------|---------------------------|------------|
| Impeccable (Cursor skill, Apache-2.0) | Apache-2.0 | Optional deeper critique/refine playbooks; install separately if the host supports it |
| [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) | MIT | Implementation review checklist |
| UI/UX Pro Max, DesignSkills | Varies | Optional local or MCP knowledge bases; supplementary only |

Stillmark Design automates the **pipeline** (research, direction, build, inspect, fix, persist) and ties it to Stillmark planning files. It is not a fork of Impeccable.

## Sync on build

`packages/cli/scripts/copy-templates.mjs` copies this folder into agent template trees under `templates/cursor` and `templates/claude` when the CLI is built.
