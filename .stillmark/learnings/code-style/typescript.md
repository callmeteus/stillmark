# TypeScript style

- 4-space indentation, double quotes, semicolons.
- Line break before every `else if`:

```ts
if (a) {
    // ...
} else
if (b) {
    // ...
}
```

- Explicit return types on every function (`@typescript-eslint/explicit-function-return-type` is an error); no `any`; unused args start with `_`.
- Lint runs with `--max-warnings=0`: a warning fails CI.
- TSDoc on exported functions, interfaces, and constants. Comments state constraints, not history.
- Exported constants in PascalCase (`PlanStatuses`, `AttributionHookMarker`).
- Relative imports without `.js` or `/index`; cross-module imports go through the folder barrel (`from "../documents"`).
- Files in PascalCase inside kebab-case folders; `src/` root holds only `index.ts`. Keep files under 700 lines (split `Cli.ts` branches into `*Commands.ts`).
- Blank line between a declaration and the `if` that uses it, and around control-flow blocks.
- Blank line after `{` before the first member of an `interface` (including Astro `interface Props`), same as expanded object literals.
- No em dash anywhere; use a hyphen.
