/**
 * Leading YAML frontmatter block.
 */
export const FRONTMATTER_RE = /^---\n[\s\S]*?\n---(?:\n|$)/;

/**
 * Fenced code block (backticks or tildes), from the opening fence to the matching closing one.
 */
export const FENCE_RE = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;

/**
 * Markdown ATX heading line.
 */
export const HEADING_RE = /^#{1,6}[ \t]+.+$/gm;

/**
 * Inline code span on a single line.
 */
export const INLINE_CODE_RE = /`[^`\n]+`/g;

/**
 * Absolute http(s) URL.
 */
export const URL_RE = /https?:\/\/[^\s)>\]"'`]+/g;

/**
 * Markdown link target; group 1 is the target.
 */
export const LINK_TARGET_RE = /\]\(([^)\s]+)/g;

/**
 * File path with at least one folder and an extension (`src/cli/Cli.ts`).
 */
export const PATH_RE = /(?:[\w@~.-]+[\\/])+[\w@.-]+\.[a-z0-9]+/gi;

/**
 * Converts CRLF line endings to LF.
 */
export function normalizeNewlines(text: string): string {
    return text.replace(/\r\n/g, "\n");
}

/**
 * Distinct trimmed matches of a regex (or of one of its groups), in order of appearance.
 */
export function uniqueMatches(text: string, re: RegExp, group = 0): string[] {
    return [...new Set([...text.matchAll(re)].map((match) => match[group].trim()))];
}
