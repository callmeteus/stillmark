import type { OperationResult } from "../results/OperationResult";

import { DESIGN_PLAYBOOKS, type DesignMode } from "./DesignModes";

const CREATE_SUBCOMMANDS = new Set(["create", "build", "study", "redesign"]);
const REVIEW_SUBCOMMANDS = new Set(["review", "critique", "audit"]);

/**
 * Payload returned by `stillmark design …` for agents.
 */
export interface DesignCommandResult extends OperationResult {
    
    mode?: DesignMode;
    subcommand?: string;
    brief?: string;
    playbooks?: readonly string[];
}

const USAGE_LINES = [
    "stillmark design   (modes and playbooks)",
    "stillmark design create \"<brief>\"   (new surfaces: macrostructure, theme, anti-slop)",
    "stillmark design build|study|redesign \"<brief>\"   (same as create)",
    "stillmark design review|critique|audit \"<surface>\"   (diagnosis and critique only unless the user asks to fix)",
    "stillmark design \"<brief>\"   (mixed: implement with create taste + review pass)",
    "stillmark design polish \"<scope>\"   (mixed)"
];

/**
 * Maps the first design subcommand to a design mode.
 *
 * @param sub First token after `design`, if any.
 * @returns Resolved mode.
 */
export function resolveDesignMode(sub: string | undefined): DesignMode {
    if (sub === undefined) {
        return "mixed";
    }

    const normalized = sub.toLowerCase();

    if (CREATE_SUBCOMMANDS.has(normalized)) {
        return "create";
    }

    if (REVIEW_SUBCOMMANDS.has(normalized)) {
        return "review";
    }

    return "mixed";
}

/**
 * True when `sub` is a known design subcommand (not free-text brief).
 *
 * @param sub First token after `design`.
 * @returns Whether the token is a reserved subcommand.
 */
export function isDesignSubcommand(sub: string | undefined): boolean {
    if (sub === undefined) {
        return false;
    }

    const normalized = sub.toLowerCase();

    return (
        CREATE_SUBCOMMANDS.has(normalized) ||
        REVIEW_SUBCOMMANDS.has(normalized) ||
        normalized === "polish"
    );
}

/**
 * Dispatches `stillmark design` for agents (`/stillmark design …`).
 *
 * @param positional Full argv tail starting at `design`.
 * @returns Mode, brief, and playbook paths under the stillmark skill.
 */
export function runDesignCommand(positional: string[]): DesignCommandResult {
    const sub = positional[1];
    const hasSubcommand = isDesignSubcommand(sub);
    const brief = hasSubcommand ? positional.slice(2).join(" ").trim() : positional.slice(1).join(" ").trim();

    if (sub === undefined && brief.length === 0) {
        return {
            ok: true,
            changed: false,
            action: "design",
            summary: [...USAGE_LINES].join("\n"),
            playbooks: ["reference/design-pipeline.md"]
        };
    }

    const mode = resolveDesignMode(hasSubcommand ? sub : undefined);
    const playbooks = DESIGN_PLAYBOOKS[mode];

    const modeLabel =
        mode === "create"
            ? "create (new UI from brief)"
            : mode === "review"
                ? "review (critique and audit; no edits unless the user continues)"
                : "mixed (create taste + review pass)";

    const summaryParts = [`Design mode: ${modeLabel}`, `Playbooks: ${playbooks.join(", ")}`];

    if (brief.length > 0) {
        summaryParts.push(`Brief: ${brief}`);
    } else if (mode === "review") {
        summaryParts.push("Brief: (scope the surface in chat if omitted)");
    }

    return {
        ok: true,
        changed: false,
        action: "design",
        mode,
        subcommand: hasSubcommand ? sub : undefined,
        brief,
        playbooks,
        summary: summaryParts.join("\n")
    };
}
