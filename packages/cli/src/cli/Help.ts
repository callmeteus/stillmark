import type { OperationResult } from "../results/OperationResult";

const GLOBAL_OPTIONS = "Global options: --json, --root=<dir>, --help. Use -- before text that starts with a dash.";

/**
 * Usage lines per top-level command.
 */
const COMMAND_USAGE: Record<string, string[]> = {
    init: ["stillmark init"],
    classify: ["stillmark classify \"<text>\""],
    roadmap: [
        "stillmark roadmap",
        "stillmark roadmap add \"<description>\" [--priority=critical|high|medium|low] [--details \"<text>\"] [--acceptance \"<text>\"] [--done] [--date=YYYY-MM-DD|--commit=<ref>] [--allow-sensitive] [--git|--no-git]",
        "stillmark roadmap done \"<item>\" [--date=YYYY-MM-DD|--commit=<ref>]",
        "stillmark roadmap defer \"<item>\"",
        "stillmark roadmap priority <item> critical|high|medium|low"
    ],
    plan: [
        "stillmark plan",
        "stillmark plan init [\"<objective>\"] [--in-scope \"<a>\\n<b>\"] [--out-of-scope \"<c>\"]",
        "stillmark plan scope [--objective \"<text>\"] [--in-scope \"<a>\\n<b>\"] [--out-of-scope \"<c>\"] [--replace]",
        "stillmark plan add \"<description>\" [--priority=critical|high|medium|low] [--details \"<text>\"] [--acceptance \"<criterion>\\n<criterion>\"] [--verification \"<check>\\n<check>\"] [--accept-scope-change]",
        "stillmark plan priority <task> critical|high|medium|low",
        "stillmark plan blocked <task> <blocker>"
    ],
    add: [
        "stillmark add \"<description>\" [--done] [--date=YYYY-MM-DD|--commit=<ref>] [--priority=critical|high|medium|low] [--details \"<text>\"] [--acceptance \"<text>\"] [--verification \"<text>\"] [--accept-scope-change]"
    ],
    move: ["stillmark move \"<item>\" to plan|roadmap [--confirm]"],
    coverage: [
        "stillmark coverage init | validate | summary | update",
        "stillmark coverage check|uncheck \"<case substring>\"",
        "stillmark coverage add \"<### heading match>\" \"<case>\" --tag=<tag> [--checked] [--details \"<text>\"]"
    ],
    config: [
        "stillmark config status",
        "stillmark config set --design-system=true|false [--prompted]",
        "stillmark config set --detail=compact|extended|inherit [--module=coverage|roadmap|plan]",
        "stillmark config set --auto-update=true|false [--update-interval=<hours>]",
        "stillmark config set --roadmap-dates=true|false",
        "stillmark config set --strip-attribution=true|false"
    ],
    git: [
        "stillmark git message-style [\"<summary>\"]",
        "stillmark git hook [status|install|remove]",
        "stillmark git setup-files",
        "stillmark git setup-commit [--message \"<msg>\"]"
    ],
    install: [
        "stillmark install --agent cursor|claude|codex [--global] [--force]   (project copy is skipped when already installed globally; --force keeps one)",
        "stillmark install --agent cursor|claude|codex [--global] --link   (dev: link the source templates)"
    ],
    update: ["stillmark update [--force]", "stillmark update apply"],
    "long-running": ["stillmark long-running apply \"<description>\" [--accept-scope-change]"]
};

/**
 * Help for one command, or the command list when the command is unknown or missing.
 */
export function helpResult(cmd: string | undefined): OperationResult & { usage: string[] } {
    const usage = cmd !== undefined && COMMAND_USAGE[cmd] !== undefined
        ? COMMAND_USAGE[cmd]
        : [`stillmark <command> [options]`, `Commands: ${Object.keys(COMMAND_USAGE).join(", ")}`];

    return {
        ok: true,
        changed: false,
        action: "help",
        summary: [...usage, GLOBAL_OPTIONS].join("\n"),
        usage
    };
}

/**
 * Refuse unknown options instead of reading them as item text.
 */
export function unknownOptionsResult(unknown: string[], cmd: string | undefined): OperationResult {
    return {
        ok: false,
        changed: false,
        summary: `Unknown option${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}. Run ${["stillmark", cmd, "--help"].filter(Boolean).join(" ")}`
    };
}
