import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { installAgent } from "../../src/adapters";
import { AgentMigrationRunner, RemoveSplitStillmarkAgentFiles } from "../../src/migrations";

describe("AgentMigrationRunner", () => {
    const roots: string[] = [];

    afterEach(() => {
        for (const root of roots) {
            fs.rmSync(root, {
                recursive: true,
                force: true
            });
        }

        roots.length = 0;
    });

    /**
     * Creates a temp directory tracked for cleanup after the test.
     *
     * @returns Absolute path to the temp directory.
     */
    function tempRoot(): string {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-migrate-"));

        roots.push(root);

        return root;
    }

    it("registers the split-command removal migration for cursor and claude", () => {
        const cursorIds = AgentMigrationRunner.migrationsForAgent("cursor").map((m) => m.id);
        const claudeIds = AgentMigrationRunner.migrationsForAgent("claude").map((m) => m.id);

        expect(cursorIds).toContain(RemoveSplitStillmarkAgentFiles.id);
        expect(claudeIds).toContain(RemoveSplitStillmarkAgentFiles.id);
        expect(AgentMigrationRunner.migrationsForAgent("codex")).toEqual([]);
    });

    it("removes legacy split slash commands and skills but keeps commands/stillmark.md", () => {
        const root = tempRoot();
        const stillmarkCommand = path.join(root, ".cursor", "commands", "stillmark.md");
        const legacyCommand = path.join(root, ".cursor", "commands", "coverage.md");
        const legacySkill = path.join(root, ".cursor", "skills", "coverage", "SKILL.md");

        fs.mkdirSync(path.dirname(stillmarkCommand), { recursive: true });
        fs.writeFileSync(stillmarkCommand, "ok\n", "utf8");
        fs.writeFileSync(legacyCommand, "legacy\n", "utf8");
        fs.mkdirSync(path.dirname(legacySkill), { recursive: true });
        fs.writeFileSync(legacySkill, "legacy\n", "utf8");

        const applied = AgentMigrationRunner.runForAgent(root, "cursor");
        const splitMigration = applied.find((entry) => entry.id === RemoveSplitStillmarkAgentFiles.id);

        expect(splitMigration).toBeDefined();
        expect(splitMigration?.removed).toContain(legacyCommand);
        expect(splitMigration?.removed).toContain(path.join(root, ".cursor", "skills", "coverage"));
        expect(fs.existsSync(stillmarkCommand)).toBe(true);
        expect(fs.existsSync(legacyCommand)).toBe(false);
    });

    it("runs migrations during installAgent", () => {
        const root = tempRoot();

        const result = installAgent(root, "cursor");

        expect(result.migrations.some((entry) => entry.id === RemoveSplitStillmarkAgentFiles.id)).toBe(true);
        expect(fs.existsSync(path.join(root, ".cursor", "commands", "stillmark.md"))).toBe(true);
        expect(fs.existsSync(path.join(root, ".cursor", "skills", "stillmark", "SKILL.md"))).toBe(true);
    });
});
