# Design mixed mode

Use when `stillmark design … --json` returns `mode: "mixed"`: free-text briefs, `polish`, browser selection on the local preview, or routine UI fixes that are not a full `create` or `review`-only run.

## Blend

1. **Implement** with the taste and anti-slop rules from `reference/design-create.md` (macrostructure and theme only as needed for the scope; do not rip apart unrelated pages).
2. Map DOM selection to project source; stay inside what the user described.
3. **Review pass** using the checklist in `reference/design-review.md` on the touched surface only (quick critique, not a full audit unless the change was large).
4. **Verify** with `reference/craft-floor.md` and one browser pass (desktop + narrow width).

## When to escalate mode

| Situation | Run instead |
|-----------|-------------|
| Brand-new page or major section from a brief | `stillmark design create "<brief>" --json` |
| User wants diagnosis only | `stillmark design audit|critique "<surface>" --json` |
| Selection on preview + casual complaint | Stay mixed; default to polish scope on that component |

## Planning

Multi-step UI: `stillmark plan add "Design: …" --acceptance "…" --json`. Long-horizon visual work: `roadmap add`.
