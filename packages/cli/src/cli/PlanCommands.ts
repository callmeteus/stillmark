import fs from "node:fs";

import { splitDetailLines } from "../config";
import { isPriority, Priorities } from "../documents";
import {
    addPlanTask,
    initTaskPlan,
    isPlanStatus,
    PlanStatuses,
    readPlanScope,
    setPlanScope,
    updatePlanTask
} from "../operations";
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

function setPlanStatus(paths: ProjectPaths, query: string, status: string): OperationResult {
    if (!isPlanStatus(status)) {
        return {
            ok: false,
            changed: false,
            summary: `Unknown status "${status}". Use ${PlanStatuses.join(", ")}`
        };
    }

    return updatePlanTask(paths, { query, status });
}

/**
 * `stillmark plan <init|scope|add|done|status|phase|priority|blocked>`; no subcommand shows the plan.
 */
export function runPlanCommand(
    paths: ProjectPaths,
    positional: string[],
    flags: Record<string, string | boolean>
): OperationResult {
    const sub = positional[1];
    const task = positional[2];
    const rest = positional.slice(3).join(" ");

    if (sub === "init") {
        const init = initTaskPlan(paths, positional.slice(2).join(" ") || undefined);

        return init.ok && hasScopeFlags(flags) ? runPlanScope(paths, flags) : init;
    }

    if (sub === "scope") {
        return runPlanScope(paths, flags);
    }

    if (sub === "add" && task) {
        return addPlanTask(paths, {
            description: positional.slice(2).join(" "),
            acceptScopeChange: Boolean(flags.acceptScopeChange),
            details: splitDetailLines(flags.details as string | undefined),
            acceptance: splitDetailLines(flags.acceptance as string | undefined),
            verification: splitDetailLines(flags.verification as string | undefined),
            priority: priorityFlag(flags).priority,
            phase: flags.phase === undefined ? undefined : String(flags.phase)
        });
    }

    if (sub === "done" && task) {
        return setPlanStatus(paths, task, "done");
    }

    if (sub === "status" && task && rest) {
        return setPlanStatus(paths, task, rest.toLowerCase());
    }

    if (sub === "phase" && task && rest) {
        return updatePlanTask(paths, { query: task, phase: rest });
    }

    if (sub === "priority" && task && rest) {
        const value = rest.toLowerCase();

        return isPriority(value)
            ? updatePlanTask(paths, { query: task, priority: value })
            : priorityFlag({ priority: value }).error as OperationResult;
    }

    if (sub === "blocked" && task && rest) {
        return updatePlanTask(paths, { query: task, blockedBy: rest });
    }

    return {
        ok: true,
        changed: false,
        summary: fs.existsSync(paths.taskPlan)
            ? fs.readFileSync(paths.taskPlan, "utf8").slice(0, 2000)
            : "No TASK_PLAN.md"
    };
}
