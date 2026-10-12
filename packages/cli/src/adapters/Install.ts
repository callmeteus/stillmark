import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AgentId = "cursor" | "claude" | "codex";

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

function copyTree(srcDir: string, destDir: string, stripPrefix: string): void {
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const srcPath = path.join(srcDir, entry.name);

        if (entry.isDirectory()) {
            copyTree(srcPath, path.join(destDir, entry.name), stripPrefix);
        } else {
            const rel = path.relative(stripPrefix, srcPath);
            const destPath = path.join(destDir, rel);
            copyFile(srcPath, destPath);
        }
    }
}

/**
 * Install agent templates into project root.
 */
export function installAgent(
    projectRoot: string,
    agent: AgentId
): { installed: string[] } {
    const templates = resolveTemplatesDir();
    const agentDir = path.join(templates, agent);
    const installed: string[] = [];

    if (!fs.existsSync(agentDir)) {
        throw new Error(`Unknown agent templates: ${agent}`);
    }

    if (agent === "codex") {
        const sectionPath = path.join(agentDir, "AGENTS-stillmark.md");
        const promptPath = path.join(agentDir, "prompts", "stillmark.md");

        if (fs.existsSync(promptPath)) {
            const dest = path.join(projectRoot, "prompts", "stillmark.md");
            copyFile(promptPath, dest);
            installed.push(dest);
        }

        if (fs.existsSync(sectionPath)) {
            const dest = path.join(projectRoot, "docs", "stillmark-agents.md");
            copyFile(sectionPath, dest);
            installed.push(dest);
        }
    } else {
        copyTree(agentDir, projectRoot, agentDir);

        for (const rel of listFiles(agentDir)) {
            installed.push(path.join(projectRoot, rel));
        }
    }

    return { installed };
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
