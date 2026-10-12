import { describe, expect, it } from "vitest";

import { loadSharedInstructions } from "../../src/adapters";

describe("Adapters", () => {
    it("shared instructions contain required rules", () => {
        const text = loadSharedInstructions();

        expect(text).toContain("ROADMAP.md");
        expect(text).toContain(".stillmark/plans/TASK_PLAN.md");
        expect(text).toContain("Never run `git commit`");
        expect(text).toContain("long-running");
        expect(text).toContain("stillmark-design");
        expect(text).toContain("needsClarification");
    });
});
