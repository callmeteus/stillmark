# Stillmark install guide

Execute these steps in the **project root** where planning files should live.

## Project or global

The prompt that sent you here says which one the user picked:

- **This project** (default): run every step below. The skill lives inside this repository.
- **Global (all projects)**: run step 1, then step 3 with `--global`, and skip steps 2, 4, and 5. The skill goes to the user's home folder (`~/.cursor`, `~/.claude`, or `~/.codex`) and works in every repository; each project gets its planning files the first time `/stillmark` runs there.

If the prompt does not say, ask the user once which one they want.

## 1. Add the CLI

Install from the [latest GitHub Release](https://github.com/callmeteus/stillmark/releases/latest) (asset `stillmark.tgz`):

```bash
npm install -g https://github.com/callmeteus/stillmark/releases/latest/download/stillmark.tgz
```

## 2. Initialize planning files

```bash
stillmark init
```

Creates `ROADMAP.md`, `stillmark.config.json`, and `.stillmark/plans/` (always in `.gitignore`). On the first `/stillmark`, your agent may ask whether to version `.stillmark/learnings/design/` in git; task plans stay local. Task plans are created when you start one with `stillmark plan init`.

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

Global install (all projects): add `--global`, for example:

```bash
stillmark install --agent cursor --global
```

## 4. First `/stillmark` (optional sharing)

Your agent may run:

```bash
stillmark config status --json
```

If prompted, choose whether `.stillmark/learnings/design/` is versioned in git. Task plans under `.stillmark/plans/` always stay local.

```bash
stillmark config set --design-system=true --prompted --json
```

Optional: entries are compact by default (task plan is extended). To write details under each test case, roadmap item, or task:

```bash
stillmark config set --detail=extended --json
# or only for COVERAGE.md:
stillmark config set --detail=extended --module=coverage --json
```

Updates: the agent checks for a new Stillmark version on its own, once a day, and refreshes its files when one is out. To change how often or turn it off:

```bash
# every 6 hours
stillmark config set --update-interval=6 --json
# turn off
stillmark config set --auto-update=false --json
```

## 5. Optional: test coverage checklist

When the team wants a shared test-case checklist in git:

```bash
stillmark coverage init
```

Then use `/stillmark coverage …` from the agent (same workflows as `stillmark coverage …`) or `stillmark coverage validate --json` after edits.

## 6. Verify

Confirm `ROADMAP.md` exists, `.stillmark/` is gitignored, and `.stillmark/plans/` was created. Use `stillmark --help` if a step fails.
