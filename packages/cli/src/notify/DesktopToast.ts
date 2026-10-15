import { spawn } from "node:child_process";

/**
 * Program, arguments, and extra environment that show one desktop notification.
 */
export interface ToastCommand {
    
    command: string;
    args: string[];
    env?: Record<string, string>;
}

/**
 * Shows a desktop notification; injectable so tests never pop real toasts.
 */
export type ToastRunner = (title: string, body: string) => Promise<{ ok: boolean; detail?: string }>;

const TIMEOUT_MS = 10_000;
const MAX_BODY = 250;

/**
 * Windows PowerShell 5.1 loads the WinRT toast API; the text comes from environment variables
 * and is XML-escaped there, so nothing from the message is ever parsed as script.
 */
const WINDOWS_SCRIPT = [
    "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null",
    "[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null",
    "$title = [Security.SecurityElement]::Escape($env:STILLMARK_TOAST_TITLE)",
    "$body = [Security.SecurityElement]::Escape($env:STILLMARK_TOAST_BODY)",
    "$xml = New-Object Windows.Data.Xml.Dom.XmlDocument",
    "$xml.LoadXml(\"<toast><visual><binding template='ToastGeneric'><text>$title</text><text>$body</text></binding></visual></toast>\")",
    "$app = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe'",
    "[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show([Windows.UI.Notifications.ToastNotification]::new($xml))"
].join("\n");

/**
 * Native notification command per platform, with no extra dependency: WinRT toast through Windows
 * PowerShell, `osascript` on macOS, and `notify-send` (libnotify) elsewhere. Text is always passed as
 * arguments or environment variables, never spliced into a shell line.
 */
export function desktopToastCommand(platform: NodeJS.Platform, title: string, body: string): ToastCommand {
    const text = body.length > MAX_BODY ? `${body.slice(0, MAX_BODY)}...` : body;

    if (platform === "win32") {
        return {
            command: "powershell.exe",
            args: ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", Buffer.from(WINDOWS_SCRIPT, "utf16le").toString("base64")],
            env: { STILLMARK_TOAST_TITLE: title, STILLMARK_TOAST_BODY: text }
        };
    }

    if (platform === "darwin") {
        return {
            command: "osascript",
            args: ["-e", "on run argv", "-e", "display notification (item 2 of argv) with title (item 1 of argv)", "-e", "end run", title, text]
        };
    }

    return { command: "notify-send", args: ["--app-name=Stillmark", "--", title, text] };
}

/**
 * Shows the notification on this computer and reports whether the system accepted it.
 */
export function showDesktopToast(title: string, body: string, platform: NodeJS.Platform = process.platform): Promise<{ ok: boolean; detail?: string }> {
    const toast = desktopToastCommand(platform, title, body);

    return new Promise((resolve) => {
        let stderr = "";
        const child = spawn(toast.command, toast.args, {
            shell: false,
            windowsHide: true,
            timeout: TIMEOUT_MS,
            env: { ...process.env, ...toast.env }
        });

        child.stderr?.on("data", (chunk: Buffer) => {
            stderr += chunk.toString();
        });
        child.on("error", (error) => {
            resolve({ ok: false, detail: `${toast.command} is not available: ${error.message}` });
        });
        child.on("close", (code) => {
            resolve(code === 0 ? { ok: true } : { ok: false, detail: stderr.trim().split(/\r?\n/)[0] || `${toast.command} exited with ${code}` });
        });
    });
}
