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

function commitFile(root: string, name: string, message: string): void {
    fs.writeFileSync(path.join(root, name), `${message}\n`);
    git(root, "add", name);
    git(root, "commit", "-q", "-m", message);
}

describe("git push", () => {
    it("sets the upstream on first push, then pushes only new commits", async () => {
        const { root, cleanup } = createTempProject();
        const remote = fs.mkdtempSync(path.join(path.dirname(root), "stillmark-remote-"));

        try {
            git(remote, "init", "-q", "--bare");
            git(root, "init", "-q", "-b", "main");
            git(root, "remote", "add", "origin", remote);
            commitFile(root, "a.txt", "primeiro");

            expect(await cli(root, "git", "push")).toBe(0);
            expect(lastJson()).toMatchObject({ pushed: true, changed: true, branch: "main" });
            expect(git(remote, "log", "-1", "--format=%s", "main").trim()).toBe("primeiro");

            expect(await cli(root, "git", "push")).toBe(0);
            expect(lastJson()).toMatchObject({ pushed: false, changed: false, ahead: 0, upstream: "origin/main" });
            expect(String(lastJson().summary)).toContain("Nothing to push");

            commitFile(root, "b.txt", "segundo");
            commitFile(root, "c.txt", "terceiro");

            expect(await cli(root, "git", "push")).toBe(0);
            expect(lastJson()).toMatchObject({ pushed: true, ahead: 2 });
            expect(git(remote, "log", "-1", "--format=%s", "main").trim()).toBe("terceiro");
        } finally {
            cleanup();
            fs.rmSync(remote, { recursive: true, force: true });
        }
    });

    it("never commits pending work and lists it so the agent can ask", async () => {
        const { root, cleanup } = createTempProject();
        const remote = fs.mkdtempSync(path.join(path.dirname(root), "stillmark-remote-"));

        try {
            git(remote, "init", "-q", "--bare");
            git(root, "init", "-q", "-b", "main");
            git(root, "remote", "add", "origin", remote);
            commitFile(root, "a.txt", "primeiro");
            await cli(root, "git", "push");

            const head = git(root, "rev-parse", "HEAD").trim();

            fs.writeFileSync(path.join(root, "a.txt"), "mudou\n");
            fs.writeFileSync(path.join(root, "novo.txt"), "novo\n");

            expect(await cli(root, "git", "push")).toBe(0);
            expect(lastJson().uncommitted).toEqual(expect.arrayContaining(["a.txt", "novo.txt"]));
            expect(String(lastJson().summary)).toContain("ask the user");
            expect(git(root, "rev-parse", "HEAD").trim()).toBe(head);
        } finally {
            cleanup();
            fs.rmSync(remote, { recursive: true, force: true });
        }
    });

    it("refuses outside git and without a remote", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "git", "push")).toBe(1);
            expect(lastJson()).toMatchObject({ gitRepo: false, pushed: false });

            git(root, "init", "-q", "-b", "main");
            commitFile(root, "a.txt", "primeiro");

            expect(await cli(root, "git", "push")).toBe(1);
            expect(String(lastJson().summary)).toContain("no origin remote");
        } finally {
            cleanup();
        }
    });

    it("reports a failed push", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q", "-b", "main");
            git(root, "remote", "add", "origin", path.join(root, "missing-remote"));
            commitFile(root, "a.txt", "primeiro");

            expect(await cli(root, "git", "push")).toBe(1);
            expect(lastJson()).toMatchObject({ ok: false, pushed: false });
        } finally {
            cleanup();
        }
    });
});
