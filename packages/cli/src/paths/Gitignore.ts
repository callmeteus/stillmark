import fs from "node:fs";

import {
    STILLMARK_DESIGN_SYSTEM_GITIGNORE_ENTRY,
    STILLMARK_LEGACY_GITIGNORE_ENTRY,
    STILLMARK_PLANS_GITIGNORE_ENTRY,
    type ProjectPaths
} from "./ProjectPaths";

const GITIGNORE_COMMENT = "# Stillmark";

function escapeForRegex(segment: string): string {
    return segment.replace(/\./g, "\\.");
}

const LEGACY_PATTERN = new RegExp(
    `(^|\\n)\\s*${escapeForRegex(STILLMARK_LEGACY_GITIGNORE_ENTRY)}\\s*(\\n|$)`
);

const PLANS_PATTERN = new RegExp(
    `(^|\\n)\\s*${escapeForRegex(STILLMARK_PLANS_GITIGNORE_ENTRY)}\\s*(\\n|$)`
);

const DESIGN_PATTERN = new RegExp(
    `(^|\\n)\\s*${escapeForRegex(STILLMARK_DESIGN_SYSTEM_GITIGNORE_ENTRY)}\\s*(\\n|$)`
);

/**
 * Returns true when .gitignore already ignores Stillmark task plans.
 */
export function gitignoreHasStillmarkPlans(content: string): boolean {
    if (PLANS_PATTERN.test(content)) {
        return true;
    }

    return LEGACY_PATTERN.test(content);
}

/**
 * Returns true when design-system under .stillmark is gitignored.
 */
export function gitignoreIgnoresDesignSystem(content: string): boolean {
    if (DESIGN_PATTERN.test(content)) {
        return true;
    }

    return LEGACY_PATTERN.test(content);
}

/**
 * Removes legacy `.stillmark/` ignore in favor of granular entries.
 */
export function stripLegacyStillmarkGitignore(content: string): string {
    return content.replace(LEGACY_PATTERN, "\n");
}

/**
 * Ensures plans are always ignored; design-system ignored when not shared.
 *
 * @returns Whether the file was changed.
 */
export function syncStillmarkGitignore(
    paths: ProjectPaths,
    shareDesignSystem: boolean
): boolean {
    let gitignore = "";

    if (fs.existsSync(paths.gitignore)) {
        gitignore = fs.readFileSync(paths.gitignore, "utf8");
    }

    let next = stripLegacyStillmarkGitignore(gitignore).replace(/\n{3,}/g, "\n\n");

    if (!PLANS_PATTERN.test(next)) {
        const suffix = next.endsWith("\n") || next === "" ? "" : "\n";
        const block =
            next === ""
                ? `${GITIGNORE_COMMENT}\n${STILLMARK_PLANS_GITIGNORE_ENTRY}\n`
                : `${suffix}\n${GITIGNORE_COMMENT}\n${STILLMARK_PLANS_GITIGNORE_ENTRY}\n`;

        next = `${next}${block}`;
    }

    if (shareDesignSystem) {
        next = next.replace(DESIGN_PATTERN, "\n");
    } else
    if (!DESIGN_PATTERN.test(next) && !LEGACY_PATTERN.test(next)) {
        const suffix = next.endsWith("\n") ? "" : "\n";
        next = `${next}${suffix}${STILLMARK_DESIGN_SYSTEM_GITIGNORE_ENTRY}\n`;
    }

    next = next.replace(/\n{3,}/g, "\n\n");

    if (next === gitignore) {
        return false;
    }

    fs.writeFileSync(paths.gitignore, next, "utf8");

    return true;
}

/**
 * Appends Stillmark gitignore rules when not already present (init default: plans + local design-system).
 *
 * @returns Whether the file was changed.
 */
export function ensureStillmarkGitignore(paths: ProjectPaths): boolean {
    return syncStillmarkGitignore(paths, false);
}

/**
 * @deprecated Use gitignoreHasStillmarkPlans or syncStillmarkGitignore.
 */
export function gitignoreHasStillmarkLocal(content: string): boolean {
    return gitignoreHasStillmarkPlans(content);
}
