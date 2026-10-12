import fs from "node:fs";
import path from "node:path";

import type { ProjectPaths } from "../paths/ProjectPaths";

/**
 * Local, gitignored cache under `.stillmark/plans/UPDATE.json`.
 */
export interface UpdateState {
    /**
     * ISO timestamp of the last registry check (successful or not).
     */
    lastCheckAt?: string;
    /**
     * Latest version reported by the registry on the last successful check.
     */
    latestVersion?: string;
    /**
     * CLI version that last installed or refreshed the agent templates.
     */
    templatesVersion?: string;
}

/**
 * Read the update cache; a missing or corrupt file counts as empty.
 */
export function loadUpdateState(paths: ProjectPaths): UpdateState {
    if (!fs.existsSync(paths.updateState)) {
        return {};
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(paths.updateState, "utf8")) as unknown;

        return parsed !== null && typeof parsed === "object" ? (parsed as UpdateState) : {};
    } catch {
        return {};
    }
}

/**
 * Persist the update cache.
 */
export function writeUpdateState(paths: ProjectPaths, state: UpdateState): void {
    fs.mkdirSync(path.dirname(paths.updateState), { recursive: true });
    fs.writeFileSync(paths.updateState, `${JSON.stringify(state, null, 4)}\n`, "utf8");
}

/**
 * Record which CLI version wrote the agent templates.
 */
export function recordTemplatesVersion(paths: ProjectPaths, version: string): void {
    writeUpdateState(paths, { ...loadUpdateState(paths), templatesVersion: version });
}
