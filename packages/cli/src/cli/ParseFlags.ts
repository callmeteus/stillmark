/**
 * Parsed argv: flags by name, remaining words, and options the CLI does not know.
 */
export interface ParsedArgs {
    flags: Record<string, string | boolean>;
    positional: string[];
    /**
     * Unknown `--options`; they are never treated as text so they cannot become item titles.
     */
    unknown: string[];
}

const BOOLEAN_FLAGS: Record<string, string> = {
    "--json": "json",
    "--git": "git",
    "--no-git": "noGit",
    "--accept-scope-change": "acceptScopeChange",
    "--allow-sensitive": "allowSensitive",
    "--confirm": "confirm",
    "--checked": "checked",
    "--prompted": "prompted",
    "--force": "force",
    "--global": "global",
    "--link": "link",
    "--replace": "replace",
    "--done": "done",
    "--save": "save",
    "--help": "help",
    "-h": "help"
};

/**
 * Flags that take a value, as `--name=value` or `--name value`.
 */
const VALUE_FLAGS: Record<string, string> = {
    "--root": "root",
    "--agent": "agent",
    "--tag": "tag",
    "--design-system": "designSystem",
    "--details": "details",
    "--detail": "detail",
    "--module": "module",
    "--acceptance": "acceptance",
    "--verification": "verification",
    "--priority": "priority",
    "--phase": "phase",
    "--objective": "objective",
    "--in-scope": "inScope",
    "--out-of-scope": "outOfScope",
    "--auto-update": "autoUpdate",
    "--update-interval": "updateInterval",
    "--date": "date",
    "--commit": "commit",
    "--roadmap-dates": "roadmapDates",
    "--strip-attribution": "stripAttribution",
    "--auto-push": "autoPush",
    "--language": "language",
    "--caveman": "caveman",
    "--token": "token",
    "--chat-id": "chatId",
    "--url": "url",
    "--name": "name",
    "--status": "status",
    "--message": "message"
};

/**
 * Split argv into flags and positional words. Everything after a bare `--` is positional.
 */
export function parseFlags(argv: string[]): ParsedArgs {
    const flags: Record<string, string | boolean> = {};
    const positional: string[] = [];
    const unknown: string[] = [];

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === "--") {
            positional.push(...argv.slice(i + 1));
            break;
        }

        if (!arg.startsWith("-") || arg === "-" || /^-\d/.test(arg)) {
            positional.push(arg);
            continue;
        }

        if (BOOLEAN_FLAGS[arg] !== undefined) {
            flags[BOOLEAN_FLAGS[arg]] = true;
            continue;
        }

        const eq = arg.indexOf("=");
        const name = eq >= 0 ? arg.slice(0, eq) : arg;
        const key = VALUE_FLAGS[name];

        if (key === undefined) {
            unknown.push(arg);
        } else
        if (eq >= 0) {
            flags[key] = arg.slice(eq + 1);
        } else
        if (argv[i + 1] !== undefined) {
            flags[key] = argv[++i];
        } else {
            unknown.push(arg);
        }
    }

    return { flags, positional, unknown };
}
