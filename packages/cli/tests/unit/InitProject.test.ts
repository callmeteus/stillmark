import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { initProject } from "../../src/operations";
import {
    resolveProjectPaths,
    STILLMARK_LEARNINGS_DESIGN_GITIGNORE_ENTRY,
    STILLMARK_PLANS_GITIGNORE_ENTRY
} from "../../src/paths/ProjectPaths";

describe("initProject", () => {
    it("creates .stillmark/plans and appends granular Stillmark gitignore rules", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-init-"));
        const paths = resolveProjectPaths(root);

        initProject(paths);

        expect(fs.existsSync(paths.planningDir)).toBe(true);
        expect(fs.existsSync(path.join(paths.learningsDesignDir, "overview.md"))).toBe(
            true
        );
        expect(fs.existsSync(path.join(paths.learningsCodeStyleDir, "overview.md"))).toBe(
            true
        );

        const config = JSON.parse(fs.readFileSync(paths.config, "utf8"));
        expect(config.learned.codeStyleDir).toBe(".stillmark/learnings/code-style");
        expect(config.learned.designDir).toBe(".stillmark/learnings/design");
        expect(paths.taskPlan).toContain(`${path.sep}.stillmark${path.sep}plans`);
        const gitignore = fs.readFileSync(paths.gitignore, "utf8");
        expect(gitignore).toContain(STILLMARK_PLANS_GITIGNORE_ENTRY);
        expect(gitignore).toContain(STILLMARK_LEARNINGS_DESIGN_GITIGNORE_ENTRY);

        fs.rmSync(root, { recursive: true, force: true });
    });

    it("does not duplicate Stillmark gitignore entries", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-init-"));
        const paths = resolveProjectPaths(root);
        fs.writeFileSync(
            paths.gitignore,
            `${STILLMARK_PLANS_GITIGNORE_ENTRY}\n`,
            "utf8"
        );

        initProject(paths);

        const gitignore = fs.readFileSync(paths.gitignore, "utf8");
        expect(gitignore.match(/\.stillmark\/plans\//g)?.length).toBe(1);

        fs.rmSync(root, { recursive: true, force: true });
    });
});
