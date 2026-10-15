import fs from "node:fs";
import path from "node:path";

import type { GitRunner } from "./GitRunner";

/** Marker line that identifies the hook as written by Stillmark. */
export const AttributionHookMarker = "# stillmark: strip-agent-attribution";

/**
 * POSIX sh `commit-msg` hook (runs under Git for Windows too). Agents add their trailers before
 * git hooks run, so stripping here catches Cursor and Claude Code even when their own settings
 * are ignored. Trailing blank lines left behind are dropped.
 */
export const AttributionHookScript = `#!/bin/sh
${AttributionHookMarker}
# Removes AI agent attribution (Cursor, Claude Code) from commit messages.
# Turn off with: stillmark config set --strip-attribution=false
msg="$1"
tmp="$msg.stillmark"
awk '
    { l = tolower($0) }
    l ~ /^co-authored-by:[ \\t]*(cursor|claude)/ { next }
    l ~ /^co-authored-by:.*(cursoragent@cursor\\.com|noreply@anthropic\\.com)/ { next }
    l ~ /^made-with:[ \\t]*cursor/ { next }
    l ~ /generated with \\[?claude code/ { next }
    { lines[++n] = $0 }
    END {
        while (n > 0 && lines[n] ~ /^[ \\t]*$/) n--
        for (i = 1; i <= n; i++) print lines[i]
    }
' "$msg" > "$tmp" && mv "$tmp" "$msg"
`;

export interface AttributionHookStatus {
    
    /** False outside a git work tree. */
    gitRepo: boolean;
    /** Absolute hooks directory (honors `core.hooksPath`). */
    hooksDir?: string;
    hookPath?: string;
    /** Stillmark hook is in place. */
    installed: boolean;
    /** A `commit-msg` hook exists that Stillmark did not write; it is never overwritten. */
    foreign: boolean;
}

/**
 * Locates the `commit-msg` hook for the repository at `root` and reports who owns it.
 */
export async function attributionHookStatus(root: string, runner: GitRunner): Promise<AttributionHookStatus> {
    const result = await runner.capture(root, ["rev-parse", "--git-path", "hooks"]);

    if (!result.ok || !result.stdout.trim()) {
        return { gitRepo: false, installed: false, foreign: false };
    }

    const hooksDir = path.resolve(root, result.stdout.trim());
    const hookPath = path.join(hooksDir, "commit-msg");

    if (!fs.existsSync(hookPath)) {
        return { gitRepo: true, hooksDir, hookPath, installed: false, foreign: false };
    }

    const ours = fs.readFileSync(hookPath, "utf8").includes(AttributionHookMarker);

    return { gitRepo: true, hooksDir, hookPath, installed: ours, foreign: !ours };
}

/**
 * Writes (or refreshes) the Stillmark `commit-msg` hook. Refuses to replace a hook it did not write.
 */
export async function installAttributionHook(root: string, runner: GitRunner): Promise<AttributionHookStatus> {
    const status = await attributionHookStatus(root, runner);

    if (!status.gitRepo || status.foreign || !status.hooksDir || !status.hookPath) {
        return status;
    }

    fs.mkdirSync(status.hooksDir, { recursive: true });
    fs.writeFileSync(status.hookPath, AttributionHookScript, { encoding: "utf8", mode: 0o755 });
    fs.chmodSync(status.hookPath, 0o755);

    return { ...status, installed: true };
}

/**
 * Deletes the Stillmark `commit-msg` hook; leaves hooks written by anyone else alone.
 */
export async function removeAttributionHook(root: string, runner: GitRunner): Promise<AttributionHookStatus> {
    const status = await attributionHookStatus(root, runner);

    if (status.installed && status.hookPath) {
        fs.rmSync(status.hookPath);

        return { ...status, installed: false };
    }

    return status;
}
