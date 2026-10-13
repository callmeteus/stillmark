import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import { parseRoadmap, todayIsoDate, type RoadmapItem } from "../../src/documents";
import { initProject } from "../../src/operations/InitProject";
import { addRoadmapItem, updateRoadmapItem } from "../../src/operations/RoadmapOperations";
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
    return runCli(["node", "stillmark", ...args, "--json", "--no-git", `--root=${root}`]);
}

describe("roadmap done", () => {
    it("records past work directly under ## Done with --done", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);
            await cli(root, "roadmap", "add", "Login by QR code", "--done", "--priority=high");

            const raw = fs.readFileSync(paths.roadmap, "utf8");
            const done = parseRoadmap(raw).sections.find((s) => s.title === "Done");

            expect(done?.items).toHaveLength(1);
            expect(done?.items[0].checked).toBe(true);
            expect(done?.items[0].metadataLine).toContain("priority: high · status: done");
            expect(lastJson().link).toBeDefined();
        } finally {
            cleanup();
        }
    });

    it("moves an existing item to ## Done keeping priority and details", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);
            await addRoadmapItem(paths, {
                description: "Dark mode",
                priority: "low",
                acceptance: ["Respects system theme"],
                gitOverride: "force-off"
            });
            await addRoadmapItem(paths, { description: "Export CSV", gitOverride: "force-off" });

            expect(await cli(root, "roadmap", "done", "Dark mode")).toBe(0);

            const doc = parseRoadmap(fs.readFileSync(paths.roadmap, "utf8"));
            const backlog = doc.sections.find((s) => s.title === "Backlog");
            const done = doc.sections.find((s) => s.title === "Done");

            expect(backlog?.items.map((i) => i.title)).toEqual(["Export CSV"]);
            expect(done?.items[0].id).toBe("R-001");
            expect(done?.items[0].checked).toBe(true);
            expect(done?.items[0].metadataLine).toContain("priority: low · status: done");
            expect(done?.items[0].acceptanceLines).toEqual(["  - Respects system theme"]);
        } finally {
            cleanup();
        }
    });

    it("is idempotent and reports unknown items", async () => {
        const { paths, cleanup } = createTempProject();

        try {
            initProject(paths);
            await addRoadmapItem(paths, { description: "Dark mode", gitOverride: "force-off" });
            updateRoadmapItem(paths, { query: "R-001", done: true });

            const before = fs.readFileSync(paths.roadmap, "utf8");
            const again = updateRoadmapItem(paths, { query: "R-001", done: true });

            expect(again.changed).toBe(false);
            expect(fs.readFileSync(paths.roadmap, "utf8")).toBe(before);
            expect(updateRoadmapItem(paths, { query: "Nope", done: true }).ok).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("keeps metadata indented after roadmap priority", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);
            await cli(root, "roadmap", "add", "Dark mode");
            await cli(root, "roadmap", "priority", "R-001", "high");

            const item = parseRoadmap(fs.readFileSync(paths.roadmap, "utf8")).sections.flatMap((s) => s.items)[0];

            expect(item.metadataLine).toMatch(/^ {2}priority: high · status: planned/);
        } finally {
            cleanup();
        }
    });

    it("routes add --done to the roadmap", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);
            await cli(root, "add", "Shipped onboarding tour", "--done");

            const done = parseRoadmap(fs.readFileSync(paths.roadmap, "utf8")).sections.find((s) => s.title === "Done");

            expect(done?.items[0].title).toBe("Shipped onboarding tour");
        } finally {
            cleanup();
        }
    });
});

function roadmapItems(file: string): RoadmapItem[] {
    return parseRoadmap(fs.readFileSync(file, "utf8")).sections.flatMap((s) => s.items);
}

describe("roadmap dates", () => {
    it("writes added and done dates by default", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);
            await cli(root, "roadmap", "add", "Dark mode");

            expect(roadmapItems(paths.roadmap)[0].metadataLine).toContain(`added: ${todayIsoDate()}`);

            await cli(root, "roadmap", "done", "Dark mode", "--date=2026-03-04");

            const meta = roadmapItems(paths.roadmap)[0].metadataLine;

            expect(meta).toContain(`added: ${todayIsoDate()}`);
            expect(meta).toContain("done: 2026-03-04");
        } finally {
            cleanup();
        }
    });

    it("takes the delivery date from a commit", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);

            const env = { ...process.env, GIT_AUTHOR_DATE: "2025-07-15T12:00:00", GIT_COMMITTER_DATE: "2025-07-15T12:00:00" };
            const git = (...args: string[]): string => execFileSync("git", args, { cwd: root, env, encoding: "utf8" });

            git("init", "-q");
            git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "--allow-empty", "-m", "QR login");
            const sha = git("rev-parse", "HEAD").trim();

            await cli(root, "roadmap", "add", "Login by QR code", "--done", `--commit=${sha}`);

            expect(roadmapItems(paths.roadmap)[0].metadataLine).toContain("done: 2025-07-15");
            expect(roadmapItems(paths.roadmap)[0].metadataLine).not.toContain("added:");
        } finally {
            cleanup();
        }
    });

    it("backfills the date of an item that is already done", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);
            await cli(root, "roadmap", "add", "Dark mode", "--done");
            await cli(root, "roadmap", "done", "R-001", "--date=2024-01-02");

            expect(lastJson().changed).toBe(true);
            expect(roadmapItems(paths.roadmap)[0].metadataLine).toContain("done: 2024-01-02");
            expect(roadmapItems(paths.roadmap)[0].metadataLine.match(/done:/g)).toHaveLength(1);
        } finally {
            cleanup();
        }
    });

    it("writes no dates when roadmap dates are off", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);
            await cli(root, "config", "set", "--roadmap-dates=false");
            await cli(root, "roadmap", "add", "Dark mode");
            await cli(root, "roadmap", "done", "Dark mode");

            expect(roadmapItems(paths.roadmap)[0].metadataLine).not.toMatch(/added:|done:/);
        } finally {
            cleanup();
        }
    });

    it("refuses invalid dates, unknown commits, and both flags together", async () => {
        const { paths, root, cleanup } = createTempProject();

        try {
            initProject(paths);

            expect(await cli(root, "roadmap", "add", "A", "--date=2026-02-30")).toBe(1);
            expect(await cli(root, "roadmap", "add", "A", "--commit=deadbeef")).toBe(1);
            expect(await cli(root, "roadmap", "add", "A", "--date=2026-01-01", "--commit=HEAD")).toBe(1);
            expect(roadmapItems(paths.roadmap)).toHaveLength(0);
        } finally {
            cleanup();
        }
    });
});
