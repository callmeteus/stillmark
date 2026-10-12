---
name: stillmark
description: >-
  Stillmark companion: planning CLI (roadmap, plan, coverage, long-running) plus
  embedded design mode for UI work. Use for /stillmark with or without arguments,
  including browser-selected elements and casual fix requests in any language.
---

# Stillmark

Single entry point for **planning**, **coverage**, and **design** in this repository. Read `templates/shared/INSTRUCTIONS.md` (or the project copy after `stillmark install`).

Run `stillmark` from the **project root** with `--json` for file-backed planning operations. Design work edits source in the repo and re-checks the running app when possible.

## How `/stillmark` is parsed

The user message is everything after `/stillmark` (trimmed). It may be CLI-shaped or free text.

| Input pattern | Mode | Action |
|---------------|------|--------|
| Starts with `roadmap`, `plan`, `coverage`, `move`, `add`, `init`, `install`, `classify`, `long-running` | **CLI** | Run matching `stillmark … --json` |
| Starts with `design` (optional rest) | **Design** | Design pipeline below; rest is brief |
| **Browser element** attached (`browser_element`, selection outline, dom_path, bounds) | **Design** | Map selection to project source; fix what user describes |
| Vague critique ("ta uma bosta arruma", "melhora isso", "feio", "polish this") with or without selection | **Design** | Treat as targeted visual fix; scale research to scope |
| Planning-ish add (`stillmark add`, roadmap/plan) mentioning UI/design | **CLI + classify** | Design tasks belong in **plan** (now) or **roadmap** (later); see below |
| Otherwise ambiguous planning vs design | **Classify** | `stillmark classify "<full user text>" --json`; if still unclear, ask **one** question |

Do **not** require a separate `/stillmark-design` or `/design` skill. Design playbooks live under `skills/stillmark-design/` in the Stillmark repo (reference files only).

## Design mode (embedded)

Triggered by `stillmark design …`, browser selection + feedback, or obvious UI critique.

### Browser selection rules

1. **Project preview only:** Edits apply to **this workspace's app** (local dev URL). If the selection is on a third-party site (e.g. google.com) or unrelated origin, say that Stillmark cannot change that page and ask the user to open **their** app in the Cursor browser preview, select the element, and run `/stillmark` again.
2. **Map DOM → source:** Use dom_path, classes, visible text, and route URL to find the component, page, or CSS module. Prefer the file that owns the selected subtree.
3. **User tone:** Informal Portuguese or English is a **design brief**, not an excuse to skip craft. Infer hierarchy, spacing, contrast, alignment, and copy issues from context + screenshot if available.
4. **Scope:** Change only what fixes the selection and its container rhythm unless the user asked for a wider redesign.

### Pipeline (automated, no command menu)

Scale phases to scope. A one-off "arruma" with a selected node is usually **0 → 3 → 4** (skip heavy reference research).

| Phase | What |
|-------|------|
| 0 | Read `PRODUCT.md`, `DESIGN.md`, tokens; load `skills/stillmark-design/reference/craft-floor.md` before editing UI |
| 1 | Research (5-8 candidates, 3-5 deep) only for **new surfaces** or explicit redesign |
| 2 | Note in `.stillmark/plans/FINDINGS.md` / `PROGRESS.md` when useful; `stillmark plan add` or `long-running apply` if scope changes |
| 3 | Implement in source |
| 4 | Run app, inspect desktop + mobile once, one fix batch |

Optional external tools: Impeccable, Vercel Web Interface Guidelines (`skills/stillmark-design/reference/external-tools.md`).

### Examples

```text
/stillmark design landing hero
/stillmark design
/stillmark ta uma bosta arruma          (+ browser element on project preview)
/stillmark o botão de copy tá perdido   (+ selection)
/stillmark roadmap add "Dark mode"
/stillmark coverage validate --json
```

## Planning mode (CLI)

When the message is clearly CLI intent, run `stillmark` and report the JSON `summary`.

**Design in planning:** Task plans and roadmaps may include design work. Prefer `stillmark plan add` with acceptance criteria (layout, breakpoints, states verified in browser). Use `roadmap add` for long-horizon visual initiatives. `stillmark classify` and `stillmark add` treat common UI/design phrases as plan vs roadmap. Execution-only fixes (browser selection + "arruma") do not require a plan line unless the user is in long-running mode or scope expands.

For `/coverage`, follow the installed `coverage` skill rules; validate with `stillmark coverage validate --json` after edits.

## Git

Never commit or push unless the user explicitly grants it. Roadmap git behavior follows `stillmark.config.json`. Auto-commit subjects **learn from recent `git log`** unless `git.commitMessage` is set. Preview: `stillmark git commit-style "<summary>" --json`.
