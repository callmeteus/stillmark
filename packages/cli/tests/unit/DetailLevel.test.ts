import fs from "node:fs";
import { describe, expect, it } from "vitest";

import {
    loadConfig,
    resolveAllDetailLevels,
    resolveDetailLevel,
    sanitizeDetailConfig,
    splitDetailLines
} from "../../src/config";
import { addCoverageCase, initCoverage } from "../../src/coverage/CoverageOperations";
import { buildDefaultCoverage } from "../../src/coverage/CoverageTemplate";
import { validateCoverage } from "../../src/coverage/ValidateCoverage";
import { parseRoadmap, parseTaskPlan } from "../../src/documents";
import { configStatus, setConfigDetail } from "../../src/operations/ConfigOperations";
import { moveToPlan } from "../../src/operations/MoveOperations";
import { addPlanTask, initTaskPlan } from "../../src/operations/PlanOperations";
import { addRoadmapItem } from "../../src/operations/RoadmapOperations";
import { createTempProject } from "../helpers/TempProject";

function coverageWithDetail(detailLine: string, separator = ""): string[] {
    const lines = buildDefaultCoverage("demo").replace(/\n$/, "").split("\n");
    const caseIndex = lines.findIndex((line) => line.startsWith("- [ ]"));
    const inserted = separator ? [separator, detailLine] : [detailLine];

    lines.splice(caseIndex + 1, 0, ...inserted);

    return lines;
}

describe("detail level resolution", () => {
    it("uses built-in defaults: plan extended, coverage and roadmap compact", () => {
        expect(resolveAllDetailLevels({})).toEqual({
            coverage: "compact",
            roadmap: "compact",
            plan: "extended"
        });
    });

    it("lets global override built-ins and modules override global", () => {
        const detail = { global: "compact" as const, coverage: "extended" as const };

        expect(resolveDetailLevel(detail, "plan")).toBe("compact");
        expect(resolveDetailLevel(detail, "roadmap")).toBe("compact");
        expect(resolveDetailLevel(detail, "coverage")).toBe("extended");
    });

    it("drops invalid values from config", () => {
        expect(sanitizeDetailConfig({ global: "huge", plan: "compact", other: "extended" })).toEqual({
            plan: "compact"
        });
        expect(sanitizeDetailConfig("compact")).toEqual({});
    });

    it("splits --details text on real and escaped newlines", () => {
        expect(splitDetailLines("first line\\nsecond line\n  \nthird")).toEqual([
            "first line",
            "second line",
            "third"
        ]);
        expect(splitDetailLines(undefined)).toEqual([]);
    });
});

describe("coverage detail validation", () => {
    it("rejects detail lines in compact mode", () => {
        const result = validateCoverage(coverageWithDetail("  Calls /auth/login with a valid user"));

        expect(result.valid).toBe(false);
        expect(result.errors.some((entry) => entry.includes("detail: extended"))).toBe(true);
    });

    it("accepts detail lines under a case in extended mode", () => {
        const result = validateCoverage(coverageWithDetail("  Calls /auth/login with a valid user"), {
            detail: "extended"
        });

        expect(result.valid).toBe(true);
    });

    it("rejects detail lines that are not right under a case", () => {
        const result = validateCoverage(coverageWithDetail("  Orphan detail", ""), {
            detail: "extended"
        });
        const separated = validateCoverage(
            coverageWithDetail("  Orphan detail", "**Label**"),
            { detail: "extended" }
        );

        expect(result.valid).toBe(true);
        expect(separated.valid).toBe(false);
        expect(separated.errors.some((entry) => entry.includes("right under"))).toBe(true);
    });
});

describe("config set --detail", () => {
    it("writes module overrides, reports them in status, and clears them with inherit", () => {
        const { paths, cleanup } = createTempProject();

        const set = setConfigDetail(paths, { level: "extended", module: "coverage" });

        expect(set.ok).toBe(true);
        expect(set.detail.coverage).toBe("extended");
        expect(loadConfig(paths).detail).toEqual({ coverage: "extended" });
        expect(configStatus(paths).detail).toEqual({
            coverage: "extended",
            roadmap: "compact",
            plan: "extended"
        });

        setConfigDetail(paths, { level: "inherit", module: "coverage" });
        expect(loadConfig(paths).detail).toEqual({});

        setConfigDetail(paths, { level: "extended" });
        expect(configStatus(paths).detail.roadmap).toBe("extended");

        cleanup();
    });
});

describe("coverage add --details", () => {
    it("refuses details while coverage is compact", () => {
        const { paths, cleanup } = createTempProject();
        initCoverage(paths);
        const before = fs.readFileSync(paths.coverage, "utf8");

        const result = addCoverageCase(paths, "index.ts", "Rejects bad password", {
            tag: "sad",
            details: ["Posts wrong password to /auth/login"]
        });

        expect(result.ok).toBe(false);
        expect(result.changed).toBe(false);
        expect(result.summary).toContain("--module=coverage");
        expect(fs.readFileSync(paths.coverage, "utf8")).toBe(before);

        cleanup();
    });

    it("writes indented details and keeps later cases after them", () => {
        const { paths, cleanup } = createTempProject();
        initCoverage(paths);
        setConfigDetail(paths, { level: "extended", module: "coverage" });

        const first = addCoverageCase(paths, "index.ts", "Rejects bad password", {
            tag: "sad",
            details: ["Posts wrong password to /auth/login", "Expects 401"]
        });
        const second = addCoverageCase(paths, "index.ts", "Locks after five tries", { tag: "edge" });
        const content = fs.readFileSync(paths.coverage, "utf8");

        expect(first.ok).toBe(true);
        expect(second.ok).toBe(true);
        expect(content).toContain(
            "- [ ] [sad] Rejects bad password\n  Posts wrong password to /auth/login\n  Expects 401\n- [ ] [edge] Locks after five tries"
        );

        cleanup();
    });
});

describe("roadmap and plan details", () => {
    it("refuses roadmap details while roadmap is compact", async () => {
        const { paths, cleanup } = createTempProject();

        const result = await addRoadmapItem(paths, {
            description: "Billing export",
            details: ["Monthly CSV for finance"]
        });

        expect(result.ok).toBe(false);
        expect(result.summary).toContain("--module=roadmap");

        cleanup();
    });

    it("writes roadmap details and parses them back", async () => {
        const { paths, cleanup } = createTempProject();
        setConfigDetail(paths, { level: "extended", module: "roadmap" });

        const result = await addRoadmapItem(paths, {
            description: "Billing export",
            details: ["Monthly CSV for finance"]
        });
        const item = parseRoadmap(fs.readFileSync(paths.roadmap, "utf8"))
            .sections.flatMap((section) => section.items)
            .find((entry) => entry.id === result.itemId);

        expect(result.ok).toBe(true);
        expect(item?.detailLines).toEqual(["Monthly CSV for finance"]);
        expect(item?.metadataLine).toContain("priority: medium");

        cleanup();
    });

    it("writes extended plan tasks with details by default", () => {
        const { paths, cleanup } = createTempProject();
        initTaskPlan(paths, "Webhooks v2");

        const result = addPlanTask(paths, {
            description: "Retry on HTTP 429",
            acceptScopeChange: true,
            details: ["Back off 1s, 2s, 4s"]
        });
        const task = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8")).tasks[0];

        expect(result.ok).toBe(true);
        expect(task.detailLines).toEqual(["Back off 1s, 2s, 4s"]);
        expect(task.acceptanceCriteria).toEqual(["(define)"]);

        cleanup();
    });

    it("writes compact plan tasks without criteria sections", () => {
        const { paths, cleanup } = createTempProject();
        initTaskPlan(paths, "Webhooks v2");
        setConfigDetail(paths, { level: "compact", module: "plan" });

        const refused = addPlanTask(paths, {
            description: "Retry on HTTP 429",
            acceptScopeChange: true,
            details: ["Back off"]
        });
        const added = addPlanTask(paths, { description: "Retry on HTTP 429", acceptScopeChange: true });
        const content = fs.readFileSync(paths.taskPlan, "utf8");

        expect(refused.ok).toBe(false);
        expect(added.ok).toBe(true);
        expect(content).toContain("### T-001 Retry on HTTP 429\nstatus: pending\npriority: medium\n");
        expect(content).not.toContain("#### Acceptance criteria");

        cleanup();
    });

    it("carries roadmap details into an extended plan on move", async () => {
        const { paths, cleanup } = createTempProject();
        setConfigDetail(paths, { level: "extended", module: "roadmap" });
        await addRoadmapItem(paths, {
            description: "Billing export",
            details: ["Monthly CSV for finance"]
        });
        initTaskPlan(paths, "Billing");

        const result = await moveToPlan(paths, "Billing export", true);
        const task = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8")).tasks[0];
        const roadmap = fs.readFileSync(paths.roadmap, "utf8");

        expect(result.ok).toBe(true);
        expect(task.detailLines).toEqual(["Monthly CSV for finance"]);
        expect(roadmap).not.toContain("Monthly CSV for finance");

        cleanup();
    });
});
