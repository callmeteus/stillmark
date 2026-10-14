import { showDesktopToast, type ToastRunner } from "./DesktopToast";
import type { NotifyChannel } from "./NotifyConfig";

/**
 * How the agent run ended.
 */
export type NotifyStatus = "done" | "failed" | "waiting" | "stopped";

export const NotifyStatuses: readonly NotifyStatus[] = ["done", "failed", "waiting", "stopped"];

/**
 * What a notification says.
 */
export interface NotifyMessage {
    status: NotifyStatus;
    /**
     * Project folder name.
     */
    project: string;
    root?: string;
    agent?: string;
    /**
     * Short text, usually the first lines of the agent's final reply.
     */
    summary?: string;
    /**
     * Base language for the status label (`pt`, `es`, `en`).
     */
    language?: string;
}

/**
 * Delivery outcome per channel. Never contains secrets.
 */
export interface NotifyDelivery {
    name: string;
    type: NotifyChannel["type"];
    ok: boolean;
    detail?: string;
}

const STATUS_LABELS: Record<string, Record<NotifyStatus, string>> = {
    en: { done: "Finished", failed: "Failed", waiting: "Waiting for you", stopped: "Stopped" },
    pt: { done: "Concluído", failed: "Falhou", waiting: "Aguardando você", stopped: "Interrompido" },
    es: { done: "Terminado", failed: "Falló", waiting: "Esperando tu respuesta", stopped: "Detenido" }
};

const MAX_SUMMARY = 1500;
const TIMEOUT_MS = 10_000;

/**
 * Narrows unknown input to a status.
 */
export function isNotifyStatus(value: unknown): value is NotifyStatus {
    return (NotifyStatuses as readonly unknown[]).includes(value);
}

/**
 * Plain text shared by Telegram, Discord, and Slack: status label and project, then the summary.
 */
export function formatNotifyText(message: NotifyMessage): string {
    const labels = STATUS_LABELS[(message.language ?? "en").split("-")[0]] ?? STATUS_LABELS.en;
    const header = `${labels[message.status]} - ${message.project}`;
    const summary = message.summary?.trim();

    if (!summary) {
        return header;
    }

    return `${header}\n${summary.length > MAX_SUMMARY ? `${summary.slice(0, MAX_SUMMARY)}...` : summary}`;
}

async function post(url: string, body: unknown): Promise<{ ok: boolean; detail?: string }> {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(TIMEOUT_MS)
        });

        return response.ok ? { ok: true } : { ok: false, detail: `HTTP ${response.status}` };
    } catch (err) {
        return { ok: false, detail: err instanceof Error ? err.name === "TimeoutError" ? "Timed out" : err.message : String(err) };
    }
}

function requestFor(channel: NotifyChannel, message: NotifyMessage): { url: string; body: unknown } | undefined {
    const text = formatNotifyText(message);

    if (channel.type === "telegram") {
        return channel.token && channel.chatId
            ? {
                url: `https://api.telegram.org/bot${channel.token}/sendMessage`,
                body: { chat_id: channel.chatId, text, disable_web_page_preview: true }
            }
            : undefined;
    }

    if (!channel.url) {
        return undefined;
    }

    if (channel.type === "discord") {
        return { url: channel.url, body: { content: text.slice(0, 2000) } };
    }

    if (channel.type === "slack") {
        return { url: channel.url, body: { text } };
    }

    return {
        url: channel.url,
        body: {
            event: "agent-finished",
            status: message.status,
            project: message.project,
            root: message.root,
            agent: message.agent,
            summary: message.summary,
            text,
            at: new Date().toISOString()
        }
    };
}

/**
 * Sends one message to every channel in parallel; one failing channel never stops the others.
 * Desktop channels show the status line as the title and the summary as the body.
 */
export async function sendToChannels(
    channels: NotifyChannel[],
    message: NotifyMessage,
    toast: ToastRunner = showDesktopToast
): Promise<NotifyDelivery[]> {
    return Promise.all(channels.map(async (channel) => {
        if (channel.type === "desktop") {
            const [title, ...body] = formatNotifyText(message).split("\n");

            return { name: channel.name, type: channel.type, ...(await toast(title, body.join("\n"))) };
        }

        const request = requestFor(channel, message);

        if (!request) {
            return { name: channel.name, type: channel.type, ok: false, detail: "Incomplete channel settings" };
        }

        return { name: channel.name, type: channel.type, ...(await post(request.url, request.body)) };
    }));
}

/**
 * Finds the chat that most recently wrote to a Telegram bot (the user sends any message to the bot first).
 */
export async function discoverTelegramChat(token: string): Promise<{ chatId?: string; title?: string; detail?: string }> {
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
            signal: AbortSignal.timeout(TIMEOUT_MS)
        });

        if (!response.ok) {
            return { detail: response.status === 401 || response.status === 404 ? "Invalid bot token" : `HTTP ${response.status}` };
        }

        type Chat = { id: number | string; title?: string; first_name?: string; username?: string };
        type Update = { message?: { chat: Chat }; channel_post?: { chat: Chat }; my_chat_member?: { chat: Chat } };

        const data = (await response.json()) as { result?: Update[] };
        const chats = (data.result ?? [])
            .map((update) => update.message?.chat ?? update.channel_post?.chat ?? update.my_chat_member?.chat)
            .filter((chat): chat is Chat => chat !== undefined);
        const chat = chats[chats.length - 1];

        return chat
            ? { chatId: String(chat.id), title: chat.title ?? chat.username ?? chat.first_name }
            : { detail: "No messages yet: open the bot in Telegram, send it any message, then try again" };
    } catch (err) {
        return { detail: err instanceof Error ? err.message : String(err) };
    }
}
