# Craft floor (Stillmark design)

Read this immediately before editing UI source, after `reference/design-pipeline.md` when you are in design mode. Project `DESIGN.md`, `PRODUCT.md`, and surface briefs override generic habits.

## Verify (one batched round)

- **Contrast:** body text and placeholders meet WCAG contrast for the surface; do not rely on gray alone on tinted backgrounds.
- **Measure:** body copy stays within a comfortable line length; display type has a clear step down from hero to section to UI.
- **Spacing:** more space above a heading than below; related controls group tightly; sections breathe apart.
- **States:** hover, focus-visible, disabled, loading, error, empty where the surface can reach them.
- **Responsive:** inspect at least one narrow and one wide width in the same pass as desktop.
- **Copy:** controls name outcomes; errors say what happened and what to do next.
- **Honesty:** no fake metrics, testimonials, charts, or dead controls presented as live.

## Refuse as default (unless the brief earns it)

- Purple or blue gradients with no product reason.
- Same hero + three cards + gradient CTA for every site.
- Nested cards, decorative glass, or hard offset shadows without a chosen visual world.
- Emoji as iconography; unregistered icon names in design-system components.
- Copying a reference site's layout, identity, or distinctive assets wholesale.

## Motion

At most one purposeful motion moment per surface unless the brief demands more. Prefer ease-out from an already-readable default. Respect `prefers-reduced-motion`.

When every check passes, ship the committed direction. Do not open-ended polish.
