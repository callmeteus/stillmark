import type { GitRunner } from "./GitRunner";

/**
 * Result of staging and committing every pending change in the work tree.
 */
export interface CommitPendingResult {

    committed: boolean;
    topLevel?: string;
    detail?: string;
}

/**
 * Drops tokens users pass when they want a commit without agent `(t)` markers in the subject.
 *
 * @param tokens - Words after `git push` in the CLI invocation.
 * @returns Text to feed into `git message-style`, or empty when nothing remains.
 */
export function pushCommitSummaryFromTokens(tokens: readonly string[]): string {
    const kept = tokens.filter((token) => {
        const lower = token.toLowerCase();

        return lower !== "no-t"
            && lower !== "not"
            && lower !== "(t)"
            && lower !== "no(t)"
            && lower !== "not(t)";
    });

    return kept.join(" ").trim();
}

/**
 * Stages all pending changes (`git add -A`) and commits with the given subject.
 *
 * @param root - Project root passed to Stillmark.
 * @param runner - Git runner (real git or test double).
 * @param message - Full commit subject line.
 * @returns Whether a new commit was created.
 */
export async function commitAllPending(
    root: string,
    runner: GitRunner,
    message: string
): Promise<CommitPendingResult> {
    const top = await runner.capture(root, ["rev-parse", "--show-toplevel"]);

    if (!top.ok || !top.stdout.trim()) {
        return { committed: false, detail: "Not a git repository" };
    }

    const topLevel = top.stdout.trim();
    const status = await runner.capture(topLevel, ["status", "--porcelain"]);

    if (!status.stdout.trim()) {
        return { committed: false, topLevel, detail: "Nothing to commit" };
    }

    const add = await runner.run(topLevel, ["add", "-A"]);

    if (!add.ok) {
        return { committed: false, topLevel, detail: add.stderr.trim() };
    }

    const commit = await runner.run(topLevel, ["commit", "-m", message]);

    if (!commit.ok) {
        return { committed: false, topLevel, detail: commit.stderr.trim() };
    }

    return { committed: true, topLevel };
}
