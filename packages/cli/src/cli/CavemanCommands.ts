import { cavemanCompress, cavemanRestore, cavemanSession, cavemanStats, cavemanVerify } from "../caveman";
import { CavemanLevels, parseCavemanLevel } from "../config";
import { setConfigCaveman } from "../operations";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

const USAGE = "Usage: stillmark caveman [stats] | on|off|lite|full|ultra [--save] | compress <file> | verify <file> | restore <file>";

/**
 * `stillmark caveman [stats] | on|off|<level> [--save] | compress <file> | verify <file> | restore <file>`.
 * A bare level applies to the current conversation only; `--save` writes it to the config instead.
 */
export function runCavemanCommand(
    paths: ProjectPaths,
    positional: string[],
    flags: Record<string, string | boolean>
): OperationResult {
    const sub = positional[1];
    const file = positional.slice(2).join(" ") || undefined;
    const level = parseCavemanLevel(sub);

    if (sub === undefined || sub === "stats" || sub === "status") {
        return cavemanStats(paths);
    }

    if (level !== undefined && positional.length === 2) {
        return flags.save ? setConfigCaveman(paths, level) : cavemanSession(paths, level);
    }

    if (sub === "compress") {
        return cavemanCompress(paths, file);
    }

    if (sub === "verify") {
        return cavemanVerify(paths, file);
    }

    if (sub === "restore") {
        return cavemanRestore(paths, file);
    }

    return { ok: false, changed: false, summary: USAGE };
}

/**
 * `stillmark config set --caveman=off|lite|full|ultra` (`on` means `full`).
 */
export function runConfigSetCaveman(paths: ProjectPaths, flags: Record<string, string | boolean>): OperationResult {
    const level = parseCavemanLevel(flags.caveman);

    if (level === undefined) {
        return {
            ok: false,
            changed: false,
            summary: `Usage: stillmark config set --caveman=${CavemanLevels.join("|")}|on`
        };
    }

    return setConfigCaveman(paths, level);
}
