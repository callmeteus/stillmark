import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import {
    addNotifyChannel,
    codexConfigFile,
    codexNotifyCommand,
    desktopToastCommand,
    loadNotifyConfig,
    parseAgentFinish,
    sendNotify,
    setCodexHook,
    type ToastRunner
} from "../../src/notify";
import { createTempProject } from "../helpers/TempProject";

let home = "";
let logs: string[] = [];
let requests: { url: string; body: Record<string, unknown> | undefined }[] = [];

beforeEach(() => {
    home = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-home-"));
    vi.stubEnv("HOME", home);
    vi.stubEnv("USERPROFILE", home);
    vi.stubEnv("CODEX_HOME", "");
    requests = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: { body?: string }) => {
        requests.push({ url: String(url), body: init?.body ? JSON.parse(init.body) as Record<string, unknown> : undefined });

        return new Response("{}", { status: 200 });
    }));
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

const SLACK = "https://hooks.slack.com/services/T000/B000/secret-slack-token";

describe("desktop notifications", () => {
    it("builds a native command per platform without putting the text in a script", () => {
        const windows = desktopToastCommand("win32", "Finished - app", "Login & \"quotes\" %PATH% $env:X");
        const script = Buffer.from(windows.args[windows.args.length - 1], "base64").toString("utf16le");

        expect(windows.command).toBe("powershell.exe");
        expect(windows.env).toEqual({ STILLMARK_TOAST_TITLE: "Finished - app", STILLMARK_TOAST_BODY: "Login & \"quotes\" %PATH% $env:X" });
        expect(windows.args.join(" ")).not.toContain("Login");
        expect(script).toContain("$env:STILLMARK_TOAST_BODY");
        expect(script).toContain("SecurityElement]::Escape");

        expect(desktopToastCommand("darwin", "T", "B").args.slice(-2)).toEqual(["T", "B"]);
        expect(desktopToastCommand("linux", "T", "-B")).toEqual({ command: "notify-send", args: ["--app-name=Stillmark", "--", "T", "-B"] });
        expect(desktopToastCommand("linux", "T", "x".repeat(400)).args[3]).toBe(`${"x".repeat(250)}...`);
    });

    it("adds a desktop channel with nothing to configure and shows status as title, summary as body", async () => {
        const { root, cleanup } = createTempProject();
        const shown: { title: string; body: string }[] = [];
        const toast: ToastRunner = async (title, body) => {
            shown.push({ title, body });

            return { ok: true };
        };

        try {
            expect(await cli(root, "notify", "add", "desktop")).toBe(0);
            expect(loadNotifyConfig().channels).toEqual([{ name: "desktop", type: "desktop" }]);

            await addNotifyChannel({ type: "slack", url: SLACK });

            const result = await sendNotify({ status: "waiting", root, summary: "Posso commitar?" }, { toast });

            expect(result.ok).toBe(true);
            expect(shown).toEqual([{ title: `Waiting for you - ${path.basename(root)}`, body: "Posso commitar?" }]);
            expect(requests).toHaveLength(1);
        } finally {
            cleanup();
        }
    });

    it("reports a missing notification program without stopping the other channels", async () => {
        const { root, cleanup } = createTempProject();
        const toast: ToastRunner = async () => ({ ok: false, detail: "notify-send is not available" });

        try {
            await addNotifyChannel({ type: "desktop", name: "pc" });
            await addNotifyChannel({ type: "slack", url: SLACK });

            const result = await sendNotify({ status: "done", root }, { toast });

            expect(result.ok).toBe(false);
            expect(result.summary).toContain("pc: failed (notify-send is not available)");
            expect(result.summary).toContain("slack: sent");
        } finally {
            cleanup();
        }
    });
});

describe("Codex finish hook", () => {
    it("runs Node with the CLI script on Windows and the stillmark command elsewhere", () => {
        expect(codexNotifyCommand("win32", "C:\\node\\node.exe", "C:\\missing\\stillmark.js"))
            .toEqual(["C:\\node\\node.exe", "C:\\missing\\stillmark.js", "notify", "run-hook", "--agent=codex"]);
        expect(codexNotifyCommand("win32", "node", "src/bin/stillmark.ts")).toEqual(["stillmark", "notify", "run-hook", "--agent=codex"]);
        expect(codexNotifyCommand("darwin", "node", "/usr/lib/stillmark.js")[0]).toBe("stillmark");
    });

    it("adds notify at the top of config.toml once and removes it leaving the rest as written", async () => {
        const { root, cleanup } = createTempProject();
        const file = codexConfigFile();
        const original = "model = \"gpt-5\"\n\n[tui]\nnotifications = true\n";

        try {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, original);

            expect(await cli(root, "notify", "hook", "install", "--agent=codex")).toBe(0);
            expect(lastJson().changed).toBe(true);

            const installed = fs.readFileSync(file, "utf8");

            expect(installed.split("\n")[0]).toMatch(/^notify = \[.*"notify", "run-hook", "--agent=codex"\]$/);
            expect(installed).toContain(original);

            await cli(root, "notify", "hook", "install", "--agent=codex");

            expect(lastJson().changed).toBe(false);

            await cli(root, "notify", "hook", "status", "--agent=codex");

            expect(lastJson().installed).toBe(true);

            await cli(root, "notify", "hook", "remove", "--agent=codex");

            expect(fs.readFileSync(file, "utf8")).toBe(original);
        } finally {
            cleanup();
        }
    });

    it("creates the Codex config when missing", () => {
        const result = setCodexHook(true, undefined, ["stillmark", "notify", "run-hook", "--agent=codex"]);

        expect(result.changed).toBe(true);
        expect(fs.readFileSync(codexConfigFile(), "utf8")).toBe("notify = [\"stillmark\", \"notify\", \"run-hook\", \"--agent=codex\"]\n");
    });

    it("never replaces another notify program, even one written over several lines", async () => {
        const { root, cleanup } = createTempProject();
        const file = codexConfigFile();
        const original = "notify = [\n  \"python3\",\n  \"/home/me/notify.py\",\n]\n[profiles.x]\nnotify = [\"ignored\"]\n";

        try {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, original);

            expect(await cli(root, "notify", "hook", "install", "--agent=codex")).toBe(1);
            expect(lastJson().summary).toContain("Codex already runs another program");
            expect(fs.readFileSync(file, "utf8")).toBe(original);
            expect(setCodexHook(false).conflict).toBe("notify = [");
        } finally {
            cleanup();
        }
    });

    it("ignores notify keys inside tables", () => {
        const file = codexConfigFile();

        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, "[profiles.work]\nnotify = [\"other\"]\n");

        expect(setCodexHook(true, undefined, ["stillmark"]).changed).toBe(true);
        expect(fs.readFileSync(file, "utf8")).toBe("notify = [\"stillmark\"]\n[profiles.work]\nnotify = [\"other\"]\n");
    });

    it("reads the Codex event: folder, last reply, and questions as waiting", () => {
        const event = { type: "agent-turn-complete", "thread-id": "t", cwd: "/repo/app", "input-messages": ["faz"], "last-assistant-message": "Pronto.\nTestes passam." };

        expect(parseAgentFinish(JSON.stringify(event))).toEqual({ status: "done", root: "/repo/app", summary: "Pronto.\nTestes passam." });
        expect(parseAgentFinish(JSON.stringify({ ...event, "last-assistant-message": "Posso commitar?" })).status).toBe("waiting");
        expect(parseAgentFinish(JSON.stringify({ type: "agent-turn-complete", cwd: "/repo" }))).toEqual({ status: "done", root: "/repo", summary: undefined });
    });

    it("takes the event from the last argument and prints {} for Codex", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await addNotifyChannel({ type: "slack", url: SLACK });

            const event = JSON.stringify({ type: "agent-turn-complete", cwd: root, "last-assistant-message": "Feito." });

            expect(await runCli(["node", "stillmark", "notify", "run-hook", "--agent=codex", `--root=${root}`, event])).toBe(0);
            expect(logs[logs.length - 1]).toBe("{}");
            expect(requests[0].body).toMatchObject({ text: `Finished - ${path.basename(root)}\nFeito.` });
        } finally {
            cleanup();
        }
    });
});
