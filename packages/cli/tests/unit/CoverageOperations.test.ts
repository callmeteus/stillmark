import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
    addCoverageCase,
    checkCoverageCase,
    initCoverage,
    uncheckCoverageCase
} from "../../src/coverage/CoverageOperations";
import { resolveProjectPaths } from "../../src/paths/ProjectPaths";
import { createTempProject } from "../helpers/TempProject";

describe("coverage operations", () => {
    it("creates and validates COVERAGE.md", () => {
        const { paths, cleanup } = createTempProject();
        const result = initCoverage(paths);

        expect(result.ok).toBe(true);
        expect(result.changed).toBe(true);
        expect(fs.existsSync(paths.coverage)).toBe(true);

        cleanup();
    });

    it("checks and unchecks a case by substring", () => {
        const { paths, cleanup } = createTempProject();
        initCoverage(paths);

        const checked = checkCoverageCase(paths, "Primary entry path succeeds");
        expect(checked.ok).toBe(true);
        expect(checked.coverage?.totalChecked).toBe(1);

        const unchecked = uncheckCoverageCase(paths, "Primary entry path succeeds");
        expect(unchecked.ok).toBe(true);
        expect(unchecked.coverage?.totalOpen).toBe(2);

        cleanup();
    });

    it("adds a case under a heading", () => {
        const { paths, cleanup } = createTempProject();
        initCoverage(paths);

        const added = addCoverageCase(
            paths,
            "index.ts",
            "Returns 404 for unknown routes",
            { tag: "sad" }
        );

        expect(added.ok).toBe(true);
        expect(added.coverage?.totalOpen).toBe(3);

        cleanup();
    });

    it("does not recreate an existing file on init", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-cov-"));
        const paths = resolveProjectPaths(root);
        fs.writeFileSync(paths.coverage, "# broken\n", "utf8");

        const result = initCoverage(paths);
        expect(result.changed).toBe(false);
        expect(result.ok).toBe(false);

        fs.rmSync(root, { recursive: true, force: true });
    });
});
