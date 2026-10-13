import type { CavemanLevel } from "../config";

/**
 * Rules shared by every active level: what must never be shortened.
 */
const BASE_RULES: readonly string[] = [
    "Reply in the user's language with correct spelling and accents; terse never means switching languages.",
    "Keep code, commands, file paths, file links, URLs, IDs (R-001, T-001), versions, numbers, and error text exactly as they are.",
    "Use full, clear sentences for warnings, destructive steps, security notes, and questions the user must answer."
];

/**
 * Extra rules per level, applied on top of the lower levels.
 */
const LEVEL_RULES: Readonly<Record<Exclude<CavemanLevel, "off">, readonly string[]>> = {
    lite: [
        "Answer first. No preamble, no recap of the request, no closing offers, no hedging.",
        "Short sentences; drop filler words and pleasantries."
    ],
    full: [
        "Fragments are fine: drop articles, auxiliaries, and connectors when meaning stays clear.",
        "One line per point; lists over paragraphs."
    ],
    ultra: [
        "Telegraphic style: common abbreviations and symbols (->, =, +) instead of words.",
        "Aim for three lines or fewer unless the user asked for detail."
    ]
};

const LEVEL_ORDER: readonly Exclude<CavemanLevel, "off">[] = ["lite", "full", "ultra"];

/**
 * Reply rules for a level; empty when caveman mode is off, so it adds no tokens.
 */
export function cavemanRules(level: CavemanLevel): string[] {
    if (level === "off") {
        return [];
    }

    const upTo = LEVEL_ORDER.indexOf(level);

    return [...BASE_RULES, ...LEVEL_ORDER.slice(0, upTo + 1).flatMap((key) => LEVEL_RULES[key])];
}

/**
 * Rough token estimate (about four characters per token), good enough to compare before and after.
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}
