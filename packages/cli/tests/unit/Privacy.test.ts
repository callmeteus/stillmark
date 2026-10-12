import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { addRoadmapItem } from "../../src/operations/RoadmapOperations";
import { moveToRoadmap } from "../../src/operations/MoveOperations";
import { copyFixture, createTempProject } from "../helpers/TempProject";

describe("Privacy", () => {
    it("blocks secrets on roadmap add", async () => {
        const { paths, cleanup } = createTempProject();

        const result = await addRoadmapItem(paths, {
            description: "api_key=sk-abcdefghijklmnopqrstuvwxyz123456"
        });

        expect(result.ok).toBe(false);
        expect(result.sensitiveFindings?.length).toBeGreaterThan(0);
        cleanup();
    });

    it("does not leak verification notes into roadmap on move", async () => {
        const { paths, cleanup } = createTempProject();
        copyFixture("SampleRoadmap.md", paths.roadmap);
        fs.mkdirSync(paths.planningDir, { recursive: true });
        copyFixture("SampleTaskPlan.md", paths.taskPlan);

        await moveToRoadmap(paths, "Session refresh", true);
        const roadmap = fs.readFileSync(paths.roadmap, "utf8");
        expect(roadmap).not.toContain("Integration test green");
        cleanup();
    });
});
