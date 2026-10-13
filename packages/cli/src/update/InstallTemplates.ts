import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
    AgentIds,
    agentTemplateFiles,
    installAgent,
    linkAgent,
    resolveSourceTemplatesDir,
    type AgentId,
    type InstallScope
} from "../adapters";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { readPackageVersion } from "./PackageVersion";
import { globalUpdateStatePath, recordTemplatesVersion, recordTemplatesVersionFile } from "./UpdateState";

/**
 * Inputs for `stillmark install`.
 */
export interface InstallTemplatesOptions {
    /**
     * Install into the home directory so every project gets the skill.
     */
    global?: boolean;
    /**
     * Dev mode: link the source templates instead of copying, so edits show up without reinstalling.
     */
    link?: boolean;
    homeDir?: string;
    currentVersion?: string;
    /**
     * Copy into the project even when the agent already has a global install.
     */
    force?: boolean;
}

/**
 * True when the agent has any Stillmark file (copied or linked) in that scope.
 */
function hasAgentFiles(root: string, agent: AgentId, scope: InstallScope): boolean {
    return agentTemplateFiles(root, agent, scope).some((file) => fs.existsSync(file.dest));
}

/**
 * Installs agent templates in the project or globally and records the templates version for auto-update.
 */
export function installTemplates(
    paths: ProjectPaths,
    agent: string | undefined,
    options: InstallTemplatesOptions = {}
): OperationResult & { scope?: InstallScope; installed: string[]; linked: string[] } {
    if (!AgentIds.includes(agent as AgentId)) {
        return {
            ok: false,
            changed: false,
            action: "install",
            summary: `Pick an agent: stillmark install --agent ${AgentIds.join("|")} [--global] [--link]`,
            installed: [],
            linked: []
        };
    }

    const scope: InstallScope = options.global ? "global" : "project";
    const homeDir = options.homeDir ?? os.homedir();
    const root = scope === "global" ? homeDir : paths.root;
    const where = scope === "global" ? ` globally (${homeDir})` : "";

    if (scope === "project" && !options.force && hasAgentFiles(homeDir, agent as AgentId, "global")) {
        return {
            ok: true,
            changed: false,
            action: "install",
            summary: `${agent} already has Stillmark installed globally (${homeDir}); nothing copied into this repo. To set up this repo run stillmark init. Use --force only to keep a project copy`,
            scope,
            installed: [],
            linked: []
        };
    }

    if (options.link) {
        const entries = linkAgent(root, agent as AgentId, scope);
        const linked = entries.map((entry) => `${entry.link} -> ${entry.target}`);

        return {
            ok: true,
            changed: true,
            action: "install",
            summary: `Linked ${agent} templates${where} to ${path.join(resolveSourceTemplatesDir(), agent as AgentId)}; template edits apply right away and auto-update leaves them alone`,
            location: linked.join(", "),
            scope,
            installed: [],
            linked
        };
    }

    const version = options.currentVersion ?? readPackageVersion();
    const { installed, linked } = installAgent(root, agent as AgentId, scope);

    if (scope === "global") {
        recordTemplatesVersionFile(globalUpdateStatePath(homeDir), version);
    } else {
        recordTemplatesVersion(paths, version);
    }

    return {
        ok: true,
        changed: installed.length > 0,
        action: "install",
        summary: scope === "global"
            ? `Installed ${agent} templates${where}; every project can use /stillmark`
            : `Installed ${agent} templates`,
        location: installed.join(", "),
        scope,
        installed,
        linked
    };
}
