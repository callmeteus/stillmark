import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildDefaultCoverage } from "../../src/coverage/CoverageTemplate";
import {
    formatCoverageSummary,
    validateCoverage
} from "../../src/coverage/ValidateCoverage";

const fixtureDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "fixtures"
);

describe("validateCoverage", () => {
    it("accepts the default template", () => {
        const lines = buildDefaultCoverage("demo").split("\n");
        const result = validateCoverage(lines);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.areas).toHaveLength(1);
        expect(result.totalOpen).toBe(2);
    });

    it("rejects prose outside checkboxes", () => {
        const lines = buildDefaultCoverage("demo").split("\n");
        lines.push("Some random prose line");
        const result = validateCoverage(lines);

        expect(result.valid).toBe(false);
        expect(result.errors.some((entry) => entry.includes("prose"))).toBe(true);
    });

    it("matches the reference validator on the default template", () => {
        const content = buildDefaultCoverage("demo");
        const tsResult = validateCoverage(content.split("\n"));
        const referencePath = path.join(fixtureDir, "ValidateCoverage.reference.mjs");
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-cov-"));
        const filePath = path.join(dir, "COVERAGE.md");
        fs.writeFileSync(filePath, content, "utf8");

        const out = execFileSync(process.execPath, [referencePath, filePath], {
            encoding: "utf8"
        });

        fs.rmSync(dir, { recursive: true, force: true });

        expect(tsResult.valid).toBe(true);
        expect(out).toContain("total: 0 [x], 2 [ ]");
    });
});

describe("formatCoverageSummary", () => {
    it("includes totals and errors", () => {
        const result = validateCoverage(["# bad title"]);
        const text = formatCoverageSummary(result);

        expect(text).toContain("error ");
        expect(text).toContain("total: 0 [x], 0 [ ]");
    });
});
