import { parseTaskPlan } from "./ParseTaskPlan";
import type { PlanTask } from "./types";

/**
 * Heading of the generated checklist; always the last section of TASK_PLAN.md.
 */
export const PlanChecklistHeading = "## Checklist";

const CHECKLIST_NOTE =
    "<!-- Generated from task status by stillmark. Mark progress with `stillmark plan done <task>`; manual edits here are overwritten. -->";
const DONE_STATUSES = ["done", "completed"];
const UNPHASED_HEADING = "Unphased";

/**
 * Task statuses that close a task (checked in the checklist).
 */
export function isClosedPlanStatus(status: string): boolean {
    return [...DONE_STATUSES, "cancelled"].includes(status.toLowerCase());
}

function checklistLine(task: PlanTask): string {
    const label = task.phase ? `${task.phase} / ${task.id} - ${task.title}` : `${task.id} - ${task.title}`;
    const status = task.status.toLowerCase();

    if (status === "cancelled") {
        return `- [x] ~~${label}~~ (cancelled)`;
    }

    return `- [${DONE_STATUSES.includes(status) ? "x" : " "}] ${label}`;
}

/**
 * Render the checklist section body: one line per task, grouped under `###` phase headings when any task has a phase.
 */
export function renderPlanChecklist(tasks: PlanTask[]): string {
    const lines = [PlanChecklistHeading, "", CHECKLIST_NOTE, ""];

    if (tasks.length === 0) {
        lines.push("_No tasks yet._");

        return `${lines.join("\n")}\n`;
    }

    if (!tasks.some((task) => task.phase)) {
        lines.push(...tasks.map(checklistLine));

        return `${lines.join("\n")}\n`;
    }

    const groups = new Map<string, PlanTask[]>();

    for (const task of tasks) {
        const key = task.phase ?? UNPHASED_HEADING;
        groups.set(key, [...(groups.get(key) ?? []), task]);
    }

    const ordered = [...groups.keys()].filter((key) => key !== UNPHASED_HEADING);

    if (groups.has(UNPHASED_HEADING)) {
        ordered.push(UNPHASED_HEADING);
    }

    ordered.forEach((key, index) => {
        if (index > 0) {
            lines.push("");
        }

        lines.push(`### ${key}`, "", ...(groups.get(key) ?? []).map(checklistLine));
    });

    return `${lines.join("\n")}\n`;
}

/**
 * Replace (or append) the generated checklist so it reflects the current tasks; it always ends the file.
 */
export function withPlanChecklist(raw: string): string {
    const lines = raw.split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim().toLowerCase() === PlanChecklistHeading.toLowerCase());
    let body = raw;

    if (start >= 0) {
        let end = start + 1;

        while (end < lines.length && !lines[end].startsWith("## ")) {
            end += 1;
        }

        body = [...lines.slice(0, start), ...lines.slice(end)].join("\n");
    }

    const tasks = parseTaskPlan(body).tasks;

    return `${body.trimEnd()}\n\n${renderPlanChecklist(tasks)}`;
}
