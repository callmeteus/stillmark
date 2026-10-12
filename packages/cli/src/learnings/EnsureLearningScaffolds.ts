import fs from "node:fs";
import path from "node:path";

import type { ProjectPaths } from "../paths/ProjectPaths";
import {
    LEARNINGS_CODE_STYLE_OVERVIEW,
    LEARNINGS_DESIGN_OVERVIEW
} from "./LearningScaffolds";

/**
 * Creates `.stillmark/learnings/design` and `code-style` starter markdown when missing.
 *
 * @returns Whether any file was written.
 */
export function ensureLearningScaffolds(paths: ProjectPaths): boolean {
    let changed = false;

    fs.mkdirSync(paths.learningsDesignDir, { recursive: true });
    fs.mkdirSync(paths.learningsCodeStyleDir, { recursive: true });

    const designOverview = path.join(paths.learningsDesignDir, "overview.md");

    if (!fs.existsSync(designOverview)) {
        fs.writeFileSync(designOverview, LEARNINGS_DESIGN_OVERVIEW, "utf8");
        changed = true;
    }

    const codeOverview = path.join(paths.learningsCodeStyleDir, "overview.md");

    if (!fs.existsSync(codeOverview)) {
        fs.writeFileSync(codeOverview, LEARNINGS_CODE_STYLE_OVERVIEW, "utf8");
        changed = true;
    }

    return changed;
}

/**
 * Returns true when the directory exists and contains at least one `.md` file.
 */
export function learningsDirHasMarkdown(dir: string): boolean {
    if (!fs.existsSync(dir)) {
        return false;
    }

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith(".md")) {
            return true;
        }
    }

    return false;
}
