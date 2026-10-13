import { cavemanRulesPayload } from "../caveman";
import {
    loadConfig,
    resolveAllDetailLevels,
    resolveAllLanguages,
    type CavemanLevel,
    type DetailLevel,
    type DetailModule,
    type LanguageTarget,
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

export interface LanguageStatusPayload {
    /**
     * True until a language was chosen for this repo; agents must ask the user once.
     */
    needsPrompt: boolean;
    /**
     * Effective language per target (English when nothing is set).
     */
    resolved: Record<LanguageTarget, string>;
}

export interface CavemanStatusPayload {
    level: CavemanLevel;
    /**
     * Reply rules agents must follow; empty when the level is `off`.
     */
    rules: string[];
    /**
     * Estimated input tokens the rules add to every turn.
     */
    ruleTokens: number;
}

/**
 * JSON payload for `stillmark config status` (first-run sharing and language prompts).
 */
export function configStatus(
    paths: ProjectPaths,
    config?: StillmarkConfig
): OperationResult & {
    config: StillmarkConfig;
    sharing: SharingStatusPayload;
    detail: Record<DetailModule, DetailLevel>;
    language: LanguageStatusPayload;
    caveman: CavemanStatusPayload;
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
        detail: resolveAllDetailLevels(resolved.detail),
        language: {
            needsPrompt: Object.keys(resolved.language).length === 0,
            resolved: resolveAllLanguages(resolved.language)
        },
        caveman: cavemanRulesPayload(resolved.caveman.level)
    };
}

/**
 * Sets the caveman reply level in `stillmark.config.json`.
 */
export function setConfigCaveman(
    paths: ProjectPaths,
    level: CavemanLevel
): OperationResult & { config: StillmarkConfig; caveman: CavemanStatusPayload } {
    const config = loadConfig(paths);

    config.caveman = { level };
    writeConfig(paths, config);

    const caveman = cavemanRulesPayload(level);

    return {
        ok: true,
        changed: true,
        action: "config-set",
        summary: level === "off"
            ? "Caveman replies are off"
            : `Caveman replies are ${level}; the rules cost ~${caveman.ruleTokens} input tokens per turn`,
        config,
        caveman
    };
}

export interface SetConfigLanguageOptions {
    /**
     * Normalized language tag, or `inherit` to remove the override.
     */
    tag: string;
    /**
     * Target to override; omit to change the global language.
     */
    target?: LanguageTarget;
}

/**
 * Updates the `language` block of `stillmark.config.json`.
 */
export function setConfigLanguage(
    paths: ProjectPaths,
    options: SetConfigLanguageOptions
): OperationResult & { config: StillmarkConfig; language: Record<LanguageTarget, string> } {
    const config = loadConfig(paths);
    const key = options.target ?? "global";

    if (options.tag === "inherit") {
        delete config.language[key];
    } else {
        config.language[key] = options.tag;
    }

    writeConfig(paths, config);

    const language = resolveAllLanguages(config.language);

    return {
        ok: true,
        changed: true,
        action: "config-set",
        summary: `Language: ${Object.entries(language).map(([target, tag]) => `${target} ${tag}`).join(", ")}`,
        config,
        language
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

/**
 * Partial update of the `update` block; omitted fields keep their current value.
 */
export interface SetConfigUpdateOptions {
    auto?: boolean;
    intervalHours?: number;
}

/**
 * Updates the `update` block of `stillmark.config.json`.
 */
export function setConfigUpdate(
    paths: ProjectPaths,
    options: SetConfigUpdateOptions
): OperationResult & { config: StillmarkConfig } {
    const config = loadConfig(paths);

    config.update = {
        auto: options.auto ?? config.update.auto,
        intervalHours: options.intervalHours ?? config.update.intervalHours
    };

    writeConfig(paths, config);

    return {
        ok: true,
        changed: true,
        action: "config-set",
        summary: config.update.auto
            ? `Update checks every ${config.update.intervalHours}h`
            : "Automatic update checks are off",
        config
    };
}

/**
 * Turns roadmap `added:` / `done:` dates on or off in `stillmark.config.json`.
 */
export function setConfigRoadmapDates(
    paths: ProjectPaths,
    dates: boolean
): OperationResult & { config: StillmarkConfig } {
    const config = loadConfig(paths);

    config.roadmap = { ...config.roadmap, dates };
    writeConfig(paths, config);

    return {
        ok: true,
        changed: true,
        action: "config-set",
        summary: dates ? "Roadmap dates are on" : "Roadmap dates are off",
        config
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
