import fs from "node:fs";

import {
    loadConfig,
    type SharingConfig,
    type StillmarkConfig,
    writeConfig
} from "../config";
import { syncStillmarkGitignore } from "../paths/Gitignore";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

const DESIGN_SYSTEM_README = `# Stillmark design system

Team-shared tokens, components notes, and visual decisions for this repo.
Task plans under \`.stillmark/plans/\` stay local and are never committed.

Update this folder when design-system changes should be visible in git.
`;

export interface SharingStatusPayload {
    needsFirstRunPrompt: boolean;
    firstRunPrompted: boolean;
    shareDesignSystem: boolean;
    alwaysPrivatePaths: string[];
    optionalSharePaths: string[];
}

/**
 * JSON payload for `stillmark config status` (first-run sharing prompt).
 */
export function configStatus(
    paths: ProjectPaths,
    config?: StillmarkConfig
): OperationResult & { config: StillmarkConfig; sharing: SharingStatusPayload } {
    const resolved = config ?? loadConfig(paths);

    const sharing: SharingStatusPayload = {
        needsFirstRunPrompt: !resolved.sharing.firstRunPrompted,
        firstRunPrompted: resolved.sharing.firstRunPrompted,
        shareDesignSystem: resolved.sharing.shareDesignSystem,
        alwaysPrivatePaths: [".stillmark/plans/"],
        optionalSharePaths: [".stillmark/design-system/"]
    };

    return {
        ok: true,
        changed: false,
        action: "config-status",
        summary: sharing.needsFirstRunPrompt
            ? "First-run sharing choice not recorded yet"
            : resolved.sharing.shareDesignSystem
                ? "Design system under .stillmark may be committed; plans stay local"
                : "All of .stillmark except shared paths stays local; plans always private",
        config: resolved,
        sharing
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

    if (nextSharing.shareDesignSystem) {
        fs.mkdirSync(paths.designSystemDir, { recursive: true });

        const readmePath = `${paths.designSystemDir}/README.md`;

        if (!fs.existsSync(readmePath)) {
            fs.writeFileSync(readmePath, DESIGN_SYSTEM_README, "utf8");
        }
    }

    return {
        ok: true,
        changed: true,
        action: "config-set",
        summary: nextSharing.shareDesignSystem
            ? "Sharing enabled for .stillmark/design-system/; task plans remain local"
            : "Keeping .stillmark/design-system/ local; task plans remain local",
        config
    };
}
