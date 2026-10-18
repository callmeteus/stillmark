import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { checkText, restoreText, rewriteText, textRules } from "../text";

const USAGE = "Usage: stillmark text check <file>|\"<text>\" | rewrite <file> | restore <file> | rules [--language=<tag>]";

/**
 * `stillmark text check | rewrite | restore | rules`: clearer prose without the marks of generated text.
 */
export function runTextCommand(
    paths: ProjectPaths,
    positional: string[],
    flags: Record<string, string | boolean>
): OperationResult {
    const sub = positional[1];
    const target = positional.slice(2).join(" ") || undefined;
    const options = { language: flags.language === undefined ? undefined : String(flags.language) };

    if (sub === "check") {
        return checkText(paths, target, options);
    }

    if (sub === "rewrite") {
        return rewriteText(paths, target, options);
    }

    if (sub === "restore") {
        return restoreText(paths, target);
    }

    if (sub === "rules") {
        return textRules(paths, options);
    }

    return { ok: false, changed: false, summary: USAGE };
}
