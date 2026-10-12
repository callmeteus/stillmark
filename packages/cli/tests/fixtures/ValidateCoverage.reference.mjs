#!/usr/bin/env node
/**
 * Validates a sub-repo COVERAGE.md against the checkbox-only format of the
 * `/coverage` skill and prints the checked/open count per area.
 *
 * Usage: node ValidateCoverage.mjs <path/to/COVERAGE.md>
 * Exit code 1 when any error is found. Warnings never fail the run.
 */
import fs from "node:fs";

// #region Constants

/**
 * Case tags allowed as the first token of a checkbox line.
 */
const ALLOWED_TAGS = new Set(["happy", "sad", "edge", "security"]);

/**
 * Legacy Portuguese tags and their English replacement.
 */
const LEGACY_TAGS = {
    feliz: "happy",
    triste: "sad",
    borda: "edge",
    "seguran├ºa": "security"
};

/**
 * Lines that must exist inside the "How to read this document" block.
 */
const HOW_TO_READ_LINES = [
    "- `[happy]` valid input, expected flow.",
    "- `[sad]` invalid input, failing dependency, domain error.",
    "- `[edge]` limits, empty, null, concurrency, cache, timing.",
    "- `[security]` auth, spoofing, injection, replay, leaks.",
    "`[x]` means the test exists. `[ ]` means it is still missing."
];

/**
 * Common Portuguese words that betray an untranslated line.
 */
const PORTUGUESE_WORDS = [
    "n├úo", "ent├úo", "tamb├®m", "j├í", "ap├│s", "sem", "com", "ou", "quando", "mesmo", "idem",
    "rota", "falha", "vazio", "ausente", "inv├ílido", "retorna", "devolve", "deve", "caso",
    "casos", "cobertura", "teste", "testes", "hoje", "coberto"
];

const PORTUGUESE_WORD_PATTERN = new RegExp(`(?<![\\p{L}\\p{N}_.])(${PORTUGUESE_WORDS.join("|")})(?![\\p{L}\\p{N}_])`, "iu");

const CHECKBOX_PATTERN = /^- \[( |x)\] (.+)$/;

const AREA_PATTERN = /^## (\d+)\. (.+)$/;

const LABEL_PATTERN = /^\*\*[^*]+\*\*$/;

const NOTFIXED_SUFFIX = " - NOTFIXED: ";

// #endregion

// #region Helpers

/**
 * Removes inline code spans so checks only look at prose.
 *
 * @param line - Markdown line
 * @returns The line without any backtick span
 */
function stripCode(line) {
    return line.replace(/`[^`]*`/g, "");
}

/**
 * Reads the heading level of a line.
 *
 * @param line - Markdown line
 * @returns Number of leading `#`, or 0 when the line is not a heading
 */
function headingLevel(line) {
    const match = line.match(/^(#{1,6}) /);

    // Ignore lines that are not headings
    if (!match) {
        return 0;
    }

    return match[1].length;
}

// #endregion

// #region Validation

/**
 * Validates the file content and collects errors, warnings and per-area counts.
 *
 * @param lines - File lines
 * @returns Errors, warnings and the checked/open count of each area
 */
function validate(lines) {
    const errors = [];
    const warnings = [];
    const areas = [];

    /**
     * Records an error on a 1-based line number.
     *
     * @param index - 0-based line index
     * @param message - What is wrong
     * @returns Nothing.
     */
    const fail = (index, message) => {
        errors.push(`L${index + 1}: ${message}`);
    };

    /**
     * Records a warning on a 1-based line number.
     *
     * @param index - 0-based line index
     * @param message - What looks wrong
     * @returns Nothing.
     */
    const warn = (index, message) => {
        warnings.push(`L${index + 1}: ${message}`);
    };

    // Title
    if (!/^# .+ test coverage$/.test(lines[0] ?? "")) {
        fail(0, "first line must be `# <Project> test coverage`");
    }

    // How to read block
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
                fail(howToReadIndex, `"How to read" block is missing the line: ${expected}`);
            }
        }
    }

    // Body: areas, headings, labels and checkboxes only
    let expectedArea = 1;
    let currentArea = null;
    let notfixedArea = null;
    const nodes = [];

    for (let index = bodyStart; index < lines.length; index++) {
        const line = lines[index];

        // Blank lines are free
        if (line.trim() === "") {
            continue;
        }

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
            fail(index, "only `##`, `###` and `####` headings are allowed in the body");
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
            fail(index, "only headings, `- [x]` / `- [ ]` lines and `**Label**` lines are allowed (no prose, tables or numbered lists)");
            continue;
        }

        // Ignore the case if it sits above every area
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

        // Tag must be one of the allowed ones
        const tag = text.match(/^\[([^\]]+)\]/);

        if (tag && !ALLOWED_TAGS.has(tag[1])) {
            const legacy = LEGACY_TAGS[tag[1]];

            if (legacy) {
                fail(index, `legacy tag [${tag[1]}], use [${legacy}]`);
            } else
            // Composite tags like [happy/sad] are fine when every part is allowed
            if (!tag[1].split("/").every((part) => {
                return ALLOWED_TAGS.has(part);
            })) {
                fail(index, `unknown tag [${tag[1]}]`);
            }
        }

        // NOTFIXED items only in the last area, always closed
        const isNotfixed = text.includes(NOTFIXED_SUFFIX);

        if (isNotfixed && currentArea !== notfixedArea) {
            fail(index, "NOTFIXED items belong in the `## <N>. NOTFIXED` area");
        }

        if (isNotfixed && !isChecked) {
            fail(index, "NOTFIXED items stay `[x]`");
        }

        if (!isNotfixed && currentArea === notfixedArea) {
            fail(index, "the NOTFIXED area only holds items with ` - NOTFIXED: <reason>`");
        }
    }

    // Headings and labels with no case under them
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

            // Stop at the next sibling or parent
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

    // NOTFIXED link in the "How to read" block
    if (notfixedArea && howToReadIndex !== -1) {
        const link = `[${notfixedArea.number}. NOTFIXED](#${notfixedArea.number}-notfixed)`;
        const block = lines.slice(howToReadIndex, bodyStart).join("\n");

        if (!block.includes(link)) {
            fail(howToReadIndex, `"How to read" block must link the NOTFIXED area as ${link}`);
        }
    }

    // Whole-file checks
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
            warn(index, `possible Portuguese outside backticks: "${portuguese[1]}"`);
        }
    });

    return {
        errors,
        warnings,
        areas
    };
}

// #endregion

// #region Main

const filePath = process.argv[2];

if (!filePath) {
    process.stderr.write("usage: node ValidateCoverage.mjs <path/to/COVERAGE.md>\n");
    process.exit(2);
}

const lines = fs.readFileSync(filePath, "utf8").replace(/\n$/, "").split("\n");
const result = validate(lines);

for (const area of result.areas) {
    process.stdout.write(`${area.number}. ${area.title}: ${area.checked} [x], ${area.open} [ ]\n`);
}

const totalChecked = result.areas.reduce((sum, area) => {
    return sum + area.checked;
}, 0);

const totalOpen = result.areas.reduce((sum, area) => {
    return sum + area.open;
}, 0);

process.stdout.write(`total: ${totalChecked} [x], ${totalOpen} [ ]\n`);

for (const warning of result.warnings) {
    process.stdout.write(`warning ${warning}\n`);
}

for (const error of result.errors) {
    process.stdout.write(`error ${error}\n`);
}

process.exit(result.errors.length > 0 ? 1 : 0);

// #endregion
