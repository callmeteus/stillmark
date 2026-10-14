import { addChangelogEntry, ChangeGroup, checkChangelog, parseChangeGroup, syncChangelog } from "../changelog";
import type { GitRunner } from "../git";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

const GROUPS = Object.values(ChangeGroup).map((group) => group.toLowerCase()).join("|");
const USAGE = `Usage: stillmark changelog [status] | sync | check | add "<what changed>" [--group=${GROUPS}]`;

/**
 * `stillmark changelog [status] | sync | check | add`.
 */
export async function runChangelogCommand(
    paths: ProjectPaths,
    positional: string[],
    flags: Record<string, string | boolean>,
    gitRunner: GitRunner
): Promise<OperationResult> {
    const sub = positional[1];

    if (sub === undefined || sub === "status") {
        return syncChangelog(paths, { dryRun: true, gitRunner });
    }

    if (sub === "sync") {
        return syncChangelog(paths, { gitRunner });
    }

    if (sub === "check") {
        return checkChangelog(paths);
    }

    if (sub === "add" && positional[2]) {
        const group = flags.group === undefined ? ChangeGroup.ADDED : parseChangeGroup(flags.group);

        return group ? addChangelogEntry(paths, positional.slice(2).join(" "), { group }) : { ok: false, changed: false, summary: USAGE };
    }

    return { ok: false, changed: false, summary: USAGE };
}
