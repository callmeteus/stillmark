import type { RoadmapDocument, TaskPlanDocument } from "../documents";

/**
 * Normalize title for duplicate detection.
 */
export function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Jaccard similarity on word tokens.
 */
export function tokenSimilarity(a: string, b: string): number {
    const setA = new Set(normalizeTitle(a).split(" ").filter(Boolean));
    const setB = new Set(normalizeTitle(b).split(" ").filter(Boolean));

    if (setA.size === 0 && setB.size === 0) {
        return 1;
    }

    let intersection = 0;

    for (const token of setA) {
        if (setB.has(token)) {
            intersection += 1;
        }
    }

    const union = setA.size + setB.size - intersection;

    return union === 0 ? 0 : intersection / union;
}

const DUPLICATE_THRESHOLD = 0.85;

/**
 * Find duplicate roadmap item by title.
 */
export function findDuplicateRoadmap(
    doc: RoadmapDocument,
    title: string
): string | undefined {
    const norm = normalizeTitle(title);

    for (const section of doc.sections) {
        for (const item of section.items) {
            if (normalizeTitle(item.title) === norm) {
                return item.id;
            }

            if (tokenSimilarity(item.title, title) >= DUPLICATE_THRESHOLD) {
                return item.id;
            }
        }
    }

    return undefined;
}

/**
 * Find duplicate plan task by title.
 */
export function findDuplicatePlan(
    doc: TaskPlanDocument,
    title: string
): string | undefined {
    const norm = normalizeTitle(title);

    for (const task of doc.tasks) {
        if (normalizeTitle(task.title) === norm) {
            return task.id;
        }

        if (tokenSimilarity(task.title, title) >= DUPLICATE_THRESHOLD) {
            return task.id;
        }
    }

    return undefined;
}
