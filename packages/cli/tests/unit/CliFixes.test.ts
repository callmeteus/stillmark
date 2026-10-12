import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import { parseFlags } from "../../src/cli/ParseFlags";
import { parseTaskPlan } from "../../src/documents";
import { checkPlanScope } from "../../src/guards";
import { addPlanTask, initTaskPlan } from "../../src/operations/PlanOperations";
import { setConfigDetail } from "../../src/operations/ConfigOperations";
import { addRoadmapItem } from "../../src/operations/RoadmapOperations";
import { parseRoadmap } from "../../src/documents";
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

describe("parseFlags", () => {
    it("never turns options into positional text", () => {
        const parsed = parseFlags(["plan", "add", "--help", "--bogus=1"]);

        expect(parsed.positional).toEqual(["plan", "add"]);
        expect(parsed.flags.help).toBe(true);
        expect(parsed.unknown).toEqual(["--bogus=1"]);
    });

    it("keeps text after -- and negative numbers as positional", () => {
        const parsed = parseFlags(["plan", "add", "-1", "--", "--weird title"]);

        expect(parsed.positional).toEqual(["plan", "add", "-1", "--weird title"]);
        expect(parsed.unknown).toEqual([]);
    });
});

describe("cli help and unknown options", () => {
    it("shows help for plan add instead of creating a task", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            const before = fs.readFileSync(paths.taskPlan, "utf8");

            const code = await runCli(["node", "stillmark", "plan", "add", "--help", "--json", `--root=${root}`]);

            expect(code).toBe(0);
            expect(lastJson().action).toBe("help");
            expect(String(lastJson().summary)).toContain("stillmark plan add");
            expect(fs.readFileSync(paths.taskPlan, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });

    it("refuses unknown options without writing", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            const before = fs.readFileSync(paths.taskPlan, "utf8");

            const code = await runCli(["node", "stillmark", "plan", "add", "Real task", "--priorty=high", "--json", `--root=${root}`]);

            expect(code).toBe(1);
            expect(String(lastJson().summary)).toContain("--priorty=high");
            expect(fs.readFileSync(paths.taskPlan, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });
});

describe("scope guard with an unfilled plan", () => {
    it("ignores (Not set) and (define) placeholders", () => {
        const { paths, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            const doc = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8"));

            expect(doc.objective).toBe("");
            expect(doc.inScope).toEqual([]);
            expect(doc.outOfScope).toEqual([]);
            expect(checkPlanScope(doc, "Define the login flow").allowed).toBe(true);
            expect(addPlanTask(paths, { description: "Wire payment webhooks" }).ok).toBe(true);
        } finally {
            cleanup();
        }
    });
});

describe("acceptance criteria and verification", () => {
    it("writes given criteria instead of (define)", () => {
        const { paths, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            addPlanTask(paths, {
                description: "Login form",
                acceptance: ["Rejects wrong password", "Locks after 5 tries"],
                verification: ["vitest LoginForm.test.ts"]
            });

            const task = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8")).tasks[0];

            expect(task.acceptanceCriteria).toEqual(["Rejects wrong password", "Locks after 5 tries"]);
            expect(task.verification).toEqual(["vitest LoginForm.test.ts"]);
        } finally {
            cleanup();
        }
    });

    it("keeps criteria sections in compact mode when criteria are given", () => {
        const { paths, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            setConfigDetail(paths, { level: "compact", module: "plan" });
            addPlanTask(paths, { description: "Logout button", acceptance: ["Clears the session"] });

            const raw = fs.readFileSync(paths.taskPlan, "utf8");
            const task = parseTaskPlan(raw).tasks[0];

            expect(task.acceptanceCriteria).toEqual(["Clears the session"]);
            expect(task.verification).toEqual(["(define)"]);
        } finally {
            cleanup();
        }
    });

    it("writes roadmap acceptance as indented bullets", async () => {
        const { paths, cleanup } = createTempProject();

        try {
            await addRoadmapItem(paths, { description: "Dark mode", acceptance: ["Follows the system theme"] });

            const items = parseRoadmap(fs.readFileSync(paths.roadmap, "utf8")).sections.flatMap((s) => s.items);

            expect(items[0].acceptanceLines).toEqual(["  - Follows the system theme"]);
        } finally {
            cleanup();
        }
    });

    it("splits --acceptance on escaped newlines from the CLI", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initTaskPlan(paths);
            await runCli([
                "node", "stillmark", "plan", "add", "Signup",
                "--acceptance", "Sends welcome email\\nValidates email", "--json", `--root=${root}`
            ]);

            const task = parseTaskPlan(fs.readFileSync(paths.taskPlan, "utf8")).tasks[0];

            expect(task.acceptanceCriteria).toEqual(["Sends welcome email", "Validates email"]);
        } finally {
            cleanup();
        }
    });
});
