import fs from "node:fs";
import { describe, expect, it } from "vitest";

import {
    applyPlanChange,
    loadState,
    saveState
} from "../../src/long-running";
import { copyFixture, createTempProject } from "../helpers/TempProject";

describe("LongRunning", () => {
    it("incorporates authorized plan changes and preserves state", () => {
        const { paths, cleanup } = createTempProject();
        fs.mkdirSync(paths.planningDir, { recursive: true });
        copyFixture("SampleTaskPlan.md", paths.taskPlan);
        saveState(paths, {
            revision: 2,
            activeTaskId: "T-002",
            completed: ["T-001"],
            journal: [{ at: "2026-01-01", message: "start" }]
        });

        const result = applyPlanChange(paths, {
            description: "Login rate limiting",
            acceptScopeChange: true
        });

        expect(result.ok).toBe(true);
        const state = loadState(paths);
        expect(state.completed).toContain("T-001");
        expect(state.journal.length).toBeGreaterThan(1);
        expect(state.revision).toBe(4);
        cleanup();
    });
});
