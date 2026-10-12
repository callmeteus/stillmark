import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { addPlanTask } from "../../src/operations/PlanOperations";
import { copyFixture, createTempProject } from "../helpers/TempProject";

describe("PlanAdd", () => {
    it("adds task without resetting progress", () => {
        const { paths, cleanup } = createTempProject();
        fs.mkdirSync(paths.planningDir, { recursive: true });
        copyFixture("SampleTaskPlan.md", paths.taskPlan);

        const result = addPlanTask(paths, {
            description: "Logout endpoint",
            acceptScopeChange: true
        });

        expect(result.ok).toBe(true);
        const after = fs.readFileSync(paths.taskPlan, "utf8");
        expect(after).toContain("status: done");
        expect(after).toContain("T-001 Login API");
        expect(after).toContain("T-003");
        expect(after).toContain("Logout endpoint");
        expect(after).toContain("## History");
        expect(after).toContain("Started 2026-01-01");
        cleanup();
    });
});
