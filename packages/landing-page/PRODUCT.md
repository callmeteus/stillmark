# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 6 static site (`@astrojs/sitemap`), plain CSS in `src/styles/global.css`, i18n via `src/i18n/en-US.ts` and `src/i18n/pt-BR.ts`. Lives in the Stillmark monorepo at `packages/landing-page`; root `npm run dev -w @stillmark/landing-page` serves local preview (default Astro port 4321).

## Users

**Primary:** Developers and technical leads who use AI coding agents (Cursor, Claude Code, Codex) and need a reliable way to manage `ROADMAP.md`, a private execution plan, and `COVERAGE.md` test checklists without hand-editing markdown for every change.

**Secondary:** Contributors evaluating whether to adopt the `stillmark` CLI in a repository before installing agent templates.

**Situation:** They land on the marketing site to understand what Stillmark does, how roadmap vs task plan differ, which agents are supported, and how to run `npx stillmark init`.

## Product Purpose

The **landing-page** surface exists to persuade visitors that Stillmark is the right companion for agentic development: public strategic roadmap in git, private `.stillmark/plans/TASK_PLAN.md`, checkbox-only `COVERAGE.md`, deterministic CLI writes, `/coverage` agent skill, and optional git integration for roadmap only.

Success for this surface: a visitor understands the split between roadmap, plan, and coverage checklist, copies or remembers the install prompt, and knows which `stillmark install --agent` variant matches their tool.

This package does not implement planning logic; it markets the CLI in `packages/cli`.

## Positioning

Stillmark is not another static roadmap template. A **deterministic CLI** performs incremental, guard-checked patches to planning files while agents interpret natural language. Neighboring tools that only document conventions or rely on the model to edit markdown directly cannot truthfully claim duplicate detection, scope guards, privacy checks on public roadmap writes, and long-running plan state in `.stillmark/plans/STATE.json`.

## Operating Context

- Visitors may read in **English** (`/`) or **Portuguese** (`/pt-br/`).
- Primary call to action on the page: copy `npx stillmark init`.
- Secondary paths: command reference table, agent install commands, link to documentation (nav label present; final docs URL not fixed in product record).
- Production site: GitHub Pages at `https://callmeteus.github.io/stillmark/` (`base: /stillmark` in `astro.config.mjs`). CLI installs from GitHub Releases (`stillmark.tgz`).

## Capabilities and Constraints

**In scope for this surface:**

- Hero, how-it-works diagram, feature grid, supported agents list, command reference, footer.
- Bilingual copy aligned with CLI behavior described in monorepo `README.md` and `ARCHITECTURE.md`.

**Out of scope for this surface:**

- Running the CLI, hosting docs, or authenticated product UI.
- Fabricated customer logos, testimonials, metrics, or pricing.

**Constraints:**

- User-facing copy: plain language, no emojis (per product conventions).
- Do not invent npm download counts, customer names, or compliance claims.

## Brand Commitments

- Product name: **Stillmark**.
- Tagline direction (from shipped copy): plan in plain language; safe CLI for agents; roadmap public / task plan private.
- Monorepo license: MIT (see root `README.md`).

## Evidence on Hand

- Product and CLI behavior: [../../README.md](../../README.md), [../../ARCHITECTURE.md](../../ARCHITECTURE.md), [../cli/README.md](../cli/README.md).
- Live copy source: `src/i18n/en-US.ts`, `src/i18n/pt-BR.ts`.
- **Not on hand:** production analytics, real GitHub org/repo URL wired in nav (placeholder `https://github.com` in pages), dedicated docs site URL, screenshots or brand illustration assets.

## Product Principles

1. **Clarity over hype:** Explain roadmap vs plan and why the CLI exists before decorative marketing.
2. **Truthful commands:** Every command shown on the page must match the shipped CLI interface.
3. **Agent-native:** Supported agents and install paths are first-class content, not an afterthought.
4. **Privacy by design:** Messaging must reflect that `.stillmark/` is local/private and roadmap writes can be guarded.
5. **Bilingual parity:** `pt-BR` is a full alternate route, not a partial translation.

## Accessibility & Inclusion

No product-specific accessibility standard confirmed beyond baseline expectations for a public marketing site (semantic structure, readable contrast, keyboard-accessible copy button). Formal WCAG target **undecided**.
