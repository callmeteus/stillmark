import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import {
    openCodeHookFile,
    openCodeHookState,
    openCodeNotifyCommand,
    setOpenCodeHook
} from "../../src/notify";
import { createTempProject } from "../helpers/TempProject";

let home = "";
let logs: string[] = [];

beforeEach(() => {
    home = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-home-"));
    vi.stubEnv("HOME", home);
    vi.stubEnv("USERPROFILE", home);
    vi.stubEnv("CODEX_HOME", "");
    vi.stubEnv("XDG_CONFIG_HOME", "");
    logs = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => {
        logs.push(line);
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fs.rmSync(home, { recursive: true, force: true });
});

function lastJson(): Record<string, unknown> {
    return JSON.parse(logs[logs.length - 1]) as Record<string, unknown>;
}

function cli(root: string, ...args: string[]): Promise<number> {
    return runCli(["node", "stillmark", ...args, "--json", `--root=${root}`]);
}

describe("OpenCode finish hook", () => {
    it("runs Node with the CLI script on Windows and the stillmark command elsewhere", () => {
        expect(openCodeNotifyCommand("win32", "C:\\node\\node.exe", "C:\\missing\\stillmark.js"))
            .toEqual(["C:\\node\\node.exe", "C:\\missing\\stillmark.js", "notify", "run-hook", "--agent=opencode"]);
        expect(openCodeNotifyCommand("win32", "node", "src/bin/stillmark.ts"))
            .toEqual(["stillmark", "notify", "run-hook", "--agent=opencode"]);
        expect(openCodeNotifyCommand("darwin", "node", "/usr/lib/stillmark.js")[0]).toBe("stillmark");
    });

    it("installs the plugin once, reports it, and removes only its own file", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(openCodeHookState()).toEqual({ installed: false });
            expect(await cli(root, "notify", "hook", "install", "--agent=opencode")).toBe(0);

            const file = openCodeHookFile();
            const content = fs.readFileSync(file, "utf8");

            expect(file).toBe(path.join(home, ".config", "opencode", "plugins", "stillmark-notify.ts"));
            expect(content).toContain('"run-hook"');
            expect(content).toContain('"--agent=opencode"');
            expect(content).toContain("Plugin.define");
            expect(content).toContain("session.execution.succeeded");
            expect(openCodeHookState().installed).toBe(true);
            expect(setOpenCodeHook(true).changed).toBe(false);

            await cli(root, "notify", "hook", "status", "--agent=opencode");

            expect(lastJson().installed).toBe(true);
            expect(await cli(root, "notify")).toBe(0);
            expect((lastJson().hooks as Record<string, boolean>).opencode).toBe(true);

            expect(await cli(root, "notify", "hook", "remove", "--agent=opencode")).toBe(0);
            expect(fs.existsSync(file)).toBe(false);
            expect(setOpenCodeHook(false).changed).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("uses XDG_CONFIG_HOME and refuses to replace a plugin it did not create", async () => {
        const { root, cleanup } = createTempProject();
        const xdg = path.join(home, "xdg");

        vi.stubEnv("XDG_CONFIG_HOME", xdg);

        try {
            expect(openCodeHookFile()).toBe(path.join(xdg, "opencode", "plugins", "stillmark-notify.ts"));

            const file = openCodeHookFile();

            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, "export default {};\n");

            const result = setOpenCodeHook(true);

            expect(result.changed).toBe(false);
            expect(result.conflict).toContain("not created by Stillmark");
            expect(fs.readFileSync(file, "utf8")).toBe("export default {};\n");
            expect(setOpenCodeHook(false).conflict).toContain("not created by Stillmark");
            expect(fs.existsSync(file)).toBe(true);

            expect(await cli(root, "notify", "hook", "install", "--agent=opencode")).toBe(1);
            expect(String(lastJson().summary)).toContain("opencode finish hook");
            expect(fs.readFileSync(file, "utf8")).toBe("export default {};\n");
        } finally {
            cleanup();
        }
    });
});
