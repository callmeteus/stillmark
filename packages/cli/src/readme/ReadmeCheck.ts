import fs from "node:fs";
import path from "node:path";

import type { ProjectFacts } from "./ProjectFacts";
import { findReadmeSection, matchReadmeSection, type ReadmeTemplate } from "./ReadmeTemplates";

export type ReadmeIssueKind =
    | "missing-title"
    | "missing-section"
    | "empty-section"
    | "heading-skip"
    | "placeholder"
    | "unknown-command"
    | "broken-link"
    | "lost-fact";

/**
 * One problem found in a README.
 */
export interface ReadmeIssue {
    kind: ReadmeIssueKind;
    detail: string;
    line?: number;
}

/**
 * A heading of the README and the catalog section it maps to.
 */
export interface ReadmeHeading {
    level: number;
    text: string;
    line: number;
    section?: string;
}

interface ParsedReadme {
    headings: ReadmeHeading[];
    /**
     * Lines outside fenced code blocks, inline code removed, with 1-based line numbers.
     */
    prose: { text: string; line: number }[];
    /**
     * Lines inside fenced code blocks, with 1-based line numbers.
     */
    code: { text: string; line: number }[];
    lines: string[];
}

const FENCE_RE = /^\s*(`{3,}|~{3,})/;

const PLACEHOLDER_PATTERNS: [RegExp, string][] = [
    [/\b(TODO|TBD|FIXME|XXX)\b/, "unfinished marker"],
    [/lorem ipsum/i, "filler text"],
    [/\{\{[^}]*\}\}/, "template variable"],
    [/\[(your|seu|sua|tu|insert|inserir)\b[^\]]*\]/i, "fill-in placeholder"],
    [/<(your|seu|sua)[-_ ][^>]*>/i, "fill-in placeholder"]
];

/**
 * Package manager subcommands that are not package scripts.
 */
const MANAGER_BUILTINS = new Set([
    "install", "i", "ci", "add", "remove", "rm", "uninstall", "dlx", "exec", "x", "create", "init", "why", "link", "unlink",
    "global", "up", "upgrade", "update", "dedupe", "info", "view", "publish", "pack", "config", "set", "cache", "outdated",
    "audit", "login", "logout", "version", "help", "list", "ls", "run", "workspace", "workspaces", "import", "patch", "env"
]);

/**
 * Splits a README into headings, prose lines, and code lines.
 */
export function parseReadme(content: string): ParsedReadme {
    const lines = content.split(/\r?\n/);
    const parsed: ParsedReadme = { headings: [], prose: [], code: [], lines };
    let fence: string | undefined;

    lines.forEach((raw, index) => {
        const line = index + 1;
        const fenceMatch = FENCE_RE.exec(raw);

        if (fence !== undefined) {
            if (fenceMatch && fenceMatch[1].startsWith(fence[0]) && fenceMatch[1].length >= fence.length && raw.trim() === fenceMatch[1]) {
                fence = undefined;
            } else {
                parsed.code.push({ text: raw, line });
            }

            return;
        }

        if (fenceMatch) {
            fence = fenceMatch[1];

            return;
        }

        const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(raw);

        if (heading) {
            parsed.headings.push({ level: heading[1].length, text: heading[2], line, section: matchReadmeSection(heading[2]) });
        }

        parsed.prose.push({ text: raw.replace(/`[^`]*`/g, ""), line });
    });

    return parsed;
}

/**
 * Facts an existing README states that a rewrite must keep: URLs, local ports, and environment variable names.
 */
export function extractReadmeFacts(content: string): string[] {
    const facts = new Set<string>();

    for (const match of content.matchAll(/https?:\/\/[^\s)<>"'`\]]+/g)) {
        const url = match[0].replace(/[.,;:]+$/, "");

        if (!/shields\.io|badge|badgen\.net/i.test(url)) {
            facts.add(url);
        }
    }

    for (const match of content.matchAll(/\b(?:localhost|127\.0\.0\.1):\d{2,5}\b/g)) {
        facts.add(match[0]);
    }

    for (const match of content.matchAll(/`([A-Z][A-Z0-9]*_[A-Z0-9_]+)`/g)) {
        facts.add(match[1]);
    }

    return [...facts];
}

function knownScripts(facts: ProjectFacts): Set<string> {
    return new Set([...Object.keys(facts.scripts), ...facts.workspaces.flatMap((workspace) => workspace.scripts)]);
}

/**
 * Script a shell command runs, when the command runs a package script or make target.
 */
function scriptOf(command: string): { kind: "script" | "make"; name: string } | undefined {
    const words = command.trim().replace(/^\$\s*/, "").split(/\s+/);
    const [tool, first, second] = words;

    if (tool === "make" && first && !first.startsWith("-")) {
        return { kind: "make", name: first };
    }

    if (!["npm", "pnpm", "yarn", "bun"].includes(tool) || !first || first.startsWith("-")) {
        return undefined;
    }

    if (first === "run" || first === "run-script") {
        return second && !second.startsWith("-") ? { kind: "script", name: second } : undefined;
    }

    if (tool === "npm") {
        return ["test", "start", "stop", "restart"].includes(first) ? { kind: "script", name: first } : undefined;
    }

    if (tool === "bun" || MANAGER_BUILTINS.has(first)) {
        return undefined;
    }

    return { kind: "script", name: first };
}

function checkCommands(parsed: ParsedReadme, facts: ProjectFacts): ReadmeIssue[] {
    const scripts = knownScripts(facts);
    const hasManifest = facts.packageManager !== undefined;
    const issues: ReadmeIssue[] = [];

    for (const { text, line } of parsed.code) {
        for (const command of text.split(/&&|;|\|\|/)) {
            const target = scriptOf(command);

            if (target?.kind === "script" && hasManifest && !scripts.has(target.name)) {
                issues.push({ kind: "unknown-command", detail: `${command.trim()}: there is no "${target.name}" script in package.json`, line });
            } else
            if (target?.kind === "make" && !facts.makeTargets.includes(target.name)) {
                issues.push({ kind: "unknown-command", detail: `${command.trim()}: there is no "${target.name}" target in the Makefile`, line });
            }
        }
    }

    return issues;
}

function checkLinks(parsed: ParsedReadme, readmeFile: string): ReadmeIssue[] {
    const issues: ReadmeIssue[] = [];
    const dir = path.dirname(readmeFile);

    for (const { text, line } of parsed.prose) {
        const targets = [
            ...[...text.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map((match) => match[1]),
            ...[...text.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/g)].map((match) => match[1]),
            ...[...text.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1])
        ];

        for (const target of targets) {
            if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) {
                continue;
            }

            const relative = decodeURIComponent(target.split(/[#?]/)[0]);

            if (relative && !fs.existsSync(path.resolve(dir, relative))) {
                issues.push({ kind: "broken-link", detail: `${target} does not exist`, line });
            }
        }
    }

    return issues;
}

function checkStructure(parsed: ParsedReadme, template: ReadmeTemplate | undefined): ReadmeIssue[] {
    const issues: ReadmeIssue[] = [];
    const first = parsed.headings[0];

    if (!first || first.level !== 1) {
        issues.push({ kind: "missing-title", detail: "The README should start with a single # title (the project name)", line: first?.line });
    }

    parsed.headings.forEach((heading, index) => {
        const previous = parsed.headings[index - 1];

        if (previous && heading.level > previous.level + 1) {
            issues.push({ kind: "heading-skip", detail: `"${heading.text}" jumps from level ${previous.level} to ${heading.level}`, line: heading.line });
        }

        const next = parsed.headings[index + 1];
        const end = next ? next.line - 1 : parsed.lines.length;
        const body = parsed.lines.slice(heading.line, end).join("\n").trim();

        if (body === "" && (!next || next.level <= heading.level)) {
            issues.push({ kind: "empty-section", detail: `"${heading.text}" has no content`, line: heading.line });
        }
    });

    const present = new Set(parsed.headings.map((heading) => heading.section).filter(Boolean));

    for (const slot of template?.sections.filter((section) => section.required) ?? []) {
        if (!present.has(slot.id)) {
            issues.push({ kind: "missing-section", detail: `Missing "${findReadmeSection(slot.id)?.heading ?? slot.id}" section (required by the ${template?.id} template)` });
        }
    }

    return issues;
}

function checkPlaceholders(parsed: ParsedReadme): ReadmeIssue[] {
    const issues: ReadmeIssue[] = [];

    for (const { text, line } of parsed.prose) {
        const found = PLACEHOLDER_PATTERNS.find(([pattern]) => pattern.test(text));

        if (found) {
            issues.push({ kind: "placeholder", detail: `${found[1]}: ${text.trim().slice(0, 80)}`, line });
        }
    }

    return issues;
}

/**
 * Checks a README: template sections, heading order, leftovers, commands that do not exist,
 * broken relative links, and facts from the previous version that disappeared.
 */
export function checkReadme(input: {
    content: string;
    file: string;
    facts: ProjectFacts;
    template?: ReadmeTemplate;
    original?: string;
}): { issues: ReadmeIssue[]; headings: ReadmeHeading[] } {
    const parsed = parseReadme(input.content);
    const lost = input.original === undefined
        ? []
        : extractReadmeFacts(input.original)
            .filter((fact) => !input.content.includes(fact))
            .map((fact): ReadmeIssue => ({ kind: "lost-fact", detail: `${fact} was in the previous README and is gone` }));

    return {
        issues: [
            ...checkStructure(parsed, input.template),
            ...checkPlaceholders(parsed),
            ...checkCommands(parsed, input.facts),
            ...checkLinks(parsed, input.file),
            ...lost
        ],
        headings: parsed.headings
    };
}
