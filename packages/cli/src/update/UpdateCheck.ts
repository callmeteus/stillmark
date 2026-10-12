import {
    AgentIds,
    installAgent,
    isAgentInstalled,
    staleAgentFiles,
    type AgentId
} from "../adapters";
import { loadConfig } from "../config";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import {
    compareVersions,
    fetchLatestVersion,
    PackageName,
    readPackageVersion,
    type LatestVersionFetcher
} from "./PackageVersion";
import { loadUpdateState, writeUpdateState, type UpdateState } from "./UpdateState";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Inputs for `stillmark update` (check) and `stillmark update apply`.
 */
export interface UpdateOptions {
    /**
     * Check the registry even when disabled or not due yet.
     */
    force?: boolean;
    now?: Date;
    fetchLatest?: LatestVersionFetcher;
    /**
     * Version of the running CLI; defaults to the packaged version.
     */
    currentVersion?: string;
}

/**
 * JSON payload for `stillmark update`.
 */
export interface UpdateCheckResult extends OperationResult {
    /**
     * True when the registry was contacted during this run.
     */
    checked: boolean;
    skipped?: "disabled" | "not-due";
    current: string;
    latest: string | null;
    cliOutdated: boolean;
    outdatedAgents: AgentId[];
    updateAvailable: boolean;
    /**
     * Command the agent should run to update, or null when up to date.
     */
    recommended: string | null;
    nextCheckAt: string | null;
    error?: string;
}

/**
 * Installed agents whose templates were written by an older CLI and differ from the packaged ones.
 */
export function outdatedAgents(paths: ProjectPaths, state: UpdateState, current: string): AgentId[] {
    if (state.templatesVersion !== undefined && compareVersions(state.templatesVersion, current) >= 0) {
        return [];
    }

    return AgentIds.filter(
        (agent) => isAgentInstalled(paths.root, agent) && staleAgentFiles(paths.root, agent).length > 0
    );
}

function recommendedCommand(
    latest: string | null,
    templatesVersion: string | undefined,
    agents: AgentId[]
): string | null {
    const templatesBehindLatest = latest !== null &&
        (templatesVersion === undefined || compareVersions(templatesVersion, latest) < 0);

    if (templatesBehindLatest) {
        return `npx -y ${PackageName}@${latest} update apply --json`;
    }

    if (agents.length > 0) {
        return `${PackageName} update apply --json`;
    }

    return null;
}

/**
 * Checks npm for a newer CLI at most once per configured interval, and compares installed templates
 * with the running CLI on every call (local and cheap).
 */
export async function checkForUpdates(
    paths: ProjectPaths,
    options: UpdateOptions = {}
): Promise<UpdateCheckResult> {
    const config = loadConfig(paths);
    const now = options.now ?? new Date();
    const current = options.currentVersion ?? readPackageVersion();
    const state = loadUpdateState(paths);
    const intervalMs = config.update.intervalHours * HOUR_MS;
    const lastCheck = state.lastCheckAt ? Date.parse(state.lastCheckAt) : Number.NaN;
    const due = Number.isNaN(lastCheck) || now.getTime() - lastCheck >= intervalMs;

    let skipped: UpdateCheckResult["skipped"];
    let error: string | undefined;
    let checked = false;

    if (!options.force && !config.update.auto) {
        skipped = "disabled";
    } else
    if (!options.force && !due) {
        skipped = "not-due";
    } else {
        checked = true;
        state.lastCheckAt = now.toISOString();

        try {
            state.latestVersion = await (options.fetchLatest ?? fetchLatestVersion)(PackageName);
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        }

        writeUpdateState(paths, state);
    }

    const latest = state.latestVersion ?? null;
    const cliOutdated = latest !== null && compareVersions(latest, current) > 0;
    const agents = outdatedAgents(paths, state, current);
    const recommended = cliOutdated
        ? recommendedCommand(latest, state.templatesVersion, agents)
        : recommendedCommand(null, state.templatesVersion, agents);
    const nextCheckAt = config.update.auto && state.lastCheckAt
        ? new Date(Date.parse(state.lastCheckAt) + intervalMs).toISOString()
        : null;

    const parts: string[] = [];

    if (cliOutdated) {
        parts.push(recommended === null
            ? `agent files already use Stillmark ${latest}; the installed CLI is still ${current}`
            : `Stillmark ${latest} is available (running ${current})`);
    }

    if (agents.length > 0) {
        parts.push(`agent files out of date: ${agents.join(", ")}`);
    }

    if (parts.length === 0) {
        parts.push(skipped === "disabled"
            ? "Automatic update checks are off"
            : `Stillmark ${current} is up to date`);
    }

    if (error !== undefined) {
        parts.push(`registry check failed: ${error}`);
    }

    return {
        ok: true,
        changed: checked,
        action: "update-check",
        summary: parts.join("; "),
        checked,
        skipped,
        current,
        latest,
        cliOutdated,
        outdatedAgents: agents,
        updateAvailable: recommended !== null,
        recommended,
        nextCheckAt,
        error
    };
}

/**
 * Refreshes every installed agent whose files differ from the running CLI templates.
 */
export function applyUpdate(
    paths: ProjectPaths,
    options: Pick<UpdateOptions, "currentVersion"> = {}
): OperationResult & { current: string; updatedAgents: AgentId[]; updatedFiles: string[] } {
    const current = options.currentVersion ?? readPackageVersion();
    const state = loadUpdateState(paths);
    const updatedAgents: AgentId[] = [];
    const updatedFiles: string[] = [];

    for (const agent of AgentIds) {
        if (!isAgentInstalled(paths.root, agent)) {
            continue;
        }

        const stale = staleAgentFiles(paths.root, agent);

        if (stale.length === 0) {
            continue;
        }

        installAgent(paths.root, agent);
        updatedAgents.push(agent);
        updatedFiles.push(...stale);
    }

    writeUpdateState(paths, { ...state, templatesVersion: current });

    return {
        ok: true,
        changed: updatedFiles.length > 0,
        action: "update-apply",
        summary: updatedAgents.length > 0
            ? `Updated Stillmark ${current} files for ${updatedAgents.join(", ")}`
            : `Agent files already match Stillmark ${current}`,
        location: updatedFiles.join(", ") || undefined,
        current,
        updatedAgents,
        updatedFiles
    };
}
