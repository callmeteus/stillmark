# Design create mode

Use only when `stillmark design … --json` returns `mode: "create"` (subcommands `create`, `build`, `study`, `redesign`). Goal: **new or rebuilt UI** that does not read as template-default generated layout.

## Study (when the brief includes a reference)

1. Inspect live when possible: layout bands, type roles, nav archetype, CTA shape, section rhythm.
2. Record macrostructure label, hero archetype, display/body/label roles, surface bands, accent usage, asymmetry.
3. Do not copy logos, photography, distinctive illustration, or verbatim copy. Do not mandate fonts by name from the reference.

## Build

1. Read `DESIGN.md`, `PRODUCT.md`, and design learnings. For a large surface, use `reference/research-template.md` in `.stillmark/plans/FINDINGS.md`.
2. **Macrostructure first:** section rhythm and hero archetype for the product mode (persuade, operate, read, experience). Do not repeat the same macrostructure as the last three major surfaces documented in this repo; vary nav archetype and section order on purpose.
3. **Theme:** pair display + body faces (never one family for both). Prefer OKLCH palettes with one anchor hue; accent under roughly five percent of the surface. Spacing scale on multiples of four. Voice matches `PRODUCT.md`.
4. **Enrich** with components and copy; refuse the anti-slop catalogue unless the brief earns an exception.
5. **Implement** in project source only.
6. **Verify** with `reference/craft-floor.md` and one browser pass (desktop + narrow width). At most one purposeful motion moment; respect `prefers-reduced-motion`.

## Redesign (create path)

Same content and honest data; **new structural fingerprint.**

1. Name current macrostructure and nav archetype.
2. Pick a deliberately different macrostructure and heading placement.
3. Rebuild; check against the anti-slop catalogue before shipping.

## Anti-slop catalogue

| Tell | Fix direction |
|------|----------------|
| Purple-to-blue or purple-to-pink gradient hero with centered white type | Solid or tinted neutrals; single accent; no decorative hero gradients |
| One generic sans for display and body | Distinct display + body pairing |
| Centered headline, body, and CTA in every section | Bias layout; break symmetry with intent |
| Identical icon-tile feature cards in a row | Vary size, alignment, or lead with type |
| Default AI nav (wordmark left, centered links, gradient pill CTA right) | Nav archetype that matches genre |
| Fake metrics, testimonials, or dead controls shown as live | Honest empty states and real copy |
| Sparkle or emoji as UI chrome | Project icon set, or none |

## Foundations

Type pairing, restrained colour, named spacing, ease-out motion with reduced-motion fallback, asymmetric layout bias when persuading, display/body/label hierarchy, restraint over decoration.
