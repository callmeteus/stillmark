import { describe, expect, it } from "vitest";

import {
    inferCommitMessageTemplateFromSubjects,
    resolveCommitMessage
} from "../../src/git/CommitMessageStyle";
import { GitRunner, type ProcessSpawner } from "../../src/git";

describe("CommitMessageStyle", () => {
    it("infers the dominant conventional prefix", () => {
        const template = inferCommitMessageTemplateFromSubjects([
            "feat(t): adiciona coverage ao CLI",
            "feat(t): corrige classificação",
            "fix(t): ajusta gitignore",
            "docs: atualiza README"
        ]);

        expect(template).toBe("feat(t): {summary}");
    });

    it("falls back to summary only without colon subjects", () => {
        const template = inferCommitMessageTemplateFromSubjects([
            "WIP",
            "save"
        ]);

        expect(template).toBe("{summary}");
    });

    it("uses configured template when set", async () => {
        const spawner: ProcessSpawner = async () => {
            return { code: 0, stdout: "", stderr: "" };
        };
        const runner = new GitRunner(spawner);
        const resolved = await resolveCommitMessage(
            "/tmp",
            "Métricas no roadmap",
            "chore: {summary}",
            runner
        );

        expect(resolved.learned).toBe(false);
        expect(resolved.message).toBe("chore: Métricas no roadmap");
    });

    it("learns from git log when config template is omitted", async () => {
        const spawner: ProcessSpawner = async (_cmd, args) => {
            if (args[0] === "log") {
                return {
                    code: 0,
                    stdout: "refactor(t): reorganiza paths\n",
                    stderr: ""
                };
            }

            return { code: 0, stdout: "", stderr: "" };
        };
        const runner = new GitRunner(spawner);
        const resolved = await resolveCommitMessage(
            "/tmp",
            "Roadmap item",
            undefined,
            runner
        );

        expect(resolved.learned).toBe(true);
        expect(resolved.message).toBe("refactor(t): Roadmap item");
    });
});
