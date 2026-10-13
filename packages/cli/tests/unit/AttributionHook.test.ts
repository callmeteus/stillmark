import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import { loadConfig } from "../../src/config";
import { AttributionHookMarker } from "../../src/git";
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

function git(root: string, ...args: string[]): string {
    return execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd: root, encoding: "utf8" });
}

function hookPath(root: string): string {
    return path.join(root, ".git", "hooks", "commit-msg");
}

const AGENT_MESSAGE = [
    "feat: login por QR code",
    "",
    "Corpo da mensagem.",
    "",
    "Made-with: Cursor",
    "Co-authored-by: Cursor <cursoragent@cursor.com>",
    "🤖 Generated with [Claude Code](https://claude.com/claude-code)",
    "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>",
    "Co-authored-by: Maria <maria@example.com>"
].join("\n");

describe("agent attribution hook", () => {
    it("is installed by init and strips Cursor and Claude attribution", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q");
            await cli(root, "init");

            expect(fs.readFileSync(hookPath(root), "utf8")).toContain(AttributionHookMarker);

            git(root, "commit", "-q", "--allow-empty", "-m", AGENT_MESSAGE);

            const message = git(root, "log", "-1", "--format=%B").trimEnd();

            expect(message).toBe([
                "feat: login por QR code",
                "",
                "Corpo da mensagem.",
                "",
                "Co-authored-by: Maria <maria@example.com>"
            ].join("\n"));
        } finally {
            cleanup();
        }
    });

    it("keeps attribution when the setting is turned off", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q");
            await cli(root, "init");
            await cli(root, "config", "set", "--strip-attribution=false");

            expect(loadConfig(paths).git.stripAgentAttribution).toBe(false);
            expect(fs.existsSync(hookPath(root))).toBe(false);

            git(root, "commit", "-q", "--allow-empty", "-m", AGENT_MESSAGE);

            expect(git(root, "log", "-1", "--format=%B")).toContain("Co-authored-by: Cursor");

            await cli(root, "config", "set", "--strip-attribution=true");

            expect(fs.existsSync(hookPath(root))).toBe(true);
        } finally {
            cleanup();
        }
    });

    it("never overwrites a commit-msg hook it did not write", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q");
            fs.mkdirSync(path.dirname(hookPath(root)), { recursive: true });
            fs.writeFileSync(hookPath(root), "#!/bin/sh\nexit 0\n");

            expect(await cli(root, "git", "hook", "install")).toBe(1);
            expect(lastJson().attributionHook).toMatchObject({ foreign: true, installed: false });
            expect(fs.readFileSync(hookPath(root), "utf8")).toBe("#!/bin/sh\nexit 0\n");

            await cli(root, "git", "hook", "remove");

            expect(fs.existsSync(hookPath(root))).toBe(true);
        } finally {
            cleanup();
        }
    });

    it("reports status, and does nothing outside a git repository", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "git", "hook");

            expect(lastJson().attributionHook).toMatchObject({ gitRepo: false, installed: false });

            git(root, "init", "-q");
            await cli(root, "git", "hook", "install");
            await cli(root, "git", "hook", "status");

            expect(lastJson().attributionHook).toMatchObject({ gitRepo: true, installed: true });
            expect(lastJson().link).toBeDefined();
        } finally {
            cleanup();
        }
    });
});
