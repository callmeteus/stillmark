import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import {
    formatNotifyText,
    loadNotifyConfig,
    notifyConfigPath,
    parseAgentFinish,
    runNotifyHook,
    summarizeReply
} from "../../src/notify";
import { createTempProject } from "../helpers/TempProject";

let logs: string[] = [];
let home = "";
let requests: { url: string; body: Record<string, unknown> | undefined }[] = [];
let respond: (url: string) => Response = (): Response => new Response("{}", { status: 200 });

beforeEach(() => {
    home = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-home-"));
    vi.stubEnv("HOME", home);
    vi.stubEnv("USERPROFILE", home);
    vi.stubEnv("CODEX_HOME", "");
    requests = [];
    respond = (): Response => new Response("{}", { status: 200 });
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: { body?: string }) => {
        requests.push({ url: String(url), body: init?.body ? JSON.parse(init.body) as Record<string, unknown> : undefined });

        return respond(String(url));
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

const DISCORD = "https://discord.com/api/webhooks/123/secret-discord-token";
const SLACK = "https://hooks.slack.com/services/T000/B000/secret-slack-token";

describe("notify channels", () => {
    it("stores channels in the user home with secrets masked in the output", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "notify", "add", "discord", `--url=${DISCORD}`)).toBe(0);
            expect(await cli(root, "notify", "add", "slack", `--url=${SLACK}`, "--name=team")).toBe(0);
            expect(await cli(root, "notify", "add", "webhook", "--url=https://example.com/hook")).toBe(0);
            expect(fs.existsSync(notifyConfigPath(home))).toBe(true);
            expect(loadNotifyConfig(home).channels.map((channel) => channel.name)).toEqual(["discord", "team", "webhook"]);

            await cli(root, "notify", "list");

            const printed = logs[logs.length - 1];

            expect(printed).not.toContain("secret-discord-token");
            expect(printed).not.toContain("secret-slack-token");
            expect(fs.readFileSync(path.join(root, "stillmark.config.json"), "utf8")).not.toContain("discord");
        } finally {
            cleanup();
        }
    });

    it("refuses wrong webhook addresses and unknown types", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "notify", "add", "discord", "--url=https://example.com/x")).toBe(1);
            expect(String(lastJson().summary)).toContain("Discord");
            expect(await cli(root, "notify", "add", "slack", "--url=http://hooks.slack.com/services/x")).toBe(1);
            expect(await cli(root, "notify", "add", "webhook", "--url=not a url")).toBe(1);
            expect(await cli(root, "notify", "add", "webhook")).toBe(1);
            expect(await cli(root, "notify", "add", "email", "--url=https://example.com")).toBe(1);
            expect(loadNotifyConfig(home).channels).toHaveLength(0);
        } finally {
            cleanup();
        }
    });

    it("finds the Telegram chat from the bot's last message", async () => {
        const { root, cleanup } = createTempProject();

        try {
            respond = (): Response => new Response(JSON.stringify({ result: [{ message: { chat: { id: 42, first_name: "Gio" } } }] }));

            expect(await cli(root, "notify", "add", "telegram", "--token=123456:ABCDEFGHIJ")).toBe(0);
            expect(loadNotifyConfig(home).channels[0]).toMatchObject({ type: "telegram", chatId: "42" });
            expect(requests[0].url).toContain("/getUpdates");
            expect(logs[logs.length - 1]).not.toContain("123456:ABCDEFGHIJ");
        } finally {
            cleanup();
        }
    });

    it("explains what to do when the bot has no messages or the token is wrong", async () => {
        const { root, cleanup } = createTempProject();

        try {
            respond = (): Response => new Response(JSON.stringify({ result: [] }));

            expect(await cli(root, "notify", "add", "telegram", "--token=123456:ABCDEFGHIJ")).toBe(1);
            expect(String(lastJson().summary)).toContain("send it any message");

            respond = (): Response => new Response("{}", { status: 401 });

            expect(await cli(root, "notify", "add", "telegram", "--token=bad")).toBe(1);
            expect(String(lastJson().summary)).toContain("Invalid bot token");
            expect(await cli(root, "notify", "add", "telegram")).toBe(1);
            expect(loadNotifyConfig(home).channels).toHaveLength(0);
        } finally {
            cleanup();
        }
    });

    it("sends the right payload to each channel in the project language", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "config", "set", "--language=pt-BR");
            await cli(root, "notify", "add", "telegram", "--token=123456:ABCDEFGHIJ", "--chat-id=7");
            await cli(root, "notify", "add", "discord", `--url=${DISCORD}`);
            await cli(root, "notify", "add", "slack", `--url=${SLACK}`);
            await cli(root, "notify", "add", "webhook", "--url=https://example.com/hook");
            requests = [];

            expect(await cli(root, "notify", "send", "Login pronto", "--status=done")).toBe(0);

            const byHost = (part: string): Record<string, unknown> => requests.find((request) => request.url.includes(part))?.body ?? {};
            const project = path.basename(root);

            expect(byHost("api.telegram.org")).toMatchObject({ chat_id: "7", text: `Concluído - ${project}\nLogin pronto` });
            expect(byHost("discord.com")).toMatchObject({ content: `Concluído - ${project}\nLogin pronto` });
            expect(byHost("hooks.slack.com")).toMatchObject({ text: `Concluído - ${project}\nLogin pronto` });
            expect(byHost("example.com")).toMatchObject({ event: "agent-finished", status: "done", project, summary: "Login pronto" });
        } finally {
            cleanup();
        }
    });

    it("keeps sending to the other channels when one fails", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "notify", "add", "discord", `--url=${DISCORD}`);
            await cli(root, "notify", "add", "slack", `--url=${SLACK}`);
            respond = (url): Response => new Response("{}", { status: url.includes("discord") ? 404 : 200 });

            expect(await cli(root, "notify", "send", "x")).toBe(1);
            expect(String(lastJson().summary)).toBe("discord: failed (HTTP 404); slack: sent");
        } finally {
            cleanup();
        }
    });

    it("pauses without losing channels, and test still sends while paused", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "notify", "add", "slack", `--url=${SLACK}`);
            await cli(root, "notify", "off");
            requests = [];

            expect(await cli(root, "notify", "send", "x")).toBe(0);
            expect(requests).toHaveLength(0);
            expect(await cli(root, "notify", "test", "slack")).toBe(0);
            expect(requests).toHaveLength(1);
            expect(await cli(root, "notify", "test", "missing")).toBe(1);

            await cli(root, "notify", "on");

            expect(loadNotifyConfig(home).enabled).toBe(true);
            expect(await cli(root, "notify", "remove", "slack")).toBe(0);
            expect(await cli(root, "notify", "remove", "slack")).toBe(1);
            expect(await cli(root, "notify", "send", "x")).toBe(1);
            expect(await cli(root, "notify", "send", "x", "--status=great")).toBe(1);
        } finally {
            cleanup();
        }
    });
});

describe("agent finish hooks", () => {
    it("installs the Cursor stop hook once, keeping other hooks", async () => {
        const { root, cleanup } = createTempProject();
        const file = path.join(home, ".cursor", "hooks.json");

        try {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, JSON.stringify({ version: 1, hooks: { stop: [{ command: "other" }], afterFileEdit: [{ command: "fmt" }] } }));

            expect(await cli(root, "notify", "hook", "install", "--agent=cursor")).toBe(0);
            await cli(root, "notify", "hook", "install", "--agent=cursor");

            const hooks = (JSON.parse(fs.readFileSync(file, "utf8")) as { hooks: Record<string, { command: string }[]> }).hooks;

            expect(hooks.stop.map((hook) => hook.command)).toEqual(["other", "stillmark notify run-hook --agent=cursor"]);
            expect(hooks.afterFileEdit).toHaveLength(1);

            await cli(root, "notify", "hook", "remove", "--agent=cursor");

            expect((JSON.parse(fs.readFileSync(file, "utf8")) as { hooks: Record<string, unknown[]> }).hooks.stop).toEqual([{ command: "other" }]);
        } finally {
            cleanup();
        }
    });

    it("installs the Claude Code Stop and Notification hooks, keeping other settings", async () => {
        const { root, cleanup } = createTempProject();
        const file = path.join(home, ".claude", "settings.json");

        try {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, JSON.stringify({ model: "x", hooks: { Stop: [{ hooks: [{ type: "command", command: "other" }] }] } }));

            expect(await cli(root, "notify", "hook", "install", "--agent=claude")).toBe(0);

            const settings = JSON.parse(fs.readFileSync(file, "utf8")) as { model: string; hooks: Record<string, unknown[]> };

            expect(settings.model).toBe("x");
            expect(settings.hooks.Stop).toHaveLength(2);
            expect(settings.hooks.Notification).toHaveLength(1);

            await cli(root, "notify");

            expect(lastJson().hooks).toEqual({ cursor: false, claude: true, codex: false });

            await cli(root, "notify", "hook", "status", "--agent=claude");

            expect(lastJson().installed).toBe(true);
            expect(await cli(root, "notify", "hook", "install", "--agent=gemini")).toBe(1);
        } finally {
            cleanup();
        }
    });

    it("reads the status and the final reply from the hook payload", () => {
        const transcript = path.join(home, "chat.jsonl");

        fs.writeFileSync(transcript, [
            JSON.stringify({ role: "user", message: { content: [{ type: "text", text: "faz o login" }] } }),
            JSON.stringify({ role: "assistant", message: { content: [{ type: "text", text: "Login pronto.\n\n```ts\ncode\n```\nTestes passam." }] } })
        ].join("\n"));

        expect(parseAgentFinish(JSON.stringify({ status: "completed", workspace_roots: ["/c:/repo/app"], transcript_path: transcript })))
            .toEqual({ status: "done", root: "/c:/repo/app", summary: "Login pronto.\nTestes passam." });
        expect(parseAgentFinish(JSON.stringify({ status: "error" })).status).toBe("failed");
        expect(parseAgentFinish(JSON.stringify({ status: "aborted" })).status).toBe("stopped");
        expect(parseAgentFinish(JSON.stringify({ hook_event_name: "Notification", message: "Claude needs your permission", cwd: "/repo" })))
            .toEqual({ status: "waiting", root: "/repo", summary: "Claude needs your permission" });
        expect(parseAgentFinish("not json").status).toBe("done");

        fs.appendFileSync(transcript, `\n${JSON.stringify({ type: "assistant", message: { role: "assistant", content: "Posso commitar?" } })}`);

        expect(parseAgentFinish(JSON.stringify({ transcript_path: transcript })).status).toBe("waiting");
    });

    it("sends from the hook and never throws", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect((await runNotifyHook("{}", "cursor", root)).summary).toBe("No active channels");

            await cli(root, "notify", "add", "slack", `--url=${SLACK}`);
            requests = [];

            const result = await runNotifyHook(JSON.stringify({ status: "completed", workspace_roots: [root] }), "cursor", root);

            expect(result.ok).toBe(true);
            expect(requests[0].body).toMatchObject({ text: `Finished - ${path.basename(root)}` });

            respond = (): Response => {
                throw new Error("offline");
            };

            expect((await runNotifyHook("{}", "cursor", root)).ok).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("keeps notifications short", () => {
        expect(summarizeReply(`${"a".repeat(300)}\n${"b".repeat(300)}`)).toBe("a".repeat(300));
        expect(summarizeReply(undefined)).toBeUndefined();
        expect(formatNotifyText({ status: "waiting", project: "app", summary: "x".repeat(2000), language: "es" }))
            .toBe(`Esperando tu respuesta - app\n${"x".repeat(1500)}...`);
    });
});
