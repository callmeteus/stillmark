import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { addPlanTask } from "../../src/operations/PlanOperations";
import { addRoadmapItem } from "../../src/operations/RoadmapOperations";
import { copyFixture, createTempProject } from "../helpers/TempProject";

describe("Duplicates", () => {
    it("detects near-duplicate roadmap items", async () => {
        const { paths, cleanup } = createTempProject();
        copyFixture("SampleRoadmap.md", paths.roadmap);

        const result = await addRoadmapItem(paths, {
            description: "Existing feature"
        });

        expect(result.duplicateOf).toBe("R-001");
        cleanup();
    });

    it("detects near-duplicate plan tasks", () => {
        const { paths, cleanup } = createTempProject();
        fs.mkdirSync(paths.planningDir, { recursive: true });
        copyFixture("SampleTaskPlan.md", paths.taskPlan);

        const result = addPlanTask(paths, {
            description: "Login API"
        });

        expect(result.duplicateOf).toBe("T-001");
        cleanup();
    });
});
