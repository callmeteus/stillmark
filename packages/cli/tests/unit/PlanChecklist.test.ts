import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import { parseTaskPlan, withPlanChecklist } from "../../src/documents";
import { createTempProject } from "../helpers/TempProject";

let logs: string[] = [];

beforeEach(() => {
    logs = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => {
        logs.push(line);
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});

function lastJson(): Record<string, unknown> {
    return JSON.parse(logs[logs.length - 1]) as Record<string, unknown>;
}

function cli(root: string, ...args: string[]): Promise<number> {
    return runCli(["node", "stillmark", ...args, "--json", `--root=${root}`]);
}

function checklist(raw: string): string[] {
    const start = raw.indexOf("## Checklist");

    return raw.slice(start).split("\n").filter((line) => line.startsWith("- ") || line.startsWith("### "));
}

describe("plan checklist", () => {
    it("ends a fresh plan with an empty checklist", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            expect(await cli(root, "plan", "init", "Weekly errands")).toBe(0);

            const raw = fs.readFileSync(paths.taskPlan, "utf8");

            expect(raw.trimEnd().endsWith("_No tasks yet._")).toBe(true);
            expect(raw.indexOf("## History")).toBeLessThan(raw.indexOf("## Checklist"));
        } finally {
            cleanup();
        }
    });

    it("lists tasks and checks them as they are marked done", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            await cli(root, "plan", "init", "Weekly errands");
            await cli(root, "plan", "add", "Grocery shopping");
            await cli(root, "plan", "add", "Pay the bills");

            expect(checklist(fs.readFileSync(paths.taskPlan, "utf8"))).toEqual([
                "- [ ] T-001 - Grocery shopping",
                "- [ ] T-002 - Pay the bills"
            ]);

            expect(await cli(root, "plan", "done", "T-001")).toBe(0);
            expect(lastJson().summary).toBe("T-001 is now done");

            const raw = fs.readFileSync(paths.taskPlan, "utf8");

            expect(checklist(raw)).toEqual([
                "- [x] T-001 - Grocery shopping",
                "- [ ] T-002 - Pay the bills"
            ]);
            expect(parseTaskPlan(raw).tasks.map((task) => task.status)).toEqual(["done", "pending"]);
            expect(raw.match(/## Checklist/g)).toHaveLength(1);
        } finally {
            cleanup();
        }
    });

    it("groups and prefixes tasks by phase", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            await cli(root, "plan", "init", "Weekly errands");
            await cli(root, "plan", "add", "Grocery shopping", "--phase=PHASE-1");
            await cli(root, "plan", "add", "Cook dinner", "--phase=PHASE-2");
            await cli(root, "plan", "add", "Pay the bills");
            await cli(root, "plan", "phase", "T-003", "PHASE-1");
            await cli(root, "plan", "status", "T-002", "cancelled");

            const raw = fs.readFileSync(paths.taskPlan, "utf8");

            expect(checklist(raw)).toEqual([
                "### PHASE-1",
                "- [ ] PHASE-1 / T-001 - Grocery shopping",
                "- [ ] PHASE-1 / T-003 - Pay the bills",
                "### PHASE-2",
                "- [x] ~~PHASE-2 / T-002 - Cook dinner~~ (cancelled)"
            ]);
            expect(parseTaskPlan(raw).tasks[2].phase).toBe("PHASE-1");
            expect(raw).toContain("priority: medium\nphase: PHASE-1");
        } finally {
            cleanup();
        }
    });

    it("rejects unknown statuses without touching the plan", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            await cli(root, "plan", "init", "Weekly errands");
            await cli(root, "plan", "add", "Grocery shopping");

            const before = fs.readFileSync(paths.taskPlan, "utf8");

            expect(await cli(root, "plan", "status", "T-001", "finished")).toBe(1);
            expect(String(lastJson().summary)).toContain("Unknown status");
            expect(fs.readFileSync(paths.taskPlan, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });

    it("overwrites manual checklist edits and keeps history before it", () => {
        const raw = [
            "# Task plan",
            "",
            "## Tasks",
            "",
            "### T-001 Grocery shopping",
            "status: done",
            "priority: medium",
            "",
            "## History",
            "- T-002 moved to roadmap as R-004",
            "",
            "## Checklist",
            "",
            "- [ ] T-001 - stale title",
            "- [ ] T-002 - gone"
        ].join("\n");

        const updated = withPlanChecklist(raw);

        expect(checklist(updated)).toEqual(["- [x] T-001 - Grocery shopping"]);
        expect(parseTaskPlan(updated).historySpan).toEqual({ startLine: 8, endLine: 11 });
    });
});
