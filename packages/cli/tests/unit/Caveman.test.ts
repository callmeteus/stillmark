import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cavemanRules, compareCompressed } from "../../src/caveman";
import { runCli } from "../../src/cli";
import { loadConfig, parseCavemanLevel } from "../../src/config";
import { createTempProject } from "../helpers/TempProject";

let logs: string[] = [];

beforeEach(() => {
    logs = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => {
        logs.push(line);
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});

function lastJson(): Record<string, unknown> {
    return JSON.parse(logs[logs.length - 1]) as Record<string, unknown>;
}

function cli(root: string, ...args: string[]): Promise<number> {
    return runCli(["node", "stillmark", ...args, "--json", `--root=${root}`]);
}

const ORIGINAL = [
    "---",
    "description: Agent rules",
    "---",
    "",
    "# Agent rules",
    "",
    "You should always make sure that you run `npm test` before you finish any piece of work, because otherwise the build might break.",
    "",
    "See [the docs](https://example.com/docs) and the file src/cli/Cli.ts for the details of how the commands are wired.",
    "",
    "```bash",
    "npm run lint",
    "```",
    ""
].join("\n");

const COMPRESSED = [
    "---",
    "description: Agent rules",
    "---",
    "",
    "# Agent rules",
    "",
    "Run `npm test` before finishing.",
    "",
    "Docs: [docs](https://example.com/docs). Wiring: src/cli/Cli.ts.",
    "",
    "```bash",
    "npm run lint",
    "```",
    ""
].join("\n");

describe("caveman config", () => {
    it("is off by default and adds no rules", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            expect(loadConfig(paths).caveman.level).toBe("off");

            await cli(root, "config", "status");

            expect(lastJson().caveman).toEqual({ level: "off", rules: [], ruleTokens: 0 });
        } finally {
            cleanup();
        }
    });

    it("turns on with plain words and grows the rules per level", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            expect(await cli(root, "config", "set", "--caveman=on")).toBe(0);
            expect(loadConfig(paths).caveman.level).toBe("full");

            await cli(root, "config", "status");

            const status = lastJson().caveman as { rules: string[]; ruleTokens: number };

            expect(status.rules.join(" ")).toContain("user's language");
            expect(status.rules.join(" ")).toContain("exactly as they are");
            expect(status.ruleTokens).toBeGreaterThan(0);
            expect(cavemanRules("lite").length).toBeLessThan(cavemanRules("full").length);
            expect(cavemanRules("full").length).toBeLessThan(cavemanRules("ultra").length);

            expect(await cli(root, "config", "set", "--caveman=off")).toBe(0);
            expect(loadConfig(paths).caveman.level).toBe("off");
        } finally {
            cleanup();
        }
    });

    it("refuses unknown levels without writing", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            const before = fs.readFileSync(paths.config, "utf8");

            expect(parseCavemanLevel("mega")).toBeUndefined();
            expect(await cli(root, "config", "set", "--caveman=mega")).toBe(1);
            expect(String(lastJson().summary)).toContain("Usage");
            expect(fs.readFileSync(paths.config, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });

    it("turns on or off for the conversation only, without touching the config", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            const before = fs.readFileSync(paths.config, "utf8");

            expect(await cli(root, "caveman", "on")).toBe(0);
            expect(lastJson()).toMatchObject({ temporary: true, level: "full", savedLevel: "off", changed: false });
            expect((lastJson().rules as string[]).length).toBeGreaterThan(0);

            expect(await cli(root, "caveman", "ultra")).toBe(0);
            expect(lastJson()).toMatchObject({ temporary: true, level: "ultra" });

            expect(await cli(root, "caveman", "off")).toBe(0);
            expect(lastJson()).toMatchObject({ temporary: true, level: "off", rules: [], ruleTokens: 0 });
            expect(fs.readFileSync(paths.config, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });

    it("saves the level with --save", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            expect(await cli(root, "caveman", "lite", "--save")).toBe(0);
            expect(loadConfig(paths).caveman.level).toBe("lite");

            await cli(root, "caveman", "off");

            expect(lastJson()).toMatchObject({ level: "off", savedLevel: "lite" });
            expect(loadConfig(paths).caveman.level).toBe("lite");
        } finally {
            cleanup();
        }
    });

    it("falls back to off when the config holds an invalid level", () => {
        const { paths, cleanup } = createTempProject();

        try {
            const config = JSON.parse(fs.readFileSync(paths.config, "utf8")) as Record<string, unknown>;

            fs.writeFileSync(paths.config, JSON.stringify({ ...config, caveman: { level: "loud" } }), "utf8");

            expect(loadConfig(paths).caveman.level).toBe("off");
        } finally {
            cleanup();
        }
    });
});

describe("caveman compare", () => {
    it("accepts a shorter rewrite that keeps everything exact", () => {
        expect(compareCompressed(ORIGINAL, COMPRESSED)).toEqual([]);
    });

    it("reports lost code, links, paths, headings, and frontmatter", () => {
        const broken = COMPRESSED
            .replace("description: Agent rules", "description: rules")
            .replace("# Agent rules", "# Rules")
            .replace("`npm test`", "tests")
            .replace("https://example.com/docs", "example.com")
            .replace("src/cli/Cli.ts", "Cli")
            .replace("npm run lint", "npm run lint --fix");
        const kinds = compareCompressed(ORIGINAL, broken).map((issue) => issue.kind);

        expect(kinds).toEqual(expect.arrayContaining(["frontmatter", "heading", "inline-code", "url", "path", "code-block"]));
    });

    it("reports a rewrite that is not smaller", () => {
        expect(compareCompressed(ORIGINAL, `${ORIGINAL}\nMore words.`).map((issue) => issue.kind)).toContain("size");
    });

    it("ignores Windows line endings", () => {
        expect(compareCompressed(ORIGINAL.replace(/\n/g, "\r\n"), COMPRESSED)).toEqual([]);
    });
});

describe("caveman context files", () => {
    it("keeps the original, verifies the rewrite, reports savings, and restores", async () => {
        const { root, paths, cleanup } = createTempProject();
        const file = path.join(root, "AGENTS.md");

        try {
            fs.writeFileSync(file, ORIGINAL, "utf8");

            expect(await cli(root, "caveman", "compress", "AGENTS.md")).toBe(0);

            const compress = lastJson();
            const original = path.join(root, String(compress.original));

            expect(fs.readFileSync(original, "utf8")).toBe(ORIGINAL);
            expect(compress.instructions).toEqual(expect.arrayContaining([expect.stringContaining("byte-exact")]));
            expect(original.startsWith(paths.planningDir)).toBe(true);

            fs.writeFileSync(file, COMPRESSED, "utf8");

            expect(await cli(root, "caveman", "verify", "AGENTS.md")).toBe(0);
            expect(Number(lastJson().savedTokens)).toBeGreaterThan(0);

            await cli(root, "caveman", "compress", "AGENTS.md");

            expect(fs.readFileSync(original, "utf8")).toBe(ORIGINAL);

            await cli(root, "caveman", "verify", "AGENTS.md");
            await cli(root, "caveman");

            const stats = lastJson();

            expect(stats.files).toHaveLength(1);
            expect(Number(stats.savedTokens)).toBeGreaterThan(0);

            expect(await cli(root, "caveman", "restore", "AGENTS.md")).toBe(0);
            expect(fs.readFileSync(file, "utf8")).toBe(ORIGINAL);
            expect(fs.existsSync(original)).toBe(false);

            await cli(root, "caveman", "stats");

            expect(lastJson().files).toHaveLength(0);
        } finally {
            cleanup();
        }
    });

    it("fails verify with the list of problems when the rewrite loses content", async () => {
        const { root, cleanup } = createTempProject();
        const file = path.join(root, "AGENTS.md");

        try {
            fs.writeFileSync(file, ORIGINAL, "utf8");
            await cli(root, "caveman", "compress", "AGENTS.md");
            fs.writeFileSync(file, "# Agent rules\n\nRun tests.\n", "utf8");

            expect(await cli(root, "caveman", "verify", "AGENTS.md")).toBe(1);
            expect((lastJson().issues as unknown[]).length).toBeGreaterThan(0);

            await cli(root, "caveman");

            expect(String(lastJson().summary)).toContain("still need");
        } finally {
            cleanup();
        }
    });

    it("refuses Stillmark documents, outside files, missing files, and other formats", async () => {
        const { root, cleanup } = createTempProject();

        try {
            fs.writeFileSync(path.join(root, "ROADMAP.md"), "# Roadmap\n", "utf8");
            fs.writeFileSync(path.join(root, "notes.json"), "{}", "utf8");

            expect(await cli(root, "caveman", "compress", "ROADMAP.md")).toBe(1);
            expect(String(lastJson().summary)).toContain("read by Stillmark");

            expect(await cli(root, "caveman", "compress", "../outside.md")).toBe(1);
            expect(String(lastJson().summary)).toContain("outside the project");

            expect(await cli(root, "caveman", "compress", "missing.md")).toBe(1);
            expect(await cli(root, "caveman", "compress", "notes.json")).toBe(1);
            expect(await cli(root, "caveman", "compress")).toBe(1);
            expect(await cli(root, "caveman", "verify", "missing.md")).toBe(1);
            expect(await cli(root, "caveman", "restore", "missing.md")).toBe(1);
        } finally {
            cleanup();
        }
    });

    it("refuses verify and restore before compress", async () => {
        const { root, cleanup } = createTempProject();

        try {
            fs.writeFileSync(path.join(root, "AGENTS.md"), ORIGINAL, "utf8");

            expect(await cli(root, "caveman", "verify", "AGENTS.md")).toBe(1);
            expect(String(lastJson().summary)).toContain("compress");
            expect(await cli(root, "caveman", "restore", "AGENTS.md")).toBe(1);
            expect(await cli(root, "caveman", "shrink")).toBe(1);
        } finally {
            cleanup();
        }
    });
});
