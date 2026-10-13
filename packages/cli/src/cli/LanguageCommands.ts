import { isLanguageTarget, LanguageTargets, normalizeLanguageTag, type LanguageTarget } from "../config";
import { setConfigLanguage } from "../operations";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

/**
 * `stillmark config set --language=<tag>|inherit [--module=<target>]`.
 */
export function runConfigSetLanguage(paths: ProjectPaths, flags: Record<string, string | boolean>): OperationResult {
    const raw = String(flags.language).trim();
    const tag = raw.toLowerCase() === "inherit" ? "inherit" : normalizeLanguageTag(raw);
    const target = flags.module === undefined ? undefined : String(flags.module).toLowerCase();

    if (tag === undefined || (target !== undefined && !isLanguageTarget(target))) {
        return {
            ok: false,
            changed: false,
            summary: `Usage: stillmark config set --language=<tag such as en or pt-BR>|inherit [--module=${LanguageTargets.join("|")}]`
        };
    }

    return setConfigLanguage(paths, { tag, target: target as LanguageTarget | undefined });
}
