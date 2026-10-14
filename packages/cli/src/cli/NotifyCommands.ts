import {
    addNotifyChannel,
    isNotifyChannelType,
    isNotifyHookAgent,
    isNotifyStatus,
    listNotify,
    manageNotifyHook,
    NotifyChannelTypes,
    NotifyHookAgents,
    NotifyStatuses,
    removeNotifyChannel,
    runNotifyHook,
    sendNotify,
    setNotifyEnabled
} from "../notify";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

const USAGE = [
    "Usage: stillmark notify [list]",
    `notify add ${NotifyChannelTypes.join("|")} [--token=<bot token> --chat-id=<id>] [--url=<webhook>] [--name=<name>]`,
    "notify add desktop [--name=<name>]",
    "notify remove <name> | notify test [<name>] | notify on|off",
    `notify send "<text>" [--status=${NotifyStatuses.join("|")}]`,
    `notify hook install|remove|status --agent=${NotifyHookAgents.join("|")}`
].join(" | ");

function optional(value: string | boolean | undefined): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * Reads everything piped to the process (the agent's hook payload); empty when nothing is piped.
 */
export async function readStdin(): Promise<string> {
    if (process.stdin.isTTY) {
        return "";
    }

    const chunks: Buffer[] = [];

    for await (const chunk of process.stdin) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    }

    return Buffer.concat(chunks).toString("utf8");
}

/**
 * `stillmark notify ...` except `run-hook`, which the CLI entry handles because its output must stay `{}`.
 */
export async function runNotifyCommand(
    paths: ProjectPaths,
    positional: string[],
    flags: Record<string, string | boolean>
): Promise<OperationResult> {
    const sub = positional[1];
    const rest = positional.slice(2);

    if (sub === undefined || sub === "list" || sub === "status") {
        return listNotify();
    }

    if (sub === "add") {
        const type = rest[0];

        if (!isNotifyChannelType(type)) {
            return { ok: false, changed: false, summary: USAGE };
        }

        return addNotifyChannel({
            type,
            name: optional(flags.name),
            token: optional(flags.token),
            chatId: optional(flags.chatId),
            url: optional(flags.url)
        });
    }

    if (sub === "remove") {
        return removeNotifyChannel(rest.join(" ") || undefined);
    }

    if (sub === "on" || sub === "off") {
        return setNotifyEnabled(sub === "on");
    }

    if (sub === "test") {
        return sendNotify({
            status: "done",
            root: paths.root,
            summary: "Stillmark test notification: this channel works.",
            channel: rest.join(" ") || undefined,
            force: true
        });
    }

    if (sub === "send") {
        const status = optional(flags.status) ?? "done";

        if (!isNotifyStatus(status)) {
            return { ok: false, changed: false, summary: USAGE };
        }

        return sendNotify({ status, root: paths.root, summary: rest.join(" ") || undefined });
    }

    if (sub === "hook") {
        const agent = optional(flags.agent);

        if (!isNotifyHookAgent(agent)) {
            return { ok: false, changed: false, summary: USAGE };
        }

        return manageNotifyHook(rest[0], agent);
    }

    return { ok: false, changed: false, summary: USAGE };
}

/**
 * `stillmark notify run-hook --agent=<agent> ['<json>']`: sends the finish notification and prints `{}` for the agent.
 * Codex passes its event JSON as the last argument; Cursor and Claude Code pipe it on stdin.
 */
export async function runNotifyHookCommand(
    paths: ProjectPaths,
    flags: Record<string, string | boolean>,
    payloadArg?: string
): Promise<number> {
    const payload = payloadArg ?? await readStdin().catch(() => "");

    await runNotifyHook(payload, optional(flags.agent) ?? "agent", paths.root);
    console.log("{}");

    return 0;
}
