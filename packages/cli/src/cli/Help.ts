import type { OperationResult } from "../results/OperationResult";

const GLOBAL_OPTIONS = "Global options: --json, --root=<dir>, --help. Use -- before text that starts with a dash.";

/**
 * Usage lines per top-level command.
 */
const COMMAND_USAGE: Record<string, string[]> = {
    init: ["stillmark init [--todos]   (--todos also adds the code's TODO/FIXME comments to the roadmap)"],
    classify: ["stillmark classify \"<text>\""],
    roadmap: [
        "stillmark roadmap",
        "stillmark roadmap add \"<description>\" [--priority=critical|high|medium|low] [--details \"<text>\"] [--acceptance \"<text>\"] [--done] [--date=YYYY-MM-DD|--commit=<ref>] [--allow-sensitive] [--git|--no-git]",
        "stillmark roadmap done \"<item>\" [--date=YYYY-MM-DD|--commit=<ref>]",
        "stillmark roadmap defer \"<item>\"",
        "stillmark roadmap todos [--add] [--git|--no-git]   (lists TODO/FIXME comments in the code; --add puts the new ones in ## Backlog, FIXME as high)",
        "stillmark roadmap priority <item> critical|high|medium|low"
    ],
    plan: [
        "stillmark plan",
        "stillmark plan init [\"<objective>\"] [--in-scope \"<a>\\n<b>\"] [--out-of-scope \"<c>\"]",
        "stillmark plan scope [--objective \"<text>\"] [--in-scope \"<a>\\n<b>\"] [--out-of-scope \"<c>\"] [--replace]",
        "stillmark plan add \"<description>\" [--priority=critical|high|medium|low] [--phase=PHASE-1] [--details \"<text>\"] [--acceptance \"<criterion>\\n<criterion>\"] [--verification \"<check>\\n<check>\"] [--accept-scope-change]",
        "stillmark plan done <task>",
        "stillmark plan status <task> pending|pending-approval|in-progress|blocked|done|cancelled",
        "stillmark plan phase <task> <phase>",
        "stillmark plan priority <task> critical|high|medium|low",
        "stillmark plan blocked <task> <blocker>"
    ],
    changelog: [
        "stillmark changelog [status]   (previews what sync would add)",
        "stillmark changelog sync   (creates CHANGELOG.md from tags or package version bumps, done roadmap items, and feat/fix commits; never rewrites released entries)",
        "stillmark changelog add \"<what changed>\" [--group=added|changed|deprecated|removed|fixed|security]",
        "stillmark changelog check"
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
    design: [
        "stillmark design   (modes: create, review, mixed)",
        "stillmark design create \"<brief>\"   (new UI: macrostructure, theme, anti-slop)",
        "stillmark design build|study|redesign \"<brief>\"   (same as create)",
        "stillmark design review|critique|audit \"<surface>\"   (critique and audit; no edits unless the user asks)",
        "stillmark design polish \"<scope>\" | stillmark design \"<free text>\"   (mixed implement + review)"
    ],
    config: [
        "stillmark config status",
        "stillmark config set --design-system=true|false [--prompted]",
        "stillmark config set --detail=compact|extended|inherit [--module=coverage|roadmap|plan]",
        "stillmark config set --auto-update=true|false [--update-interval=<hours>]",
        "stillmark config set --roadmap-dates=true|false",
        "stillmark config set --strip-attribution=true|false",
        "stillmark config set --auto-push=true|false",
        "stillmark config set --language=<en|pt-BR|...>|inherit [--module=roadmap|plan|coverage|changelog|docs|commits]",
        "stillmark config set --caveman=off|lite|full|ultra|on"
    ],
    notify: [
        "stillmark notify [list]",
        "stillmark notify add telegram --token=<bot token> [--chat-id=<id>] [--name=<name>]   (chat found by itself after you message the bot)",
        "stillmark notify add discord|slack|webhook --url=<webhook url> [--name=<name>]",
        "stillmark notify add desktop [--name=<name>]   (native notification on this computer; nothing to configure)",
        "stillmark notify test [<name>] | notify remove <name> | notify on|off",
        "stillmark notify send \"<text>\" [--status=done|failed|waiting|stopped]",
        "stillmark notify hook install|remove|status --agent=cursor|claude|codex   (notifies every time the agent finishes)"
    ],
    caveman: [
        "stillmark caveman [stats]",
        "stillmark caveman on|off|lite|full|ultra [--save]   (this conversation only; --save keeps it in stillmark.config.json)",
        "stillmark caveman compress <file>   (keeps the readable original, then the agent rewrites the file)",
        "stillmark caveman verify <file>",
        "stillmark caveman restore <file>"
    ],
    readme: [
        "stillmark readme templates",
        "stillmark readme plan [--template=<id>] [--file=README.md]   (project facts, outline, facts to keep; backs up the current README)",
        "stillmark readme check [--template=<id>] [--file=README.md]   (sections, unknown commands, broken links, leftovers, lost facts)",
        "stillmark readme restore [--file=README.md]"
    ],
    git: [
        "stillmark git push [--with-commit] [--message \"<subject>\"] [summary]",
        "  (pushes local commits; when needsCommit is true, ask the user or rerun with --with-commit)",
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
