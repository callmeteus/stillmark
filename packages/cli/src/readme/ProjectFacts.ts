import fs from "node:fs";
import path from "node:path";

/**
 * A workspace package found under the README's directory.
 */
export interface WorkspaceFact {
    dir: string;
    name?: string;
    description?: string;
    private: boolean;
    scripts: string[];
}

/**
 * Facts read from the project files next to a README. Agents write only what is listed here.
 */
export interface ProjectFacts {
    /**
     * Directory of the README, relative to the project root ("." for the root).
     */
    dir: string;
    name?: string;
    description?: string;
    version?: string;
    license?: string;
    private: boolean;
    homepage?: string;
    repository?: string;
    packageManager?: string;
    engines: Record<string, string>;
    bin: string[];
    scripts: Record<string, string>;
    /**
     * Ready-to-paste commands for the detected package manager (`npm run build`, `yarn test`, ...).
     */
    runCommands: string[];
    makeTargets: string[];
    workspaces: WorkspaceFact[];
    /**
     * True when the directory is a package of a parent workspace.
     */
    insideWorkspace: boolean;
    frameworks: string[];
    /**
     * Variable names from `.env.example` and similar files, never values.
     */
    envVars: string[];
    /**
     * Docs and repo files that exist and can be linked (LICENSE, CHANGELOG.md, docs/, ...).
     */
    files: string[];
    otherManifests: string[];
}

interface PackageJson {
    name?: string;
    description?: string;
    version?: string;
    license?: string;
    private?: boolean;
    homepage?: string;
    repository?: string | { url?: string };
    packageManager?: string;
    engines?: Record<string, string>;
    bin?: string | Record<string, string>;
    scripts?: Record<string, string>;
    workspaces?: string[] | { packages?: string[] };
    main?: string;
    exports?: unknown;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

const KNOWN_FRAMEWORKS = [
    "astro", "next", "nuxt", "react", "vue", "svelte", "@sveltejs/kit", "solid-js", "angular", "@angular/core",
    "express", "fastify", "koa", "hono", "@nestjs/core", "electron", "tauri", "vite", "typescript",
    "tailwindcss", "sequelize", "prisma", "typeorm", "vitest", "jest", "playwright", "@playwright/test"
];

const LINKABLE_FILES = [
    "LICENSE", "LICENSE.md", "LICENSE.txt", "CONTRIBUTING.md", "CHANGELOG.md", "ARCHITECTURE.md", "CODE_OF_CONDUCT.md",
    "SECURITY.md", "ROADMAP.md", "COVERAGE.md", "CONTEXT.md", "AGENTS.md", "docs", "Dockerfile", "docker-compose.yml",
    "docker-compose.yaml", "compose.yml", "compose.yaml", ".github/workflows", ".gitlab-ci.yml", "Makefile"
];

const ENV_FILES = [".env.example", ".env.sample", ".env.template", ".env.dist", "example.env"];

const OTHER_MANIFESTS = ["pyproject.toml", "requirements.txt", "Cargo.toml", "go.mod", "pom.xml", "build.gradle", "composer.json", "Gemfile"];

function readJson(file: string): PackageJson | undefined {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8")) as PackageJson;
    } catch {
        return undefined;
    }
}

function workspaceGlobs(pkg: PackageJson | undefined, dir: string): string[] {
    const fromPackage = Array.isArray(pkg?.workspaces) ? pkg.workspaces : pkg?.workspaces?.packages ?? [];
    const pnpmFile = path.join(dir, "pnpm-workspace.yaml");

    if (!fs.existsSync(pnpmFile)) {
        return fromPackage;
    }

    const fromPnpm = fs.readFileSync(pnpmFile, "utf8")
        .split(/\r?\n/)
        .map((line) => /^\s*-\s*["']?([^"'#]+?)["']?\s*$/.exec(line)?.[1])
        .filter((value): value is string => Boolean(value));

    return [...fromPackage, ...fromPnpm];
}

/**
 * Expands `dir/*` and plain directory patterns; deeper globs are listed as-is when they exist.
 */
function expandWorkspaces(dir: string, globs: string[]): WorkspaceFact[] {
    const dirs = new Set<string>();

    for (const glob of globs.filter((value) => !value.startsWith("!"))) {
        const clean = glob.replace(/\/\*\*?$/, "");

        if (clean === glob) {
            dirs.add(glob);
            continue;
        }

        const base = path.join(dir, clean);

        if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
            for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
                if (entry.isDirectory()) {
                    dirs.add(`${clean}/${entry.name}`);
                }
            }
        }
    }

    return [...dirs]
        .sort()
        .flatMap((rel) => {
            const pkg = readJson(path.join(dir, rel, "package.json"));

            return pkg
                ? [{ dir: rel, name: pkg.name, description: pkg.description, private: pkg.private === true, scripts: Object.keys(pkg.scripts ?? {}) }]
                : [];
        });
}

function detectPackageManager(dir: string, root: string, pkg: PackageJson | undefined): string | undefined {
    if (pkg?.packageManager) {
        return pkg.packageManager.split("@")[0];
    }

    const locks: [string, string][] = [["pnpm-lock.yaml", "pnpm"], ["yarn.lock", "yarn"], ["bun.lockb", "bun"], ["bun.lock", "bun"], ["package-lock.json", "npm"]];
    let current = dir;

    while (true) {
        const found = locks.find(([file]) => fs.existsSync(path.join(current, file)));

        if (found) {
            return found[1];
        }

        if (current === root || path.dirname(current) === current) {
            return pkg ? "npm" : undefined;
        }

        current = path.dirname(current);
    }
}

/**
 * Command that runs a package script with the given package manager.
 */
export function scriptCommand(manager: string | undefined, script: string): string {
    const pm = manager ?? "npm";

    if (pm === "npm") {
        return ["test", "start"].includes(script) ? `npm ${script}` : `npm run ${script}`;
    }

    return pm === "bun" ? `bun run ${script}` : `${pm} ${script}`;
}

function isInsideWorkspace(dir: string, root: string): boolean {
    let current = path.dirname(dir);

    while (current.length >= root.length) {
        const pkg = readJson(path.join(current, "package.json"));

        if (pkg && workspaceGlobs(pkg, current).length > 0) {
            return true;
        }

        if (current === root || path.dirname(current) === current) {
            return false;
        }

        current = path.dirname(current);
    }

    return false;
}

function readEnvVars(dir: string): string[] {
    const names = new Set<string>();

    for (const file of ENV_FILES.map((name) => path.join(dir, name)).filter((file) => fs.existsSync(file))) {
        for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
            const match = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=/.exec(line);

            if (match) {
                names.add(match[1]);
            }
        }
    }

    return [...names];
}

function readMakeTargets(dir: string): string[] {
    const file = path.join(dir, "Makefile");

    if (!fs.existsSync(file)) {
        return [];
    }

    return fs.readFileSync(file, "utf8")
        .split(/\r?\n/)
        .map((line) => /^([A-Za-z0-9][\w.-]*)\s*:(?!=)/.exec(line)?.[1])
        .filter((target): target is string => Boolean(target) && target !== ".PHONY");
}

/**
 * Reads the facts a README in `dir` may state: manifest data, scripts, workspaces, env var names, and linkable docs.
 */
export function readProjectFacts(root: string, dir: string): ProjectFacts {
    const pkg = readJson(path.join(dir, "package.json"));
    const packageManager = detectPackageManager(dir, root, pkg);
    const scripts = pkg?.scripts ?? {};
    const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
    const repository = typeof pkg?.repository === "string" ? pkg.repository : pkg?.repository?.url;
    const bin = typeof pkg?.bin === "string" ? [pkg.name ?? ""].filter(Boolean) : Object.keys(pkg?.bin ?? {});
    const makeTargets = readMakeTargets(dir);

    return {
        dir: path.relative(root, dir).split(path.sep).join("/") || ".",
        name: pkg?.name ?? path.basename(dir),
        description: pkg?.description,
        version: pkg?.version,
        license: pkg?.license,
        private: pkg?.private === true,
        homepage: pkg?.homepage,
        repository,
        packageManager,
        engines: pkg?.engines ?? {},
        bin,
        scripts,
        runCommands: [
            ...(pkg ? [packageManager === "npm" || !packageManager ? "npm install" : `${packageManager} install`] : []),
            ...Object.keys(scripts).map((script) => scriptCommand(packageManager, script)),
            ...makeTargets.map((target) => `make ${target}`)
        ],
        makeTargets,
        workspaces: expandWorkspaces(dir, workspaceGlobs(pkg, dir)),
        insideWorkspace: path.resolve(dir) !== path.resolve(root) && isInsideWorkspace(dir, root),
        frameworks: KNOWN_FRAMEWORKS.filter((name) => deps[name] !== undefined).map((name) => `${name} ${deps[name]}`),
        envVars: readEnvVars(dir),
        files: LINKABLE_FILES.filter((file) => fs.existsSync(path.join(dir, file))),
        otherManifests: OTHER_MANIFESTS.filter((file) => fs.existsSync(path.join(dir, file)))
    };
}

/**
 * Template that fits the project best, with the reason shown to the user.
 */
export function suggestReadmeTemplate(facts: ProjectFacts): { template: string; reason: string } {
    if (facts.workspaces.length > 0) {
        return { template: "app-root", reason: `${facts.workspaces.length} workspace package(s) found` };
    }

    if (facts.insideWorkspace) {
        return { template: "package", reason: "This directory is a package of a parent workspace" };
    }

    if (facts.bin.length > 0) {
        return { template: "cli", reason: `The package ships the command(s) ${facts.bin.join(", ")}` };
    }

    const deploys = facts.files.some((file) => /^(Dockerfile|docker-compose|compose)/.test(file));

    if (facts.private && (deploys || facts.envVars.length > 0)) {
        return { template: "service", reason: "Private project with deploy files or environment variables" };
    }

    if (!facts.private && facts.version !== undefined) {
        return { template: "standard", reason: "Publishable package" };
    }

    if (Object.keys(facts.scripts).length === 0 && facts.otherManifests.length === 0) {
        return { template: "minimal", reason: "Small project without scripts" };
    }

    return { template: "makeareadme", reason: "General project" };
}
