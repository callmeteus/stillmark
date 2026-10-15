# Changelog

All notable changes to this project are listed here, newest first.

## [Unreleased]

## [0.2.0] - 2026-10-15

### Added

- Design modes under `/stillmark design` (create, review, mixed) with dedicated playbooks
- Agent template migrations that remove legacy split slash commands
- Smarter `stillmark git push` with `needsCommit`, `proposedMessage`, and `--with-commit`
- Update checks on GitHub releases when the CLI is not on npm yet, with install hints in JSON
- Finished work on the roadmap with delivery dates from commits
- Guided first-run setup, setup-only commit, and agent attribution stripping
- Commit messages without copied scopes and with user confirmation
- Task plan checklist grouped by phase, with plan done and status
- Choose the language of generated markdown documents, globally or per document
- Optional caveman mode to save tokens (terse replies, inspired by the caveman skill)
- Push local commits with stillmark git push, listing uncommitted work instead of committing it
- Notify the user when the agent finishes working (Telegram, Discord, webhooks)
- README.md generator and refactorer with selectable templates
- Push right after every commit by default, configurable with config set --auto-push
- Landing site that explains everything the agent does, with docs-style topic guides
- Turn TODO and FIXME comments in the code into roadmap items, with stillmark roadmap todos and init --todos
- Generate and maintain CHANGELOG.md, including retroactive history
- Desktop toast notifications and an automatic Codex finish hook

## [0.1.0] - 2026-10-12

### Added

- CLI with roadmap, private task plan, coverage checklist, and agent templates
- First-run choice to share or keep design learnings local
- Landing page on GitHub Pages and CLI downloads from GitHub Releases
- Single /stillmark command for planning, coverage, and CLI mirror
- Design playbooks merged into the stillmark skill
- Landing command reference in agent and terminal forms
- Landing language toggle on the same page
- Local design and code-style learnings
- Landing redesign as a blueprint sheet with a revisions demo
- Compact or extended detail level, global or per module
- Automatic update checks with a configurable interval
- Global install and project or global picker on the landing
- Plan scope and priority flags with clickable file links
