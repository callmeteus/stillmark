# Stillmark install guide

Execute these steps in the **project root** where planning files should live.

## 1. Add the CLI

Install from the [latest GitHub Release](https://github.com/callmeteus/stillmark/releases/latest) (asset `stillmark.tgz`):

```bash
npm install -g https://github.com/callmeteus/stillmark/releases/latest/download/stillmark.tgz
```

## 2. Initialize planning files

```bash
stillmark init
```

Creates `ROADMAP.md`, `stillmark.config.json`, and `.stillmark/plans/` (added to `.gitignore`). Task plans are created when you start one with `stillmark plan init`.

## 3. Install agent templates

Pick the agent you use:

```bash
stillmark install --agent cursor
```

```bash
stillmark install --agent claude
```

```bash
stillmark install --agent codex
```

## 4. Optional: test coverage checklist

When the team wants a shared test-case checklist in git:

```bash
stillmark coverage init
```

Then use the agent skill `/coverage` (installed with Cursor and Claude templates) or `stillmark coverage validate --json` after edits.

## 5. Verify

Confirm `ROADMAP.md` exists, `.stillmark/` is gitignored, and `.stillmark/plans/` was created. Use `stillmark --help` if a step fails.
