import { describe, expect, it } from "vitest";

import { CommitType, CommitTypeSource, inferCommitType, onlyStillmarkFiles, splitSummaryPrefix } from "../../src/git";

describe("CommitType", () => {
    it("splits a known prefix and drops the (t) marker", () => {
        expect(splitSummaryPrefix("feat(t): adiciona X")).toEqual({ type: CommitType.FEAT, scope: undefined, breaking: false, summary: "adiciona X" });
        expect(splitSummaryPrefix("fix(auth)!: troca login")).toEqual({ type: CommitType.FIX, scope: "auth", breaking: true, summary: "troca login" });
    });

    it("leaves unknown prefixes in the summary", () => {
        expect(splitSummaryPrefix("Nota: algo mudou")).toEqual({ breaking: false, summary: "Nota: algo mudou" });
    });

    it("uses docs when only documentation changed, even with a fix verb", () => {
        const inferred = inferCommitType("corrige link do README", [{ path: "README.md", added: false }, { path: "docs/setup.md", added: false }]);

        expect(inferred).toMatchObject({ type: CommitType.DOCS, source: CommitTypeSource.FILES });
    });

    it("uses test, ci, and chore for files of one kind", () => {
        expect(inferCommitType("", [{ path: "packages/cli/tests/unit/A.test.ts", added: true }]).type).toBe(CommitType.TEST);
        expect(inferCommitType("", [{ path: ".github/workflows/ci.yml", added: false }]).type).toBe(CommitType.CI);
        expect(inferCommitType("", [{ path: "package.json", added: false }, { path: ".gitignore", added: false }]).type).toBe(CommitType.CHORE);
    });

    it("reads the verb of the summary for source changes", () => {
        const source = [{ path: "src/a.ts", added: false }, { path: "README.md", added: false }];

        expect(inferCommitType("corrige o cálculo do total", source).type).toBe(CommitType.FIX);
        expect(inferCommitType("refatora o carregador", source).type).toBe(CommitType.REFACTOR);
        expect(inferCommitType("adds dark mode", source).type).toBe(CommitType.FEAT);
        expect(inferCommitType("otimiza a busca", source).type).toBe(CommitType.PERF);
    });

    it("uses feat for new source files without other signals", () => {
        expect(inferCommitType("", [{ path: "src/text/TextCheck.ts", added: true }])).toMatchObject({
            type: CommitType.FEAT,
            source: CommitTypeSource.NEW_FILES
        });
    });

    it("marks the guess as default when nothing points to a type", () => {
        expect(inferCommitType("ajustes", [{ path: "src/a.ts", added: false }]).source).toBe(CommitTypeSource.DEFAULT);
    });

    it("detects changes made only to Stillmark files", () => {
        expect(onlyStillmarkFiles([{ path: "ROADMAP.md", added: false }, { path: ".stillmark/state.json", added: true }])).toBe(true);
        expect(onlyStillmarkFiles([{ path: "ROADMAP.md", added: false }, { path: "src/a.ts", added: false }])).toBe(false);
        expect(onlyStillmarkFiles([])).toBe(false);
    });
});
