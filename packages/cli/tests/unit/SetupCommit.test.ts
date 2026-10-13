import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import { createTempProject } from "../helpers/TempProject";

let logs: string[] = [];

beforeEach(() => {
    vi.stubEnv("GIT_AUTHOR_NAME", "t");
    vi.stubEnv("GIT_AUTHOR_EMAIL", "t@t");
    vi.stubEnv("GIT_COMMITTER_NAME", "t");
    vi.stubEnv("GIT_COMMITTER_EMAIL", "t@t");
    logs = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => {
        logs.push(line);
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

function lastJson(): Record<string, unknown> {
    return JSON.parse(logs[logs.length - 1]) as Record<string, unknown>;
}

function cli(root: string, ...args: string[]): Promise<number> {
    return runCli(["node", "stillmark", ...args, "--json", `--root=${root}`]);
}

function git(root: string, ...args: string[]): string {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

describe("first-run setup commit", () => {
    it("lists and commits only Stillmark files, leaving other work untouched", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q");
            fs.writeFileSync(path.join(root, "app.ts"), "export {};\n");
            git(root, "add", "app.ts");
            git(root, "commit", "-q", "-m", "inicial");

            await cli(root, "init");
            fs.writeFileSync(path.join(root, "DESIGN.md"), "# Design\n");
            fs.writeFileSync(path.join(root, "app.ts"), "export const staged = 1;\n");
            git(root, "add", "app.ts");
            fs.writeFileSync(path.join(root, "notes.txt"), "rascunho\n");

            await cli(root, "git", "setup-files");

            const files = (lastJson().setupFiles as { files: string[] }).files;

            expect(lastJson().proposedMessage).toBe("configura o Stillmark");

            expect(files).toEqual(expect.arrayContaining([".gitignore", "DESIGN.md", "ROADMAP.md", "stillmark.config.json"]));
            expect(files).not.toContain("app.ts");
            expect(files).not.toContain("notes.txt");
            expect(files.some((f) => f.startsWith(".stillmark/plans/"))).toBe(false);

            expect(await cli(root, "git", "setup-commit", "--message", "chore: configura o Stillmark")).toBe(0);

            const committed = git(root, "show", "--name-only", "--format=%s", "HEAD").trim().split("\n");

            expect(committed[0]).toBe("chore: configura o Stillmark");
            expect(committed).not.toContain("app.ts");
            expect(committed).toContain("DESIGN.md");
            expect(git(root, "diff", "--cached", "--name-only").trim()).toBe("app.ts");
            expect(git(root, "status", "--porcelain")).toContain("?? notes.txt");
        } finally {
            cleanup();
        }
    });

    it("reports nothing to commit and refuses outside git", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "git", "setup-files")).toBe(1);

            git(root, "init", "-q");
            await cli(root, "init");
            await cli(root, "git", "setup-commit");
            await cli(root, "git", "setup-commit");

            expect(lastJson()).toMatchObject({ ok: true, changed: false, summary: "Nothing to commit" });
        } finally {
            cleanup();
        }
    });

    it("pushes right after the commit by default, and stays local with --auto-push=false", async () => {
        const { root, cleanup } = createTempProject();
        const remote = fs.mkdtempSync(path.join(path.dirname(root), "stillmark-remote-"));

        try {
            git(remote, "init", "-q", "--bare");
            git(root, "init", "-q", "-b", "main");
            fs.writeFileSync(path.join(root, "app.ts"), "export {};\n");
            git(root, "add", "app.ts");
            git(root, "commit", "-q", "-m", "inicial");
            git(root, "remote", "add", "origin", remote);
            git(root, "push", "-q", "-u", "origin", "main");

            await cli(root, "init");
            await cli(root, "config", "status");

            expect((lastJson().config as { git: { autoPush: boolean } }).git.autoPush).toBe(true);
            expect(await cli(root, "git", "setup-commit")).toBe(0);
            expect(lastJson()).toMatchObject({ pushed: true });
            expect(git(remote, "log", "-1", "--format=%s", "main").trim()).toBe("configura o Stillmark");

            expect(await cli(root, "config", "set", "--auto-push=false")).toBe(0);
            fs.writeFileSync(path.join(root, "PRODUCT.md"), "# Product\n");
            await cli(root, "git", "setup-commit", "--message", "docs: produto");

            expect(lastJson()).toMatchObject({ changed: true, pushed: false });
            expect(git(remote, "log", "-1", "--format=%s", "main").trim()).toBe("configura o Stillmark");
            expect(await cli(root, "config", "set", "--auto-push=maybe")).toBe(1);
        } finally {
            cleanup();
            fs.rmSync(remote, { recursive: true, force: true });
        }
    });
});
