# Design pipeline (Stillmark)

All design work goes through **`/stillmark design …`** only (never a separate `/design` slash).

## Step 1: dispatch with the CLI

Run from the project root:

```bash
stillmark design <subcommand> <brief> --json
```

Read the JSON `mode` and `playbooks` and load every playbook listed (under this skill's `reference/`). When the user did not use a subcommand, run `stillmark design "<their text>" --json` or `stillmark design --json` for help.

| `mode` | When | Playbooks |
|--------|------|-----------|
| **create** | `design create`, `build`, `study`, `redesign` | `design-create.md`, `craft-floor.md` |
| **review** | `design review`, `critique`, `audit` | `design-review.md`, `craft-floor.md` |
| **mixed** | `design polish`, free text, browser selection fixes | `design-mixed.md`, `design-create.md`, `design-review.md`, `craft-floor.md` |

Project `DESIGN.md`, `PRODUCT.md`, and `.stillmark/learnings/design/` override generic habits.

## Step 2: implement or report

- **create:** ship new UI from the brief (see `design-create.md`).
- **review:** ranked diagnosis only unless the user asks to fix (see `design-review.md`).
- **mixed:** implement scoped changes, then a short review pass (see `design-mixed.md`).

**Local preview only** for edits. Map browser selection to source. One verification pass (desktop + narrow width) after implementation modes.

## Quick examples

```text
/stillmark design create landing for a small-batch honey farm
/stillmark design study https://example.com
/stillmark design audit pricing page
/stillmark design critique checkout
/stillmark design polish hero spacing
/stillmark design more room between these cards   (+ selection on local preview)
```
