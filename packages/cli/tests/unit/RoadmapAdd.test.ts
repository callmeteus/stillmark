import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { addRoadmapItem } from "../../src/operations/RoadmapOperations";
import { copyFixture, createTempProject } from "../helpers/TempProject";

describe("RoadmapAdd", () => {
    it("adds item without overwriting unrelated content", async () => {
        const { paths, cleanup } = createTempProject();
        copyFixture("SampleRoadmap.md", paths.roadmap);
        const before = fs.readFileSync(paths.roadmap, "utf8");

        const result = await addRoadmapItem(paths, {
            description: "PostgreSQL support"
        });

        expect(result.ok).toBe(true);
        const after = fs.readFileSync(paths.roadmap, "utf8");
        expect(after).toContain("R-003");
        expect(after).toContain("PostgreSQL support");
        expect(after).toContain("**R-001** Existing feature");
        expect(after).toContain("## Milestone A");
        expect(before).not.toContain("PostgreSQL support");
        cleanup();
    });
});
