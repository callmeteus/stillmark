import fs from "node:fs";
import path from "node:path";

import {
    compactDetailsMessage,
    loadConfig,
    resolveDetailLevel,
    type DetailLevel
} from "../config";
import type { GitRunner } from "../git";
import { normalizeNewlines } from "../markdown";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { buildDefaultCoverage, resolveCoverageProjectName } from "./CoverageTemplate";
import {
    COVERAGE_DETAIL_PATTERN,
    formatCoverageSummary,
    validateCoverageFile,
    type CoverageValidationResult
} from "./ValidateCoverage";

const CHECKBOX_PATTERN = /^- \[( |x)\] /;

/**
 * Effective detail level for COVERAGE.md from stillmark.config.json.
 */
function coverageDetail(paths: ProjectPaths): DetailLevel {
    return resolveDetailLevel(loadConfig(paths).detail, "coverage");
}

const TEST_PATH_PATTERN =
    /(^|\/)(tests?|__tests__|spec)(\/|$)|\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs|lua)$|_spec\.lua$/i;

/**
 * Reads COVERAGE.md if present, with LF line endings (git on Windows checks files out with CRLF).
 */
function readCoverage(paths: ProjectPaths): string | null {
    if (!fs.existsSync(paths.coverage)) {
        return null;
    }

    return normalizeNewlines(fs.readFileSync(paths.coverage, "utf8"));
}

/**
 * Writes COVERAGE.md keeping the line endings the file already uses, so inserted lines never mix LF into a CRLF file.
 */
function writeCoverage(paths: ProjectPaths, content: string): void {
    const crlf = fs.existsSync(paths.coverage) && fs.readFileSync(paths.coverage, "utf8").includes("\r\n");
    const normalized = content.endsWith("\n") ? content : `${content}\n`;

    fs.writeFileSync(paths.coverage, crlf ? normalized.replace(/\n/g, "\r\n") : normalized, "utf8");
}

function validationResult(
    paths: ProjectPaths,
    raw: string,
    changed: boolean,
    action: string
): OperationResult {
    const validation = validateCoverageFile(raw, { detail: coverageDetail(paths) });

    return {
        ok: validation.valid,
        changed,
        action,
        location: paths.coverage,
        summary: formatCoverageSummary(validation),
        coverage: validation
    };
}

/**
 * Creates COVERAGE.md when missing.
 */
export function initCoverage(paths: ProjectPaths): OperationResult {
    if (fs.existsSync(paths.coverage)) {
        const raw = readCoverage(paths)!;

        return validationResult(paths, raw, false, "coverage-init");
    }

    const name = resolveCoverageProjectName(paths.root, () => {
        const pkg = path.join(paths.root, "package.json");

        if (!fs.existsSync(pkg)) {
            return null;
        }

        return fs.readFileSync(pkg, "utf8");
    });
    const content = buildDefaultCoverage(name);
    writeCoverage(paths, content);

    const validation = validateCoverageFile(content, { detail: coverageDetail(paths) });

    return {
        ok: validation.valid,
        changed: true,
        action: "coverage-init",
        location: paths.coverage,
        summary: `Created ${paths.coverage}\n${formatCoverageSummary(validation)}`,
        coverage: validation
    };
}

/**
 * Validates COVERAGE.md without writing.
 */
export function validateCoverageDocument(paths: ProjectPaths): OperationResult {
    const raw = readCoverage(paths);

    if (!raw) {
        return {
            ok: false,
            changed: false,
            action: "coverage-validate",
            summary: `Missing ${paths.coverage}. Run stillmark coverage init first.`
        };
    }

    return validationResult(paths, raw, false, "coverage-validate");
}

/**
 * Returns validation stats as a short summary (alias of validate).
 */
export function coverageSummary(paths: ProjectPaths): OperationResult {
    return validateCoverageDocument(paths);
}

/**
 * Marks the first checkbox line matching query as checked.
 */
export function checkCoverageCase(
    paths: ProjectPaths,
    query: string
): OperationResult {
    return toggleCoverageCase(paths, query, true);
}

/**
 * Marks the first checkbox line matching query as unchecked.
 */
export function uncheckCoverageCase(
    paths: ProjectPaths,
    query: string
): OperationResult {
    return toggleCoverageCase(paths, query, false);
}

function toggleCoverageCase(
    paths: ProjectPaths,
    query: string,
    checked: boolean
): OperationResult {
    const raw = readCoverage(paths);

    if (!raw) {
        return {
            ok: false,
            changed: false,
            summary: `Missing ${paths.coverage}`
        };
    }

    const needle = query.trim().toLowerCase();

    if (!needle) {
        return {
            ok: false,
            changed: false,
            summary: "Provide a non-empty match string"
        };
    }

    const lines = raw.replace(/\n$/, "").split("\n");
    let matchIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!CHECKBOX_PATTERN.test(line)) {
            continue;
        }

        if (line.toLowerCase().includes(needle)) {
            matchIndex = i;
            break;
        }
    }

    if (matchIndex === -1) {
        return {
            ok: false,
            changed: false,
            summary: `No checkbox line matches "${query}"`
        };
    }

    const target = checked ? "[x]" : "[ ]";
    lines[matchIndex] = lines[matchIndex].replace(/^- \[( |x)\]/, `- ${target}`);
    const next = lines.join("\n");
    writeCoverage(paths, next);

    const validation = validateCoverageFile(next, { detail: coverageDetail(paths) });

    return {
        ok: validation.valid,
        changed: true,
        action: checked ? "coverage-check" : "coverage-uncheck",
        location: paths.coverage,
        summary: `${checked ? "Checked" : "Unchecked"} line ${matchIndex + 1}\n${formatCoverageSummary(validation)}`,
        coverage: validation
    };
}

export type CoverageCaseTag = "happy" | "sad" | "edge" | "security";

/**
 * Appends a checkbox under a ### heading that matches headingQuery.
 * With `details`, writes indented detail lines under the case (coverage detail must be extended).
 */
export function addCoverageCase(
    paths: ProjectPaths,
    headingQuery: string,
    caseText: string,
    options?: { tag?: CoverageCaseTag; checked?: boolean; details?: string[] }
): OperationResult {
    const raw = readCoverage(paths);

    if (!raw) {
        return {
            ok: false,
            changed: false,
            summary: `Missing ${paths.coverage}`
        };
    }

    const details = options?.details ?? [];

    if (details.length > 0 && coverageDetail(paths) === "compact") {
        return {
            ok: false,
            changed: false,
            action: "coverage-add",
            summary: compactDetailsMessage("coverage")
        };
    }

    const headingNeedle = headingQuery.trim().toLowerCase();
    const text = caseText.trim();

    if (!headingNeedle || !text) {
        return {
            ok: false,
            changed: false,
            summary: "Heading query and case text are required"
        };
    }

    const lines = raw.replace(/\n$/, "").split("\n");
    let sectionIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("### ") && line.toLowerCase().includes(headingNeedle)) {
            sectionIndex = i;
            break;
        }
    }

    if (sectionIndex === -1) {
        return {
            ok: false,
            changed: false,
            summary: `No ### heading matches "${headingQuery}"`
        };
    }

    const tag = options?.tag ? `[${options.tag}] ` : "";
    const box = options?.checked ? "[x]" : "[ ]";
    const newLine = `- ${box} ${tag}${text}`;

    let insertAt = sectionIndex + 1;

    while (insertAt < lines.length) {
        const line = lines[insertAt];

        if (line.startsWith("## ") || line.startsWith("### ")) {
            break;
        }

        if (CHECKBOX_PATTERN.test(line) || COVERAGE_DETAIL_PATTERN.test(line)) {
            insertAt++;
            continue;
        }

        if (line.trim() === "" || line.startsWith("#### ") || /^\*\*/.test(line)) {
            insertAt++;
            continue;
        }

        break;
    }

    lines.splice(insertAt, 0, newLine, ...details.map((detail) => `  ${detail}`));
    const next = lines.join("\n");
    writeCoverage(paths, next);

    const validation = validateCoverageFile(next, { detail: coverageDetail(paths) });

    return {
        ok: validation.valid,
        changed: true,
        action: "coverage-add",
        location: paths.coverage,
        summary: `Added case under ${lines[sectionIndex]}\n${formatCoverageSummary(validation)}`,
        coverage: validation
    };
}

import type { CoverageChangedFile } from "./CoverageUpdateHints";

/**
 * Git hints for `/stillmark coverage update` (changed paths since last COVERAGE.md commit).
 */
export async function coverageUpdateHints(
    paths: ProjectPaths,
    gitRunner: GitRunner
): Promise<OperationResult> {
    if (!fs.existsSync(paths.coverage)) {
        return {
            ok: false,
            changed: false,
            action: "coverage-update",
            summary: `Missing ${paths.coverage}. Create it before running update hints.`
        };
    }

    const log = await gitRunner.capture(paths.root, [
        "log",
        "-1",
        "--format=%H",
        "--",
        "COVERAGE.md"
    ]);
    const baseCommit = log.stdout.trim() || null;
    const changedFiles: CoverageChangedFile[] = [];

    if (baseCommit) {
        const diff = await gitRunner.capture(paths.root, [
            "diff",
            "--name-status",
            baseCommit,
            "HEAD"
        ]);

        for (const line of diff.stdout.split("\n")) {
            if (!line.trim()) {
                continue;
            }

            const parts = line.split("\t");
            const status = parts[0] ?? "";
            const filePath = parts[parts.length - 1] ?? "";
            changedFiles.push({
                status,
                path: filePath,
                relevant: isRelevantCoveragePath(filePath)
            });
        }
    }

    const status = await gitRunner.capture(paths.root, ["status", "--short"]);

    for (const line of status.stdout.split("\n")) {
        if (!line.trim()) {
            continue;
        }

        const trimmed = line.trim();
        const filePath = trimmed.slice(3).trim();
        const statusCode = trimmed.slice(0, 2).trim();

        if (changedFiles.some((entry) => entry.path === filePath)) {
            continue;
        }

        changedFiles.push({
            status: statusCode,
            path: filePath,
            relevant: isRelevantCoveragePath(filePath)
        });
    }

    const relevant = changedFiles.filter((entry) => entry.relevant);
    const summaryLines = [
        baseCommit
            ? `Base commit for COVERAGE.md: ${baseCommit}`
            : "No git history for COVERAGE.md yet; using working tree status",
        "",
        "Changed paths (relevant for coverage first):",
        ...relevant.map((entry) => `${entry.status}\t${entry.path}`),
        "",
        "All changed paths:",
        ...changedFiles.map((entry) => `${entry.status}\t${entry.path}`)
    ];

    return {
        ok: true,
        changed: false,
        action: "coverage-update",
        location: paths.coverage,
        summary: summaryLines.join("\n"),
        coverageUpdate: {
            baseCommit,
            changedFiles
        }
    };
}

function isRelevantCoveragePath(filePath: string): boolean {
    if (filePath === "COVERAGE.md") {
        return true;
    }

    return TEST_PATH_PATTERN.test(filePath);
}

export { type CoverageValidationResult };
