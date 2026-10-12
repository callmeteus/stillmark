import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { moveToPlan, moveToRoadmap } from "../../src/operations/MoveOperations";
import { initTaskPlan } from "../../src/operations/PlanOperations";
import { copyFixture, createTempProject } from "../helpers/TempProject";

describe("Move", () => {
    it("moves roadmap to plan with metadata and reference", async () => {
        const { paths, cleanup } = createTempProject();
        copyFixture("SampleRoadmap.md", paths.roadmap);
        initTaskPlan(paths, "Ship auth");

        const result = await moveToPlan(paths, "Dashboard", true);

        expect(result.ok).toBe(true);
        const roadmap = fs.readFileSync(paths.roadmap, "utf8");
        const plan = fs.readFileSync(paths.taskPlan, "utf8");
        expect(roadmap).toContain("Moved to plan as");
        expect(roadmap).not.toMatch(/\*\*R-002\*\* Dashboard/);
        expect(plan).toContain("Dashboard");
        expect(plan).toContain("pending-approval");
        cleanup();
    });

    it("moves plan to roadmap without duplicate body", async () => {
        const { paths, cleanup } = createTempProject();
        copyFixture("SampleRoadmap.md", paths.roadmap);
        fs.mkdirSync(paths.planningDir, { recursive: true });
        copyFixture("SampleTaskPlan.md", paths.taskPlan);

        const result = await moveToRoadmap(paths, "Session refresh", true);

        expect(result.ok).toBe(true);
        const roadmap = fs.readFileSync(paths.roadmap, "utf8");
        const plan = fs.readFileSync(paths.taskPlan, "utf8");
        expect(roadmap).toContain("Session refresh");
        expect(plan).toContain("moved to roadmap as");
        expect(plan).not.toContain("### T-002 Session refresh");
        cleanup();
    });
});
