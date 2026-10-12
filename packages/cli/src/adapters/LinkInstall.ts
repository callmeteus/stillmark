import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AgentId, InstallScope } from "./Install";
import { resolveTemplatesDir } from "./Install";

/**
 * One link created by `install --link`.
 */
export interface LinkedEntry {
    target: string;
    link: string;
    kind: "junction" | "dir" | "file";
}

/**
 * Templates to link against: the repository `templates/` in a dev checkout, otherwise the packaged copy.
 */
export function resolveSourceTemplatesDir(): string {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const repoTemplates = path.resolve(here, "..", "..", "..", "..", "templates");

    return fs.existsSync(path.join(repoTemplates, "shared")) ? repoTemplates : resolveTemplatesDir();
}

function removeExisting(entry: string): void {
    let stat: fs.Stats;

    try {
        stat = fs.lstatSync(entry);
    } catch {
        return;
    }

    if (stat.isSymbolicLink()) {
        fs.unlinkSync(entry);
    } else {
        fs.rmSync(entry, { recursive: true, force: true });
    }
}

function linkDir(target: string, link: string): LinkedEntry {
    const kind = process.platform === "win32" ? "junction" : "dir";

    fs.symlinkSync(target, link, kind);

    return { target, link, kind };
}

function linkFile(target: string, link: string): LinkedEntry {
    try {
        fs.symlinkSync(target, link, "file");
    } catch (err) {
        throw new Error(
            `Could not create a symlink at ${link}. On Windows, turn on Developer Mode or run the terminal as administrator.`,
            { cause: err }
        );
    }

    return { target, link, kind: "file" };
}

/**
 * Directories named `stillmark` are linked whole; other files are linked one by one.
 */
function linkTree(srcDir: string, destDir: string, out: LinkedEntry[]): void {
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const src = path.join(srcDir, entry.name);
        const dest = path.join(destDir, entry.name);

        fs.mkdirSync(destDir, { recursive: true });

        if (entry.isDirectory() && entry.name === "stillmark") {
            removeExisting(dest);
            out.push(linkDir(src, dest));
        } else
        if (entry.isDirectory()) {
            linkTree(src, dest, out);
        } else {
            removeExisting(dest);
            out.push(linkFile(src, dest));
        }
    }
}

/**
 * Links agent templates instead of copying them, so template edits show up without reinstalling.
 *
 * @param root Project root for `project`, home directory for `global`.
 */
export function linkAgent(root: string, agent: AgentId, scope: InstallScope = "project"): LinkedEntry[] {
    const agentDir = path.join(resolveSourceTemplatesDir(), agent);
    const out: LinkedEntry[] = [];

    if (!fs.existsSync(agentDir)) {
        throw new Error(`Unknown agent templates: ${agent}`);
    }

    if (agent === "codex") {
        const prompt = path.join(agentDir, "prompts", "stillmark.md");
        const dest = scope === "global"
            ? path.join(root, ".codex", "prompts", "stillmark.md")
            : path.join(root, "prompts", "stillmark.md");

        fs.mkdirSync(path.dirname(dest), { recursive: true });
        removeExisting(dest);
        out.push(linkFile(prompt, dest));

        return out;
    }

    linkTree(agentDir, root, out);

    return out;
}
