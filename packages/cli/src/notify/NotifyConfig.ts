import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Where a notification goes. `desktop` is a native notification on the computer running the agent.
 */
export type NotifyChannelType = "telegram" | "discord" | "slack" | "webhook" | "desktop";

export const NotifyChannelTypes: readonly NotifyChannelType[] = ["telegram", "discord", "slack", "webhook", "desktop"];

/**
 * One delivery target. Secrets (bot token, webhook URL) live only in the user's home directory.
 * Desktop channels have no settings beyond their name.
 */
export interface NotifyChannel {
    name: string;
    type: NotifyChannelType;
    /**
     * Telegram bot token.
     */
    token?: string;
    /**
     * Telegram chat that receives the messages.
     */
    chatId?: string;
    /**
     * Discord, Slack, or generic webhook URL.
     */
    url?: string;
}

/**
 * `~/.stillmark/notify.json`: shared by every project of this user, never inside a repository.
 */
export interface NotifyConfig {
    enabled: boolean;
    channels: NotifyChannel[];
}

/**
 * Narrows unknown input to a channel type.
 */
export function isNotifyChannelType(value: unknown): value is NotifyChannelType {
    return (NotifyChannelTypes as readonly unknown[]).includes(value);
}

/**
 * Path of the per-user notification config.
 */
export function notifyConfigPath(homeDir: string = os.homedir()): string {
    return path.join(homeDir, ".stillmark", "notify.json");
}

/**
 * Loads the notification config; disabled with no channels when the file is missing or unreadable.
 */
export function loadNotifyConfig(homeDir?: string): NotifyConfig {
    const file = notifyConfigPath(homeDir);

    if (!fs.existsSync(file)) {
        return { enabled: true, channels: [] };
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<NotifyConfig>;
        const channels = Array.isArray(parsed.channels)
            ? parsed.channels.filter((channel) => channel && typeof channel.name === "string" && isNotifyChannelType(channel.type))
            : [];

        return { enabled: parsed.enabled !== false, channels };
    } catch {
        return { enabled: true, channels: [] };
    }
}

/**
 * Saves the notification config readable only by the current user.
 */
export function writeNotifyConfig(config: NotifyConfig, homeDir?: string): string {
    const file = notifyConfigPath(homeDir);

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(config, null, 4)}\n`, { encoding: "utf8", mode: 0o600 });

    return file;
}

function mask(secret: string | undefined): string | undefined {
    if (!secret) {
        return undefined;
    }

    return secret.length <= 8 ? "****" : `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

/**
 * Channel safe to print: tokens and webhook URLs are masked.
 */
export function maskChannel(channel: NotifyChannel): NotifyChannel {
    const url = channel.url ? new URL(channel.url) : undefined;

    return {
        name: channel.name,
        type: channel.type,
        token: mask(channel.token),
        chatId: channel.chatId,
        url: url ? `${url.protocol}//${url.host}/${mask(url.pathname.slice(1))}` : undefined
    };
}
