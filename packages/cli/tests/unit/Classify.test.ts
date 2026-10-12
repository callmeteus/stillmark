import { describe, expect, it } from "vitest";

import { classifyIntent } from "../../src/intent";

describe("Classify", () => {
    it("routes natural-language examples to roadmap or plan", () => {
        expect(
            classifyIntent({
                text: "Add PostgreSQL support to the roadmap.",
                hasActivePlan: true
            }).summary
        ).toBe("roadmap");

        expect(
            classifyIntent({
                text: "Put integration tests in the current plan.",
                hasActivePlan: true
            }).summary
        ).toBe("plan");

        expect(
            classifyIntent({
                text: "Add observability as a future milestone.",
                hasActivePlan: false
            }).summary
        ).toBe("roadmap");

        expect(
            classifyIntent({
                text: "Polish the landing hero layout this sprint.",
                hasActivePlan: true
            }).summary
        ).toBe("plan");

        expect(
            classifyIntent({
                text: "Design system refresh as a Q3 initiative.",
                hasActivePlan: true
            }).summary
        ).toBe("roadmap");
    });

    it("returns needsClarification when ambiguous", () => {
        const result = classifyIntent({
            text: "Add widgets",
            hasActivePlan: true,
            objectiveSnippet: "Unrelated objective"
        });

        expect(result.needsClarification).toBe(true);
        expect(result.clarificationQuestion).toBeTruthy();
    });
});
