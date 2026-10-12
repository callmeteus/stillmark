import type { PlanTask, TaskPlanDocument } from "./types";

const TASK_HEADER_RE = /^### (T-\d+) (.+)$/;
const FIELD_RE =
    /^(status|priority|depends|blocked-by):\s*(.+)$/i;

/**
 * Parse `.stillmark/plans/TASK_PLAN.md`.
 */
export function parseTaskPlan(raw: string): TaskPlanDocument {
    const lines = raw.split(/\r?\n/);
    let objective = "";
    const inScope: string[] = [];
    const outOfScope: string[] = [];
    const tasks: PlanTask[] = [];
    let historySpan: { startLine: number; endLine: number } | null = null;

    let section: string | null = null;
    let scopeMode: "in" | "out" | null = null;
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith("## ")) {
            section = line.slice(3).trim().toLowerCase();
            scopeMode = null;

            if (section === "history") {
                historySpan = { startLine: i, endLine: lines.length };
            }

            i += 1;
            continue;
        }

        if (section === "objective" && line.trim() && !line.startsWith("#")) {
            objective = line.trim();
            i += 1;
            continue;
        }

        if (section === "scope") {
            if (line.startsWith("### In scope")) {
                scopeMode = "in";
                i += 1;
                continue;
            }

            if (line.startsWith("### Out of scope")) {
                scopeMode = "out";
                i += 1;
                continue;
            }

            if (line.startsWith("- ") && scopeMode === "in") {
                inScope.push(line.slice(2).trim());
            } else
            if (line.startsWith("- ") && scopeMode === "out") {
                outOfScope.push(line.slice(2).trim());
            }

            i += 1;
            continue;
        }

        if (section === "tasks") {
            const header = TASK_HEADER_RE.exec(line);

            if (header) {
                const blockStart = i;
                const id = header[1];
                const title = header[2].trim();
                let status = "pending";
                let priority = "medium";
                const depends: string[] = [];
                const blockedBy: string[] = [];
                const acceptanceCriteria: string[] = [];
                const verification: string[] = [];
                let fieldSection: "acceptance" | "verification" | null = null;
                i += 1;

                while (i < lines.length) {
                    const inner = lines[i];

                    if (inner.startsWith("### ") || inner.startsWith("## ")) {
                        break;
                    }

                    if (inner.startsWith("#### Acceptance criteria")) {
                        fieldSection = "acceptance";
                        i += 1;
                        continue;
                    }

                    if (inner.startsWith("#### Verification")) {
                        fieldSection = "verification";
                        i += 1;
                        continue;
                    }

                    if (inner.startsWith("- ") && fieldSection === "acceptance") {
                        acceptanceCriteria.push(inner.slice(2).trim());
                        i += 1;
                        continue;
                    }

                    if (inner.startsWith("- ") && fieldSection === "verification") {
                        verification.push(inner.slice(2).trim());
                        i += 1;
                        continue;
                    }

                    const field = FIELD_RE.exec(inner.trim());

                    if (field) {
                        const key = field[1].toLowerCase();
                        const value = field[2].trim();

                        if (key === "status") {
                            status = value;
                        } else
                        if (key === "priority") {
                            priority = value;
                        } else
                        if (key === "depends") {
                            depends.push(
                                ...value.split(/[,·]/).map((s) => s.trim()).filter(Boolean)
                            );
                        } else
                        if (key === "blocked-by") {
                            blockedBy.push(
                                ...value.split(/[,·]/).map((s) => s.trim()).filter(Boolean)
                            );
                        }

                        fieldSection = null;
                    }

                    i += 1;
                }

                tasks.push({
                    id,
                    title,
                    status,
                    priority,
                    depends,
                    blockedBy,
                    acceptanceCriteria,
                    verification,
                    blockSpan: { startLine: blockStart, endLine: i },
                    sectionSpan: { startLine: blockStart, endLine: i }
                });
                continue;
            }
        }

        i += 1;
    }

    if (historySpan) {
        historySpan.endLine = lines.length;
    }

    return {
        raw,
        objective,
        inScope,
        outOfScope,
        tasks,
        historySpan
    };
}

export function findPlanTask(
    doc: TaskPlanDocument,
    query: string
): PlanTask | undefined {
    const q = query.trim().toLowerCase();

    for (const task of doc.tasks) {
        if (task.id.toLowerCase() === q) {
            return task;
        }

        if (task.title.toLowerCase().includes(q) || q.includes(task.title.toLowerCase())) {
            return task;
        }
    }

    return undefined;
}

export function allPlanTaskIds(doc: TaskPlanDocument): string[] {
    return doc.tasks.map((t) => t.id);
}

export function hasOpenPlanTasks(doc: TaskPlanDocument): boolean {
    return doc.tasks.some(
        (t) => !["done", "completed", "cancelled"].includes(t.status.toLowerCase())
    );
}
