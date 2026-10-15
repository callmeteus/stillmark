import os from "node:os";

import {
    AgentIds,
    installAgent,
    isAgentInstalled,
    staleAgentFiles,
    type AgentId,
    type InstallScope
} from "../adapters";
import { loadConfig } from "../config";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { compareVersions, PackageName, readPackageVersion, type LatestVersionFetcher } from "./PackageVersion";
import {
    buildCliInstallHints,
    recommendedCliUpgradeCommand,
    resolveLatestRelease,
    type CliInstallHints,
    type ReleaseChannel
} from "./ReleaseChannels";
import {
    globalUpdateStatePath,
    loadUpdateState,
    loadUpdateStateFile,
    recordTemplatesVersionFile,
    writeUpdateState
} from "./UpdateState";

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
    /**
     * Home directory holding global installs; defaults to the OS home.
     */
    homeDir?: string;
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
    /**
     * `npm` or `github` when `latest` came from the last successful check.
     */
    latestChannel: ReleaseChannel | null;
    /**
     * Global install URLs (GitHub is the fallback while the package is not on npm).
     */
    install: CliInstallHints;
    cliOutdated: boolean;
    outdatedAgents: AgentId[];
    /**
     * Agents installed in the home directory (`install --global`) that need a refresh.
     */
    outdatedGlobalAgents: AgentId[];
    updateAvailable: boolean;
    /**
     * Command the agent should run to update, or null when up to date.
     */
    recommended: string | null;
    nextCheckAt: string | null;
    error?: string;
    /**
     * Why npm was skipped when `latestChannel` is `github`.
     */
    npmFallbackNote?: string;
}

function isBehind(version: string | undefined, target: string): boolean {
    return version === undefined || compareVersions(version, target) < 0;
}

/**
 * Agents installed under `root` for that scope.
 */
export function installedAgents(root: string, scope: InstallScope): AgentId[] {
    return AgentIds.filter((agent) => isAgentInstalled(root, agent, scope));
}

/**
 * Installed agents whose templates were written by an older CLI and differ from the packaged ones.
 */
export function outdatedAgents(
    root: string,
    scope: InstallScope,
    templatesVersion: string | undefined,
    current: string
): AgentId[] {
    if (!isBehind(templatesVersion, current)) {
        return [];
    }

    return installedAgents(root, scope).filter((agent) => staleAgentFiles(root, agent, scope).length > 0);
}

/**
 * Checks npm and GitHub releases for a newer CLI at most once per configured interval, and compares
 * installed templates (project and global) with the running CLI on every call (local and cheap).
 */
export async function checkForUpdates(
    paths: ProjectPaths,
    options: UpdateOptions = {}
): Promise<UpdateCheckResult> {
    const config = loadConfig(paths);
    const now = options.now ?? new Date();
    const current = options.currentVersion ?? readPackageVersion();
    const homeDir = options.homeDir ?? os.homedir();
    const state = loadUpdateState(paths);
    const globalState = loadUpdateStateFile(globalUpdateStatePath(homeDir));
    const intervalMs = config.update.intervalHours * HOUR_MS;
    const lastCheck = state.lastCheckAt ? Date.parse(state.lastCheckAt) : Number.NaN;
    const due = Number.isNaN(lastCheck) || now.getTime() - lastCheck >= intervalMs;

    let skipped: UpdateCheckResult["skipped"];
    let error: string | undefined;
    let npmFallbackNote: string | undefined;
    let latestChannel: ReleaseChannel | null = state.latestChannel ?? null;
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
            if (options.fetchLatest) {
                state.latestVersion = await options.fetchLatest(PackageName);
                latestChannel = "npm";
            } else {
                const resolved = await resolveLatestRelease(PackageName);

                state.latestVersion = resolved.version;
                latestChannel = resolved.channel;

                if (resolved.npmError !== undefined) {
                    npmFallbackNote = resolved.npmError;
                }
            }
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            latestChannel = null;
        }

        state.latestChannel = latestChannel ?? undefined;
        writeUpdateState(paths, state);
    }

    const latest = state.latestVersion ?? null;
    const install = buildCliInstallHints(latest, latestChannel ?? state.latestChannel ?? null);
    const cliOutdated = latest !== null && compareVersions(latest, current) > 0;
    const agents = outdatedAgents(paths.root, "project", state.templatesVersion, current);
    const globalAgents = outdatedAgents(homeDir, "global", globalState.templatesVersion, current);
    const templatesBehindLatest = cliOutdated && latest !== null && (
        isBehind(state.templatesVersion, latest) ||
        (installedAgents(homeDir, "global").length > 0 && isBehind(globalState.templatesVersion, latest))
    );

    let recommended: string | null = null;

    if (templatesBehindLatest && latest !== null && latestChannel !== null) {
        recommended = recommendedCliUpgradeCommand(latest, latestChannel);
    } else
    if (agents.length > 0 || globalAgents.length > 0) {
        recommended = `${PackageName} update apply --json`;
    }

    const nextCheckAt = config.update.auto && state.lastCheckAt
        ? new Date(Date.parse(state.lastCheckAt) + intervalMs).toISOString()
        : null;

    const parts: string[] = [];

    if (cliOutdated) {
        const where = latestChannel === "github" ? "on GitHub releases" : "on npm";

        parts.push(recommended === null
            ? `agent files already use Stillmark ${latest}; the installed CLI is still ${current}`
            : `Stillmark ${latest} is available ${where} (running ${current})`);
    }

    if (agents.length > 0) {
        parts.push(`agent files out of date: ${agents.join(", ")}`);
    }

    if (globalAgents.length > 0) {
        parts.push(`global agent files out of date: ${globalAgents.join(", ")}`);
    }

    if (parts.length === 0) {
        parts.push(skipped === "disabled"
            ? "Automatic update checks are off"
            : `Stillmark ${current} is up to date`);
    }

    if (error !== undefined) {
        parts.push(`version check failed: ${error}`);
    } else
    if (npmFallbackNote !== undefined && latestChannel === "github") {
        parts.push(`npm unavailable (${npmFallbackNote}); using GitHub releases`);
    }

    if (checked && latest !== null && latestChannel === "github") {
        parts.push(`install: ${install.githubLatest}`);
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
        latestChannel: latestChannel ?? state.latestChannel ?? null,
        install,
        cliOutdated,
        outdatedAgents: agents,
        outdatedGlobalAgents: globalAgents,
        updateAvailable: recommended !== null,
        recommended,
        nextCheckAt,
        error,
        npmFallbackNote
    };
}

function refreshScope(root: string, scope: InstallScope): { agents: AgentId[]; files: string[] } {
    const agents: AgentId[] = [];
    const files: string[] = [];

    for (const agent of installedAgents(root, scope)) {
        const stale = staleAgentFiles(root, agent, scope);

        if (stale.length > 0) {
            installAgent(root, agent, scope);
            agents.push(agent);
            files.push(...stale);
        }
    }

    return { agents, files };
}

/**
 * Refreshes every installed agent (project and global) whose files differ from the running CLI templates.
 */
export function applyUpdate(
    paths: ProjectPaths,
    options: Pick<UpdateOptions, "currentVersion" | "homeDir"> = {}
): OperationResult & {
    current: string;
    updatedAgents: AgentId[];
    updatedGlobalAgents: AgentId[];
    updatedFiles: string[];
} {
    const current = options.currentVersion ?? readPackageVersion();
    const homeDir = options.homeDir ?? os.homedir();
    const project = refreshScope(paths.root, "project");
    const global = refreshScope(homeDir, "global");

    writeUpdateState(paths, { ...loadUpdateState(paths), templatesVersion: current });

    if (installedAgents(homeDir, "global").length > 0) {
        recordTemplatesVersionFile(globalUpdateStatePath(homeDir), current);
    }

    const updatedFiles = [...project.files, ...global.files];
    const labels = [...project.agents, ...global.agents.map((agent) => `${agent} (global)`)];

    return {
        ok: true,
        changed: updatedFiles.length > 0,
        action: "update-apply",
        summary: labels.length > 0
            ? `Updated Stillmark ${current} files for ${labels.join(", ")}`
            : `Agent files already match Stillmark ${current}`,
        location: updatedFiles.join(", ") || undefined,
        current,
        updatedAgents: project.agents,
        updatedGlobalAgents: global.agents,
        updatedFiles
    };
}
