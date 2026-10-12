import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { initProject } from "../../src/operations";
import {
    resolveProjectPaths,
    STILLMARK_GITIGNORE_ENTRY
} from "../../src/paths/ProjectPaths";

describe("initProject", () => {
    it("creates .stillmark/plans and appends .stillmark/ to .gitignore", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-init-"));
        const paths = resolveProjectPaths(root);

        initProject(paths);

        expect(fs.existsSync(paths.planningDir)).toBe(true);
        expect(paths.taskPlan).toContain(`${path.sep}.stillmark${path.sep}plans`);
        const gitignore = fs.readFileSync(paths.gitignore, "utf8");
        expect(gitignore).toContain(STILLMARK_GITIGNORE_ENTRY);

        fs.rmSync(root, { recursive: true, force: true });
    });

    it("does not duplicate .stillmark/ in .gitignore", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-init-"));
        const paths = resolveProjectPaths(root);
        fs.writeFileSync(paths.gitignore, `${STILLMARK_GITIGNORE_ENTRY}\n`, "utf8");

        initProject(paths);

        const gitignore = fs.readFileSync(paths.gitignore, "utf8");
        expect(gitignore.match(/\.stillmark\/?/g)?.length).toBe(1);

        fs.rmSync(root, { recursive: true, force: true });
    });
});
