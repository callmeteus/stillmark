import fs from "node:fs";
import path from "node:path";

import { loadConfig, resolveLanguage } from "../config";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { compareFacts, scanText, type TextIssue } from "./TextCheck";
import { languageFromTag, TextLanguage } from "./TextLanguage";
import { TextSeverity } from "./TextPatterns";
import { writingRules } from "./TextRules";

/**
 * Options shared by the text commands.
 */
export interface TextOptions {
    /**
     * Language tag from `--language`; skips detection when set.
     */
    language?: string;
}

/**
 * Issue totals per severity.
 */
export interface TextCounts {
    high: number;
    medium: number;
    low: number;
}

type TextResult = OperationResult & {
    language?: TextLanguage;
    issues?: TextIssue[];
    counts?: TextCounts;
};

type Source =
    | { kind: "file"; abs: string; rel: string; backup: string; raw: string }
    | { kind: "text"; raw: string }
    | { error: string };

const TEXT_EXTENSIONS = [".md", ".mdc", ".txt"];

function toPosix(value: string): string {
    return value.split(path.sep).join("/");
}

function failure(summary: string): OperationResult {
    return { ok: false, changed: false, summary };
}

function looksLikePath(value: string): boolean {
    return !/\s/.test(value) && (/[\\/]/.test(value) || TEXT_EXTENSIONS.includes(path.extname(value).toLowerCase()));
}

/**
 * Resolves the argument of a text command to a project file, or to raw text when `allowText` is set.
 */
function resolveSource(paths: ProjectPaths, target: string | undefined, allowText: boolean): Source {
    if (!target) {
        return { error: "Usage: stillmark text check <file>|\"<text>\" | rewrite <file> | restore <file> | rules" };
    }

    const abs = path.resolve(paths.root, target);
    const exists = fs.existsSync(abs) && fs.statSync(abs).isFile();

    if (!exists) {
        if (allowText && !looksLikePath(target)) {
            return { kind: "text", raw: target };
        }

        return { error: `File not found: ${target}` };
    }

    const rel = path.relative(paths.root, abs);

    if (rel.startsWith("..") || path.isAbsolute(rel)) {
        return { error: `${target} is outside the project` };
    }

    if (!TEXT_EXTENSIONS.includes(path.extname(abs).toLowerCase())) {
        return { error: `Only ${TEXT_EXTENSIONS.join(", ")} files can be checked` };
    }

    const managed = [paths.roadmap, paths.coverage, paths.changelog].some((file) => file.toLowerCase() === abs.toLowerCase()) ||
        abs.toLowerCase().startsWith(paths.planningDir.toLowerCase() + path.sep);

    if (!allowText && managed) {
        return { error: `${toPosix(rel)} is kept by Stillmark commands; reword its entries through them (or by hand for Unreleased changelog entries), then run stillmark text check ${toPosix(rel)}` };
    }

    return {
        kind: "file",
        abs,
        rel: toPosix(rel),
        backup: path.join(paths.textDir, "originals", rel),
        raw: fs.readFileSync(abs, "utf8")
    };
}

function scanOptions(paths: ProjectPaths, options: TextOptions): { force?: TextLanguage; fallback?: TextLanguage } {
    return {
        force: languageFromTag(options.language),
        fallback: languageFromTag(resolveLanguage(loadConfig(paths).language, "docs"))
    };
}

function countIssues(issues: TextIssue[]): TextCounts {
    return {
        high: issues.filter((issue) => issue.severity === TextSeverity.HIGH).length,
        medium: issues.filter((issue) => issue.severity === TextSeverity.MEDIUM).length,
        low: issues.filter((issue) => issue.severity === TextSeverity.LOW).length
    };
}

function isBlocking(issue: TextIssue): boolean {
    return issue.severity !== TextSeverity.LOW;
}

/**
 * `stillmark text check <file>|"<text>"`: finds marks of generated text with the rules of the detected language.
 * While a rewrite is in progress it also compares the file with its original and flags lost or invented facts;
 * once the check passes, the kept original is released.
 */
export function checkText(paths: ProjectPaths, target: string | undefined, options: TextOptions = {}): TextResult {
    const source = resolveSource(paths, target, true);

    if ("error" in source) {
        return failure(source.error);
    }

    const scan = scanText(source.raw, scanOptions(paths, options));
    const rewriting = source.kind === "file" && fs.existsSync(source.backup);
    const facts = rewriting ? compareFacts(fs.readFileSync(source.backup, "utf8"), source.raw) : [];
    const issues = [...facts, ...scan.issues];
    const blocking = issues.filter(isBlocking).length;
    const label = source.kind === "file" ? source.rel : "Text";
    const released = rewriting && blocking === 0;

    if (released) {
        fs.rmSync(source.backup);
    }

    const warnings = issues.length - blocking;
    const summary = blocking === 0
        ? `${label} reads clean (${scan.language})${warnings > 0 ? `; ${warnings} warning(s) worth a look` : ""}${released ? "; rewrite accepted" : ""}`
        : `${blocking} problem(s) in ${label} (${scan.language})${facts.length > 0 ? `, ${facts.length} about facts` : ""}: fix them${rewriting ? ` or run stillmark text restore ${label}` : ""}`;

    return {
        ok: blocking === 0,
        changed: released,
        action: "text-check",
        summary,
        location: source.kind === "file" ? source.abs : undefined,
        language: scan.language,
        issues,
        counts: countIssues(issues)
    };
}

/**
 * `stillmark text rewrite <file>`: keeps the original, then returns the issues, the writing rules of the
 * detected language, and the steps for the agent to rewrite the file. Running it again keeps the first original.
 */
export function rewriteText(
    paths: ProjectPaths,
    target: string | undefined,
    options: TextOptions = {}
): TextResult & { file?: string; original?: string; rules?: string[]; instructions?: string[] } {
    const source = resolveSource(paths, target, false);

    if ("error" in source) {
        return failure(source.error);
    }

    if (source.kind === "text") {
        return failure("Usage: stillmark text rewrite <file>");
    }

    if (!fs.existsSync(source.backup)) {
        fs.mkdirSync(path.dirname(source.backup), { recursive: true });
        fs.copyFileSync(source.abs, source.backup);
    }

    const originalRaw = fs.readFileSync(source.backup, "utf8");
    const scan = scanText(originalRaw, scanOptions(paths, options));
    const original = toPosix(path.relative(paths.root, source.backup));

    return {
        ok: true,
        changed: true,
        action: "text-rewrite",
        summary: `Original kept at ${original}. ${scan.issues.length} issue(s) found (${scan.language}). Rewrite ${source.rel}, then run stillmark text check ${source.rel}`,
        location: source.abs,
        file: source.rel,
        original,
        language: scan.language,
        issues: scan.issues,
        counts: countIssues(scan.issues),
        rules: writingRules(scan.language),
        instructions: [
            `Rewrite ${source.rel} from the original at ${original}, in the same language (${scan.language}); do not translate.`,
            "Fix every listed issue, strongest first, then read the whole text once more for anything that still sounds generated.",
            "Follow every rule in rules. Change the prose only; keep the document structure unless it gets in the reader's way.",
            "Never invent: if a sentence needs a detail the original does not have, keep it vague, drop the claim, or ask the user.",
            `Then run stillmark text check ${source.rel} --json until ok is true. It also flags facts lost or added compared with the original; stillmark text restore ${source.rel} brings the original back.`
        ]
    };
}

/**
 * `stillmark text restore <file>`: puts the original back after a rewrite.
 */
export function restoreText(paths: ProjectPaths, target: string | undefined): OperationResult {
    const source = resolveSource(paths, target, false);

    if ("error" in source) {
        return failure(source.error);
    }

    if (source.kind === "text" || !fs.existsSync(source.backup)) {
        return failure(`No kept original for ${target}; nothing to restore`);
    }

    fs.copyFileSync(source.backup, source.abs);
    fs.rmSync(source.backup);

    return {
        ok: true,
        changed: true,
        action: "text-restore",
        summary: `Restored ${source.rel} from its original`,
        location: source.abs
    };
}

/**
 * `stillmark text rules [--language=<tag>]`: writing rules for a language, by default the configured docs language.
 */
export function textRules(paths: ProjectPaths, options: TextOptions = {}): OperationResult & { language: TextLanguage; rules: string[] } {
    const { force, fallback } = scanOptions(paths, options);
    const language = force ?? fallback ?? TextLanguage.EN;

    return {
        ok: true,
        changed: false,
        action: "text-rules",
        summary: `Writing rules for ${language}: follow them in everything you write for this project`,
        language,
        rules: writingRules(language)
    };
}
