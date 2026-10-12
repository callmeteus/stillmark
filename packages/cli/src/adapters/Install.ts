import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AgentId = "cursor" | "claude" | "codex";

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
 * Map packaged templates of one agent to their destination paths in the project.
 */
export function agentTemplateFiles(
    projectRoot: string,
    agent: AgentId
): AgentTemplateFile[] {
    const templates = resolveTemplatesDir();
    const agentDir = path.join(templates, agent);

    if (!fs.existsSync(agentDir)) {
        throw new Error(`Unknown agent templates: ${agent}`);
    }

    if (agent === "codex") {
        const files: AgentTemplateFile[] = [];
        const sectionPath = path.join(agentDir, "AGENTS-stillmark.md");
        const promptPath = path.join(agentDir, "prompts", "stillmark.md");

        if (fs.existsSync(promptPath)) {
            files.push({ src: promptPath, dest: path.join(projectRoot, "prompts", "stillmark.md") });
        }

        if (fs.existsSync(sectionPath)) {
            files.push({ src: sectionPath, dest: path.join(projectRoot, "docs", "stillmark-agents.md") });
        }

        return files;
    }

    return listFiles(agentDir).map((rel) => ({
        src: path.join(agentDir, rel),
        dest: path.join(projectRoot, rel)
    }));
}

/**
 * Install agent templates into project root.
 */
export function installAgent(
    projectRoot: string,
    agent: AgentId
): { installed: string[] } {
    const installed: string[] = [];

    for (const file of agentTemplateFiles(projectRoot, agent)) {
        copyFile(file.src, file.dest);
        installed.push(file.dest);
    }

    return { installed };
}

function normalizedContent(file: string): string {
    return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

/**
 * True when at least one template file of the agent exists in the project.
 */
export function isAgentInstalled(projectRoot: string, agent: AgentId): boolean {
    return agentTemplateFiles(projectRoot, agent).some((file) => fs.existsSync(file.dest));
}

/**
 * Destination files that are missing or differ from the packaged templates (line endings ignored).
 */
export function staleAgentFiles(projectRoot: string, agent: AgentId): string[] {
    return agentTemplateFiles(projectRoot, agent)
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
