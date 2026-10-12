---
name: stillmark-design
description: >-
  Internal design playbook for the stillmark skill. Do not invoke alone; use
  /stillmark design or /stillmark with browser selection and free-text UI feedback.
disable-model-invocation: true
---

# Stillmark Design

Behave as a **product designer and frontend engineer**, not a generic UI generator. This skill runs an **automated pipeline** end to end. You do not present a command menu first; you classify the request, execute the pipeline, and only ask when a missing answer would change product behavior or scope.

Stillmark Design lives in this repository under `skills/stillmark-design/`. It complements the `stillmark` and `coverage` skills and uses the same CLI and local plan files.

## When this skill applies

- New page, flow, or component with meaningful visual work.
- Redesign or new visual direction (explicit or implied).
- Substantial layout, typography, or interaction changes.
- User invokes `/stillmark design`, `/stillmark` with a **browser_element**, or asks to fix or redesign UI in free text.

**Small fixes** (one spacing tweak, copy fix, bug in existing styles): skip full research; read `reference/craft-floor.md`, patch, run, one inspection pass.

## Automated pipeline (default)

Run these phases in order. Skip or shorten only when the work is clearly narrow.

### Phase 0 - Context (always)

1. Read project docs: `README.md`, `PRODUCT.md`, `DESIGN.md` (if present), surface-specific briefs, and the incumbent UI (source, tokens, components).
2. Note stack (framework, CSS approach, design-system components).
3. If `stillmark init` was never run, suggest it; do not block on it if planning files already exist.
4. Load `reference/craft-floor.md` before any UI edit.

### Phase 1 - Research (substantial work)

1. Clarify product purpose, users, required actions, and constraints from docs and the user message.
2. **Web search** for 5-8 current examples in the **same category and audience**, not generic inspiration lists.
3. Pick **3-5** strong references. **Visit** them when browser or fetch tools exist; capture snapshots or screenshots when supported.
4. Fill `reference/research-template.md` (in chat or in `.stillmark/plans/FINDINGS.md`). Per reference: hierarchy, layout, type, spacing, color, imagery, motion, mobile behavior, and what **not** to copy.
5. Choose one **coherent original direction** tailored to the product. State explicit implementation decisions (type scale, spacing rhythm, color roles, layout grid).

**Honesty:** Distinguish observed vs inferred. Do not claim live inspection or screenshots you did not perform.

Optional: delegate reference gathering to a research subagent with a fixed deliverable (filled template). The **primary agent** still chooses the direction.

### Phase 2 - Plan (Stillmark integration)

Use the four-document model. Do **not** invent a fifth mandatory tracker.

| Document | Path | Use |
|----------|------|-----|
| Findings | `.stillmark/plans/FINDINGS.md` | Reference URLs, observations, direction decisions (append or update sections) |
| Progress | `.stillmark/plans/PROGRESS.md` | What was built, verified, and corrected |
| Task plan | `.stillmark/plans/TASK_PLAN.md` | Design tasks and acceptance criteria via Stillmark CLI |
| Roadmap | `ROADMAP.md` | Only when milestones or long-term scope change |

Commands (project root, `--json`):

```bash
stillmark plan add "<design task with acceptance criteria>" --json
stillmark long-running apply "<in-scope design change>" --json --accept-scope-change
stillmark classify "<ambiguous request>" --json
```

Create `FINDINGS.md` / `PROGRESS.md` if missing (local, gitignored under `.stillmark/`). Use `DESIGN.md` at project or surface level when the team needs a durable token and pattern spec; it does not replace the four trackers.

Planning is **optional** for a single quick fix; when design is part of the current delivery, add tasks with `stillmark plan add` (acceptance criteria in the description) or `stillmark roadmap add` for later visual milestones. The same `stillmark classify` / `stillmark add` rules apply to design wording.

### Phase 3 - Implement

1. Implement the **full** surface per the direction and stack conventions.
2. Preserve existing design system during refinement; replace identity only on explicit redesign.
3. Avoid default AI UI patterns unless they serve the product (see `reference/craft-floor.md`).
4. Use real functionality; no fake controls or fabricated social proof.
5. Optional delegation: implementation subagent with frozen direction doc; primary agent integrates and owns consistency.

### Phase 4 - Run and inspect (bounded)

When the app can run and browser tools exist:

1. Start or use the dev server for the target surface.
2. **One inspection round:** desktop and mobile (or two widths) together.
3. Check hierarchy, overflow, spacing, type, images, focus, key interactions, empty/error states if reachable.
4. Compare against Phase 1 decisions and craft floor.
5. **One correction batch** for all defects found; optional **one** confirm pass, then stop.

Apply [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) as a secondary checklist when useful (see `reference/external-tools.md`).

### Phase 5 - Persist and report

1. Append outcomes to `.stillmark/plans/PROGRESS.md` (what shipped, what was verified, known gaps).
2. Update `FINDINGS.md` only if new durable design knowledge appeared.
3. Report to the user in plain language: direction summary, references used, files touched, verification done.

## Dispatch (via `/stillmark`)

| User says | Do |
|-----------|-----|
| `/stillmark design` alone | Ask what surface **only if** nothing is inferable from chat, files, or browser selection |
| `/stillmark design <surface>` | Full pipeline, scaled to scope |
| `/stillmark <critique>` + browser element | Map DOM to source; phases 0, 3, 4 typical |
| `/stillmark research …` / `verify …` with `design` context | Phases as named in the stillmark skill |

## Modes (pick one per surface)

- **Persuade:** marketing, landing, pricing - action and clarity first.
- **Operate:** apps, dashboards, settings - scanability and consistency.
- **Read:** docs and articles - structure and reading rhythm.
- **Experience:** portfolios and showcases - artifact leads.

## Long-running and delegation

During multi-step execution, treat design scope changes like any Stillmark plan change:

```bash
stillmark long-running apply "<description>" --json
```

Delegate in parallel when the host supports subagents and tasks are independent:

| Role | Deliverable |
|------|-------------|
| Research | Completed research template with live inspection notes |
| UX | Flows, states, edge cases |
| Systems | Token and component proposal |
| Build | PR-ready code for one surface |
| Critique | Defect list from browser inspection |

Integrate deliberately; avoid conflicting edits. Subagent output is input, not a substitute for direction or final inspection.

## Optional external skills

Impeccable, UI/UX Pro Max, and similar tools are **optional amplifiers**. See `reference/external-tools.md`. Do not duplicate their licensed prose; invoke them when installed and appropriate.

## Never

- Ship a URL list and immediately code without a direction.
- Copy a competitor layout, identity, or assets.
- Replace an established project design system without a redesign brief.
- Commit or push without explicit user grant.
- Run open-ended polish loops after two inspection passes.

## Skill files in this repo

```
skills/stillmark-design/
  SKILL.md
  reference/craft-floor.md
  reference/research-template.md
  reference/external-tools.md
```

Installed into the consumer project by `stillmark install --agent cursor|claude` under `.cursor/skills/stillmark-design/` or `.claude/skills/stillmark-design/`.
