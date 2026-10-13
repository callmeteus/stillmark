import { isIsoDate } from "../documents";
import type { GitRunner } from "../git";
import { setConfigRoadmapDates } from "../operations";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

function failure(summary: string): OperationResult {
    return { ok: false, changed: false, summary };
}

/**
 * Resolves `--date=YYYY-MM-DD` or `--commit=<ref>` (author date of that commit) into a roadmap date.
 * Returns `{}` when neither flag is present so the operation falls back to today.
 */
export async function roadmapDateFlag(
    paths: ProjectPaths,
    flags: Record<string, string | boolean>,
    gitRunner: GitRunner
): Promise<{ date?: string; error?: OperationResult }> {
    if (flags.date !== undefined && flags.commit !== undefined) {
        return { error: failure("Use either --date or --commit, not both") };
    }

    if (flags.date !== undefined) {
        const value = String(flags.date);

        return isIsoDate(value)
            ? { date: value }
            : { error: failure(`Invalid date "${value}". Use YYYY-MM-DD`) };
    }

    if (flags.commit !== undefined) {
        const ref = String(flags.commit);
        const result = await gitRunner.capture(paths.root, ["show", "-s", "--format=%as", ref, "--"]);
        const date = result.stdout.trim();

        return result.ok && isIsoDate(date)
            ? { date }
            : { error: failure(`Could not read the date of commit "${ref}"`) };
    }

    return {};
}

/**
 * `stillmark config set --roadmap-dates=true|false`.
 */
export function runConfigSetRoadmapDates(
    paths: ProjectPaths,
    flags: Record<string, string | boolean>
): OperationResult {
    const value = String(flags.roadmapDates).toLowerCase();

    if (value !== "true" && value !== "false") {
        return failure("Use --roadmap-dates=true or --roadmap-dates=false");
    }

    return setConfigRoadmapDates(paths, value === "true");
}
