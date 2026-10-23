import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { installAgent, resolveSourceTemplatesDir } from "../../src/adapters";
import { loadConfig, sanitizeUpdateConfig } from "../../src/config";
import { setConfigUpdate } from "../../src/operations/ConfigOperations";
import {
    applyUpdate,
    checkForUpdates,
    compareVersions,
    installTemplates,
    loadUpdateState,
    readPackageVersion,
    recordTemplatesVersion,
    writeUpdateState
} from "../../src/update";
import { createTempProject } from "../helpers/TempProject";

const NOW = new Date("2026-10-12T12:00:00.000Z");
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-home-"));

function fetcher(version: string): { fetch: (name: string) => Promise<string>; calls: () => number } {
    let count = 0;

    return {
        fetch: async (): Promise<string> => {
            count++;

            return version;
        },
        calls: (): number => count
    };
}

describe("update config", () => {
    it("defaults to daily automatic checks", () => {
        const { paths, cleanup } = createTempProject();

        try {
            expect(loadConfig(paths).update).toEqual({ auto: true, intervalHours: 24 });
        } finally {
            cleanup();
        }
    });

    it("drops invalid values", () => {
        expect(sanitizeUpdateConfig({ auto: "yes", intervalHours: -2 })).toEqual({ auto: true, intervalHours: 24 });
        expect(sanitizeUpdateConfig({ auto: false, intervalHours: 6 })).toEqual({ auto: false, intervalHours: 6 });
    });

    it("updates only the provided fields", () => {
        const { paths, cleanup } = createTempProject();

        try {
            setConfigUpdate(paths, { intervalHours: 12 });
            setConfigUpdate(paths, { auto: false });

            expect(loadConfig(paths).update).toEqual({ auto: false, intervalHours: 12 });
        } finally {
            cleanup();
        }
    });
});

describe("compareVersions", () => {
    it("orders by major, minor, patch and puts prereleases first", () => {
        expect(compareVersions("0.2.0", "0.1.9")).toBeGreaterThan(0);
        expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
        expect(compareVersions("v1.0.0", "1.0.1")).toBeLessThan(0);
        expect(compareVersions("1.0.0-beta.1", "1.0.0")).toBeLessThan(0);
    });

    it("reads the running CLI version", () => {
        expect(readPackageVersion()).toMatch(/^\d+\.\d+\.\d+/);
    });
});

describe("checkForUpdates", () => {
    it("checks the registry and recommends npx when a newer CLI exists", async () => {
        const { paths, cleanup } = createTempProject();
        const registry = fetcher("0.2.0");

        try {
            const result = await checkForUpdates(paths, { now: NOW, fetchLatest: registry.fetch, currentVersion: "0.1.0", homeDir: HOME });

            expect(result.checked).toBe(true);
            expect(result.cliOutdated).toBe(true);
            expect(result.recommended).toBe("npx -y stillmark@0.2.0 update apply --json");
            expect(result.latestChannel).toBe("npm");
            expect(result.install.githubLatest).toContain("github.com/callmeteus/stillmark/releases/latest/download/stillmark.tgz");
            expect(result.nextCheckAt).toBe("2026-10-13T12:00:00.000Z");
            expect(loadUpdateState(paths).latestVersion).toBe("0.2.0");
        } finally {
            cleanup();
        }
    });

    it("skips the registry until the interval passes, unless forced", async () => {
        const { paths, cleanup } = createTempProject();
        const registry = fetcher("0.1.0");
        const options = { fetchLatest: registry.fetch, currentVersion: "0.1.0", homeDir: HOME };

        try {
            await checkForUpdates(paths, { ...options, now: NOW });
            const early = await checkForUpdates(paths, { ...options, now: new Date("2026-10-12T20:00:00.000Z") });
            const forced = await checkForUpdates(paths, { ...options, now: new Date("2026-10-12T20:00:00.000Z"), force: true });
            const later = await checkForUpdates(paths, { ...options, now: new Date("2026-10-14T12:00:00.000Z") });

            expect(early.skipped).toBe("not-due");
            expect(early.updateAvailable).toBe(false);
            expect(forced.checked).toBe(true);
            expect(later.checked).toBe(true);
            expect(registry.calls()).toBe(3);
        } finally {
            cleanup();
        }
    });

    it("does not contact the registry when automatic checks are off", async () => {
        const { paths, cleanup } = createTempProject();
        const registry = fetcher("9.9.9");

        try {
            setConfigUpdate(paths, { auto: false });

            const result = await checkForUpdates(paths, { now: NOW, fetchLatest: registry.fetch, currentVersion: "0.1.0", homeDir: HOME });

            expect(result.skipped).toBe("disabled");
            expect(result.nextCheckAt).toBeNull();
            expect(registry.calls()).toBe(0);
        } finally {
            cleanup();
        }
    });

    it("records the check even when the registry fails", async () => {
        const { paths, cleanup } = createTempProject();

        try {
            const result = await checkForUpdates(paths, {
                now: NOW,
                currentVersion: "0.1.0",
                homeDir: HOME,
                fetchLatest: async () => {
                    throw new Error("offline");
                }
            });

            expect(result.ok).toBe(true);
            expect(result.error).toBe("offline");
            expect(result.updateAvailable).toBe(false);
            expect(loadUpdateState(paths).lastCheckAt).toBe(NOW.toISOString());
        } finally {
            cleanup();
        }
    });

    it("stops recommending npx once the templates already match the latest version", async () => {
        const { paths, cleanup } = createTempProject();

        try {
            writeUpdateState(paths, { templatesVersion: "0.2.0" });

            const result = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.2.0").fetch, currentVersion: "0.1.0", homeDir: HOME });

            expect(result.cliOutdated).toBe(true);
            expect(result.recommended).toBeNull();
        } finally {
            cleanup();
        }
    });
});

describe("agent template refresh", () => {
    it("flags agent files written by an older CLI and refreshes them on apply", async () => {
        const { paths, cleanup } = createTempProject();
        const skill = path.join(paths.root, ".cursor", "skills", "stillmark", "SKILL.md");

        try {
            installAgent(paths.root, "cursor");
            recordTemplatesVersion(paths, "0.0.1");
            fs.writeFileSync(skill, "old skill\n", "utf8");

            const check = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.1.0").fetch, currentVersion: "0.1.0", homeDir: HOME });

            expect(check.outdatedAgents).toEqual(["cursor"]);
            expect(check.recommended).toBe("stillmark update apply --json");

            const applied = applyUpdate(paths, { currentVersion: "0.1.0", homeDir: HOME });

            expect(applied.updatedAgents).toEqual(["cursor"]);
            expect(applied.updatedFiles).toContain(skill);
            expect(fs.readFileSync(skill, "utf8")).not.toBe("old skill\n");
            expect(loadUpdateState(paths).templatesVersion).toBe("0.1.0");
        } finally {
            cleanup();
        }
    });

    it("leaves edited agent files alone while the templates version is current", async () => {
        const { paths, cleanup } = createTempProject();
        const skill = path.join(paths.root, ".cursor", "skills", "stillmark", "SKILL.md");

        try {
            installAgent(paths.root, "cursor");
            recordTemplatesVersion(paths, "0.1.0");
            fs.writeFileSync(skill, "custom skill\n", "utf8");

            const check = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.1.0").fetch, currentVersion: "0.1.0", homeDir: HOME });

            expect(check.outdatedAgents).toEqual([]);
            expect(check.updateAvailable).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("installs globally into the home directory and refreshes it on apply", async () => {
        const { paths, root, cleanup } = createTempProject();
        const home = path.join(root, "home");
        const skill = path.join(home, ".cursor", "skills", "stillmark", "SKILL.md");

        try {
            const installed = installTemplates(paths, "cursor", { global: true, homeDir: home, currentVersion: "0.0.1" });

            expect(installed.scope).toBe("global");
            expect(fs.existsSync(skill)).toBe(true);
            expect(fs.existsSync(path.join(root, ".cursor"))).toBe(false);

            fs.writeFileSync(skill, "old skill\n", "utf8");

            const check = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.1.0").fetch, currentVersion: "0.1.0", homeDir: home });

            expect(check.outdatedGlobalAgents).toEqual(["cursor"]);
            expect(check.recommended).toBe("stillmark update apply --json");

            const applied = applyUpdate(paths, { currentVersion: "0.1.0", homeDir: home });

            expect(applied.updatedGlobalAgents).toEqual(["cursor"]);
            expect(fs.readFileSync(skill, "utf8")).not.toBe("old skill\n");
        } finally {
            cleanup();
        }
    });

    it("installs only the prompt for global codex", () => {
        const { paths, root, cleanup } = createTempProject();
        const home = path.join(root, "home");

        try {
            const installed = installTemplates(paths, "codex", { global: true, homeDir: home });

            expect(installed.installed).toEqual([path.join(home, ".codex", "prompts", "stillmark.md")]);
        } finally {
            cleanup();
        }
    });

    it("installs the OpenCode command and skill into the project", () => {
        const { paths, root, cleanup } = createTempProject();
        const home = path.join(root, "home");

        try {
            const installed = installTemplates(paths, "opencode", { homeDir: home, currentVersion: "0.1.0" });
            const command = path.join(root, ".opencode", "commands", "stillmark.md");
            const skill = path.join(root, ".opencode", "skills", "stillmark", "SKILL.md");
            const playbook = path.join(root, ".opencode", "skills", "stillmark", "reference", "coverage.md");

            expect(installed.installed).toContain(command);
            expect(installed.installed).toContain(skill);
            expect(installed.installed).toContain(playbook);
            expect(fs.readFileSync(skill, "utf8")).toContain("The only Stillmark entry");
        } finally {
            cleanup();
        }
    });

    it("installs OpenCode globally under the user config directory", async () => {
        const { paths, root, cleanup } = createTempProject();
        const home = path.join(root, "home");
        const previousXdg = process.env.XDG_CONFIG_HOME;

        try {
            delete process.env.XDG_CONFIG_HOME;
            const installed = installTemplates(paths, "opencode", { global: true, homeDir: home, currentVersion: "0.0.1" });
            const skill = path.join(home, ".config", "opencode", "skills", "stillmark", "SKILL.md");

            expect(installed.scope).toBe("global");
            expect(installed.installed).toContain(skill);
            expect(fs.existsSync(path.join(home, ".opencode"))).toBe(false);

            fs.writeFileSync(skill, "old skill\n", "utf8");

            const check = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.1.0").fetch, currentVersion: "0.1.0", homeDir: home });

            expect(check.outdatedGlobalAgents).toEqual(["opencode"]);

            const applied = applyUpdate(paths, { currentVersion: "0.1.0", homeDir: home });

            expect(applied.updatedGlobalAgents).toEqual(["opencode"]);
            expect(fs.readFileSync(skill, "utf8")).not.toBe("old skill\n");
        } finally {
            if (previousXdg === undefined) {
                delete process.env.XDG_CONFIG_HOME;
            } else {
                process.env.XDG_CONFIG_HOME = previousXdg;
            }

            cleanup();
        }
    });

    it("honors XDG_CONFIG_HOME for global OpenCode installs", () => {
        const { paths, root, cleanup } = createTempProject();
        const home = path.join(root, "home");
        const xdg = path.join(root, "xdg");
        const previousXdg = process.env.XDG_CONFIG_HOME;

        try {
            process.env.XDG_CONFIG_HOME = xdg;

            const installed = installTemplates(paths, "opencode", { global: true, homeDir: home });
            const command = path.join(xdg, "opencode", "commands", "stillmark.md");

            expect(installed.installed).toContain(command);
            expect(fs.existsSync(path.join(home, ".config", "opencode"))).toBe(false);
        } finally {
            if (previousXdg === undefined) {
                delete process.env.XDG_CONFIG_HOME;
            } else {
                process.env.XDG_CONFIG_HOME = previousXdg;
            }

            cleanup();
        }
    });

    it("links OpenCode templates into the project without writing through the link", () => {
        const { paths, root, cleanup } = createTempProject();
        const home = path.join(root, "home");
        const skillDir = path.join(root, ".opencode", "skills", "stillmark");
        const source = path.join(resolveSourceTemplatesDir(), "opencode", "skills", "stillmark", "SKILL.md");
        const before = fs.readFileSync(source, "utf8");

        try {
            const result = installTemplates(paths, "opencode", { homeDir: home, link: true });

            expect(result.ok).toBe(true);
            expect(fs.lstatSync(skillDir).isSymbolicLink()).toBe(true);
            expect(fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8")).toBe(before);

            const copied = installTemplates(paths, "opencode", { homeDir: home });

            expect(copied.installed.some((file) => file.startsWith(skillDir))).toBe(false);
            expect(fs.readFileSync(source, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });

    it("links the source templates in dev mode and never writes through the link", async () => {
        const { paths, root, cleanup } = createTempProject();
        const home = path.join(root, "home");
        const skillDir = path.join(home, ".cursor", "skills", "stillmark");
        const source = path.join(resolveSourceTemplatesDir(), "cursor", ".cursor", "skills", "stillmark", "SKILL.md");
        const before = fs.readFileSync(source, "utf8");

        try {
            const result = installTemplates(paths, "cursor", { global: true, link: true, homeDir: home });

            expect(result.ok).toBe(true);
            expect(fs.lstatSync(skillDir).isSymbolicLink()).toBe(true);
            expect(fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8")).toBe(before);

            const check = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.1.0").fetch, currentVersion: "0.1.0", homeDir: home });

            expect(check.outdatedGlobalAgents).toEqual([]);

            const copied = installTemplates(paths, "cursor", { global: true, homeDir: home });

            expect(copied.installed.some((file) => file.startsWith(skillDir))).toBe(false);
            expect(fs.readFileSync(source, "utf8")).toBe(before);
        } finally {
            cleanup();
        }
    });

    it("skips the project copy when the agent is already installed globally", () => {
        const { paths, root, cleanup } = createTempProject();
        const home = path.join(root, "home");
        const projectSkill = path.join(root, ".cursor", "skills", "stillmark", "SKILL.md");

        try {
            installTemplates(paths, "cursor", { global: true, homeDir: home });

            const skipped = installTemplates(paths, "cursor", { homeDir: home });

            expect(skipped).toMatchObject({ ok: true, changed: false, installed: [] });
            expect(skipped.summary).toContain("stillmark init");
            expect(fs.existsSync(projectSkill)).toBe(false);

            const forced = installTemplates(paths, "cursor", { homeDir: home, force: true });

            expect(forced.installed).toContain(projectSkill);
            expect(installTemplates(paths, "claude", { homeDir: home }).installed.length).toBeGreaterThan(0);
        } finally {
            cleanup();
        }
    });

    it("refuses an unknown agent", () => {
        const { paths, cleanup } = createTempProject();

        try {
            expect(installTemplates(paths, "vim").ok).toBe(false);
            expect(installTemplates(paths, undefined).ok).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("ignores agents that were never installed", () => {
        const { paths, cleanup } = createTempProject();

        try {
            const applied = applyUpdate(paths, { currentVersion: "0.1.0", homeDir: HOME });

            expect(applied.changed).toBe(false);
            expect(applied.updatedAgents).toEqual([]);
        } finally {
            cleanup();
        }
    });
});
