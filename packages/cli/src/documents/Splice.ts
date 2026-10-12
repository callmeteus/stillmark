import type { LineSpan } from "./types";

/**
 * Replace a line span in source text with new content.
 */
export function spliceLines(
    raw: string,
    span: LineSpan,
    replacement: string
): string {
    const lines = raw.split(/\r?\n/);
    const before = lines.slice(0, span.startLine);
    const after = lines.slice(span.endLine);
    const insert = replacement === "" ? [] : replacement.split(/\r?\n/);

    return [...before, ...insert, ...after].join("\n");
}

/**
 * Insert lines after a given line index (0-based). Use -1 to prepend at file start.
 */
export function insertAfterLine(
    raw: string,
    afterLineIndex: number,
    content: string
): string {
    const lines = raw.split(/\r?\n/);
    const insert = content === "" ? [] : content.split(/\r?\n/);
    const at = afterLineIndex + 1;

    return [...lines.slice(0, at), ...insert, ...lines.slice(at)].join("\n");
}

/**
 * Get next ID like R-001 or T-004 from existing IDs.
 */
export function nextId(prefix: "R" | "T", existing: string[]): string {
    let max = 0;

    for (const id of existing) {
        const match = /^[RT]-(\d+)$/.exec(id);

        if (match) {
            max = Math.max(max, Number.parseInt(match[1], 10));
        }
    }

    const next = max + 1;

    return `${prefix}-${String(next).padStart(3, "0")}`;
}
