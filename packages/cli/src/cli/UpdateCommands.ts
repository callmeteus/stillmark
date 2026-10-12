import { parseIntervalHours } from "../config";
import { setConfigUpdate } from "../operations";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { applyUpdate, checkForUpdates } from "../update";

const CONFIG_USAGE =
    "Usage: stillmark config set [--auto-update=true|false] [--update-interval=<hours>] --json";

const UPDATE_USAGE = "Usage: stillmark update [check] [--force] | update apply --json";

function parseBoolean(value: string): boolean | undefined {
    const normalized = value.toLowerCase();

    if (["true", "yes", "1", "on"].includes(normalized)) {
        return true;
    }

    if (["false", "no", "0", "off"].includes(normalized)) {
        return false;
    }

    return undefined;
}

/**
 * True when `config set` carries update flags.
 */
export function hasUpdateConfigFlags(flags: Record<string, string | boolean>): boolean {
    return flags.autoUpdate !== undefined || flags.updateInterval !== undefined;
}

/**
 * `stillmark config set --auto-update=… --update-interval=…`.
 */
export function runConfigSetUpdate(
    paths: ProjectPaths,
    flags: Record<string, string | boolean>
): OperationResult {
    const auto = flags.autoUpdate === undefined ? undefined : parseBoolean(String(flags.autoUpdate));
    const intervalHours = flags.updateInterval === undefined
        ? undefined
        : parseIntervalHours(flags.updateInterval);

    if (
        (flags.autoUpdate !== undefined && auto === undefined) ||
        (flags.updateInterval !== undefined && intervalHours === undefined)
    ) {
        return { ok: false, changed: false, summary: CONFIG_USAGE };
    }

    return setConfigUpdate(paths, { auto, intervalHours });
}

/**
 * `stillmark update [check|apply]`.
 */
export async function runUpdateCommand(
    paths: ProjectPaths,
    sub: string | undefined,
    flags: Record<string, string | boolean>
): Promise<OperationResult> {
    if (sub === undefined || sub === "check") {
        return checkForUpdates(paths, { force: Boolean(flags.force) });
    }

    if (sub === "apply") {
        return applyUpdate(paths);
    }

    return { ok: false, changed: false, summary: UPDATE_USAGE };
}
