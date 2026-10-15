import { describe, expect, it } from "vitest";

import { isDesignSubcommand, resolveDesignMode, runDesignCommand } from "../../src/design";

describe("DesignCommands", () => {
    it("resolves create mode for create, build, study, and redesign", () => {
        expect(resolveDesignMode("create")).toBe("create");
        expect(resolveDesignMode("build")).toBe("create");
        expect(resolveDesignMode("study")).toBe("create");
        expect(resolveDesignMode("redesign")).toBe("create");
    });

    it("resolves review mode for review, critique, and audit", () => {
        expect(resolveDesignMode("review")).toBe("review");
        expect(resolveDesignMode("critique")).toBe("review");
        expect(resolveDesignMode("audit")).toBe("review");
    });

    it("resolves mixed mode for polish and unknown first tokens", () => {
        expect(resolveDesignMode("polish")).toBe("mixed");
        expect(resolveDesignMode("hero")).toBe("mixed");
        expect(resolveDesignMode(undefined)).toBe("mixed");
    });

    it("returns help when design is invoked with no arguments", () => {
        const result = runDesignCommand(["design"]);

        expect(result.ok).toBe(true);
        expect(result.summary).toContain("stillmark design create");
        expect(result.playbooks).toContain("reference/design-pipeline.md");
    });

    it("returns create playbooks for design create", () => {
        const result = runDesignCommand(["design", "create", "landing for a honey farm"]);

        expect(result.mode).toBe("create");
        expect(result.brief).toBe("landing for a honey farm");
        expect(result.playbooks).toEqual([
            "reference/design-create.md",
            "reference/craft-floor.md"
        ]);
    });

    it("returns review playbooks for design critique", () => {
        const result = runDesignCommand(["design", "critique", "checkout page"]);

        expect(result.mode).toBe("review");
        expect(result.playbooks?.[0]).toBe("reference/design-review.md");
    });

    it("returns mixed playbooks for free-text design and polish", () => {
        const freeText = runDesignCommand(["design", "fix", "card", "spacing"]);
        const polish = runDesignCommand(["design", "polish", "nav"]);

        expect(freeText.mode).toBe("mixed");
        expect(freeText.playbooks).toContain("reference/design-mixed.md");
        expect(polish.mode).toBe("mixed");
    });

    it("treats polish as a subcommand not part of the brief", () => {
        expect(isDesignSubcommand("polish")).toBe(true);
        expect(runDesignCommand(["design", "polish"]).brief).toBe("");
    });
});
