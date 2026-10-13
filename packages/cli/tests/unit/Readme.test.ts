import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import {
    extractReadmeFacts,
    matchReadmeSection,
    readProjectFacts,
    ReadmeSections,
    ReadmeTemplates,
    scriptCommand,
    suggestReadmeTemplate
} from "../../src/readme";
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

function write(root: string, rel: string, content: string): void {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content, "utf8");
}

function issueKinds(): string[] {
    return (lastJson().issues as { kind: string }[]).map((issue) => issue.kind);
}

const GOOD_CLI_README = [
    "# demo",
    "",
    "Small tool.",
    "",
    "## Install",
    "",
    "```bash",
    "npm install -g demo",
    "```",
    "",
    "## Usage",
    "",
    "```bash",
    "npm run build && npm test",
    "```",
    "",
    "## Commands",
    "",
    "| Command | Purpose |",
    "| --- | --- |",
    "| `demo run` | Runs it |",
    "",
    "## License",
    "",
    "MIT, see [LICENSE](LICENSE).",
    ""
].join("\n");

describe("readme catalog", () => {
    it("every template references catalog sections and has unique ids", () => {
        const ids = new Set(ReadmeSections.map((section) => section.id));

        expect(new Set(ReadmeTemplates.map((template) => template.id)).size).toBe(ReadmeTemplates.length);

        for (const template of ReadmeTemplates) {
            expect(template.sections.every((slot) => ids.has(slot.id))).toBe(true);
            expect(template.sections.some((slot) => slot.required)).toBe(true);
        }
    });

    it("maps headings in English, Portuguese, and Spanish, preferring the longest alias", () => {
        expect(matchReadmeSection("Instalação")).toBe("install");
        expect(matchReadmeSection("Primeiros passos")).toBe("getStarted");
        expect(matchReadmeSection("What Is Stillmark?")).toBe("overview");
        expect(matchReadmeSection("Local Development Setup")).toBe("development");
        expect(matchReadmeSection("Licencia")).toBe("license");
        expect(matchReadmeSection("Repository layout")).toBe("architecture");
        expect(matchReadmeSection("How to run the tests")).toBe("development");
        expect(matchReadmeSection("Random words")).toBeUndefined();
    });
});

describe("project facts", () => {
    it("reads scripts, bin, env var names, and linkable files, and suggests the cli template", () => {
        const { root, cleanup } = createTempProject();

        try {
            write(root, "package.json", JSON.stringify({ name: "demo", version: "1.0.0", bin: { demo: "dist/cli.js" }, scripts: { build: "tsc", test: "vitest" }, devDependencies: { typescript: "^5.0.0" } }));
            write(root, "package-lock.json", "{}");
            write(root, ".env.example", "API_TOKEN=\nexport PORT=3000\n# COMMENT=1\n");
            write(root, "LICENSE", "MIT");

            const facts = readProjectFacts(root, root);

            expect(facts.packageManager).toBe("npm");
            expect(facts.runCommands).toEqual(["npm install", "npm run build", "npm test"]);
            expect(facts.envVars).toEqual(["API_TOKEN", "PORT"]);
            expect(facts.files).toContain("LICENSE");
            expect(facts.frameworks).toEqual(["typescript ^5.0.0"]);
            expect(suggestReadmeTemplate(facts).template).toBe("cli");
        } finally {
            cleanup();
        }
    });

    it("expands workspaces for the root and detects packages inside a workspace", () => {
        const { root, cleanup } = createTempProject();

        try {
            write(root, "package.json", JSON.stringify({ name: "mono", private: true, workspaces: ["packages/*"] }));
            write(root, "yarn.lock", "");
            write(root, "packages/api/package.json", JSON.stringify({ name: "@mono/api", scripts: { dev: "node ." } }));
            write(root, "packages/notes/README.md", "no manifest here");

            const rootFacts = readProjectFacts(root, root);
            const apiFacts = readProjectFacts(root, path.join(root, "packages/api"));

            expect(rootFacts.workspaces).toEqual([{ dir: "packages/api", name: "@mono/api", description: undefined, private: false, scripts: ["dev"] }]);
            expect(suggestReadmeTemplate(rootFacts).template).toBe("app-root");
            expect(apiFacts.insideWorkspace).toBe(true);
            expect(apiFacts.runCommands).toContain("yarn dev");
            expect(suggestReadmeTemplate(apiFacts).template).toBe("package");
        } finally {
            cleanup();
        }
    });

    it("builds commands for each package manager", () => {
        expect(scriptCommand("npm", "lint")).toBe("npm run lint");
        expect(scriptCommand(undefined, "start")).toBe("npm start");
        expect(scriptCommand("pnpm", "dev")).toBe("pnpm dev");
        expect(scriptCommand("bun", "build")).toBe("bun run build");
    });

    it("keeps URLs, local ports, and env vars as facts, but not badges", () => {
        const facts = extractReadmeFacts("[![b](https://img.shields.io/x)](https://example.com/app). Open http://localhost:4321. Set `DATABASE_URL`.");

        expect(facts).toEqual(["https://example.com/app", "http://localhost:4321", "localhost:4321", "DATABASE_URL"]);
    });
});

describe("stillmark readme", () => {
    it("lists the templates", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "readme", "templates")).toBe(0);
            expect((lastJson().templates as unknown[]).length).toBe(ReadmeTemplates.length);
        } finally {
            cleanup();
        }
    });

    it("plan without a template suggests one and asks the user to pick", async () => {
        const { root, cleanup } = createTempProject();

        try {
            write(root, "package.json", JSON.stringify({ name: "demo", bin: "cli.js", scripts: { build: "tsc" } }));

            expect(await cli(root, "readme", "plan")).toBe(0);

            const result = lastJson();

            expect(result.template).toBe("cli");
            expect(result.needsClarification).toBe(true);
            expect(result.templates).toBeDefined();
            expect(result.backup).toBeUndefined();
        } finally {
            cleanup();
        }
    });

    it("plan refuses unknown templates and files outside the project", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "readme", "plan", "--template=fancy")).toBe(1);
            expect(lastJson().summary).toContain("Unknown template");

            expect(await cli(root, "readme", "plan", "--file=../README.md")).toBe(1);
            expect(await cli(root, "readme", "plan", "--file=README.txt")).toBe(1);
        } finally {
            cleanup();
        }
    });

    it("plan backs up the README, maps its headings, and lists facts to keep", async () => {
        const { root, paths, cleanup } = createTempProject();

        try {
            write(root, "README.md", "# Demo\n\n## Instalação\n\nRun on http://localhost:3000 with `API_TOKEN`.\n");

            expect(await cli(root, "readme", "plan", "--template=minimal")).toBe(0);

            const result = lastJson();
            const outline = result.outline as { id: string; existing?: string }[];

            expect(result.needsClarification).toBe(false);
            expect(outline.find((section) => section.id === "install")?.existing).toBe("Instalação");
            expect(result.factsToKeep).toEqual(["http://localhost:3000", "localhost:3000", "API_TOKEN"]);
            expect(fs.existsSync(path.join(paths.readmeDir, "backups", "README.md"))).toBe(true);
        } finally {
            cleanup();
        }
    });

    it("check reports missing sections, unknown commands, broken links, leftovers, and lost facts", async () => {
        const { root, cleanup } = createTempProject();

        try {
            write(root, "package.json", JSON.stringify({ name: "demo", scripts: { build: "tsc" } }));
            write(root, "README.md", "# Demo\n\nSee https://example.com/docs and set `API_TOKEN`.\n");
            await cli(root, "readme", "plan", "--template=cli");

            write(root, "README.md", [
                "# Demo",
                "",
                "### Usage",
                "",
                "TODO describe it. See [guide](docs/guide.md).",
                "",
                "```bash",
                "npm run deploy",
                "make release",
                "```",
                "",
                "## License",
                ""
            ].join("\n"));

            expect(await cli(root, "readme", "check")).toBe(1);

            const kinds = issueKinds();

            expect(kinds).toEqual(expect.arrayContaining(["heading-skip", "empty-section", "missing-section", "placeholder", "unknown-command", "broken-link", "lost-fact"]));
            expect(kinds.filter((kind) => kind === "unknown-command")).toHaveLength(2);
            expect(kinds.filter((kind) => kind === "lost-fact")).toHaveLength(2);
        } finally {
            cleanup();
        }
    });

    it("check passes a complete README and ignores placeholders inside code", async () => {
        const { root, cleanup } = createTempProject();

        try {
            write(root, "package.json", JSON.stringify({ name: "demo", scripts: { build: "tsc", test: "vitest" } }));
            write(root, "LICENSE", "MIT");
            write(root, "README.md", GOOD_CLI_README.replace("Small tool.", "Small tool, `TODO` lives in code only."));

            expect(await cli(root, "readme", "check", "--template=cli")).toBe(0);
            expect(lastJson().issues).toEqual([]);
        } finally {
            cleanup();
        }
    });

    it("check fails when the README does not exist", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "readme", "check")).toBe(1);
            expect(lastJson().summary).toContain("does not exist");
        } finally {
            cleanup();
        }
    });

    it("restore puts the previous README back, and fails without a backup", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "readme", "restore")).toBe(1);

            write(root, "README.md", "# Old\n");
            await cli(root, "readme", "plan", "--template=minimal");
            write(root, "README.md", "# New\n");

            expect(await cli(root, "readme", "restore")).toBe(0);
            expect(fs.readFileSync(path.join(root, "README.md"), "utf8")).toBe("# Old\n");
        } finally {
            cleanup();
        }
    });

    it("keeps the backup during a rewrite and refreshes it after a passing check", async () => {
        const { root, paths, cleanup } = createTempProject();
        const backup = path.join(paths.readmeDir, "backups", "README.md");

        try {
            write(root, "package.json", JSON.stringify({ name: "demo", scripts: { build: "tsc", test: "vitest" } }));
            write(root, "LICENSE", "MIT");
            write(root, "README.md", "# Old\n");
            await cli(root, "readme", "plan", "--template=cli");

            write(root, "README.md", "# Draft\n");
            await cli(root, "readme", "plan");
            expect(lastJson().template).toBe("cli");
            expect(fs.readFileSync(backup, "utf8")).toBe("# Old\n");

            write(root, "README.md", GOOD_CLI_README);
            expect(await cli(root, "readme", "check")).toBe(0);

            await cli(root, "readme", "plan");
            expect(fs.readFileSync(backup, "utf8")).toBe(GOOD_CLI_README);
        } finally {
            cleanup();
        }
    });

    it("rejects an unknown readme subcommand", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "readme", "publish")).toBe(1);
            expect(lastJson().summary).toContain("Usage: stillmark readme");
        } finally {
            cleanup();
        }
    });
});
