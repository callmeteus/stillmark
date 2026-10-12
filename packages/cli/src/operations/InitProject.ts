import fs from "node:fs";

import { writeDefaultConfig } from "../config";
import { ensureStillmarkGitignore } from "../paths/Gitignore";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

const DEFAULT_ROADMAP = `# Roadmap

## Backlog

## Deferred

`;

/**
 * Initialize Stillmark project files.
 */
export function initProject(paths: ProjectPaths): OperationResult {
    if (!fs.existsSync(paths.roadmap)) {
        fs.writeFileSync(paths.roadmap, DEFAULT_ROADMAP, "utf8");
    }

    fs.mkdirSync(paths.planningDir, { recursive: true });

    if (!fs.existsSync(paths.config)) {
        writeDefaultConfig(paths);
    }

    const gitignoreChanged = ensureStillmarkGitignore(paths);

    return {
        ok: true,
        changed: true,
        action: "init",
        summary: gitignoreChanged
            ? "Initialized ROADMAP.md, .stillmark/plans, stillmark.config.json, and .gitignore"
            : "Initialized ROADMAP.md, .stillmark/plans, and stillmark.config.json"
    };
}
