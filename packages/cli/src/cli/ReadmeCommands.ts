import type { ProjectPaths } from "../paths/ProjectPaths";
import { readmeCheck, readmePlan, readmeRestore, readmeTemplates } from "../readme";
import type { OperationResult } from "../results/OperationResult";

const USAGE = "Usage: stillmark readme templates | plan [--template=<id>] [--file=README.md] | check [--template=<id>] [--file=README.md] | restore [--file=README.md]";

/**
 * `stillmark readme templates | plan | check | restore`.
 */
export function runReadmeCommand(
    paths: ProjectPaths,
    positional: string[],
    flags: Record<string, string | boolean>
): OperationResult {
    const sub = positional[1];
    const options = {
        template: typeof flags.template === "string" ? flags.template : undefined,
        file: typeof flags.file === "string" ? flags.file : undefined
    };

    if (sub === undefined || sub === "templates") {
        return readmeTemplates();
    }

    if (sub === "plan") {
        return readmePlan(paths, options);
    }

    if (sub === "check") {
        return readmeCheck(paths, options);
    }

    if (sub === "restore") {
        return readmeRestore(paths, options);
    }

    return { ok: false, changed: false, summary: USAGE };
}
