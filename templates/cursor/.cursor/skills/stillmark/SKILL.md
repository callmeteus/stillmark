---
name: stillmark
description: >-
  Single Stillmark entry: every CLI command and COVERAGE.md workflow through
  /stillmark, plus embedded design (browser selection, UI feedback). Do not use
  a separate /coverage slash command.
---

# Stillmark

**Only entry point:** `/stillmark` (not `/coverage`, not `/stillmark-design`). Read `templates/shared/INSTRUCTIONS.md` after `stillmark install`.

All file-backed operations run `stillmark … --json` from the **project root**. The text after `/stillmark` is the instruction.

## CLI mirror rule

Anything valid on the terminal as `stillmark <args>` is valid as:

```text
/stillmark <args>
```

- If the user repeats the binary (`/stillmark stillmark plan add …`), strip one leading `stillmark ` and run the rest.
- Always append `--json` for CLI runs unless the user forbids it.
- `stillmark <command> --help` prints usage and changes nothing. Unknown options are refused; put text that starts with a dash after `--`.
- Task criteria go through flags, not hand edits: `plan add "<title>" --acceptance "<a>\n<b>" --verification "<check>"` (`--acceptance` also works on `roadmap add`).
- Supported top-level verbs: `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `coverage`, `config`, `git`, `update`, `long-running`.

## Auto-update (start of every `/stillmark`)

Before handling the request, run:

```bash
stillmark update --json
```

It contacts npm at most once per `update.intervalHours` (default 24h) and returns at once otherwise, so it is cheap to call every time. When `updateAvailable` is **true**, run the command in `recommended` (`stillmark update apply --json` or `npx -y stillmark@<version> update apply --json`), tell the user in one line what was updated, then re-read this skill if its files changed and continue with the original request. Ignore `error` (offline, registry down) and keep going. Do not run `npm install` or edit `package.json` yourself; if the summary says the installed CLI is older, just mention it.

User controls: "para de atualizar sozinho" = `stillmark config set --auto-update=false --json`; "verifica a cada 6 horas" = `stillmark config set --update-interval=6 --json`; "procura atualização agora" = `stillmark update --force --json`.

## Repo without Stillmark files (global install)

When the skill was installed with `--global`, a repository may have no `stillmark.config.json` or `ROADMAP.md` yet. Before the first file-backed command there, ask once whether to set Stillmark up in this repo; on yes run `stillmark init --json`, on no answer without touching files.

## First run: sharing under `.stillmark`

```bash
stillmark config status --json
```

When `sharing.needsFirstRunPrompt` is **true**, ask **one** question (task plans **always** stay local; optional `.stillmark/learnings/design/` in git). Record with `stillmark config set --design-system=true|false --prompted --json`. Defer = skip `--prompted`.

## Detail level: compact or extended

The same status payload has `detail` (`coverage`, `roadmap`, `plan`). **compact** = item line only; **extended** = item line plus short indented details, written with `--details "<text>"` on `coverage add`, `roadmap add`, `plan add`, or `add`. Defaults: coverage and roadmap compact, plan extended. Requests like "deixa o coverage extenso" or "tudo compacto" map to `stillmark config set --detail=extended|compact [--module=coverage|roadmap|plan] --json` (omit `--module` for global; `--detail=inherit` removes an override).

## How `/stillmark` is parsed

Let `text` = message after `/stillmark` (trimmed). Strip optional leading `stillmark ` once.

| Input pattern | Mode | Action |
|---------------|------|--------|
| Starts with `init`, `install`, `classify`, `add`, `roadmap`, `plan`, `move`, `config`, `git`, `update`, `long-running` | **CLI** | `stillmark <text> --json` |
| Starts with `coverage` | **Coverage** | See [Coverage mode](#coverage-mode-embedded) and `reference/coverage.md` |
| Starts with `design` | **Design** | Design pipeline; rest is brief |
| Browser element attached | **Design** | Map selection to project source |
| UI critique without planning intent | **Design** | Targeted visual fix |
| Mentions COVERAGE.md, checklist, "marca coberto", test cases, NOTFIXED | **Coverage** | `reference/coverage.md` free-text workflow |
| Obvious new roadmap/plan item | **CLI** | `stillmark classify` or `stillmark add` with full `text` |
| Otherwise ambiguous | **Classify** | `stillmark classify "<text>" --json`; one question if needed |

Do **not** tell users to run `/coverage`. Redirect: *"Use `/stillmark coverage …`"*.

Playbooks: `reference/coverage.md`, `reference/craft-floor.md`, etc. (`.cursor/skills/stillmark/reference/`).

## Coverage mode (embedded)

Load `reference/coverage.md` for full rules.

| `text` | Action |
|--------|--------|
| `coverage` only | Print help from reference **verbatim**; change nothing |
| `coverage update` | Update workflow (hints via `stillmark coverage update --json`, then reconcile) |
| `coverage validate`, `coverage summary`, `coverage check`, … | `stillmark coverage … --json` |
| `coverage <free text>` | Free-text COVERAGE.md edits per reference |
| Free text about tests/checklist (no `coverage` prefix) | Same free-text workflow |

After every COVERAGE.md edit: `stillmark coverage validate --json` until `ok`.

```text
/stillmark coverage
/stillmark coverage update
/stillmark coverage validate --json
/stillmark coverage adiciona casos happy path do login
/stillmark marca o fluxo de logout como coberto
```

## Design mode (embedded)

Triggered by `design …`, browser selection, or obvious UI critique. Load `reference/craft-floor.md` before edits.

1. **Project preview only** (not third-party sites).
2. Map DOM → source; fix scope the user described.
3. Run app; one inspection pass (desktop + narrow width).

```text
/stillmark design hero
/stillmark ta uma bosta arruma     (+ selection on local preview)
```

## Planning notes

- Design work in plans: `stillmark plan add` with acceptance criteria; long-horizon UI in `roadmap add`.
- Long-running: `stillmark long-running apply` when scope changes mid-run.

## Git

Never commit or push unless the user grants it. Preview subjects: `stillmark git commit-style "<summary>" --json`.

## Examples (CLI via slash)

```text
/stillmark init
/stillmark install --agent cursor
/stillmark config status --json
/stillmark roadmap add "Observability"
/stillmark plan init "Ship billing"
/stillmark move "API keys" to plan --confirm --json
/stillmark git commit-style "Add WAF rules" --json
```
