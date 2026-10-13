# Product

## What Stillmark is

Stillmark is a CLI plus agent skills (Cursor, Claude Code, Codex) that lets developers manage planning files in plain language through their AI coding agent. The agent interprets the request; the CLI performs deterministic, span-preserving edits with scope, privacy, duplicate, and validation guards, and returns structured JSON.

It keeps three buckets apart:

| File | Audience | Purpose |
|------|----------|---------|
| `ROADMAP.md` | Shared with the team (committed) | Long-term goals, priorities, deferred work, and delivered work with dates |
| `.stillmark/plans/TASK_PLAN.md` | Private (git-ignored) | Objective, scope, and concrete tasks for the current work, ending with a progress checklist |
| `COVERAGE.md` | Shared with the team (committed) | Checkbox-only checklist of tested cases, tagged happy, sad, edge, or security |

It also carries a design mode (`/stillmark design`, browser selections on the local preview) and project learnings (`.stillmark/learnings/design/`, `.stillmark/learnings/code-style/`).

## Who uses it

- Developers who work through AI coding agents and want planning files that stay accurate without hand-editing markdown.
- Teams that want a public roadmap and test checklist in the repo, while each developer keeps half-baked execution plans local.

## Core promises

- **One entry point:** everything goes through `/stillmark` in the agent, mirroring the `stillmark` CLI.
- **No hand-editing:** routine changes (add, prioritize, defer, finish, check a test case) are CLI operations, not free-form file rewrites.
- **Private by default:** task plans never leave the machine; sharing design learnings is an explicit first-run choice.
- **Safe git:** never commits or pushes unless the user asks; strips agent attribution trailers by default; setup commits only touch Stillmark files.
- **Traceable answers:** every reply that touches a planning file links to it.

## Tone of voice

- Plain, direct, and practical: say what changes and where it lives ("Plan in plain language. Ship with a clear trail.").
- Describe outcomes for the user, not implementation details.
- No hype, no emojis, no em dash.
- Bilingual landing (English and Brazilian Portuguese) with the same content in both.

## Distribution

- Landing page on GitHub Pages: [callmeteus.github.io/stillmark](https://callmeteus.github.io/stillmark/).
- CLI tarball on GitHub Releases (`stillmark.tgz`); install guide for agents at `install.md` on the site.

## Related documents

- Landing page as a product surface: [packages/landing-page/PRODUCT.md](packages/landing-page/PRODUCT.md).
- Visual system (blueprint sheet, revision orange, Barlow lettering): [packages/landing-page/DESIGN.md](packages/landing-page/DESIGN.md).

## Open questions

- The `stillmark` name is not on the npm registry yet (`stillmark update` gets a 404), so `npx stillmark@latest` does not work today. When will the package be published?
- Pricing and licensing beyond MIT: is there any plan for a hosted or paid tier?
- Primary audience priority: solo developers or teams?
