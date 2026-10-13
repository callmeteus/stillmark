import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import { setConfigDetail } from "../../src/operations";
import { roadmapTodos } from "../../src/operations/RoadmapTodos";
import { GitRunner, type ProcessSpawner } from "../../src/git";
import { scanTodos, TodoTag } from "../../src/todos";
import { copyFixture, createTempProject } from "../helpers/TempProject";

/** Git that is not available, so the scanner walks the folder. */
const noGit = new GitRunner(async () => ({ code: 128, stdout: "", stderr: "not a git repository" }));

function write(root: string, rel: string, content: string): void {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content, "utf8");
}

describe("scanTodos", () => {
    it("finds TODO and FIXME comments across comment styles", async () => {
        const { root, cleanup } = createTempProject();
        write(root, "src/a.ts", "const a = 1; // TODO: export invoices as CSV\n/* FIXME(gio): retry is broken */\n");
        write(root, "scripts/run.py", "# TODO - cache the token lookup\n");

        const todos = await scanTodos(root, noGit);

        expect(todos.map((todo) => todo.text).sort()).toEqual(["cache the token lookup", "export invoices as CSV", "retry is broken"]);
        expect(todos.find((todo) => todo.text === "retry is broken")?.tag).toBe(TodoTag.FIXME);
        expect(todos.find((todo) => todo.text === "export invoices as CSV")?.locations).toEqual([{ file: "src/a.ts", line: 1 }]);
        cleanup();
    });

    it("ignores prose, lowercase words, empty tags, build output, and node_modules", async () => {
        const { root, cleanup } = createTempProject();
        write(root, "notes.md", "// TODO: not code\n");
        write(root, "src/b.ts", "const label = \"todo list\";\n// TODO\nconst x = \"TODO: in a string\";\n");
        write(root, "node_modules/pkg/index.js", "// TODO: vendored\n");
        write(root, "dist/out.js", "// TODO: built\n");

        expect(await scanTodos(root, noGit)).toEqual([]);
        cleanup();
    });

    it("ignores TODO markers inside string literals and wrapped doc sentences, but keeps block TODOs with a colon", async () => {
        const { root, cleanup } = createTempProject();
        write(root, "src/c.ts", [
            "const sample = \"// TODO: inside a string\";",
            "const other = `# FIXME: inside a template`;",
            "/**",
            " * Adds new comments:",
            " * FIXME as high priority, TODO as medium.",
            " * TODO: split this module",
            " */"
        ].join("\n"));

        const todos = await scanTodos(root, noGit);

        expect(todos.map((todo) => todo.text)).toEqual(["split this module"]);
        cleanup();
    });

    it("merges the same TODO from several files and keeps FIXME when either is one", async () => {
        const { root, cleanup } = createTempProject();
        write(root, "a.ts", "// TODO: add rate limiting\n");
        write(root, "b.ts", "\n// FIXME: Add rate limiting\n");

        const todos = await scanTodos(root, noGit);

        expect(todos).toHaveLength(1);
        expect(todos[0].tag).toBe(TodoTag.FIXME);
        expect(todos[0].locations).toEqual([{ file: "a.ts", line: 1 }, { file: "b.ts", line: 2 }]);
        cleanup();
    });

    it("uses git's file list when available, so ignored files are skipped", async () => {
        const { root, cleanup } = createTempProject();
        write(root, "tracked.ts", "// TODO: tracked work\n");
        write(root, "ignored.ts", "// TODO: ignored work\n");
        const spawner: ProcessSpawner = async () => ({ code: 0, stdout: "tracked.ts\n", stderr: "" });

        const todos = await scanTodos(root, new GitRunner(spawner));

        expect(todos.map((todo) => todo.text)).toEqual(["tracked work"]);
        cleanup();
    });

    it("shortens very long comments to one roadmap line", async () => {
        const { root, cleanup } = createTempProject();
        write(root, "long.ts", `// TODO: ${"word ".repeat(60)}\n`);

        const [todo] = await scanTodos(root, noGit);

        expect(todo.text.length).toBeLessThanOrEqual(140);
        expect(todo.text.endsWith("…")).toBe(true);
        cleanup();
    });
});

describe("roadmapTodos", () => {
    it("lists TODOs without writing and flags the ones already on the roadmap", async () => {
        const { root, paths, cleanup } = createTempProject();
        copyFixture("SampleRoadmap.md", paths.roadmap);
        write(root, "src/a.ts", "// TODO: Dashboard\n// TODO: export invoices as CSV\n");
        const before = fs.readFileSync(paths.roadmap, "utf8");

        const result = await roadmapTodos(paths, { gitRunner: noGit });

        expect(result.ok).toBe(true);
        expect(result.changed).toBe(false);
        expect(result.todos.find((todo) => todo.text === "Dashboard")?.onRoadmap).toBe("R-002");
        expect(result.todos.find((todo) => todo.text === "export invoices as CSV")?.onRoadmap).toBeUndefined();
        expect(fs.readFileSync(paths.roadmap, "utf8")).toBe(before);
        cleanup();
    });

    it("adds new TODOs to the backlog, FIXME as high priority, skipping ones already there", async () => {
        const { root, paths, cleanup } = createTempProject();
        copyFixture("SampleRoadmap.md", paths.roadmap);
        write(root, "src/a.ts", "// TODO: Dashboard\n// TODO: export invoices as CSV\n// FIXME: payment retry drops events\n");

        const result = await roadmapTodos(paths, { add: true, gitRunner: noGit });
        const roadmap = fs.readFileSync(paths.roadmap, "utf8");

        expect(result.changed).toBe(true);
        expect(result.todos.filter((todo) => todo.added)).toHaveLength(2);
        expect(roadmap).toMatch(/\*\*R-00\d\*\* export invoices as CSV\n {2}priority: medium/);
        expect(roadmap).toMatch(/\*\*R-00\d\*\* payment retry drops events\n {2}priority: high/);
        expect(roadmap.match(/Dashboard/g)).toHaveLength(1);
        expect(result.git?.status).toBe("skipped");
        cleanup();
    });

    it("is safe to run twice: the second run adds nothing", async () => {
        const { root, paths, cleanup } = createTempProject();
        write(root, "src/a.ts", "// TODO: export invoices as CSV\n");

        await roadmapTodos(paths, { add: true, gitRunner: noGit });
        const second = await roadmapTodos(paths, { add: true, gitRunner: noGit });

        expect(second.changed).toBe(false);
        expect(second.todos[0].onRoadmap).toBe("R-001");
        cleanup();
    });

    it("leaves out TODOs that look like secrets", async () => {
        const { root, paths, cleanup } = createTempProject();
        write(root, "src/a.ts", "// TODO: rotate password=hunter2secret on the server\n");

        const result = await roadmapTodos(paths, { add: true, gitRunner: noGit });

        expect(result.changed).toBe(false);
        expect(result.todos[0].skipped).toBe("looks like a secret");
        expect(fs.readFileSync(paths.roadmap, "utf8")).not.toContain("hunter2");
        cleanup();
    });

    it("notes where each TODO lives when roadmap detail is extended", async () => {
        const { root, paths, cleanup } = createTempProject();
        setConfigDetail(paths, { level: "extended", module: "roadmap" });
        write(root, "src/a.ts", "\n// TODO: export invoices as CSV\n");

        await roadmapTodos(paths, { add: true, gitRunner: noGit });

        expect(fs.readFileSync(paths.roadmap, "utf8")).toContain("from: src/a.ts:2");
        cleanup();
    });

    it("runs from the CLI: roadmap todos lists, init --todos adds", async () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-todos-"));
        write(root, "src/a.ts", "// FIXME: payment retry drops events\n");
        const logs: string[] = [];
        vi.spyOn(console, "log").mockImplementation((line: string) => {
            logs.push(line);
        });

        expect(await runCli(["node", "stillmark", "init", "--todos", "--json", `--root=${root}`])).toBe(0);
        const init = JSON.parse(logs[logs.length - 1]) as { summary: string; todos: { added?: string }[] };

        expect(await runCli(["node", "stillmark", "roadmap", "todos", "--json", `--root=${root}`])).toBe(0);
        const list = JSON.parse(logs[logs.length - 1]) as { changed: boolean; todos: { onRoadmap?: string }[] };

        vi.restoreAllMocks();
        expect(init.summary).toContain("Added 1 TODO/FIXME comment");
        expect(init.todos[0].added).toBe("R-001");
        expect(list.changed).toBe(false);
        expect(list.todos[0].onRoadmap).toBe("R-001");
        expect(fs.readFileSync(path.join(root, "ROADMAP.md"), "utf8")).toContain("payment retry drops events");
        fs.rmSync(root, { recursive: true, force: true });
    });

    it("lists without a roadmap but refuses to add before init", async () => {
        const { root, paths, cleanup } = createTempProject();
        fs.rmSync(paths.roadmap);
        write(root, "src/a.ts", "// TODO: export invoices as CSV\n");

        const list = await roadmapTodos(paths, { gitRunner: noGit });
        const add = await roadmapTodos(paths, { add: true, gitRunner: noGit });

        expect(list.ok).toBe(true);
        expect(list.todos).toHaveLength(1);
        expect(add.ok).toBe(false);
        expect(add.summary).toContain("stillmark init");
        expect(fs.existsSync(paths.roadmap)).toBe(false);
        cleanup();
    });
});
