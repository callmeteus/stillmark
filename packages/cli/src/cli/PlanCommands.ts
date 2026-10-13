import fs from "node:fs";

import { splitDetailLines } from "../config";
import { isPriority, Priorities } from "../documents";
import { readPlanScope, setPlanScope } from "../operations";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

/**
 * Normalized `--priority`, `undefined` when absent, or an error result when the value is not accepted.
 */
export function priorityFlag(
    flags: Record<string, string | boolean>
): { priority?: string; error?: OperationResult } {
    if (flags.priority === undefined) {
        return {};
    }

    const value = String(flags.priority).toLowerCase();

    if (!isPriority(value)) {
        return {
            error: {
                ok: false,
                changed: false,
                summary: `Unknown priority "${String(flags.priority)}". Use ${Priorities.join(", ")}`
            }
        };
    }

    return { priority: value };
}

/**
 * True when the command line carries objective or scope flags.
 */
export function hasScopeFlags(flags: Record<string, string | boolean>): boolean {
    return flags.objective !== undefined || flags.inScope !== undefined || flags.outOfScope !== undefined;
}

/**
 * `stillmark plan scope [--objective] [--in-scope] [--out-of-scope] [--replace]`; no flags shows the scope.
 */
export function runPlanScope(paths: ProjectPaths, flags: Record<string, string | boolean>): OperationResult {
    if (!hasScopeFlags(flags) && fs.existsSync(paths.taskPlan)) {
        const scope = readPlanScope(fs.readFileSync(paths.taskPlan, "utf8"));

        return {
            ok: true,
            changed: false,
            action: "plan scope",
            summary: `Objective: ${scope.objective || "(not set)"}; in scope: ${scope.inScope.join(" | ") || "(none)"}; out of scope: ${scope.outOfScope.join(" | ") || "(none)"}`,
            scope
        } as OperationResult & { scope: typeof scope };
    }

    return setPlanScope(paths, {
        objective: flags.objective as string | undefined,
        inScope: flags.inScope === undefined ? undefined : splitDetailLines(String(flags.inScope)),
        outOfScope: flags.outOfScope === undefined ? undefined : splitDetailLines(String(flags.outOfScope)),
        replace: Boolean(flags.replace)
    });
}
