import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { installAgent } from "../../src/adapters";
import { loadConfig, sanitizeUpdateConfig } from "../../src/config";
import { setConfigUpdate } from "../../src/operations/ConfigOperations";
import {
    applyUpdate,
    checkForUpdates,
    compareVersions,
    loadUpdateState,
    readPackageVersion,
    recordTemplatesVersion,
    writeUpdateState
} from "../../src/update";
import { createTempProject } from "../helpers/TempProject";

const NOW = new Date("2026-10-12T12:00:00.000Z");

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
            const result = await checkForUpdates(paths, { now: NOW, fetchLatest: registry.fetch, currentVersion: "0.1.0" });

            expect(result.checked).toBe(true);
            expect(result.cliOutdated).toBe(true);
            expect(result.recommended).toBe("npx -y stillmark@0.2.0 update apply --json");
            expect(result.nextCheckAt).toBe("2026-10-13T12:00:00.000Z");
            expect(loadUpdateState(paths).latestVersion).toBe("0.2.0");
        } finally {
            cleanup();
        }
    });

    it("skips the registry until the interval passes, unless forced", async () => {
        const { paths, cleanup } = createTempProject();
        const registry = fetcher("0.1.0");
        const options = { fetchLatest: registry.fetch, currentVersion: "0.1.0" };

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

            const result = await checkForUpdates(paths, { now: NOW, fetchLatest: registry.fetch, currentVersion: "0.1.0" });

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

            const result = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.2.0").fetch, currentVersion: "0.1.0" });

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

            const check = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.1.0").fetch, currentVersion: "0.1.0" });

            expect(check.outdatedAgents).toEqual(["cursor"]);
            expect(check.recommended).toBe("stillmark update apply --json");

            const applied = applyUpdate(paths, { currentVersion: "0.1.0" });

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

            const check = await checkForUpdates(paths, { now: NOW, fetchLatest: fetcher("0.1.0").fetch, currentVersion: "0.1.0" });

            expect(check.outdatedAgents).toEqual([]);
            expect(check.updateAvailable).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("ignores agents that were never installed", () => {
        const { paths, cleanup } = createTempProject();

        try {
            const applied = applyUpdate(paths, { currentVersion: "0.1.0" });

            expect(applied.changed).toBe(false);
            expect(applied.updatedAgents).toEqual([]);
        } finally {
            cleanup();
        }
    });
});
