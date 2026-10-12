import fs from "node:fs";

import {
    findPlanTask,
    findRoadmapItem,
    parseRoadmap,
    parseTaskPlan,
    spliceLines
} from "../documents";
import { insertAfterLine } from "../documents/Splice";
import type { OperationResult } from "../results/OperationResult";
import type { ProjectPaths } from "../paths/ProjectPaths";
import { addPlanTask } from "./PlanOperations";
import { addRoadmapItem } from "./RoadmapOperations";

function collectDependents(
    plan: ReturnType<typeof parseTaskPlan>,
    itemId: string
): string[] {
    const deps: string[] = [];

    for (const task of plan.tasks) {
        if (task.depends.includes(itemId)) {
            deps.push(task.id);
        }
    }

    return deps;
}

/**
 * Move item from roadmap to plan.
 */
export async function moveToPlan(
    paths: ProjectPaths,
    query: string,
    confirm = false
): Promise<OperationResult> {
    const raw = fs.readFileSync(paths.roadmap, "utf8");
    const doc = parseRoadmap(raw);
    const item = findRoadmapItem(doc, query);

    if (!item) {
        return { ok: false, changed: false, summary: "Roadmap item not found" };
    }

    const addResult = addPlanTask(paths, {
        description: item.title,
        acceptScopeChange: confirm
    });

    if (!addResult.ok || !addResult.itemId) {
        return addResult;
    }

    const verify = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8"));
    const created = findPlanTask(verify, addResult.itemId);

    if (!created) {
        return {
            ok: false,
            changed: false,
            summary: "Destination write verification failed"
        };
    }

    const planWithStatus = fs.readFileSync(paths.taskPlan, "utf8");
    const statusUpdated = planWithStatus.replace(
        new RegExp(`(### ${addResult.itemId}[^\n]*\n)status: pending`, "m"),
        `$1status: pending-approval`
    );
    fs.writeFileSync(paths.taskPlan, statusUpdated, "utf8");

    const reference = `- _Moved to plan as ${addResult.itemId}_`;
    const removed = spliceLines(raw, item.itemSpan, reference);
    fs.writeFileSync(paths.roadmap, removed, "utf8");

    return {
        ok: true,
        changed: true,
        action: "move to plan",
        itemId: addResult.itemId,
        summary: `Moved ${item.id} to plan as ${addResult.itemId}`
    };
}

/**
 * Move item from plan to roadmap (strips private verification).
 */
export async function moveToRoadmap(
    paths: ProjectPaths,
    query: string,
    confirm = false,
    gitRunner?: import("../git").GitRunner
): Promise<OperationResult> {
    const planRaw = fs.readFileSync(paths.taskPlan, "utf8");
    const plan = parseTaskPlan(planRaw);
    const task = findPlanTask(plan, query);

    if (!task) {
        return { ok: false, changed: false, summary: "Plan task not found" };
    }

    const dependents = collectDependents(plan, task.id);

    if (dependents.length > 0 && !confirm) {
        return {
            ok: false,
            changed: false,
            requiresConfirm: true,
            dependentsAffected: dependents,
            summary: "Move affects dependent tasks; pass --confirm"
        };
    }

    const addResult = await addRoadmapItem(paths, {
        description: task.title,
        priority: task.priority,
        privatePlanRaw: planRaw,
        gitRunner
    });

    if (!addResult.ok || !addResult.itemId) {
        return addResult;
    }

    const verify = parseRoadmap(fs.readFileSync(paths.roadmap, "utf8"));
    const created = findRoadmapItem(verify, addResult.itemId);

    if (!created) {
        return {
            ok: false,
            changed: false,
            summary: "Destination write verification failed"
        };
    }

    const reference = `- ${task.id} moved to roadmap as ${addResult.itemId}`;
    let removed = spliceLines(planRaw, task.blockSpan, "");
    const docAfter = parseTaskPlan(removed);

    if (docAfter.historySpan) {
        removed = insertAfterLine(
            removed,
            docAfter.historySpan.endLine - 2,
            reference
        );
    } else {
        removed = `${removed.trimEnd()}\n\n## History\n${reference}\n`;
    }

    fs.writeFileSync(paths.taskPlan, removed, "utf8");

    return {
        ok: true,
        changed: true,
        action: "move to roadmap",
        itemId: addResult.itemId,
        summary: `Moved ${task.id} to roadmap as ${addResult.itemId}`,
        git: addResult.git
    };
}
