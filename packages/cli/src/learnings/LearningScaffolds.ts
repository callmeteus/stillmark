/**
 * Starter markdown for `.stillmark/learnings/*` (Cursor-rules style, one topic per file).
 */
export const LEARNINGS_DESIGN_OVERVIEW = `# Design learnings

Stable visual decisions for this repo. Add more \`.md\` files in this folder (one concern per file), like Cursor rules.

## How to use

- Capture tokens, layout habits, component patterns, and "do / do not" after real UI work.
- Keep files short and scannable; link out to Figma or docs when needed.
- When \`stillmark config set --design-system=true\`, this folder may be committed for the team.
`;

export const LEARNINGS_CODE_STYLE_OVERVIEW = `# Code style learnings

Stable coding conventions for this repo. Add more \`.md\` files in this folder (one concern per file), like Cursor rules.

## Commits

Stillmark infers commit subject prefixes from recent \`git log\` unless \`git.commitMessage\` is set in \`stillmark.config.json\`. Preview with \`stillmark git commit-style\`.

## How to use

- Record naming, formatting, test habits, and review notes the agent should reuse.
- Prefer examples over abstract rules.
`;
