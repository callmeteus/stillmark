import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { loadConfig } from "../../src/config";
import { configStatus, setConfigSharing } from "../../src/operations";
import {
    gitignoreIgnoresDesignSystem,
    gitignoreHasStillmarkPlans
} from "../../src/paths/Gitignore";
import {
    resolveProjectPaths,
    STILLMARK_DESIGN_SYSTEM_GITIGNORE_ENTRY,
    STILLMARK_LEGACY_GITIGNORE_ENTRY,
    STILLMARK_PLANS_GITIGNORE_ENTRY
} from "../../src/paths/ProjectPaths";
import { initProject } from "../../src/operations/InitProject";

describe("ConfigOperations", () => {
    it("reports needsFirstRunPrompt until user answers", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-config-"));
        const paths = resolveProjectPaths(root);

        initProject(paths);

        const before = configStatus(paths);
        expect(before.sharing.needsFirstRunPrompt).toBe(true);

        setConfigSharing(paths, { shareDesignSystem: false, markPrompted: true });

        const after = configStatus(paths, loadConfig(paths));
        expect(after.sharing.needsFirstRunPrompt).toBe(false);
        expect(after.sharing.shareDesignSystem).toBe(false);

        fs.rmSync(root, { recursive: true, force: true });
    });

    it("keeps plans ignored and toggles design-system gitignore", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-config-"));
        const paths = resolveProjectPaths(root);

        initProject(paths);

        let gitignore = fs.readFileSync(paths.gitignore, "utf8");
        expect(gitignoreHasStillmarkPlans(gitignore)).toBe(true);
        expect(gitignoreIgnoresDesignSystem(gitignore)).toBe(true);

        setConfigSharing(paths, { shareDesignSystem: true, markPrompted: true });

        gitignore = fs.readFileSync(paths.gitignore, "utf8");
        expect(gitignore).toContain(STILLMARK_PLANS_GITIGNORE_ENTRY);
        expect(gitignoreIgnoresDesignSystem(gitignore)).toBe(false);
        expect(fs.existsSync(path.join(paths.designSystemDir, "README.md"))).toBe(
            true
        );

        setConfigSharing(paths, { shareDesignSystem: false, markPrompted: true });

        gitignore = fs.readFileSync(paths.gitignore, "utf8");
        expect(gitignoreIgnoresDesignSystem(gitignore)).toBe(true);

        fs.rmSync(root, { recursive: true, force: true });
    });

    it("migrates legacy .stillmark/ gitignore on sync", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-config-"));
        const paths = resolveProjectPaths(root);

        fs.writeFileSync(
            paths.gitignore,
            `${STILLMARK_LEGACY_GITIGNORE_ENTRY}\n`,
            "utf8"
        );

        initProject(paths);

        const gitignore = fs.readFileSync(paths.gitignore, "utf8");
        expect(gitignore).not.toMatch(/^\s*\.stillmark\/\s*$/m);
        expect(gitignore).toContain(STILLMARK_PLANS_GITIGNORE_ENTRY);
        expect(gitignore).toContain(STILLMARK_DESIGN_SYSTEM_GITIGNORE_ENTRY);

        fs.rmSync(root, { recursive: true, force: true });
    });
});
