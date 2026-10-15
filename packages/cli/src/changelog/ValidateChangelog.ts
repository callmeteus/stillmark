import fs from "node:fs";

import { isIsoDate } from "../documents";
import { scanForSensitiveContent } from "../guards";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { ChangeGroupHeadings, parseChangelog, sectionEntries, UNRELEASED } from "./ChangelogDocument";

/**
 * One problem found by `changelog check`. Errors fail the check; warnings are entries to reword.
 */
export interface ChangelogIssue {
    
    level: "error" | "warning";
    /** Release the problem is in, when it is inside one. */
    version?: string;
    message: string;
}

export interface ChangelogCheckResult extends OperationResult {
    
    issues: ChangelogIssue[];
}

const GROUP_HEADINGS = new Set(Object.values(ChangeGroupHeadings));
const TECHNICAL_RE = /(?:^|[\s(`])(?:[\w.-]+\/)+[\w.-]+\.\w{1,4}\b|\b\w+\.(?:ts|tsx|js|mjs|vue|astro|json|py|go|rs|sql)\b|\b[A-Z][A-Z0-9]+_[A-Z0-9_]+\b|\bHTTP \d{3}\b/;

/**
 * Checks CHANGELOG.md structure (title, one Unreleased on top, `## [version] - YYYY-MM-DD` releases
 * newest first with unique versions, Keep a Changelog group headings) and its entries: nothing that
 * looks like a secret or personal data, and no file names, env vars, or status codes users would not understand.
 */
export function checkChangelog(paths: ProjectPaths): ChangelogCheckResult {
    if (!fs.existsSync(paths.changelog)) {
        return {
            ok: false,
            changed: false,
            action: "changelog check",
            summary: "No CHANGELOG.md yet. Create it from the project history with stillmark changelog sync",
            issues: []
        };
    }

    const doc = parseChangelog(fs.readFileSync(paths.changelog, "utf8"));
    const issues: ChangelogIssue[] = [];
    const seen = new Set<string>();
    let previousDate: string | undefined;

    if (!doc.preamble.some((line) => /^# \S/.test(line))) {
        issues.push({ level: "error", message: "Missing the \"# Changelog\" title" });
    }

    doc.sections.forEach((section, index) => {
        const version = section.version;

        if (seen.has(version)) {
            issues.push({ level: "error", version, message: `Release ${version} is listed twice` });
        }

        seen.add(version);

        if (version === UNRELEASED) {
            if (index > 0) {
                issues.push({ level: "error", version, message: "Unreleased must be the first section" });
            }
        } else
        if (!section.date || !isIsoDate(section.date)) {
            issues.push({ level: "error", version, message: `Release ${version} needs a date as "## [${version}] - YYYY-MM-DD"` });
        } else {
            if (previousDate && section.date > previousDate) {
                issues.push({ level: "error", version, message: `Release ${version} is newer than the one above it; keep releases newest first` });
            }

            previousDate = section.date;
        }

        for (const line of section.lines) {
            const heading = /^### (.+?)\s*$/.exec(line)?.[1];

            if (heading && !GROUP_HEADINGS.has(heading)) {
                issues.push({ level: "error", version, message: `Unknown group "${heading}"; use ${[...GROUP_HEADINGS].join(", ")}` });
            }
        }

        for (const entry of sectionEntries(section)) {
            if (!entry.heading) {
                issues.push({ level: "error", version, message: `Entry outside a group: ${entry.text}` });
            }

            if (scanForSensitiveContent(entry.text).length > 0) {
                issues.push({ level: "error", version, message: `Looks like a secret or personal data: ${entry.text}` });
            } else
            if (TECHNICAL_RE.test(entry.text)) {
                issues.push({ level: "warning", version, message: `Reads like an internal detail; describe what users notice instead: ${entry.text}` });
            }
        }
    });

    const errors = issues.filter((issue) => issue.level === "error").length;
    const warnings = issues.length - errors;

    return {
        ok: errors === 0,
        changed: false,
        action: "changelog check",
        location: paths.changelog,
        summary: issues.length === 0
            ? `CHANGELOG.md is valid (${doc.sections.length} section${doc.sections.length === 1 ? "" : "s"})`
            : `CHANGELOG.md has ${errors} error${errors === 1 ? "" : "s"} and ${warnings} warning${warnings === 1 ? "" : "s"}`,
        issues
    };
}
