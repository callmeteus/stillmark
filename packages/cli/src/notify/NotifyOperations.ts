import fs from "node:fs";
import path from "node:path";

import { loadConfig, resolveLanguage } from "../config";
import { resolveProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { parseAgentFinish, setNotifyHook, notifyHookInstalled, NotifyHookAgents, type NotifyHookAgent } from "./AgentHooks";
import { discoverTelegramChat, sendToChannels, type NotifyDelivery, type NotifyStatus } from "./Channels";
import type { ToastRunner } from "./DesktopToast";
import {
    loadNotifyConfig,
    maskChannel,
    notifyConfigPath,
    NotifyChannelTypes,
    writeNotifyConfig,
    type NotifyChannel,
    type NotifyChannelType
} from "./NotifyConfig";

/**
 * Optional overrides for tests: home directory (defaults to the current user's home) and desktop toasts.
 */
export interface NotifyContext {
    homeDir?: string;
    toast?: ToastRunner;
}

export interface AddNotifyChannelOptions {
    type: NotifyChannelType;
    name?: string;
    token?: string;
    chatId?: string;
    url?: string;
}

const URL_HOSTS: Partial<Record<NotifyChannelType, RegExp>> = {
    discord: /^(?:www\.|canary\.|ptb\.)?discord(?:app)?\.com$/,
    slack: /^hooks\.slack\.com$/
};

function failure(summary: string): OperationResult {
    return { ok: false, changed: false, summary };
}

function normalizeRoot(root: string): string {
    return /^\/[a-z]:/i.test(root) ? root.slice(1) : root;
}

function projectLanguage(root: string): string {
    try {
        const paths = resolveProjectPaths(root);

        return fs.existsSync(paths.config) ? resolveLanguage(loadConfig(paths).language, "docs") : "en";
    } catch {
        return "en";
    }
}

function deliverySummary(deliveries: NotifyDelivery[]): string {
    return deliveries
        .map((delivery) => `${delivery.name}: ${delivery.ok ? "sent" : `failed (${delivery.detail})`}`)
        .join("; ");
}

function validateUrl(type: NotifyChannelType, raw: string | undefined): string | undefined {
    if (!raw) {
        return `--url is required for ${type}`;
    }

    let url: URL;

    try {
        url = new URL(raw);
    } catch {
        return "--url is not a valid address";
    }

    if (url.protocol !== "https:") {
        return "--url must start with https://";
    }

    const host = URL_HOSTS[type];

    if (host && !host.test(url.hostname)) {
        return type === "discord"
            ? "Use the webhook URL from Discord: channel settings, Integrations, Webhooks, Copy Webhook URL"
            : "Use the incoming webhook URL from Slack (https://hooks.slack.com/services/...)";
    }

    return undefined;
}

/**
 * `stillmark notify add <type>`: validates and stores a channel. Telegram finds the chat by itself when `--chat-id` is omitted.
 */
export async function addNotifyChannel(options: AddNotifyChannelOptions, context: NotifyContext = {}): Promise<OperationResult & { channel?: NotifyChannel }> {
    const config = loadNotifyConfig(context.homeDir);
    const name = (options.name ?? options.type).trim();
    const channel: NotifyChannel = { name, type: options.type };

    if (options.type === "telegram") {
        if (!options.token) {
            return failure("--token is required: create a bot with @BotFather in Telegram and paste the token it gives you");
        }

        channel.token = options.token.trim();
        channel.chatId = options.chatId?.trim();

        if (!channel.chatId) {
            const found = await discoverTelegramChat(channel.token);

            if (!found.chatId) {
                return failure(found.detail ?? "Could not find the chat");
            }

            channel.chatId = found.chatId;
        }
    } else
    if (options.type !== "desktop") {
        const error = validateUrl(options.type, options.url);

        if (error) {
            return failure(error);
        }

        channel.url = options.url;
    }

    const replaced = config.channels.some((existing) => existing.name === name);

    config.channels = [...config.channels.filter((existing) => existing.name !== name), channel];

    const file = writeNotifyConfig(config, context.homeDir);

    return {
        ok: true,
        changed: true,
        action: "notify add",
        summary: options.type === "desktop"
            ? `${replaced ? "Updated" : "Added"} desktop notifications "${name}" in ${file}. Run stillmark notify test ${name} to see one`
            : `${replaced ? "Updated" : "Added"} ${options.type} channel "${name}" in ${file} (outside every repository). Run stillmark notify test ${name}`,
        channel: maskChannel(channel)
    };
}

/**
 * `stillmark notify remove <name>`.
 */
export function removeNotifyChannel(name: string | undefined, context: NotifyContext = {}): OperationResult {
    const config = loadNotifyConfig(context.homeDir);

    if (!name || !config.channels.some((channel) => channel.name === name)) {
        return failure(`No channel named "${name ?? ""}". Run stillmark notify list`);
    }

    config.channels = config.channels.filter((channel) => channel.name !== name);
    writeNotifyConfig(config, context.homeDir);

    return { ok: true, changed: true, action: "notify remove", summary: `Removed channel "${name}"` };
}

/**
 * `stillmark notify on|off`: pauses or resumes every channel without deleting them.
 */
export function setNotifyEnabled(enabled: boolean, context: NotifyContext = {}): OperationResult {
    const config = loadNotifyConfig(context.homeDir);

    config.enabled = enabled;
    writeNotifyConfig(config, context.homeDir);

    return {
        ok: true,
        changed: true,
        action: "notify toggle",
        summary: enabled ? "Notifications are on" : "Notifications are paused; channels are kept"
    };
}

/**
 * `stillmark notify [list]`: channels with secrets masked, and which agents have the finish hook.
 */
export function listNotify(context: NotifyContext = {}): OperationResult & {
    enabled: boolean;
    channels: NotifyChannel[];
    hooks: Record<NotifyHookAgent, boolean>;
} {
    const config = loadNotifyConfig(context.homeDir);
    const hooks = Object.fromEntries(
        NotifyHookAgents.map((agent) => [agent, notifyHookInstalled(agent, context.homeDir)])
    ) as Record<NotifyHookAgent, boolean>;
    const hooked = NotifyHookAgents.filter((agent) => hooks[agent]);

    return {
        ok: true,
        changed: false,
        action: "notify list",
        summary: config.channels.length === 0
            ? `No notification channels yet. Add one with stillmark notify add ${NotifyChannelTypes.join("|")}`
            : [
                `${config.enabled ? "On" : "Paused"}: ${config.channels.map((channel) => `${channel.name} (${channel.type})`).join(", ")}`,
                hooked.length > 0 ? `finish hook in ${hooked.join(", ")}` : `no agent finish hook yet (stillmark notify hook install --agent=${NotifyHookAgents.join("|")})`
            ].join("; "),
        location: notifyConfigPath(context.homeDir),
        enabled: config.enabled,
        channels: config.channels.map(maskChannel),
        hooks
    };
}

export interface SendNotifyOptions {
    status: NotifyStatus;
    root: string;
    summary?: string;
    agent?: string;
    /**
     * Only this channel (by name); every channel when omitted.
     */
    channel?: string;
    /**
     * Send even while notifications are paused (used by `notify test`).
     */
    force?: boolean;
}

/**
 * Sends a notification to the configured channels.
 */
export async function sendNotify(options: SendNotifyOptions, context: NotifyContext = {}): Promise<OperationResult & { deliveries: NotifyDelivery[] }> {
    const config = loadNotifyConfig(context.homeDir);
    const channels = options.channel === undefined
        ? config.channels
        : config.channels.filter((channel) => channel.name === options.channel);

    if (channels.length === 0) {
        return {
            ...failure(options.channel === undefined ? "No notification channels configured" : `No channel named "${options.channel}"`),
            deliveries: []
        };
    }

    if (!config.enabled && !options.force) {
        return { ok: true, changed: false, action: "notify send", summary: "Notifications are paused; nothing sent", deliveries: [] };
    }

    const root = normalizeRoot(options.root);
    const deliveries = await sendToChannels(channels, {
        status: options.status,
        project: path.basename(root),
        root,
        agent: options.agent,
        summary: options.summary,
        language: projectLanguage(root)
    }, context.toast);

    return {
        ok: deliveries.every((delivery) => delivery.ok),
        changed: false,
        action: "notify send",
        summary: deliverySummary(deliveries),
        deliveries
    };
}

/**
 * `stillmark notify run-hook --agent=<agent>`: called by the agent's finish hook with its JSON
 * (on stdin for Cursor and Claude Code, as the last argument for Codex).
 * Never throws and never blocks the agent; failures are only reported in the result.
 */
export async function runNotifyHook(
    payload: string,
    agent: string,
    fallbackRoot: string,
    context: NotifyContext = {}
): Promise<OperationResult> {
    try {
        const config = loadNotifyConfig(context.homeDir);

        if (!config.enabled || config.channels.length === 0) {
            return { ok: true, changed: false, action: "notify hook", summary: "No active channels" };
        }

        const finish = parseAgentFinish(payload);

        return await sendNotify(
            { status: finish.status, root: finish.root ?? fallbackRoot, summary: finish.summary, agent },
            context
        );
    } catch (err) {
        return failure(err instanceof Error ? err.message : String(err));
    }
}

/**
 * `stillmark notify hook install|remove|status --agent=cursor|claude|codex`.
 */
export function manageNotifyHook(action: string | undefined, agent: NotifyHookAgent, context: NotifyContext = {}): OperationResult {
    if (action === "install" || action === "remove") {
        const result = setNotifyHook(agent, action === "install", context.homeDir);

        if (result.conflict) {
            return {
                ok: false,
                changed: false,
                action: `notify hook ${action}`,
                summary: `Codex already runs another program when it finishes (${result.conflict} in ${result.file}) and accepts only one; Stillmark left it untouched. Remove that line to use Stillmark notifications instead`,
                location: result.file
            };
        }

        return {
            ok: true,
            changed: result.changed,
            action: `notify hook ${action}`,
            summary: action === "install"
                ? `${agent} will notify your channels every time the agent finishes, fails, or waits for you (${result.file})`
                : `${agent} no longer sends finish notifications`,
            location: result.file
        };
    }

    const installed = notifyHookInstalled(agent, context.homeDir);

    return {
        ok: true,
        changed: false,
        action: "notify hook status",
        summary: installed ? `${agent} finish hook is installed` : `${agent} finish hook is not installed`,
        installed
    } as OperationResult;
}
