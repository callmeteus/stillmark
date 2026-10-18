import type { DetailLevel } from "../config/DetailLevel";
import { normalizeNewlines } from "../markdown";

/**
 * Allowed case tags on checkbox lines.
 */
const ALLOWED_TAGS = new Set(["happy", "sad", "edge", "security"]);

/**
 * Legacy Portuguese tags mapped to English.
 */
const LEGACY_TAGS: Record<string, string> = {
    feliz: "happy",
    triste: "sad",
    borda: "edge",
    "segurança": "security"
};

/**
 * Required lines inside the "How to read this document" block.
 */
export const HOW_TO_READ_LINES = [
    "- `[happy]` valid input, expected flow.",
    "- `[sad]` invalid input, failing dependency, domain error.",
    "- `[edge]` limits, empty, null, concurrency, cache, timing.",
    "- `[security]` auth, spoofing, injection, replay, leaks.",
    "`[x]` means the test exists. `[ ]` means it is still missing."
];

const PORTUGUESE_WORDS = [
    "não",
    "então",
    "também",
    "já",
    "após",
    "sem",
    "com",
    "ou",
    "quando",
    "mesmo",
    "idem",
    "rota",
    "falha",
    "vazio",
    "ausente",
    "inválido",
    "retorna",
    "devolve",
    "deve",
    "caso",
    "casos",
    "cobertura",
    "teste",
    "testes",
    "hoje",
    "coberto"
];

const PORTUGUESE_WORD_PATTERN = new RegExp(
    `(?<![\\p{L}\\p{N}_.])(${PORTUGUESE_WORDS.join("|")})(?![\\p{L}\\p{N}_])`,
    "iu"
);

const CHECKBOX_PATTERN = /^- \[( |x)\] (.+)$/;

const AREA_PATTERN = /^## (\d+)\. (.+)$/;

const LABEL_PATTERN = /^\*\*[^*]+\*\*$/;

const NOTFIXED_SUFFIX = " - NOTFIXED: ";

/**
 * Indented detail line under a case (extended detail only).
 */
export const COVERAGE_DETAIL_PATTERN = /^ {2}\S/;

/**
 * Options for coverage validation.
 */
export interface CoverageValidationOptions {
    
    /**
     * `extended` allows indented detail lines right under a case; `compact` (default) rejects them.
     */
    detail?: DetailLevel;
}

/**
 * Per-area checkbox counts from validation.
 */
export interface CoverageAreaStats {
    
    number: number;
    title: string;
    checked: number;
    open: number;
}

/**
 * Result of validating COVERAGE.md content.
 */
export interface CoverageValidationResult {
    
    valid: boolean;
    errors: string[];
    warnings: string[];
    areas: CoverageAreaStats[];
    totalChecked: number;
    totalOpen: number;
}

function stripCode(line: string): string {
    return line.replace(/`[^`]*`/g, "");
}

function headingLevel(line: string): number {
    const match = line.match(/^(#{1,6}) /);

    if (!match) {
        return 0;
    }

    return match[1].length;
}

/**
 * Validates COVERAGE.md lines against the checkbox-only format.
 */
export function validateCoverage(
    lines: string[],
    options: CoverageValidationOptions = {}
): CoverageValidationResult {
    const extended = options.detail === "extended";
    const errors: string[] = [];
    const warnings: string[] = [];
    const areas: CoverageAreaStats[] = [];

    const fail = (index: number, message: string): void => {
        errors.push(`L${index + 1}: ${message}`);
    };

    const warn = (index: number, message: string): void => {
        warnings.push(`L${index + 1}: ${message}`);
    };

    if (!/^# .+ test coverage$/.test(lines[0] ?? "")) {
        fail(0, "first line must be `# <Project> test coverage`");
    }

    const howToReadIndex = lines.indexOf("## How to read this document");

    if (howToReadIndex === -1) {
        fail(0, "missing `## How to read this document` block");
    }

    let bodyStart = 1;

    if (howToReadIndex !== -1) {
        bodyStart = lines.findIndex((line, index) => {
            return index > howToReadIndex && line.startsWith("## ");
        });

        if (bodyStart === -1) {
            bodyStart = lines.length;
        }

        const block = lines.slice(howToReadIndex, bodyStart);

        for (const expected of HOW_TO_READ_LINES) {
            if (!block.includes(expected)) {
                fail(
                    howToReadIndex,
                    `"How to read" block is missing the line: ${expected}`
                );
            }
        }
    }

    let expectedArea = 1;
    let currentArea: CoverageAreaStats | null = null;
    let notfixedArea: CoverageAreaStats | null = null;
    const nodes: { index: number; level: number }[] = [];
    let underCase = false;

    for (let index = bodyStart; index < lines.length; index++) {
        const line = lines[index];

        if (line.trim() === "") {
            underCase = false;
            continue;
        }

        if (COVERAGE_DETAIL_PATTERN.test(line)) {
            if (!underCase) {
                fail(index, "indented detail lines must sit right under a `- [ ]` / `- [x]` case");
            } else
            if (!extended) {
                fail(
                    index,
                    "detail lines under a case need `detail: extended` for coverage (stillmark config set --detail=extended --module=coverage)"
                );
            }

            continue;
        }

        underCase = false;

        const level = headingLevel(line);

        if (level === 2) {
            const match = line.match(AREA_PATTERN);

            if (!match) {
                fail(index, "area headings must be `## <N>. <Area>`");
                continue;
            }

            if (Number(match[1]) !== expectedArea) {
                fail(index, `area number should be ${expectedArea}`);
            }

            if (notfixedArea) {
                fail(index, "NOTFIXED must be the last area");
            }

            expectedArea = Number(match[1]) + 1;

            currentArea = {
                number: Number(match[1]),
                title: match[2],
                checked: 0,
                open: 0
            };

            areas.push(currentArea);

            if (match[2] === "NOTFIXED") {
                notfixedArea = currentArea;
            }

            nodes.push({
                index,
                level: 2
            });

            continue;
        }

        if (level === 3 || level === 4) {
            nodes.push({
                index,
                level
            });

            continue;
        }

        if (level !== 0) {
            fail(
                index,
                "only `##`, `###` and `####` headings are allowed in the body"
            );
            continue;
        }

        if (LABEL_PATTERN.test(line)) {
            nodes.push({
                index,
                level: 5
            });

            continue;
        }

        const checkbox = line.match(CHECKBOX_PATTERN);

        if (!checkbox) {
            fail(
                index,
                "only headings, `- [x]` / `- [ ]` lines and `**Label**` lines are allowed (no prose, tables or numbered lists)"
            );
            continue;
        }

        underCase = true;

        if (!currentArea) {
            fail(index, "checkbox outside any `## <N>. <Area>`");
            continue;
        }

        const isChecked = checkbox[1] === "x";
        const text = checkbox[2];

        if (isChecked) {
            currentArea.checked++;
        } else {
            currentArea.open++;
        }

        const tag = text.match(/^\[([^\]]+)\]/);

        if (tag && !ALLOWED_TAGS.has(tag[1])) {
            const legacy = LEGACY_TAGS[tag[1]];

            if (legacy) {
                fail(index, `legacy tag [${tag[1]}], use [${legacy}]`);
            } else
            if (
                !tag[1].split("/").every((part) => {
                    return ALLOWED_TAGS.has(part);
                })
            ) {
                fail(index, `unknown tag [${tag[1]}]`);
            }
        }

        const isNotfixed = text.includes(NOTFIXED_SUFFIX);

        if (isNotfixed && currentArea !== notfixedArea) {
            fail(index, "NOTFIXED items belong in the `## <N>. NOTFIXED` area");
        }

        if (isNotfixed && !isChecked) {
            fail(index, "NOTFIXED items stay `[x]`");
        }

        if (!isNotfixed && currentArea === notfixedArea) {
            fail(
                index,
                "the NOTFIXED area only holds items with ` - NOTFIXED: <reason>`"
            );
        }
    }

    for (let position = 0; position < nodes.length; position++) {
        const node = nodes[position];
        let hasCase = false;

        for (let index = node.index + 1; index < lines.length; index++) {
            const line = lines[index];
            const level = headingLevel(line);

            if (CHECKBOX_PATTERN.test(line)) {
                hasCase = true;
                break;
            }

            if (level !== 0 && level <= Math.min(node.level, 4)) {
                break;
            }

            if (node.level === 5 && LABEL_PATTERN.test(line)) {
                break;
            }
        }

        if (!hasCase) {
            fail(node.index, "heading or label with no checkbox under it");
        }
    }

    if (notfixedArea && howToReadIndex !== -1) {
        const link = `[${notfixedArea.number}. NOTFIXED](#${notfixedArea.number}-notfixed)`;
        const block = lines.slice(howToReadIndex, bodyStart).join("\n");

        if (!block.includes(link)) {
            fail(
                howToReadIndex,
                `"How to read" block must link the NOTFIXED area as ${link}`
            );
        }
    }

    lines.forEach((line, index) => {
        if (line.includes("\u2014")) {
            fail(index, "em dash found, use `-`");
        }

        const prose = stripCode(line);

        if (/\b\d{2}\/\d{2}\/\d{4}\b/.test(prose)) {
            fail(index, "date must be ISO (YYYY-MM-DD)");
        }

        if (/\d,\d+%/.test(prose)) {
            warn(index, "decimal comma in a percentage, use a dot");
        }

        const portuguese = prose.match(PORTUGUESE_WORD_PATTERN);

        if (portuguese) {
            warn(
                index,
                `possible Portuguese outside backticks: "${portuguese[1]}"`
            );
        }
    });

    const totalChecked = areas.reduce((sum, area) => {
        return sum + area.checked;
    }, 0);

    const totalOpen = areas.reduce((sum, area) => {
        return sum + area.open;
    }, 0);

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        areas,
        totalChecked,
        totalOpen
    };
}

/**
 * Validates a COVERAGE.md file on disk.
 */
export function validateCoverageFile(
    raw: string,
    options: CoverageValidationOptions = {}
): CoverageValidationResult {
    const lines = normalizeNewlines(raw).replace(/\n$/, "").split("\n");

    return validateCoverage(lines, options);
}

/**
 * Builds a human-readable validation summary.
 */
export function formatCoverageSummary(result: CoverageValidationResult): string {
    const lines: string[] = [];

    for (const area of result.areas) {
        lines.push(
            `${area.number}. ${area.title}: ${area.checked} [x], ${area.open} [ ]`
        );
    }

    lines.push(`total: ${result.totalChecked} [x], ${result.totalOpen} [ ]`);

    for (const warning of result.warnings) {
        lines.push(`warning ${warning}`);
    }

    for (const error of result.errors) {
        lines.push(`error ${error}`);
    }

    return lines.join("\n");
}
