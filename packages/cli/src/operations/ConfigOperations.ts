import {
    loadConfig,
    resolveAllDetailLevels,
    type DetailLevel,
    type DetailModule,
    type SharingConfig,
    type StillmarkConfig,
    writeConfig
} from "../config";
import { ensureLearningScaffolds, learningsDirHasMarkdown } from "../learnings";
import { syncStillmarkGitignore } from "../paths/Gitignore";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

export interface SharingStatusPayload {
    needsFirstRunPrompt: boolean;
    firstRunPrompted: boolean;
    shareDesignSystem: boolean;
    alwaysPrivatePaths: string[];
    optionalSharePaths: string[];
    learnings: {
        designDir: string;
        codeStyleDir: string;
        designHasMarkdown: boolean;
        codeStyleHasMarkdown: boolean;
    };
}

/**
 * JSON payload for `stillmark config status` (first-run sharing prompt).
 */
export function configStatus(
    paths: ProjectPaths,
    config?: StillmarkConfig
): OperationResult & {
    config: StillmarkConfig;
    sharing: SharingStatusPayload;
    detail: Record<DetailModule, DetailLevel>;
} {
    const resolved = config ?? loadConfig(paths);

    const sharing: SharingStatusPayload = {
        needsFirstRunPrompt: !resolved.sharing.firstRunPrompted,
        firstRunPrompted: resolved.sharing.firstRunPrompted,
        shareDesignSystem: resolved.sharing.shareDesignSystem,
        alwaysPrivatePaths: [".stillmark/plans/"],
        optionalSharePaths: [".stillmark/learnings/design/"],
        learnings: {
            designDir: resolved.learned.designDir,
            codeStyleDir: resolved.learned.codeStyleDir,
            designHasMarkdown: learningsDirHasMarkdown(paths.learningsDesignDir),
            codeStyleHasMarkdown: learningsDirHasMarkdown(paths.learningsCodeStyleDir)
        }
    };

    return {
        ok: true,
        changed: false,
        action: "config-status",
        summary: sharing.needsFirstRunPrompt
            ? "First-run sharing choice not recorded yet"
            : resolved.sharing.shareDesignSystem
                ? "Design learnings under .stillmark/learnings/design may be committed; plans stay local"
                : "Design learnings stay local; code-style learnings may still be committed",
        config: resolved,
        sharing,
        detail: resolveAllDetailLevels(resolved.detail)
    };
}

export interface SetConfigDetailOptions {
    /**
     * New level, or `inherit` to remove the override so the module (or global) falls back to defaults.
     */
    level: DetailLevel | "inherit";
    /**
     * Module to override; omit to change the global level.
     */
    module?: DetailModule;
}

/**
 * Updates the `detail` block of `stillmark.config.json`.
 */
export function setConfigDetail(
    paths: ProjectPaths,
    options: SetConfigDetailOptions
): OperationResult & { config: StillmarkConfig; detail: Record<DetailModule, DetailLevel> } {
    const config = loadConfig(paths);
    const key = options.module ?? "global";

    if (options.level === "inherit") {
        delete config.detail[key];
    } else {
        config.detail[key] = options.level;
    }

    writeConfig(paths, config);

    const detail = resolveAllDetailLevels(config.detail);

    return {
        ok: true,
        changed: true,
        action: "config-set",
        summary: `Detail: coverage ${detail.coverage}, roadmap ${detail.roadmap}, plan ${detail.plan}`,
        config,
        detail
    };
}

export interface SetConfigSharingOptions {
    shareDesignSystem: boolean;
    markPrompted: boolean;
}

/**
 * Updates `stillmark.config.json` sharing flags and syncs .gitignore.
 */
export function setConfigSharing(
    paths: ProjectPaths,
    options: SetConfigSharingOptions
): OperationResult & { config: StillmarkConfig } {
    const config = loadConfig(paths);
    const nextSharing: SharingConfig = {
        firstRunPrompted: options.markPrompted
            ? true
            : config.sharing.firstRunPrompted,
        shareDesignSystem: options.shareDesignSystem
    };

    config.sharing = nextSharing;
    writeConfig(paths, config);

    syncStillmarkGitignore(paths, nextSharing.shareDesignSystem);
    ensureLearningScaffolds(paths);

    return {
        ok: true,
        changed: true,
        action: "config-set",
        summary: nextSharing.shareDesignSystem
            ? "Sharing enabled for .stillmark/learnings/design/; task plans remain local"
            : "Keeping .stillmark/learnings/design/ local; task plans remain local",
        config
    };
}
