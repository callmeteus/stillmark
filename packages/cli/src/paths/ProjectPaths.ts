import path from "node:path";

/**
 * Resolved paths for a Stillmark project root.
 */
export interface ProjectPaths {
    root: string;
    roadmap: string;
    stillmarkDir: string;
    planningDir: string;
    taskPlan: string;
    state: string;
    config: string;
    gitignore: string;
    coverage: string;
}

/**
 * Local Stillmark directory ignored by git (plans, state, etc.).
 */
export const STILLMARK_LOCAL_DIR = ".stillmark";

/**
 * Gitignore line appended by `stillmark init` when missing.
 */
export const STILLMARK_GITIGNORE_ENTRY = `${STILLMARK_LOCAL_DIR}/`;

/**
 * Build standard paths from project root.
 */
export function resolveProjectPaths(root: string): ProjectPaths {
    const normalized = path.resolve(root);

    return {
        root: normalized,
        roadmap: path.join(normalized, "ROADMAP.md"),
        stillmarkDir: path.join(normalized, STILLMARK_LOCAL_DIR),
        planningDir: path.join(normalized, STILLMARK_LOCAL_DIR, "plans"),
        taskPlan: path.join(normalized, STILLMARK_LOCAL_DIR, "plans", "TASK_PLAN.md"),
        state: path.join(normalized, STILLMARK_LOCAL_DIR, "plans", "STATE.json"),
        config: path.join(normalized, "stillmark.config.json"),
        gitignore: path.join(normalized, ".gitignore"),
        coverage: path.join(normalized, "COVERAGE.md")
    };
}
