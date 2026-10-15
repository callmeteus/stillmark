import { describe, expect, it } from "vitest";

import { pushCommitSummaryFromTokens } from "../../src/git/CommitPending";

describe("pushCommitSummaryFromTokens", () => {
    it("drops no-t markers and joins the rest", () => {
        expect(pushCommitSummaryFromTokens(["no-t", "design", "migrations"])).toBe("design migrations");
    });

    it("returns empty when only markers remain", () => {
        expect(pushCommitSummaryFromTokens(["no-t", "(t)"])).toBe("");
    });
});
