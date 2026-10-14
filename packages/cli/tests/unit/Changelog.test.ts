import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { commitEntry, plainEntryText } from "../../src/changelog";
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

/** Commits one file change on a fixed day so releases get predictable dates. */
function commitOn(root: string, day: string, message: string, file = "work.txt", content = `${message}\n`): void {
    const when = `${day}T12:00:00`;

    fs.writeFileSync(path.join(root, file), content);
    git(root, "add", file);
    execFileSync("git", ["commit", "-q", "-m", message], {
        cwd: root,
        env: { ...process.env, GIT_AUTHOR_DATE: when, GIT_COMMITTER_DATE: when }
    });
}

function changelog(root: string): string {
    return fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
}

describe("changelog entries", () => {
    it("keeps only user-visible commit types, in sentence case", () => {
        expect(commitEntry("feat(api): export invoices as CSV.")).toEqual({ group: "ADDED", text: "Export invoices as CSV" });
        expect(commitEntry("fix!: login loop")).toEqual({ group: "FIXED", text: "Login loop" });
        expect(commitEntry("perf: faster search")).toEqual({ group: "CHANGED", text: "Faster search" });
        expect(commitEntry("docs: readme")).toBeUndefined();
        expect(commitEntry("chore(t): bump deps")).toBeUndefined();
        expect(commitEntry("Merge branch main")).toBeUndefined();
        expect(plainEntryText("  dark mode. ")).toBe("Dark mode");
    });
});

describe("changelog sync", () => {
    it("creates a changelog with only Unreleased when there is no history, intro in the document language", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "config", "set", "--language=pt-BR", "--module=changelog");

            expect(await cli(root, "changelog", "sync")).toBe(0);
            expect(lastJson()).toMatchObject({ created: true, source: "NONE", entriesAdded: 0 });
            expect(changelog(root)).toBe("# Changelog\n\nTodas as mudanças relevantes deste projeto, das mais recentes para as mais antigas.\n\n## [Unreleased]\n");
        } finally {
            cleanup();
        }
    });

    it("previews without writing", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "changelog")).toBe(0);
            expect(lastJson()).toMatchObject({ changed: false, created: true, action: "changelog status" });
            expect(String(lastJson().summary)).toMatch(/^Would create/);
            expect(fs.existsSync(path.join(root, "CHANGELOG.md"))).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("places done roadmap items in the release that shipped them, newest release first", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q", "-b", "main");
            commitOn(root, "2026-01-10", "chore: start");
            git(root, "tag", "v0.1.0");
            commitOn(root, "2026-02-10", "chore: more");
            git(root, "tag", "v0.2.0");
            await cli(root, "roadmap", "add", "Invoice export", "--done", "--date=2026-01-05", "--no-git");
            await cli(root, "roadmap", "add", "Fix login loop", "--done", "--date=2026-02-01", "--no-git");
            await cli(root, "roadmap", "add", "Dark mode", "--done", "--date=2026-03-01", "--no-git");
            await cli(root, "roadmap", "add", "Not finished yet", "--no-git");

            expect(await cli(root, "changelog", "sync")).toBe(0);
            expect(lastJson()).toMatchObject({ source: "TAGS", releasesAdded: ["0.1.0", "0.2.0"], entriesAdded: 3 });

            const text = changelog(root);

            expect(text).toContain("## [Unreleased]\n\n### Added\n\n- Dark mode\n\n## [0.2.0] - 2026-02-10\n\n### Fixed\n\n- Fix login loop\n\n## [0.1.0] - 2026-01-10\n\n### Added\n\n- Invoice export\n");
            expect(text).not.toContain("Not finished yet");

            expect(await cli(root, "changelog", "sync")).toBe(0);
            expect(lastJson()).toMatchObject({ changed: false, summary: "CHANGELOG.md is up to date" });
            expect(changelog(root)).toBe(text);
        } finally {
            cleanup();
        }
    });

    it("falls back to feat and fix commits for releases without roadmap items and leaves secrets out", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q", "-b", "main");
            commitOn(root, "2026-01-01", "feat: export invoices");
            commitOn(root, "2026-01-02", "fix(api): login loop");
            commitOn(root, "2026-01-03", "docs: readme");
            commitOn(root, "2026-01-04", "feat: token=abcdef1234567890");
            git(root, "tag", "1.0.0");

            expect(await cli(root, "changelog", "sync")).toBe(0);
            expect(lastJson()).toMatchObject({ releasesAdded: ["1.0.0"], entriesAdded: 2, sensitive: 1 });
            expect(changelog(root)).toContain("## [1.0.0] - 2026-01-04\n\n### Added\n\n- Export invoices\n\n### Fixed\n\n- Login loop\n");
            expect(changelog(root)).not.toContain("Readme");
        } finally {
            cleanup();
        }
    });

    it("updates incrementally: new work goes to Unreleased, a new tag moves it out, released text is never rewritten", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q", "-b", "main");
            commitOn(root, "2026-01-01", "feat: export invoices");
            git(root, "tag", "v1.0.0");
            await cli(root, "changelog", "sync");

            fs.writeFileSync(path.join(root, "CHANGELOG.md"), changelog(root).replace("- Export invoices", "- Download invoices as a spreadsheet"));
            commitOn(root, "2026-02-01", "feat: dark mode");
            await cli(root, "changelog", "sync");

            expect(lastJson()).toMatchObject({ entriesAdded: 1, releasesAdded: [] });
            expect(changelog(root)).toContain("## [Unreleased]\n\n### Added\n\n- Dark mode\n\n## [1.0.0] - 2026-01-01\n\n### Added\n\n- Download invoices as a spreadsheet\n");

            git(root, "tag", "v1.1.0");
            await cli(root, "changelog", "sync");

            expect(lastJson()).toMatchObject({ releasesAdded: ["1.1.0"], entriesMoved: 1, entriesAdded: 0 });
            expect(changelog(root)).toContain("## [Unreleased]\n\n## [1.1.0] - 2026-02-01\n\n### Added\n\n- Dark mode\n\n## [1.0.0] - 2026-01-01\n\n### Added\n\n- Download invoices as a spreadsheet\n");
            expect(changelog(root)).not.toContain("Export invoices");
        } finally {
            cleanup();
        }
    });

    it("uses version bumps of the project package.json when there are no tags", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q", "-b", "main");
            commitOn(root, "2026-01-01", "feat: first screen", "package.json", "{\n    \"name\": \"app\",\n    \"version\": \"1.0.0\"\n}\n");
            commitOn(root, "2026-01-05", "feat: search");
            commitOn(root, "2026-01-06", "chore: release", "package.json", "{\n    \"name\": \"app\",\n    \"version\": \"1.1.0\"\n}\n");
            commitOn(root, "2026-01-07", "fix: empty search results");

            expect(await cli(root, "changelog", "sync")).toBe(0);
            expect(lastJson()).toMatchObject({ source: "PACKAGE_VERSION", versionFile: "package.json", releasesAdded: ["1.0.0", "1.1.0"] });
            expect(changelog(root)).toContain("## [Unreleased]\n\n### Fixed\n\n- Empty search results\n\n## [1.1.0] - 2026-01-06\n\n### Added\n\n- Search\n\n## [1.0.0] - 2026-01-01\n\n### Added\n\n- First screen\n");
        } finally {
            cleanup();
        }
    });

    it("reports done roadmap items without a date when releases exist", async () => {
        const { root, cleanup } = createTempProject();

        try {
            git(root, "init", "-q", "-b", "main");
            commitOn(root, "2026-01-01", "chore: start");
            git(root, "tag", "v1.0.0");
            await cli(root, "config", "set", "--roadmap-dates=false");
            await cli(root, "roadmap", "add", "Invoice export", "--done", "--no-git");
            await cli(root, "changelog", "sync");

            expect(lastJson().undated).toEqual(["R-001"]);
            expect(String(lastJson().summary)).toContain("without a done date");
            expect(changelog(root)).not.toContain("Invoice export");
        } finally {
            cleanup();
        }
    });
});

describe("changelog add and roadmap done", () => {
    it("adds plain entries under Unreleased by group, once, and refuses secrets", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "changelog", "add", "invoices download as PDF")).toBe(0);
            expect(await cli(root, "changelog", "add", "Wrong totals on the invoice page", "--group=fixed")).toBe(0);
            expect(await cli(root, "changelog", "add", "Invoices download as PDF.")).toBe(0);
            expect(lastJson()).toMatchObject({ changed: false, summary: "Already in CHANGELOG.md" });
            expect(await cli(root, "changelog", "add", "Send reports to boss@example.com")).toBe(1);
            expect(await cli(root, "changelog", "add", "Something", "--group=misc")).toBe(1);

            expect(changelog(root)).toContain("## [Unreleased]\n\n### Added\n\n- Invoices download as PDF\n\n### Fixed\n\n- Wrong totals on the invoice page\n");
            expect(changelog(root)).not.toContain("example.com");
        } finally {
            cleanup();
        }
    });

    it("lists roadmap items finished today only when the project keeps a changelog", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "roadmap", "add", "Invoice export", "--no-git");
            await cli(root, "roadmap", "done", "Invoice export");

            expect(fs.existsSync(path.join(root, "CHANGELOG.md"))).toBe(false);

            await cli(root, "changelog", "sync");
            await cli(root, "roadmap", "add", "Fix login loop", "--no-git");
            await cli(root, "roadmap", "done", "Fix login loop");

            expect(String(lastJson().summary)).toContain("listed under Unreleased in CHANGELOG.md");

            await cli(root, "roadmap", "add", "Old work", "--done", "--date=2020-01-01", "--no-git");

            const text = changelog(root);

            expect(text).toContain("### Fixed\n\n- Fix login loop");
            expect(text).not.toContain("Old work");
        } finally {
            cleanup();
        }
    });
});

describe("changelog check", () => {
    it("passes a synced changelog and asks to create one when missing", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "changelog", "check")).toBe(1);
            expect(String(lastJson().summary)).toContain("stillmark changelog sync");

            await cli(root, "changelog", "add", "Dark mode");

            expect(await cli(root, "changelog", "check")).toBe(0);
            expect(lastJson().issues).toEqual([]);
        } finally {
            cleanup();
        }
    });

    it("finds structure errors, personal data, and technical wording", async () => {
        const { root, cleanup } = createTempProject();

        try {
            fs.writeFileSync(path.join(root, "CHANGELOG.md"), [
                "## [1.0.0] - 2026-01-01",
                "- Loose entry",
                "### Added",
                "- Updated src/core/Auth.ts",
                "### Misc",
                "- Mail admin@example.com",
                "## [Unreleased]",
                "## [2.0.0] - 2026-05-01",
                "## [1.0.0]",
                ""
            ].join("\n"));

            expect(await cli(root, "changelog", "check")).toBe(1);

            const messages = (lastJson().issues as { level: string; message: string }[]).map((issue) => `${issue.level}: ${issue.message}`);

            expect(messages).toEqual(expect.arrayContaining([
                "error: Missing the \"# Changelog\" title",
                "error: Entry outside a group: Loose entry",
                "warning: Reads like an internal detail; describe what users notice instead: Updated src/core/Auth.ts",
                "error: Unknown group \"Misc\"; use Added, Changed, Deprecated, Removed, Fixed, Security",
                "error: Looks like a secret or personal data: Mail admin@example.com",
                "error: Unreleased must be the first section",
                "error: Release 2.0.0 is newer than the one above it; keep releases newest first",
                "error: Release 1.0.0 is listed twice",
                "error: Release 1.0.0 needs a date as \"## [1.0.0] - YYYY-MM-DD\""
            ]));
        } finally {
            cleanup();
        }
    });
});
