import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { opencodeConfigRoot, resolveTemplatesDir } from "../adapters/Install";

/**
 * Text every Stillmark OpenCode hook file contains; used to recognize the file as ours.
 */
export const OpenCodeHookMarker = "stillmark notify run-hook --agent=opencode";

const RUN_HOOK_ARGS = ["notify", "run-hook", "--agent=opencode"];
const COMMAND_LINE = /^const Command: readonly string\[\] = .*;$/m;
const FILE_NAME = "stillmark-notify.ts";

/**
 * Plugin file OpenCode loads for the current user: `<config>/plugins/stillmark-notify.ts`.
 *
 * @param homeDir Home directory used when `XDG_CONFIG_HOME` is not set.
 */
export function openCodeHookFile(homeDir: string = os.homedir()): string {
    return path.join(opencodeConfigRoot(homeDir), "plugins", FILE_NAME);
}

/**
 * Program the plugin runs after a session ends. OpenCode starts the plugin inside its own process, so on
 * Windows the plugin points at Node and the Stillmark CLI script instead of the npm `.cmd` shim.
 */
export function openCodeNotifyCommand(
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

function isOurs(content: string): boolean {
    return content.includes(OpenCodeHookMarker)
        && /"notify"\s*,\s*"run-hook"\s*,\s*"--agent=opencode"/.test(content);
}

function render(command: string[]): string {
    const template = fs.readFileSync(
        path.join(resolveTemplatesDir(), "shared", "OpenCodeNotifyPlugin.ts"),
        "utf8"
    );

    if (!COMMAND_LINE.test(template)) {
        throw new Error("Stillmark OpenCode hook template is missing its command line");
    }

    return template.replace(COMMAND_LINE, `const Command: readonly string[] = ${JSON.stringify(command)};`);
}

/**
 * Whether the Stillmark plugin is installed for OpenCode, and the file that blocks it, if any.
 */
export function openCodeHookState(homeDir?: string): { installed: boolean; conflict?: string } {
    const file = openCodeHookFile(homeDir);

    if (!fs.existsSync(file)) {
        return { installed: false };
    }

    return isOurs(fs.readFileSync(file, "utf8"))
        ? { installed: true }
        : { installed: false, conflict: "the existing plugin was not created by Stillmark" };
}

/**
 * Adds or removes the user-level OpenCode plugin, keeping every other plugin untouched.
 * An existing `stillmark-notify.ts` written by another program is reported as a conflict and never replaced.
 */
export function setOpenCodeHook(
    install: boolean,
    homeDir?: string,
    command: string[] = openCodeNotifyCommand()
): { file: string; changed: boolean; conflict?: string } {
    const file = openCodeHookFile(homeDir);
    const state = openCodeHookState(homeDir);

    if (!install) {
        if (!fs.existsSync(file)) {
            return { file, changed: false };
        }

        if (!state.installed) {
            return { file, changed: false, conflict: state.conflict };
        }

        fs.rmSync(file, { force: true });

        return { file, changed: true };
    }

    if (state.conflict) {
        return { file, changed: false, conflict: state.conflict };
    }

    const content = render(command);

    if (state.installed && fs.readFileSync(file, "utf8") === content) {
        return { file, changed: false };
    }

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, "utf8");

    return { file, changed: true };
}
