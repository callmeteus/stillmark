# Design review mode

Use only when `stillmark design … --json` returns `mode: "review"` (`review`, `critique`, `audit`). Goal: **structured diagnosis** of existing UI quality. **Do not edit source** unless the user explicitly asks to fix items afterward.

## Audit (full surface)

Ranked punch list. For each issue:

1. What reads wrong or template-default.
2. Why it fails the brief, `DESIGN.md`, or project learnings.
3. Smallest fix direction (no implementation yet).

Score against `reference/craft-floor.md` and the review checklist below.

## Critique (opinionated review)

Shorter than audit when scope is one flow or component:

- **Works:** what already matches the product and tokens.
- **Tells:** what reads as generated or off-brand.
- **Top three:** changes that would matter most (ordered).
- **Risk:** accessibility, honesty, or states the surface skips.

## Review checklist (interface craft)

Work through what applies; skip N/A sections.

- **Hierarchy:** can you read display, body, and label roles in two seconds?
- **Typography:** pairing, scale steps, line length, placeholder contrast.
- **Colour and surfaces:** contrast on real backgrounds, not gray-on-tint alone; accent discipline.
- **Layout:** spacing above headings vs below; grouping of related controls; responsive at one narrow width.
- **Components:** buttons and links name outcomes; focus-visible on every interactive element.
- **Forms:** labels, errors (what happened + what to do), disabled and loading states.
- **Motion:** purposeful or absent; reduced-motion respected.
- **Copy:** no fake social proof, metrics, or dead controls presented as live.
- **Performance and polish:** layout shift, heavy decoration without purpose, unregistered icon names in DS components.

When the [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) are available, use them as a second lens after this checklist.

## After review

Stop when the list is delivered. If the user says to fix, switch to `stillmark design "<scope>" --json` (mixed) or scoped polish in chat, then implement.
