import path from "node:path";

import type { ProjectPaths } from "../paths/ProjectPaths";
import type { GitRunner } from "./GitRunner";

/** Root documents that the first-run setup may generate next to the Stillmark config. */
export const SetupDocuments = ["DESIGN.md", "PRODUCT.md"] as const;

export interface SetupFiles {
    
    /** False outside a git work tree. */
    gitRepo: boolean;
    /** Repository top level (git paths below are relative to it). */
    topLevel?: string;
    /** Stillmark-owned paths with uncommitted changes, relative to the repository root. */
    files: string[];
}

export interface SetupCommitResult extends SetupFiles {
    
    committed: boolean;
    detail?: string;
}

/**
 * Paths Stillmark setup is allowed to commit. `.stillmark/plans/` is never listed: it stays gitignored,
 * and design learnings only show up when the user chose to share them (otherwise gitignored).
 */
function setupPathspecs(paths: ProjectPaths): string[] {
    return [
        paths.config,
        paths.roadmap,
        paths.coverage,
        paths.gitignore,
        ...SetupDocuments.map((name) => path.join(paths.root, name)),
        path.dirname(paths.learningsDesignDir)
    ];
}

/**
 * Lists Stillmark-owned files that are new or modified (via `git status --porcelain -z`).
 */
export async function listSetupFiles(paths: ProjectPaths, runner: GitRunner): Promise<SetupFiles> {
    const top = await runner.capture(paths.root, ["rev-parse", "--show-toplevel"]);

    if (!top.ok || !top.stdout.trim()) {
        return { gitRepo: false, files: [] };
    }

    const topLevel = path.resolve(top.stdout.trim());
    const status = await runner.capture(topLevel, [
        "status",
        "--porcelain=v1",
        "-z",
        "--untracked-files=all",
        "--",
        ...setupPathspecs(paths).map((p) => path.relative(topLevel, p).replace(/\\/g, "/") || ".")
    ]);

    const entries = status.stdout.split("\0");
    const files: string[] = [];

    for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];

        if (entry.length <= 3) {
            continue;
        }

        files.push(entry.slice(3));

        // Renames and copies carry the source path as the next NUL-separated entry.
        if (entry[0] === "R" || entry[0] === "C") {
            i += 1;
        }
    }

    const owned = files.filter((file) => !file.startsWith(".stillmark/plans/"));

    return { gitRepo: true, topLevel, files: [...new Set(owned)].sort() };
}

/**
 * Commits only the Stillmark setup files, leaving any other staged or unstaged work untouched.
 */
export async function commitSetupFiles(
    paths: ProjectPaths,
    runner: GitRunner,
    message: string
): Promise<SetupCommitResult> {
    const listed = await listSetupFiles(paths, runner);

    if (!listed.gitRepo || !listed.topLevel || listed.files.length === 0) {
        return { ...listed, committed: false, detail: listed.gitRepo ? "Nothing to commit" : "Not a git repository" };
    }

    const add = await runner.run(listed.topLevel, ["add", "--", ...listed.files]);

    if (!add.ok) {
        return { ...listed, committed: false, detail: add.stderr };
    }

    const commit = await runner.run(listed.topLevel, ["commit", "-m", message, "--only", "--", ...listed.files]);

    return commit.ok
        ? { ...listed, committed: true }
        : { ...listed, committed: false, detail: commit.stderr };
}
