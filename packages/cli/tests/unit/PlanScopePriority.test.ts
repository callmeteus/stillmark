import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import { parseRoadmap, parseTaskPlan } from "../../src/documents";
import { checkPlanScope } from "../../src/guards";
import { initTaskPlan } from "../../src/operations/PlanOperations";
import { setPlanScope } from "../../src/operations/PlanScope";
import { fileLink } from "../../src/results/FileLink";
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

describe("plan scope", () => {
    it("replaces placeholders with real objective and scope entries", () => {
        const { paths, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            setPlanScope(paths, {
                objective: "Webhooks v2",
                inScope: ["Signed payloads", "Retries"],
                outOfScope: ["Dashboard redesign"]
            });

            const raw = fs.readFileSync(paths.taskPlan, "utf8");
            const doc = parseTaskPlan(raw);

            expect(doc.objective).toBe("Webhooks v2");
            expect(doc.inScope).toEqual(["Signed payloads", "Retries"]);
            expect(doc.outOfScope).toEqual(["Dashboard redesign"]);
            expect(raw).not.toContain("(define)");
            expect(raw).not.toContain("(Not set)");
            expect(checkPlanScope(doc, "Dashboard redesign").allowed).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("appends without duplicates and replaces with --replace", () => {
        const { paths, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            setPlanScope(paths, { inScope: ["Retries"] });
            setPlanScope(paths, { inScope: ["retries", "Signed payloads"] });

            expect(parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8")).inScope).toEqual(["Retries", "Signed payloads"]);

            setPlanScope(paths, { inScope: ["Only this"], replace: true });

            expect(parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8")).inScope).toEqual(["Only this"]);
        } finally {
            cleanup();
        }
    });

    it("sets scope from plan init flags and shows it with plan scope", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            await cli(root, "plan", "init", "Billing export", "--in-scope", "CSV\\nPDF", "--out-of-scope", "Excel");

            const doc = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8"));

            expect(doc.objective).toBe("Billing export");
            expect(doc.inScope).toEqual(["CSV", "PDF"]);
            expect(doc.outOfScope).toEqual(["Excel"]);

            await cli(root, "plan", "scope");

            expect(lastJson().scope).toEqual({ objective: "Billing export", inScope: ["CSV", "PDF"], outOfScope: ["Excel"] });
        } finally {
            cleanup();
        }
    });

    it("refuses when there is no plan", () => {
        const { paths, cleanup } = createTempProject();

        try {
            expect(setPlanScope(paths, { objective: "x" }).ok).toBe(false);
        } finally {
            cleanup();
        }
    });
});

describe("file links", () => {
    it("returns a clickable markdown link for plan and roadmap commands", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            await cli(root, "plan", "init", "Billing export");

            const expected = `[TASK_PLAN.md](${encodeURI(paths.taskPlan.replace(/\\/g, "/"))})`;

            expect(lastJson().link).toBe(expected);

            await cli(root, "plan");

            expect(lastJson().location).toBe(paths.taskPlan);
            expect(lastJson().link).toBe(expected);

            await cli(root, "plan", "add", "Sign payloads");
            await cli(root, "plan", "priority", "T-001", "high");

            expect(lastJson().link).toBe(expected);

            await cli(root, "roadmap", "add", "Dark mode");

            expect(String(lastJson().link)).toMatch(/^\[ROADMAP\.md\]\(.+ROADMAP\.md\)$/);
        } finally {
            cleanup();
        }
    });

    it("omits the link when the file does not exist", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "plan");

            expect(lastJson().link).toBeUndefined();
        } finally {
            cleanup();
        }
    });

    it("encodes spaces so Windows paths stay clickable", () => {
        expect(fileLink("C:\\My Repo\\TASK_PLAN.md")).toMatch(/\(.*My%20Repo\/TASK_PLAN\.md\)$/);
    });
});

describe("priority flags", () => {
    it("writes --priority on plan add and roadmap add", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            await cli(root, "plan", "add", "Sign payloads", "--priority=HIGH");
            await cli(root, "roadmap", "add", "Dark mode", "--priority", "low");

            const task = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8")).tasks[0];
            const item = parseRoadmap(fs.readFileSync(paths.roadmap, "utf8")).sections.flatMap((s) => s.items)[0];

            expect(task.priority).toBe("high");
            expect(item.metadataLine).toContain("priority: low");
        } finally {
            cleanup();
        }
    });

    it("changes a task priority with plan priority", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            await cli(root, "plan", "add", "Sign payloads");
            await cli(root, "plan", "priority", "T-001", "critical");

            expect(parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8")).tasks[0].priority).toBe("critical");
        } finally {
            cleanup();
        }
    });

    it("refuses unknown priorities without writing", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            const before = fs.readFileSync(paths.taskPlan, "utf8");

            expect(await cli(root, "plan", "add", "Sign payloads", "--priority=urgent")).toBe(1);
            expect(String(lastJson().summary)).toContain("critical, high, medium, low");
            expect(fs.readFileSync(paths.taskPlan, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });
});
