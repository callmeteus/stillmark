import fs from "node:fs";

import type { ProjectPaths } from "../paths/ProjectPaths";

export interface SharingConfig {
    /**
     * True after the user answered the first-run sharing question (yes or no).
     */
    firstRunPrompted: boolean;
    /**
     * When true, `.stillmark/learnings/design/` is not gitignored and may be committed.
     */
    shareDesignSystem: boolean;
}

export interface LearnedConfig {
    /**
     * Folder for design learning markdown (default `.stillmark/learnings/design`).
     */
    designDir: string;
    /**
     * Folder for code style learning markdown (default `.stillmark/learnings/code-style`).
     */
    codeStyleDir: string;
}

export interface GitConfig {
    autoCommit: boolean;
    autoPush: boolean;
    /**
     * Optional template with `{summary}`. When omitted, Stillmark infers prefix from `git log`.
     */
    commitMessage?: string;
}

export interface StillmarkConfig {
    git: GitConfig;
    sharing: SharingConfig;
    learned: LearnedConfig;
}

const DEFAULT_LEARNED: LearnedConfig = {
    designDir: ".stillmark/learnings/design",
    codeStyleDir: ".stillmark/learnings/code-style"
};

const DEFAULT_SHARING: SharingConfig = {
    firstRunPrompted: false,
    shareDesignSystem: false
};

const DEFAULT_CONFIG: StillmarkConfig = {
    git: {
        autoCommit: false,
        autoPush: false
    },
    sharing: { ...DEFAULT_SHARING },
    learned: { ...DEFAULT_LEARNED }
};

/**
 * Load stillmark.config.json or return defaults.
 */
export function loadConfig(paths: ProjectPaths): StillmarkConfig {
    if (!fs.existsSync(paths.config)) {
        return { ...DEFAULT_CONFIG, git: { ...DEFAULT_CONFIG.git } };
    }

    const raw = fs.readFileSync(paths.config, "utf8");
    const parsed = JSON.parse(raw) as Partial<StillmarkConfig>;

    return {
        git: {
            autoCommit: parsed.git?.autoCommit ?? DEFAULT_CONFIG.git.autoCommit,
            autoPush: parsed.git?.autoPush ?? DEFAULT_CONFIG.git.autoPush,
            commitMessage: parsed.git?.commitMessage
        },
        sharing: {
            firstRunPrompted:
                parsed.sharing?.firstRunPrompted ?? DEFAULT_SHARING.firstRunPrompted,
            shareDesignSystem:
                parsed.sharing?.shareDesignSystem ?? DEFAULT_SHARING.shareDesignSystem
        },
        learned: {
            designDir: parsed.learned?.designDir ?? DEFAULT_LEARNED.designDir,
            codeStyleDir: parsed.learned?.codeStyleDir ?? DEFAULT_LEARNED.codeStyleDir
        }
    };
}

/**
 * Persist stillmark.config.json.
 */
export function writeConfig(paths: ProjectPaths, config: StillmarkConfig): void {
    const content = `${JSON.stringify(config, null, 4)}\n`;

    fs.writeFileSync(paths.config, content, "utf8");
}

/**
 * Write default config (git off).
 */
export function writeDefaultConfig(paths: ProjectPaths): void {
    const content = `${JSON.stringify(DEFAULT_CONFIG, null, 4)}\n`;

    fs.writeFileSync(paths.config, content, "utf8");
}

export type GitOverride = "default" | "force-on" | "force-off";

/**
 * Resolve whether git should run for this operation.
 */
export function resolveGitEnabled(
    config: StillmarkConfig,
    override: GitOverride
): boolean {
    if (override === "force-on") {
        return true;
    }

    if (override === "force-off") {
        return false;
    }

    return config.git.autoCommit;
}

export function resolveGitPush(
    config: StillmarkConfig,
    commitEnabled: boolean
): boolean {
    return commitEnabled && config.git.autoPush;
}
