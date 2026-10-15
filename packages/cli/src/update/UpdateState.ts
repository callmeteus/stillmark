import fs from "node:fs";
import path from "node:path";

import type { ProjectPaths } from "../paths/ProjectPaths";
import type { ReleaseChannel } from "./ReleaseChannels";

/**
 * Local, gitignored cache under `.stillmark/plans/UPDATE.json`.
 * Global installs keep their own copy in `~/.stillmark/UPDATE.json` (only `templatesVersion` is used there).
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
     * Whether `latestVersion` came from npm or GitHub releases.
     */
    latestChannel?: ReleaseChannel;
    /**
     * CLI version that last installed or refreshed the agent templates.
     */
    templatesVersion?: string;
}

/**
 * Path of the update cache for global (home directory) installs.
 */
export function globalUpdateStatePath(homeDir: string): string {
    return path.join(homeDir, ".stillmark", "UPDATE.json");
}

/**
 * Read an update cache file; a missing or corrupt file counts as empty.
 */
export function loadUpdateStateFile(file: string): UpdateState {
    if (!fs.existsSync(file)) {
        return {};
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as unknown;

        return parsed !== null && typeof parsed === "object" ? (parsed as UpdateState) : {};
    } catch {
        return {};
    }
}

/**
 * Persist an update cache file.
 */
export function writeUpdateStateFile(file: string, state: UpdateState): void {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(state, null, 4)}\n`, "utf8");
}

/**
 * Read the project update cache.
 */
export function loadUpdateState(paths: ProjectPaths): UpdateState {
    return loadUpdateStateFile(paths.updateState);
}

/**
 * Persist the project update cache.
 */
export function writeUpdateState(paths: ProjectPaths, state: UpdateState): void {
    writeUpdateStateFile(paths.updateState, state);
}

/**
 * Record which CLI version wrote the agent templates in an update cache file.
 */
export function recordTemplatesVersionFile(file: string, version: string): void {
    writeUpdateStateFile(file, { ...loadUpdateStateFile(file), templatesVersion: version });
}

/**
 * Record which CLI version wrote the project agent templates.
 */
export function recordTemplatesVersion(paths: ProjectPaths, version: string): void {
    recordTemplatesVersionFile(paths.updateState, version);
}
