import { describe, expect, it } from "vitest";

import {
    inferCommitMessageTemplateFromSubjects,
    resolveCommitMessage
} from "../../src/git/CommitMessageStyle";
import { CommitType, CommitTypeSource, GitRunner, type ProcessSpawner } from "../../src/git";

function runnerWithLog(log: string): GitRunner {
    const spawner: ProcessSpawner = async (_cmd, args) => {
        return args[0] === "log" ? { code: 0, stdout: log, stderr: "" } : { code: 0, stdout: "", stderr: "" };
    };

    return new GitRunner(spawner);
}

const CONVENTIONAL_LOG = "feat(t): adiciona coverage\nfix(t): corrige classificação\ndocs: atualiza README\n";

describe("CommitMessageStyle", () => {
    it("learns the conventional format but never copies a type or scope", () => {
        const template = inferCommitMessageTemplateFromSubjects([
            "feat(t): adiciona coverage ao CLI",
            "feat(t): corrige classificação",
            "fix(t): ajusta gitignore",
            "docs: atualiza README"
        ], "refactor");

        expect(template).toBe("refactor: {summary}");
    });

    it("falls back to summary only without a conventional history", () => {
        const template = inferCommitMessageTemplateFromSubjects([
            "WIP",
            "save",
            "Merge stuff"
        ], "feat");

        expect(template).toBe("{summary}");
    });

    it("uses configured template when set for Stillmark commits", async () => {
        const resolved = await resolveCommitMessage("/tmp", "Métricas no roadmap", "chore: {summary}", runnerWithLog(""), {
            kind: CommitType.DOCS
        });

        expect(resolved.learned).toBe(false);
        expect(resolved.message).toBe("chore: Métricas no roadmap");
    });

    it("uses the fixed kind for Stillmark's own commits", async () => {
        const resolved = await resolveCommitMessage("/tmp", "Roadmap item", undefined, runnerWithLog("refactor(t): reorganiza paths\n"), {
            kind: CommitType.DOCS
        });

        expect(resolved.learned).toBe(true);
        expect(resolved.message).toBe("docs: Roadmap item");
        expect(resolved.typeSource).toBe(CommitTypeSource.STILLMARK);
    });

    it("types code changes as feat, never as docs copied from the last commit", async () => {
        const resolved = await resolveCommitMessage(
            "/tmp",
            "adiciona checagem de texto",
            undefined,
            runnerWithLog("docs: atualiza README\ndocs: corrige link\n"),
            { changes: [{ path: "packages/cli/src/text/TextCheck.ts", added: true }, { path: "README.md", added: false }] }
        );

        expect(resolved.message).toBe("feat: adiciona checagem de texto");
        expect(resolved.type).toBe("feat");
    });

    it("replaces the type of a configured template with the inferred one for change commits", async () => {
        const resolved = await resolveCommitMessage("/tmp", "corrige o login", "docs: {summary}", runnerWithLog(""), {
            changes: [{ path: "src/auth/Login.ts", added: false }]
        });

        expect(resolved.message).toBe("fix: corrige o login");
    });

    it("never cuts a long summary and warns instead", async () => {
        const summary = "adiciona detecção de idioma por parágrafo, checagem de padrões e reescrita com verificação de fatos";
        const resolved = await resolveCommitMessage("/tmp", summary, undefined, runnerWithLog(CONVENTIONAL_LOG), {
            changes: [{ path: "src/text/TextCheck.ts", added: true }]
        });

        expect(resolved.message).toBe(`feat: ${summary}`);
        expect(resolved.warning).toContain("72");
    });

    it("keeps the type the summary already has and drops agent markers", async () => {
        const resolved = await resolveCommitMessage("/tmp", "fix(t): ajusta push", undefined, runnerWithLog(CONVENTIONAL_LOG), {
            changes: [{ path: "src/git/Push.ts", added: true }]
        });

        expect(resolved.message).toBe("fix: ajusta push");
        expect(resolved.typeSource).toBe(CommitTypeSource.SUMMARY_PREFIX);
    });

    it("writes the plain summary when the repo does not use conventional commits", async () => {
        const resolved = await resolveCommitMessage("/tmp", "adiciona texto", undefined, runnerWithLog("WIP\nsave\n"), {
            changes: [{ path: "src/a.ts", added: true }]
        });

        expect(resolved.message).toBe("adiciona texto");
        expect(resolved.type).toBeUndefined();
    });
});
