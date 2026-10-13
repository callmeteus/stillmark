import fs from "node:fs";
import path from "node:path";

import type { OperationResult } from "./OperationResult";

/**
 * Builds a clickable markdown link to an absolute file path.
 * Forward slashes and URI encoding keep Windows paths with spaces clickable in chat UIs.
 */
export function fileLink(file: string): string {
    const target = encodeURI(path.resolve(file).replace(/\\/g, "/"));

    return `[${path.basename(file)}](${target})`;
}

/**
 * Adds `location` (when missing) and `link` to a result that points at a single existing document.
 */
export function withFileLink(result: OperationResult, fallback?: string): OperationResult {
    const location = result.location ?? fallback;

    if (!location || location.includes(", ") || !fs.existsSync(location) || !fs.statSync(location).isFile()) {
        return result;
    }

    return { ...result, location, link: fileLink(location) };
}
