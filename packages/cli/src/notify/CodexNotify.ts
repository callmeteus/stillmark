import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const RUN_HOOK_ARGS = ["notify", "run-hook", "--agent=codex"];
const TABLE_RE = /^\s*\[/;
const NOTIFY_RE = /^\s*notify\s*=/;

/**
 * `config.toml` of the Codex CLI: `$CODEX_HOME` when set for the current user, else `~/.codex`.
 */
export function codexConfigFile(homeDir: string = os.homedir()): string {
    const base = process.env.CODEX_HOME && homeDir === os.homedir() ? process.env.CODEX_HOME : path.join(homeDir, ".codex");

    return path.join(base, "config.toml");
}

/**
 * Program Codex runs after every turn. Codex starts it without a shell and appends the event JSON as
 * the last argument, so on Windows the npm `.cmd` shim is skipped in favor of Node and the CLI script.
 */
export function codexNotifyCommand(
    platform: NodeJS.Platform = process.platform,
    execPath: string = process.execPath,
    script: string | undefined = process.argv[1]
): string[] {
    if (platform === "win32" && script && /\.[cm]?js$/i.test(script)) {
        let resolved = script;

        try {
            resolved = fs.realpathSync(script);
        } catch {
            resolved = script;
        }

        return [execPath, resolved, ...RUN_HOOK_ARGS];
    }

    return ["stillmark", ...RUN_HOOK_ARGS];
}

function bracketDepth(line: string): number {
    const code = line.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, "").replace(/#.*$/, "");

    return (code.match(/\[/g) ?? []).length - (code.match(/\]/g) ?? []).length;
}

/**
 * Lines of the top-level `notify = [...]` key (it may span several lines); `undefined` when absent.
 * Keys inside `[tables]` are a different setting and are ignored.
 */
function findNotify(lines: string[]): { start: number; end: number; value: string } | undefined {
    for (let index = 0; index < lines.length; index++) {
        if (TABLE_RE.test(lines[index])) {
            return undefined;
        }

        if (!NOTIFY_RE.test(lines[index])) {
            continue;
        }

        let end = index + 1;
        let depth = bracketDepth(lines[index].replace(NOTIFY_RE, ""));

        while (depth > 0 && end < lines.length) {
            depth += bracketDepth(lines[end]);
            end += 1;
        }

        return { start: index, end, value: lines.slice(index, end).join("\n") };
    }

    return undefined;
}

function isOurs(value: string): boolean {
    return value.includes("run-hook") && value.includes("--agent=codex");
}

function readLines(file: string): string[] {
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").split("\n") : [];
}

/**
 * Whether Codex runs Stillmark after every turn, and the other program it runs instead, if any.
 */
export function codexHookState(homeDir?: string): { installed: boolean; conflict?: string } {
    const found = findNotify(readLines(codexConfigFile(homeDir)));

    if (!found) {
        return { installed: false };
    }

    return isOurs(found.value) ? { installed: true } : { installed: false, conflict: found.value.trim().split("\n")[0] };
}

/**
 * Adds or removes `notify` in the Codex config, keeping every other line as written. Codex accepts a
 * single notify program, so another one already there is reported as a conflict and never replaced.
 */
export function setCodexHook(
    install: boolean,
    homeDir?: string,
    command: string[] = codexNotifyCommand()
): { file: string; changed: boolean; conflict?: string } {
    const file = codexConfigFile(homeDir);
    const lines = readLines(file);
    const found = findNotify(lines);

    if (found && !isOurs(found.value)) {
        return { file, changed: false, conflict: found.value.trim().split("\n")[0] };
    }

    if (Boolean(found) === install) {
        return { file, changed: false };
    }

    const next = found
        ? [...lines.slice(0, found.start), ...lines.slice(found.end)]
        : [`notify = [${command.map((part) => JSON.stringify(part)).join(", ")}]`, ...lines];
    const text = next.join("\n");

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text.endsWith("\n") ? text : `${text}\n`, "utf8");

    return { file, changed: true };
}
