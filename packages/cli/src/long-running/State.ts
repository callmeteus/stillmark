import fs from "node:fs";
import path from "node:path";

import { parseTaskPlan, PriorityOrder } from "../documents";
import type { ProjectPaths } from "../paths/ProjectPaths";
import { addPlanTask } from "../operations/PlanOperations";
import type { OperationResult } from "../results/OperationResult";

export interface LongRunningState {
    revision: number;
    activeTaskId: string | null;
    completed: string[];
    journal: { at: string; message: string }[];
}

function defaultState(): LongRunningState {
    return {
        revision: 0,
        activeTaskId: null,
        completed: [],
        journal: []
    };
}

/**
 * Load STATE.json or default.
 */
export function loadState(paths: ProjectPaths): LongRunningState {
    if (!fs.existsSync(paths.state)) {
        return defaultState();
    }

    const raw = fs.readFileSync(paths.state, "utf8");

    return JSON.parse(raw) as LongRunningState;
}

/**
 * Atomic write STATE.json.
 */
export function saveState(paths: ProjectPaths, state: LongRunningState): void {
    fs.mkdirSync(paths.planningDir, { recursive: true });
    const tmp = path.join(paths.planningDir, "STATE.json.tmp");
    const next = { ...state, revision: state.revision + 1 };

    fs.writeFileSync(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    fs.renameSync(tmp, paths.state);
}

const PRIORITY_ORDER: Record<string, number> = PriorityOrder;

/**
 * Pick next actionable task id.
 */
export function resolveNextActionableTask(
    paths: ProjectPaths,
    state: LongRunningState
): string | null {
    if (!fs.existsSync(paths.taskPlan)) {
        return null;
    }

    const plan = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8"));
    const done = new Set(state.completed.map((id) => id.toLowerCase()));

    const candidates = plan.tasks
        .filter((t) => {
            const status = t.status.toLowerCase();

            if (["done", "completed", "cancelled"].includes(status)) {
                return false;
            }

            if (t.blockedBy.length > 0) {
                return false;
            }

            for (const dep of t.depends) {
                if (!done.has(dep.toLowerCase())) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            const pa = PRIORITY_ORDER[a.priority.toLowerCase()] ?? 2;
            const pb = PRIORITY_ORDER[b.priority.toLowerCase()] ?? 2;

            return pa - pb;
        });

    return candidates[0]?.id ?? null;
}

export interface ApplyPlanChangeInput {
    description: string;
    acceptScopeChange?: boolean;
}

/**
 * Apply authorized plan change during long-running execution.
 */
export function applyPlanChange(
    paths: ProjectPaths,
    input: ApplyPlanChangeInput
): OperationResult {
    const state = loadState(paths);
    const result = addPlanTask(paths, {
        description: input.description,
        acceptScopeChange: input.acceptScopeChange
    });

    if (!result.ok) {
        return result;
    }

    const nextId = resolveNextActionableTask(paths, state);
    const active =
        state.activeTaskId && state.completed.includes(state.activeTaskId)
            ? nextId
            : state.activeTaskId ?? nextId;

    saveState(paths, {
        ...state,
        activeTaskId: active,
        journal: [
            ...state.journal,
            {
                at: new Date().toISOString(),
                message: result.summary ?? "plan change"
            }
        ]
    });

    return {
        ...result,
        summary: `${result.summary}; next actionable: ${active ?? "none"}`
    };
}
