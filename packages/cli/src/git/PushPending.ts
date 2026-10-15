import type { GitRunner } from "./GitRunner";

/**
 * What `stillmark git push` found and did.
 */
export interface PushPendingResult {
    
    gitRepo: boolean;
    branch?: string;
    /**
     * Upstream before the push (`origin/main`); `undefined` when the branch had none.
     */
    upstream?: string;
    /**
     * Local commits the remote did not have before the push.
     */
    ahead: number;
    pushed: boolean;
    /**
     * Changed or untracked files left out of the push because they are not committed.
     */
    uncommitted: string[];
    /**
     * True when there is pending work the user may want to commit before another push attempt.
     */
    needsCommit: boolean;
    detail?: string;
}

/**
 * Pushes local commits of the current branch. Sets `origin` as upstream when the branch has none.
 * Never commits: uncommitted files are only listed so the agent can ask the user first.
 */
export async function pushPending(root: string, runner: GitRunner): Promise<PushPendingResult> {
    const top = await runner.capture(root, ["rev-parse", "--show-toplevel"]);

    if (!top.ok) {
        return {
            gitRepo: false,
            ahead: 0,
            pushed: false,
            uncommitted: [],
            needsCommit: false,
            detail: "Not a git repository"
        };
    }

    const cwd = top.stdout.trim();
    const status = await runner.capture(cwd, ["status", "--porcelain"]);
    const uncommitted = status.stdout.split(/\r?\n/).filter(Boolean).map((line) => line.slice(3));
    const branch = (await runner.capture(cwd, ["rev-parse", "--abbrev-ref", "HEAD"])).stdout.trim();
    const upstreamResult = await runner.capture(cwd, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
    const upstream = upstreamResult.ok ? upstreamResult.stdout.trim() : undefined;
    const needsCommit = uncommitted.length > 0;
    const base = { gitRepo: true, branch, upstream, uncommitted, needsCommit };

    if (upstream === undefined) {
        const remotes = (await runner.capture(cwd, ["remote"])).stdout.split(/\r?\n/).filter(Boolean);

        if (!remotes.includes("origin")) {
            return { ...base, ahead: 0, pushed: false, detail: "No upstream and no origin remote; add a remote first" };
        }

        const count = await runner.capture(cwd, ["rev-list", "--count", "HEAD"]);
        const push = await runner.run(cwd, ["push", "--set-upstream", "origin", branch]);

        return {
            ...base,
            ahead: Number(count.stdout.trim()) || 0,
            pushed: push.ok,
            detail: push.ok ? undefined : push.stderr.trim()
        };
    }

    const ahead = Number((await runner.capture(cwd, ["rev-list", "--count", `${upstream}..HEAD`])).stdout.trim()) || 0;

    if (ahead === 0) {
        return { ...base, ahead, pushed: false };
    }

    const push = await runner.run(cwd, ["push"]);

    return { ...base, ahead, pushed: push.ok, detail: push.ok ? undefined : push.stderr.trim() };
}
