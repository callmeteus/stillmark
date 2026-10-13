import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import { loadConfig, normalizeLanguageTag, resolveLanguage } from "../../src/config";
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

describe("language config", () => {
    it("normalizes language tags and rejects invalid ones", () => {
        expect(normalizeLanguageTag("pt_br")).toBe("pt-BR");
        expect(normalizeLanguageTag("EN")).toBe("en");
        expect(normalizeLanguageTag("es-419")).toBe("es-419");
        expect(normalizeLanguageTag("portuguese")).toBeUndefined();
        expect(normalizeLanguageTag(3)).toBeUndefined();
    });

    it("asks for a language until one is chosen, defaulting to English", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "config", "status");

            expect(lastJson().language).toMatchObject({ needsPrompt: true, resolved: { roadmap: "en", commits: "en" } });

            expect(await cli(root, "config", "set", "--language=pt-br")).toBe(0);
            await cli(root, "config", "status");

            expect(lastJson().language).toMatchObject({ needsPrompt: false, resolved: { plan: "pt-BR", docs: "pt-BR" } });
        } finally {
            cleanup();
        }
    });

    it("overrides one document and falls back to global with inherit", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            await cli(root, "config", "set", "--language=pt-BR");
            await cli(root, "config", "set", "--language=en", "--module=coverage");

            expect(resolveLanguage(loadConfig(paths).language, "coverage")).toBe("en");
            expect(resolveLanguage(loadConfig(paths).language, "roadmap")).toBe("pt-BR");

            await cli(root, "config", "set", "--language=inherit", "--module=coverage");

            expect(resolveLanguage(loadConfig(paths).language, "coverage")).toBe("pt-BR");
        } finally {
            cleanup();
        }
    });

    it("refuses invalid tags and targets without writing", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            const before = fs.readFileSync(paths.config, "utf8");

            expect(await cli(root, "config", "set", "--language=portuguese")).toBe(1);
            expect(await cli(root, "config", "set", "--language=pt-BR", "--module=readme")).toBe(1);
            expect(String(lastJson().summary)).toContain("Usage");
            expect(fs.readFileSync(paths.config, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });

    it("writes commit messages in the commits language", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "git", "message-style");

            expect(lastJson()).toMatchObject({ summary: "update Stillmark", commitLanguage: "en" });

            await cli(root, "config", "set", "--language=pt-BR", "--module=commits");
            await cli(root, "git", "message-style");

            expect(lastJson()).toMatchObject({ summary: "atualiza o Stillmark", commitLanguage: "pt-BR" });
        } finally {
            cleanup();
        }
    });
});
