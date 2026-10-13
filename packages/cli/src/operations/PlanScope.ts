import fs from "node:fs";

import { isPlanPlaceholder, parseTaskPlan } from "../documents";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

/**
 * Inputs for `stillmark plan scope`.
 */
export interface SetPlanScopeOptions {
    objective?: string;
    inScope?: string[];
    outOfScope?: string[];
    /**
     * Replace the given lists instead of appending to them.
     */
    replace?: boolean;
}

/**
 * Current objective and scope lists, placeholders excluded.
 */
export interface PlanScopePayload {
    objective: string;
    inScope: string[];
    outOfScope: string[];
}

function isHeading(line: string): boolean {
    return line.startsWith("## ") || line.startsWith("### ");
}

/**
 * Line range `[start, end)` of the body that follows `heading`, up to the next heading.
 */
function sectionBody(lines: string[], heading: string): { start: number; end: number } | null {
    const index = lines.findIndex((line) => line.trim().toLowerCase() === heading.toLowerCase());

    if (index < 0) {
        return null;
    }

    let end = index + 1;

    while (end < lines.length && !isHeading(lines[end])) {
        end++;
    }

    return { start: index + 1, end };
}

function rewriteList(lines: string[], heading: string, entries: string[], replace: boolean): string[] {
    const body = sectionBody(lines, heading);

    if (body === null) {
        throw new Error(`TASK_PLAN.md has no "${heading}" section`);
    }

    const current = replace
        ? []
        : lines.slice(body.start, body.end)
            .filter((line) => line.startsWith("- ") && !isPlanPlaceholder(line.slice(2)))
            .map((line) => line.slice(2).trim());
    const seen = new Set(current.map((entry) => entry.toLowerCase()));
    const merged = [...current];

    for (const entry of entries) {
        if (!seen.has(entry.toLowerCase())) {
            seen.add(entry.toLowerCase());
            merged.push(entry);
        }
    }

    const bullets = (merged.length > 0 ? merged : ["(define)"]).map((entry) => `- ${entry}`);

    return [...lines.slice(0, body.start), "", ...bullets, "", ...lines.slice(body.end)];
}

function rewriteObjective(lines: string[], objective: string): string[] {
    const body = sectionBody(lines, "## Objective");

    if (body === null) {
        throw new Error("TASK_PLAN.md has no \"## Objective\" section");
    }

    return [...lines.slice(0, body.start), "", objective, "", ...lines.slice(body.end)];
}

/**
 * Read the plan objective and scope.
 */
export function readPlanScope(raw: string): PlanScopePayload {
    const doc = parseTaskPlan(raw);

    return { objective: doc.objective, inScope: doc.inScope, outOfScope: doc.outOfScope };
}

/**
 * Sets the objective and adds (or replaces) in-scope and out-of-scope entries in TASK_PLAN.md.
 * `(define)` / `(Not set)` placeholders are dropped as soon as real entries arrive.
 */
export function setPlanScope(
    paths: ProjectPaths,
    options: SetPlanScopeOptions
): OperationResult & { scope: PlanScopePayload } {
    if (!fs.existsSync(paths.taskPlan)) {
        return {
            ok: false,
            changed: false,
            action: "plan scope",
            summary: "No TASK_PLAN.md; run stillmark plan init first",
            scope: { objective: "", inScope: [], outOfScope: [] }
        };
    }

    const raw = fs.readFileSync(paths.taskPlan, "utf8");
    const replace = Boolean(options.replace);
    let lines = raw.split(/\r?\n/);

    if (options.objective !== undefined && options.objective.trim() !== "") {
        lines = rewriteObjective(lines, options.objective.trim());
    }

    if (options.inScope !== undefined && (options.inScope.length > 0 || replace)) {
        lines = rewriteList(lines, "### In scope", options.inScope, replace);
    }

    if (options.outOfScope !== undefined && (options.outOfScope.length > 0 || replace)) {
        lines = rewriteList(lines, "### Out of scope", options.outOfScope, replace);
    }

    const updated = lines.join("\n").replace(/\n{3,}/g, "\n\n");
    const changed = updated !== raw;

    if (changed) {
        fs.writeFileSync(paths.taskPlan, updated, "utf8");
    }

    const scope = readPlanScope(updated);

    return {
        ok: true,
        changed,
        action: "plan scope",
        summary: `Objective: ${scope.objective || "(not set)"}; in scope: ${scope.inScope.length}; out of scope: ${scope.outOfScope.length}`,
        location: paths.taskPlan,
        scope
    };
}
