import {
    FENCE_RE,
    FRONTMATTER_RE,
    INLINE_CODE_RE,
    LINK_TARGET_RE,
    normalizeNewlines,
    PATH_RE,
    uniqueMatches,
    URL_RE
} from "../markdown";
import { detectLanguage, TextLanguage } from "./TextLanguage";
import { HeadingSmallWords, SharedPatterns, StructuralPatterns, TextSeverity, type TextPattern } from "./TextPatterns";
import { EnglishPatterns } from "./TextPatternsEn";
import { PortuguesePatterns } from "./TextPatternsPt";

/**
 * One problem found in a text: a writing pattern, or a fact the rewrite lost or added.
 */
export interface TextIssue {
    id: string;
    severity: TextSeverity;
    /**
     * 1-based line in the checked text; absent for facts missing from the rewrite.
     */
    line?: number;
    excerpt: string;
    message: string;
    fix: string;
    language?: TextLanguage;
}

/**
 * Result of scanning prose: the detected document language and the issues, sorted by line.
 */
export interface TextScan {
    language: TextLanguage;
    issues: TextIssue[];
}

interface Paragraph {
    start: number;
    text: string;
}

const MARKDOWN_LINK_TARGET_RE = /\]\([^)\n]*\)/g;
const TABLE_ROW_RE = /^[ \t]*\|.*$/gm;
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;
const SOFT_BREAK_RE = /\n(?![ \t]*(?:[-*+]|\d+[.)]|#{1,6})[ \t])/g;
const SENTENCE_RE = /[^.!?\n]+[.!?]*/g;
const WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}'\u2019-]*/gu;
const ORDERED_MARKER_RE = /^[ \t]*\d+[.)][ \t]/gm;
const NUMBER_RE = /(?<![\p{L}\p{N}.,])\d+(?:[.,:]\d+)*%?/gu;

function blank(match: string): string {
    return match.replace(/[^\n]/g, " ");
}

/**
 * Prose only, same length and line breaks as the input: frontmatter, code, URLs, link targets, tables, and comments become spaces.
 */
export function maskProse(raw: string): string {
    return normalizeNewlines(raw)
        .replace(FRONTMATTER_RE, blank)
        .replace(FENCE_RE, blank)
        .replace(HTML_COMMENT_RE, blank)
        .replace(INLINE_CODE_RE, blank)
        .replace(URL_RE, blank)
        .replace(MARKDOWN_LINK_TARGET_RE, (match) => `]${blank(match.slice(1))}`)
        .replace(TABLE_ROW_RE, blank);
}

function paragraphs(masked: string): Paragraph[] {
    const result: Paragraph[] = [];
    let current: Paragraph | undefined;

    masked.split("\n").forEach((line, index) => {
        if (line.trim() === "") {
            current = undefined;
        } else
        if (current) {
            current.text += `\n${line}`;
        } else {
            current = { start: index + 1, text: line };
            result.push(current);
        }
    });

    return result;
}

function patternsFor(language: TextLanguage): TextPattern[] {
    if (language === TextLanguage.EN) {
        return [...SharedPatterns, ...EnglishPatterns];
    } else
    if (language === TextLanguage.PT) {
        return [...SharedPatterns, ...PortuguesePatterns];
    }

    return SharedPatterns;
}

function lineAt(paragraph: Paragraph, index: number): number {
    return paragraph.start + paragraph.text.slice(0, index).split("\n").length - 1;
}

function excerpt(text: string): string {
    const flat = text.replace(/\s+/g, " ").trim();

    return flat.length > 80 ? `${flat.slice(0, 77)}...` : flat;
}

function patternIssues(paragraph: Paragraph, language: TextLanguage): TextIssue[] {
    return patternsFor(language).flatMap((pattern) =>
        [...paragraph.text.matchAll(pattern.regex)].map((match) => ({
            id: pattern.id,
            severity: pattern.severity,
            line: lineAt(paragraph, match.index ?? 0),
            excerpt: excerpt(match[0]),
            message: pattern.message,
            fix: pattern.fix,
            language
        }))
    );
}

function longSentenceIssues(paragraph: Paragraph, language: TextLanguage): TextIssue[] {
    const rule = StructuralPatterns.longSentence;
    const joined = paragraph.text.replace(SOFT_BREAK_RE, " ");

    return [...joined.matchAll(SENTENCE_RE)]
        .filter((match) => (match[0].match(WORD_RE) ?? []).length > rule.maxWords)
        .map((match) => ({
            id: rule.id,
            severity: rule.severity,
            line: lineAt(paragraph, match.index ?? 0),
            excerpt: excerpt(match[0]),
            message: rule.message,
            fix: rule.fix,
            language
        }));
}

function titleCaseIssues(masked: string, language: TextLanguage): TextIssue[] {
    const rule = StructuralPatterns.titleCaseHeading;

    return masked.split("\n").flatMap((line, index) => {
        const heading = /^#{1,6}[ \t]+(.+)$/.exec(line)?.[1];
        const words = heading?.match(/\p{L}[\p{L}'\u2019-]*/gu) ?? [];
        const significant = words.filter((word) => !HeadingSmallWords.has(word.toLowerCase()));
        const titleCase = significant.length >= 3 &&
            significant.every((word) => /^\p{Lu}/u.test(word)) &&
            !significant.every((word) => word === word.toUpperCase());

        return titleCase
            ? [{
                id: rule.id,
                severity: rule.severity,
                line: index + 1,
                excerpt: excerpt(heading ?? ""),
                message: rule.message[language],
                fix: rule.fix,
                language
            }]
            : [];
    });
}

/**
 * Language choice for a scan: `force` skips detection, `fallback` is used when the text is too short to tell.
 */
export interface ScanOptions {
    force?: TextLanguage;
    fallback?: TextLanguage;
}

/**
 * Finds writing patterns in a text. The document language comes from the whole text; each paragraph
 * is checked with its own language when it is long enough to tell, so mixed documents get the right rules.
 */
export function scanText(raw: string, options: ScanOptions = {}): TextScan {
    const masked = maskProse(raw);
    const language = options.force ?? detectLanguage(masked) ?? options.fallback ?? TextLanguage.OTHER;
    const issues = paragraphs(masked).flatMap((paragraph) => {
        const own = options.force ?? detectLanguage(paragraph.text) ?? language;

        return [...patternIssues(paragraph, own), ...longSentenceIssues(paragraph, own)];
    });

    issues.push(...titleCaseIssues(masked, language));
    issues.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));

    return { language, issues };
}

function factIssue(lost: boolean, value: string, line?: number): TextIssue {
    return lost
        ? {
            id: "fact-lost",
            severity: TextSeverity.HIGH,
            excerpt: excerpt(value),
            message: "In the original but missing from the rewrite",
            fix: "Put it back exactly as it was"
        }
        : {
            id: "possible-invention",
            severity: TextSeverity.HIGH,
            line,
            excerpt: excerpt(value),
            message: "In the rewrite but not in the original",
            fix: "Remove it unless it comes from the code or the user"
        };
}

function lineOf(text: string, value: string): number | undefined {
    const index = text.indexOf(value);

    return index < 0 ? undefined : text.slice(0, index).split("\n").length;
}

function proseNumbers(raw: string): string[] {
    const prose = maskProse(raw).replace(PATH_RE, blank).replace(ORDERED_MARKER_RE, blank);

    return uniqueMatches(prose, NUMBER_RE);
}

function verbatimTokens(raw: string): string[] {
    const prose = normalizeNewlines(raw).replace(FENCE_RE, "");
    const plain = prose.replace(INLINE_CODE_RE, " ").replace(URL_RE, " ");

    return [
        ...uniqueMatches(prose, INLINE_CODE_RE),
        ...uniqueMatches(prose, URL_RE),
        ...uniqueMatches(prose, LINK_TARGET_RE, 1),
        ...uniqueMatches(plain, PATH_RE)
    ];
}

/**
 * Compares a rewrite with its original: frontmatter, code blocks, inline code, URLs, link targets,
 * paths, and numbers must all survive, and nothing of that kind may appear that the original did not have.
 */
export function compareFacts(originalRaw: string, rewrittenRaw: string): TextIssue[] {
    const original = normalizeNewlines(originalRaw);
    const rewritten = normalizeNewlines(rewrittenRaw);
    const issues: TextIssue[] = [];

    if ((FRONTMATTER_RE.exec(original)?.[0] ?? "") !== (FRONTMATTER_RE.exec(rewritten)?.[0] ?? "")) {
        issues.push({ ...factIssue(true, "frontmatter"), message: "Frontmatter changed", fix: "Keep it exactly as in the original" });
    }

    const originalBlocks = [...original.matchAll(FENCE_RE)].map((match) => match[0]);
    const rewrittenBlocks = [...rewritten.matchAll(FENCE_RE)].map((match) => match[0]);

    issues.push(
        ...originalBlocks.filter((block) => !rewrittenBlocks.includes(block)).map((block) => factIssue(true, block)),
        ...rewrittenBlocks.filter((block) => !originalBlocks.includes(block)).map((block) => factIssue(false, block, lineOf(rewritten, block)))
    );

    const originalTokens = verbatimTokens(original);
    const rewrittenTokens = verbatimTokens(rewritten);

    issues.push(
        ...originalTokens.filter((token) => !rewritten.includes(token)).map((token) => factIssue(true, token)),
        ...rewrittenTokens
            .filter((token) => !original.includes(token.replace(/^`|`$/g, "")))
            .map((token) => factIssue(false, token, lineOf(rewritten, token)))
    );

    const originalNumbers = proseNumbers(original);
    const rewrittenNumbers = proseNumbers(rewritten);

    issues.push(
        ...originalNumbers.filter((value) => !rewrittenNumbers.includes(value)).map((value) => factIssue(true, value)),
        ...rewrittenNumbers
            .filter((value) => !originalNumbers.includes(value))
            .map((value) => factIssue(false, value, lineOf(maskProse(rewritten), value)))
    );

    return issues;
}
