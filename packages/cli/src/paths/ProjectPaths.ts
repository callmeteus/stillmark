import path from "node:path";

/**
 * Resolved paths for a Stillmark project root.
 */
export interface ProjectPaths {
    root: string;
    roadmap: string;
    stillmarkDir: string;
    planningDir: string;
    learningsDir: string;
    learningsDesignDir: string;
    learningsCodeStyleDir: string;
    taskPlan: string;
    state: string;
    config: string;
    gitignore: string;
    coverage: string;
}

/**
 * Local Stillmark directory (plans private; design learnings optional in git).
 */
export const STILLMARK_LOCAL_DIR = ".stillmark";

/**
 * Task plans and execution state (always gitignored).
 */
export const STILLMARK_PLANS_GITIGNORE_ENTRY = `${STILLMARK_LOCAL_DIR}/plans/`;

/**
 * Design learnings markdown (gitignored until sharing is enabled).
 */
export const STILLMARK_LEARNINGS_DESIGN_GITIGNORE_ENTRY =
    `${STILLMARK_LOCAL_DIR}/learnings/design/`;

/**
 * @deprecated Use STILLMARK_LEARNINGS_DESIGN_GITIGNORE_ENTRY. Kept for gitignore migration.
 */
export const STILLMARK_DESIGN_SYSTEM_GITIGNORE_ENTRY =
    `${STILLMARK_LOCAL_DIR}/design-system/`;

/**
 * Legacy gitignore entry from older Stillmark versions.
 */
export const STILLMARK_LEGACY_GITIGNORE_ENTRY = `${STILLMARK_LOCAL_DIR}/`;

/**
 * Build standard paths from project root.
 */
export function resolveProjectPaths(root: string): ProjectPaths {
    const normalized = path.resolve(root);
    const learningsDir = path.join(normalized, STILLMARK_LOCAL_DIR, "learnings");

    return {
        root: normalized,
        roadmap: path.join(normalized, "ROADMAP.md"),
        stillmarkDir: path.join(normalized, STILLMARK_LOCAL_DIR),
        planningDir: path.join(normalized, STILLMARK_LOCAL_DIR, "plans"),
        learningsDir,
        learningsDesignDir: path.join(learningsDir, "design"),
        learningsCodeStyleDir: path.join(learningsDir, "code-style"),
        taskPlan: path.join(normalized, STILLMARK_LOCAL_DIR, "plans", "TASK_PLAN.md"),
        state: path.join(normalized, STILLMARK_LOCAL_DIR, "plans", "STATE.json"),
        config: path.join(normalized, "stillmark.config.json"),
        gitignore: path.join(normalized, ".gitignore"),
        coverage: path.join(normalized, "COVERAGE.md")
    };
}
