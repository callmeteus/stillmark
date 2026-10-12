import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AgentId = "cursor" | "claude" | "codex";

/**
 * `project` writes into the repository; `global` writes into the user's home so every project gets the skill.
 */
export type InstallScope = "project" | "global";

/**
 * Every agent Stillmark can install templates for.
 */
export const AgentIds: AgentId[] = ["cursor", "claude", "codex"];

/**
 * One packaged template file and where it lands in the project.
 */
export interface AgentTemplateFile {
    src: string;
    dest: string;
}

/**
 * Resolve packaged templates directory.
 */
export function resolveTemplatesDir(): string {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const distTemplates = path.join(here, "..", "templates");

    if (fs.existsSync(distTemplates)) {
        return distTemplates;
    }

    const devTemplates = path.resolve(here, "..", "..", "..", "..", "templates");

    if (fs.existsSync(devTemplates)) {
        return devTemplates;
    }

    throw new Error("Stillmark templates not found");
}

function copyFile(src: string, dest: string): void {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

/**
 * Map packaged templates of one agent to their destination paths.
 *
 * @param root Project root for `project`, home directory for `global`.
 */
export function agentTemplateFiles(
    root: string,
    agent: AgentId,
    scope: InstallScope = "project"
): AgentTemplateFile[] {
    const templates = resolveTemplatesDir();
    const agentDir = path.join(templates, agent);

    if (!fs.existsSync(agentDir)) {
        throw new Error(`Unknown agent templates: ${agent}`);
    }

    if (agent === "codex" && scope === "global") {
        const promptPath = path.join(agentDir, "prompts", "stillmark.md");

        return fs.existsSync(promptPath)
            ? [{ src: promptPath, dest: path.join(root, ".codex", "prompts", "stillmark.md") }]
            : [];
    }

    if (agent === "codex") {
        const files: AgentTemplateFile[] = [];
        const sectionPath = path.join(agentDir, "AGENTS-stillmark.md");
        const promptPath = path.join(agentDir, "prompts", "stillmark.md");

        if (fs.existsSync(promptPath)) {
            files.push({ src: promptPath, dest: path.join(root, "prompts", "stillmark.md") });
        }

        if (fs.existsSync(sectionPath)) {
            files.push({ src: sectionPath, dest: path.join(root, "docs", "stillmark-agents.md") });
        }

        return files;
    }

    return listFiles(agentDir).map((rel) => ({
        src: path.join(agentDir, rel),
        dest: path.join(root, rel)
    }));
}

function sameOnDisk(a: string, b: string): boolean {
    return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
}

/**
 * True when `dest` resolves outside `root` through a symlink or junction (a dev link from `install --link`).
 */
export function isLinkedPath(dest: string, root: string): boolean {
    if (!fs.existsSync(dest)) {
        return false;
    }

    const expected = path.join(fs.realpathSync(root), path.relative(root, dest));

    return !sameOnDisk(fs.realpathSync(dest), expected);
}

/**
 * Install agent templates into the project root, or into the home directory for `global`.
 * Linked destinations are left alone so a copy never writes through a dev link into the source templates.
 */
export function installAgent(
    root: string,
    agent: AgentId,
    scope: InstallScope = "project"
): { installed: string[]; linked: string[] } {
    const installed: string[] = [];
    const linked: string[] = [];

    for (const file of agentTemplateFiles(root, agent, scope)) {
        if (isLinkedPath(file.dest, root)) {
            linked.push(file.dest);
        } else {
            copyFile(file.src, file.dest);
            installed.push(file.dest);
        }
    }

    return { installed, linked };
}

function normalizedContent(file: string): string {
    return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

/**
 * True when at least one template file of the agent was copied under `root` for that scope.
 * Linked installs (`install --link`) follow the source templates and are not managed by auto-update.
 */
export function isAgentInstalled(root: string, agent: AgentId, scope: InstallScope = "project"): boolean {
    return agentTemplateFiles(root, agent, scope)
        .some((file) => fs.existsSync(file.dest) && !isLinkedPath(file.dest, root));
}

/**
 * Copied destination files that are missing or differ from the packaged templates (line endings ignored).
 */
export function staleAgentFiles(root: string, agent: AgentId, scope: InstallScope = "project"): string[] {
    return agentTemplateFiles(root, agent, scope)
        .filter((file) => !isLinkedPath(file.dest, root))
        .filter((file) => !fs.existsSync(file.dest) || normalizedContent(file.dest) !== normalizedContent(file.src))
        .map((file) => file.dest);
}

function listFiles(dir: string, base = dir): string[] {
    const out: string[] = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            out.push(...listFiles(full, base));
        } else {
            out.push(path.relative(base, full));
        }
    }

    return out;
}

/**
 * Load shared instructions for tests.
 */
export function loadSharedInstructions(): string {
    const templates = resolveTemplatesDir();

    return fs.readFileSync(
        path.join(templates, "shared", "INSTRUCTIONS.md"),
        "utf8"
    );
}
