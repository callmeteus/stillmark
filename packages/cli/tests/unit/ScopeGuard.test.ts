import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { addPlanTask } from "../../src/operations/PlanOperations";
import { loadState } from "../../src/long-running";
import { copyFixture, createTempProject } from "../helpers/TempProject";

describe("ScopeGuard", () => {
    it("refuses out-of-scope plan add without authorization", () => {
        const { paths, cleanup } = createTempProject();
        fs.mkdirSync(paths.planningDir, { recursive: true });
        copyFixture("SampleTaskPlan.md", paths.taskPlan);

        const result = addPlanTask(paths, {
            description: "Dashboard redesign"
        });

        expect(result.ok).toBe(false);
        expect(result.outOfScope).toBe(true);
        expect(loadState(paths).revision).toBe(0);
        cleanup();
    });
});
