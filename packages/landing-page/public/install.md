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

Creates `ROADMAP.md`, `stillmark.config.json`, and `.stillmark/plans/` (always in `.gitignore`). On the first `/stillmark`, your agent may ask whether to version `.stillmark/design-system/` in git; task plans stay local. Task plans are created when you start one with `stillmark plan init`.

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

## 4. First `/stillmark` (optional sharing)

Your agent may run:

```bash
stillmark config status --json
```

If prompted, choose whether `.stillmark/design-system/` is versioned in git. Task plans under `.stillmark/plans/` always stay local.

```bash
stillmark config set --design-system=true --prompted --json
```

## 5. Optional: test coverage checklist

When the team wants a shared test-case checklist in git:

```bash
stillmark coverage init
```

Then use `/stillmark coverage …` from the agent (same workflows as `stillmark coverage …`) or `stillmark coverage validate --json` after edits.

## 6. Verify

Confirm `ROADMAP.md` exists, `.stillmark/` is gitignored, and `.stillmark/plans/` was created. Use `stillmark --help` if a step fails.
