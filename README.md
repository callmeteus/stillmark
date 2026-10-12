<div align="center">

# Stillmark

> Interactive roadmap and execution plan management for AI agents

**A deterministic CLI plus agent adapters so users never hand-edit planning markdown for routine changes.**

[CLI package](packages/cli/README.md) • [Architecture](ARCHITECTURE.md)

</div>

---

## What Is Stillmark?

Stillmark separates **public strategic planning** (`ROADMAP.md`) from **private execution planning** (`.stillmark/plans/TASK_PLAN.md`, local) and maintains a **test coverage companion** (`COVERAGE.md`). Agents interpret natural language; the CLI performs safe, incremental file updates with scope, privacy, validation, and optional git guards.

## Repository layout

| Path | Role |
|------|------|
| `packages/cli` | Published `stillmark` npm package (engine + bin) |
| `packages/landing-page` | Astro marketing site (`en` + `pt-br`) |
| `templates/` | Cursor, Claude Code, and Codex install templates |
| `skills/stillmark-design/` | Autonomous UI research and implementation skill (synced into templates on CLI build) |

## Get started

```bash
cd packages/cli
npm install
npm run build
npx stillmark init
```

Install agent templates from a project root:

```bash
stillmark install --agent cursor
```

## Development

```bash
npm install
npm run ci
```

## License

MIT
