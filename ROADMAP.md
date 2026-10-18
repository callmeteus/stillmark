# Roadmap

## Backlog

## Deferred

## Done

- [x] **R-001** CLI with roadmap, private task plan, coverage checklist, and agent templates
  priority: medium · status: done · done: 2026-10-12
- [x] **R-002** First-run choice to share or keep design learnings local
  priority: medium · status: done · done: 2026-10-12
- [x] **R-003** Landing page on GitHub Pages and CLI downloads from GitHub Releases
  priority: medium · status: done · done: 2026-10-12
- [x] **R-004** Single /stillmark command for planning, coverage, and CLI mirror
  priority: medium · status: done · done: 2026-10-12
- [x] **R-005** Design playbooks merged into the stillmark skill
  priority: medium · status: done · done: 2026-10-12
- [x] **R-006** Landing command reference in agent and terminal forms
  priority: medium · status: done · done: 2026-10-12
- [x] **R-007** Landing language toggle on the same page
  priority: medium · status: done · done: 2026-10-12
- [x] **R-008** Local design and code-style learnings
  priority: medium · status: done · done: 2026-10-12
- [x] **R-009** Landing redesign as a blueprint sheet with a revisions demo
  priority: medium · status: done · done: 2026-10-12
- [x] **R-010** Compact or extended detail level, global or per module
  priority: medium · status: done · done: 2026-10-12
- [x] **R-011** Automatic update checks with a configurable interval
  priority: medium · status: done · done: 2026-10-12
- [x] **R-012** Global install and project or global picker on the landing
  priority: medium · status: done · done: 2026-10-12
- [x] **R-013** Plan scope and priority flags with clickable file links
  priority: medium · status: done · done: 2026-10-12
- [x] **R-014** Finished work on the roadmap with delivery dates from commits
  priority: medium · status: done · done: 2026-10-13
- [x] **R-015** Guided first-run setup, setup-only commit, and agent attribution stripping
  priority: medium · status: done · done: 2026-10-13
- [x] **R-016** Commit messages without copied scopes and with user confirmation
  priority: medium · status: done · done: 2026-10-13
- [x] **R-017** Task plan checklist grouped by phase, with plan done and status
  priority: medium · status: done · done: 2026-10-13
- [x] **R-022** Choose the language of generated markdown documents, globally or per document
  priority: medium · status: done · added: 2026-10-13 · done: 2026-10-13
  - One language setting for all documents, with per-document overrides (task plans, roadmap, changelog, coverage, design, product)
  - Set in plain language and stored in stillmark.config.json
  - Fixed structure keeps working in any language: headings, IDs, and fields the CLI parses stay stable
- [x] **R-020** Optional caveman mode to save tokens (terse replies, inspired by the caveman skill)
  priority: medium · status: done · added: 2026-10-13 · done: 2026-10-13
  - Opt-in setting in stillmark.config.json, off by default, toggled in plain language
  - Agent replies drop filler but keep commands, file links, IDs, and errors exact, still in the user's language
  - Optionally compress Stillmark skill and planning context the way caveman-compress does, with the readable original kept
  - Measure the savings, since the extra rules also cost input tokens
- [x] **R-024** Push local commits with stillmark git push, listing uncommitted work instead of committing it
  priority: medium · status: done · done: 2026-10-13
- [x] **R-018** Notify the user when the agent finishes working (Telegram, Discord, webhooks)
  priority: medium · status: done · added: 2026-10-13 · done: 2026-10-13
  - Fires on every finish: success, failure, blocked, or waiting for input
  - Channels: Telegram and Discord bots, generic webhooks, and local delivery from the user's own computer
  - Channels and credentials configured per user, never committed
- [x] **R-021** README.md generator and refactorer with selectable templates
  priority: medium · status: done · added: 2026-10-13 · done: 2026-10-13
  - Generates a README from the real project (scripts, packages, setup) or restructures an existing one
  - Several templates the user picks from (for example app or monorepo root, package, open source library)
  - Keeps accurate existing facts (ports, env vars, URLs) and never invents commands
- [x] **R-026** Push right after every commit by default, configurable with config set --auto-push
  priority: medium · status: done · done: 2026-10-13
- [x] **R-019** Landing site that explains everything the agent does, with docs-style topic guides
  priority: medium · status: done · added: 2026-10-13 · done: 2026-10-13
  - Every agent capability explained with a concrete example (what you say, what Stillmark does, what changes)
  - All commands documented, including the full design mode
  - Dedicated site areas or pages per topic (roadmap, plan, coverage, design, git, config, updates) instead of one long page
  - English and Portuguese with the same content
- [x] **R-027** Turn TODO and FIXME comments in the code into roadmap items, with stillmark roadmap todos and init --todos
  priority: medium · status: done · done: 2026-10-13
- [x] **R-023** Generate and maintain CHANGELOG.md, including retroactive history
  priority: medium · status: done · added: 2026-10-13 · done: 2026-10-13
  - Created and updated by the CLI like ROADMAP.md and COVERAGE.md, with validation
  - Backfills past releases from git history, tags, and roadmap Done items, dated by commit
  - User-visible changes only, in plain language, no internal details or secrets
  - Updates incrementally without rewriting existing entries
- [x] **R-025** Desktop toast notifications and an automatic Codex finish hook
  priority: low · status: done · added: 2026-10-13 · done: 2026-10-13
- [x] **R-028** Clear writing: text check and rewrite with English and Portuguese rules, and a rule against inventing facts
  priority: high · status: done · done: 2026-10-18
- [x] **R-029** Commit messages that match the change: the type comes from what changed, never from the last commit, and the text is never cut
  priority: medium · status: done · done: 2026-10-18