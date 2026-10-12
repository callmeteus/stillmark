import fs from "node:fs";

import {
    STILLMARK_GITIGNORE_ENTRY,
    STILLMARK_LOCAL_DIR,
    type ProjectPaths
} from "./ProjectPaths";

const STILLMARK_GITIGNORE_PATTERN = new RegExp(
    `(^|\\n)\\s*${STILLMARK_LOCAL_DIR.replace(".", "\\.")}\\/?\\s*(\\n|$)`
);

/**
 * Returns true when .gitignore already ignores the local Stillmark directory.
 */
export function gitignoreHasStillmarkLocal(content: string): boolean {
    return STILLMARK_GITIGNORE_PATTERN.test(content);
}

/**
 * Appends `.stillmark/` to .gitignore when not already present.
 *
 * @returns Whether the file was changed.
 */
export function ensureStillmarkGitignore(paths: ProjectPaths): boolean {
    let gitignore = "";

    if (fs.existsSync(paths.gitignore)) {
        gitignore = fs.readFileSync(paths.gitignore, "utf8");
    }

    if (gitignoreHasStillmarkLocal(gitignore)) {
        return false;
    }

    const suffix = gitignore.endsWith("\n") || gitignore === "" ? "" : "\n";
    fs.writeFileSync(
        paths.gitignore,
        `${gitignore}${suffix}${STILLMARK_GITIGNORE_ENTRY}\n`,
        "utf8"
    );

    return true;
}
