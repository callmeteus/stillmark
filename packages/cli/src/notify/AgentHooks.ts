import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { NotifyStatus } from "./Channels";
import { codexConfigFile, codexHookState, setCodexHook } from "./CodexNotify";

/**
 * Agents whose finish event Stillmark can hook automatically.
 */
export type NotifyHookAgent = "cursor" | "claude" | "codex";

export const NotifyHookAgents: readonly NotifyHookAgent[] = ["cursor", "claude", "codex"];

const HOOK_MARKER = "stillmark notify run-hook";

/**
 * Narrows unknown input to a hookable agent.
 */
export function isNotifyHookAgent(value: unknown): value is NotifyHookAgent {
    return (NotifyHookAgents as readonly unknown[]).includes(value);
}

function hookCommand(agent: NotifyHookAgent): string {
    return `${HOOK_MARKER} --agent=${agent}`;
}

function hooksFile(agent: NotifyHookAgent, homeDir: string): string {
    if (agent === "codex") {
        return codexConfigFile(homeDir);
    }

    return agent === "cursor"
        ? path.join(homeDir, ".cursor", "hooks.json")
        : path.join(homeDir, ".claude", "settings.json");
}

function readJson(file: string): Record<string, unknown> {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown> : {};
}

function writeJson(file: string, data: unknown): void {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

type CursorHook = { command?: string };
type ClaudeGroup = { matcher?: string; hooks?: { type?: string; command?: string }[] };

function isOurs(command: string | undefined): boolean {
    return typeof command === "string" && command.includes(HOOK_MARKER);
}

/**
 * Whether the Stillmark finish hook is present for an agent.
 */
export function notifyHookInstalled(agent: NotifyHookAgent, homeDir: string = os.homedir()): boolean {
    if (agent === "codex") {
        return codexHookState(homeDir).installed;
    }

    const data = readJson(hooksFile(agent, homeDir));
    const hooks = (data.hooks ?? {}) as Record<string, unknown[]>;

    if (agent === "cursor") {
        return ((hooks.stop ?? []) as CursorHook[]).some((hook) => isOurs(hook.command));
    }

    return ((hooks.Stop ?? []) as ClaudeGroup[]).some((group) => group.hooks?.some((hook) => isOurs(hook.command)));
}

/**
 * Adds or removes the finish hook in the user-level agent settings, keeping every other hook untouched.
 * Cursor: `stop` in `~/.cursor/hooks.json`. Claude Code: `Stop` and `Notification` in `~/.claude/settings.json`.
 * Codex: top-level `notify` in `~/.codex/config.toml`, reported as `conflict` when another program owns it.
 */
export function setNotifyHook(
    agent: NotifyHookAgent,
    install: boolean,
    homeDir: string = os.homedir()
): { file: string; changed: boolean; conflict?: string } {
    if (agent === "codex") {
        return setCodexHook(install, homeDir);
    }

    const file = hooksFile(agent, homeDir);
    const before = notifyHookInstalled(agent, homeDir);

    if (before === install) {
        return { file, changed: false };
    }

    const data = readJson(file);
    const hooks = { ...((data.hooks ?? {}) as Record<string, unknown[]>) };

    if (agent === "cursor") {
        const stop = ((hooks.stop ?? []) as CursorHook[]).filter((hook) => !isOurs(hook.command));

        hooks.stop = install ? [...stop, { command: hookCommand(agent), timeout: 30 }] : stop;

        writeJson(file, { version: 1, ...data, hooks });

        return { file, changed: true };
    }

    for (const event of ["Stop", "Notification"]) {
        const groups = ((hooks[event] ?? []) as ClaudeGroup[])
            .map((group) => ({ ...group, hooks: (group.hooks ?? []).filter((hook) => !isOurs(hook.command)) }))
            .filter((group) => group.hooks.length > 0);

        hooks[event] = install
            ? [...groups, { hooks: [{ type: "command", command: hookCommand(agent), timeout: 30 }] }]
            : groups;
    }

    writeJson(file, { ...data, hooks });

    return { file, changed: true };
}

/**
 * What the agent passed to the finish hook on stdin, reduced to what a notification needs.
 */
export interface AgentFinish {
    status: NotifyStatus;
    root?: string;
    summary?: string;
}

const TRANSCRIPT_TAIL_BYTES = 256 * 1024;

function textOf(content: unknown): string {
    if (typeof content === "string") {
        return content;
    }

    if (!Array.isArray(content)) {
        return "";
    }

    return content
        .map((part: { type?: string; text?: string }) => (part?.type === "text" && typeof part.text === "string" ? part.text : ""))
        .filter(Boolean)
        .join("\n");
}

/**
 * Last assistant text in a JSONL transcript (Cursor or Claude Code), reading only the end of the file.
 */
export function lastAssistantText(transcriptPath: string | undefined): string | undefined {
    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
        return undefined;
    }

    const size = fs.statSync(transcriptPath).size;
    const start = Math.max(0, size - TRANSCRIPT_TAIL_BYTES);
    const buffer = Buffer.alloc(size - start);
    const fd = fs.openSync(transcriptPath, "r");

    try {
        fs.readSync(fd, buffer, 0, buffer.length, start);
    } finally {
        fs.closeSync(fd);
    }

    const lines = buffer.toString("utf8").split(/\r?\n/).filter(Boolean).reverse();

    for (const line of lines) {
        try {
            const entry = JSON.parse(line) as { role?: string; type?: string; message?: { role?: string; content?: unknown }; content?: unknown };
            const role = entry.message?.role ?? entry.role ?? entry.type;

            if (role === "assistant") {
                const text = textOf(entry.message?.content ?? entry.content).trim();

                if (text) {
                    return text;
                }
            }
        } catch {
            continue;
        }
    }

    return undefined;
}

/**
 * First lines of a reply, short enough for a chat notification.
 */
export function summarizeReply(text: string | undefined, maxLength = 400): string | undefined {
    if (!text) {
        return undefined;
    }

    const lines = text
        .replace(/^\s*(`{3,}|~{3,})[\s\S]*?^\s*\1\s*$/gm, "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    let summary = "";

    for (const line of lines) {
        if (summary.length + line.length > maxLength) {
            break;
        }

        summary = summary ? `${summary}\n${line}` : line;
    }

    return summary || lines[0]?.slice(0, maxLength);
}

/**
 * Reads the hook payload of Cursor (`stop`), Claude Code (`Stop`, `Notification`), or Codex
 * (`agent-turn-complete`). A final reply ending with a question counts as waiting for the user.
 */
export function parseAgentFinish(raw: string): AgentFinish {
    let input: Record<string, unknown> = {};

    try {
        input = raw.trim() ? JSON.parse(raw) as Record<string, unknown> : {};
    } catch {
        input = {};
    }

    const roots = Array.isArray(input.workspace_roots) ? input.workspace_roots as string[] : [];
    const root = roots[0] ?? (typeof input.cwd === "string" ? input.cwd : undefined);

    if (input.hook_event_name === "Notification") {
        return { status: "waiting", root, summary: typeof input.message === "string" ? input.message : undefined };
    }

    const reply = input.type === "agent-turn-complete"
        ? typeof input["last-assistant-message"] === "string" ? input["last-assistant-message"] : undefined
        : lastAssistantText(typeof input.transcript_path === "string" ? input.transcript_path : undefined);
    const summary = summarizeReply(reply);
    const status: NotifyStatus = input.status === "error"
        ? "failed"
        : input.status === "aborted"
            ? "stopped"
            : reply?.trim().endsWith("?")
                ? "waiting"
                : "done";

    return { status, root, summary };
}
