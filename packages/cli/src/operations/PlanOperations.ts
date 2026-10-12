import fs from "node:fs";

import {
    allPlanTaskIds,
    findPlanTask,
    hasOpenPlanTasks,
    insertAfterLine,
    nextId,
    parseTaskPlan,
    spliceLines
} from "../documents";
import {
    compactDetailsMessage,
    loadConfig,
    resolveDetailLevel,
    type DetailLevel
} from "../config";
import { findDuplicatePlan, checkPlanScope } from "../guards";
import type { OperationResult } from "../results/OperationResult";
import type { ProjectPaths } from "../paths/ProjectPaths";

export interface AddPlanOptions {
    description: string;
    acceptScopeChange?: boolean;
    priority?: string;
    /**
     * Free-text detail lines under the task fields; requires plan detail `extended`.
     */
    details?: string[];
    /**
     * Acceptance criteria bullets; replaces the `(define)` placeholder.
     */
    acceptance?: string[];
    /**
     * Verification bullets; replaces the `(define)` placeholder.
     */
    verification?: string[];
}

function bulletList(items: string[]): string {
    return (items.length > 0 ? items : ["(define)"]).map((item) => `- ${item}`).join("\n");
}

/**
 * Compact tasks keep only the header and fields, plus criteria sections when criteria were given;
 * extended tasks always add details and both criteria sections.
 */
function formatPlanTask(
    id: string,
    title: string,
    priority: string,
    detail: DetailLevel,
    options: Pick<AddPlanOptions, "details" | "acceptance" | "verification">
): string {
    const details = options.details ?? [];
    const acceptance = options.acceptance ?? [];
    const verification = options.verification ?? [];
    const header = `### ${id} ${title}
status: pending
priority: ${priority}
`;

    if (detail === "compact" && acceptance.length === 0 && verification.length === 0) {
        return header;
    }

    const detailBlock = details.length > 0 ? `\n${details.join("\n")}\n` : "";

    return `${header}${detailBlock}
#### Acceptance criteria
${bulletList(acceptance)}

#### Verification
${bulletList(verification)}
`;
}

const DEFAULT_PLAN = `# Task plan

## Objective

(Not set)

## Scope

### In scope

- (define)

### Out of scope

- (define)

## Tasks

## History

`;

/**
 * Initialize TASK_PLAN.md if missing.
 */
export function initTaskPlan(
    paths: ProjectPaths,
    objective?: string,
    force = false
): OperationResult {
    fs.mkdirSync(paths.planningDir, { recursive: true });

    if (fs.existsSync(paths.taskPlan)) {
        const existing = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8"));

        if (hasOpenPlanTasks(existing) && !force) {
            return {
                ok: false,
                changed: false,
                summary:
                    "Active plan has open tasks; finish or archive before re-init"
            };
        }
    }

    let content = DEFAULT_PLAN;

    if (objective) {
        content = content.replace("(Not set)", objective);
    }

    fs.writeFileSync(paths.taskPlan, content, "utf8");

    return {
        ok: true,
        changed: true,
        action: "plan init",
        location: paths.taskPlan
    };
}

/**
 * Add task to active plan.
 */
export function addPlanTask(
    paths: ProjectPaths,
    options: AddPlanOptions
): OperationResult {
    if (!fs.existsSync(paths.taskPlan)) {
        return {
            ok: false,
            changed: false,
            summary: "No TASK_PLAN.md; use plan init or move from roadmap"
        };
    }

    const detail = resolveDetailLevel(loadConfig(paths).detail, "plan");
    const details = options.details ?? [];

    if (details.length > 0 && detail === "compact") {
        return {
            ok: false,
            changed: false,
            action: "plan add",
            summary: compactDetailsMessage("plan")
        };
    }

    const raw = fs.readFileSync(paths.taskPlan, "utf8");
    const doc = parseTaskPlan(raw);
    const duplicateOf = findDuplicatePlan(doc, options.description);

    if (duplicateOf) {
        return {
            ok: false,
            changed: false,
            duplicateOf,
            action: "plan add"
        };
    }

    const scope = checkPlanScope(doc, options.description);

    if (!scope.allowed && !options.acceptScopeChange) {
        return {
            ok: false,
            changed: false,
            outOfScope: scope.reason === "outOfScope",
            scopeMessage: scope.message,
            alternatives: scope.alternatives,
            action: "plan add"
        };
    }

    const id = nextId("T", allPlanTaskIds(doc));
    const priority = options.priority ?? "medium";
    const block = formatPlanTask(id, options.description, priority, detail, options);
    const lines = raw.split(/\r?\n/);
    let tasksHeader = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase() === "## tasks") {
            tasksHeader = i;
            break;
        }
    }

    if (tasksHeader < 0) {
        return { ok: false, changed: false, summary: "## Tasks section missing" };
    }

    let insertAt = tasksHeader;

    if (doc.tasks.length > 0) {
        insertAt = doc.tasks[doc.tasks.length - 1].blockSpan.endLine - 1;
    }

    const updated = insertAfterLine(raw, insertAt, block);
    fs.writeFileSync(paths.taskPlan, updated, "utf8");

    return {
        ok: true,
        changed: true,
        action: "plan add",
        itemId: id,
        location: paths.taskPlan,
        summary: `Added ${id} to task plan`
    };
}

export interface UpdatePlanOptions {
    query: string;
    priority?: string;
    status?: string;
    blockedBy?: string;
}

/**
 * Update plan task fields in place.
 */
export function updatePlanTask(
    paths: ProjectPaths,
    options: UpdatePlanOptions
): OperationResult {
    const raw = fs.readFileSync(paths.taskPlan, "utf8");
    const doc = parseTaskPlan(raw);
    const task = findPlanTask(doc, options.query);

    if (!task) {
        return { ok: false, changed: false, summary: "Task not found" };
    }

    const lines = raw.split(/\r?\n/);
    const start = task.blockSpan.startLine;
    const end = task.blockSpan.endLine;
    const blockLines = lines.slice(start, end);

    for (let i = 0; i < blockLines.length; i++) {
        if (options.priority && blockLines[i].startsWith("priority:")) {
            blockLines[i] = `priority: ${options.priority}`;
        }

        if (options.status && blockLines[i].startsWith("status:")) {
            blockLines[i] = `status: ${options.status}`;
        }

        if (options.blockedBy && blockLines[i].startsWith("blocked-by:")) {
            blockLines[i] = `blocked-by: ${options.blockedBy}`;
        } else
        if (options.blockedBy && blockLines[i].startsWith("status:")) {
            blockLines.splice(i + 1, 0, `blocked-by: ${options.blockedBy}`);
        }
    }

    const replacement = blockLines.join("\n");
    const updated = spliceLines(raw, task.blockSpan, replacement);
    fs.writeFileSync(paths.taskPlan, updated, "utf8");

    return {
        ok: true,
        changed: true,
        action: "plan update",
        itemId: task.id,
        summary: `Updated ${task.id}`
    };
}
