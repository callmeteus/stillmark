import { TextLanguage } from "./TextLanguage";

/**
 * How strongly a pattern marks text as machine-written. HIGH and MEDIUM block `text check`; LOW is a warning.
 */
export enum TextSeverity {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}

/**
 * One detectable writing pattern: what it matches, why it hurts the reader, and how to fix it.
 */
export interface TextPattern {
    /**
     * Stable kebab-case id, shared by the English and Portuguese versions of the same pattern.
     */
    id: string;
    severity: TextSeverity;
    /**
     * Global, case-insensitive, unicode regex run on prose (code, URLs, and tables removed).
     */
    regex: RegExp;
    message: string;
    fix: string;
}

/**
 * Apostrophe, straight or typographic.
 */
export const APOS = "['\\u2019]";

/**
 * Builds a regex matching any of the fragments as whole words, accents included.
 */
export function phrases(fragments: string[]): RegExp {
    return new RegExp(`(?<![\\p{L}\\p{N}])(?:${fragments.join("|")})(?![\\p{L}\\p{N}])`, "giu");
}

/**
 * Patterns that mean the same in every language.
 */
export const SharedPatterns: TextPattern[] = [
    {
        id: "em-dash",
        severity: TextSeverity.MEDIUM,
        regex: /\u2014/g,
        message: "Em dash, one of the most common marks of generated text",
        fix: "Use a comma, a colon, parentheses, a hyphen, or split the sentence"
    },
    {
        id: "emoji",
        severity: TextSeverity.MEDIUM,
        regex: /(?![\u00A9\u00AE\u2122])\p{Extended_Pictographic}/gu,
        message: "Decorative emoji",
        fix: "Remove it; say it in words if it carried meaning"
    },
    {
        id: "curly-quotes",
        severity: TextSeverity.LOW,
        regex: /[\u201C\u201D]/g,
        message: "Typographic double quotes in a plain-text file",
        fix: "Use straight quotes unless the project uses typographic ones on purpose"
    }
];

/**
 * Patterns checked line by line instead of by regex, with their copy per language.
 */
export const StructuralPatterns = {
    longSentence: {
        id: "long-sentence",
        severity: TextSeverity.LOW,
        maxWords: 40,
        message: "Sentence over 40 words",
        fix: "Split it: one idea per sentence"
    },
    titleCaseHeading: {
        id: "title-case-heading",
        severity: TextSeverity.LOW,
        message: {
            [TextLanguage.EN]: "Every word of the heading is capitalized",
            [TextLanguage.PT]: "Every word of the heading is capitalized; Portuguese capitalizes only the first word and proper names",
            [TextLanguage.OTHER]: "Every word of the heading is capitalized"
        },
        fix: "Use sentence case: capitalize the first word and proper names only"
    }
};

/**
 * Short words that stay lowercase in title case, so they do not count when spotting it.
 */
export const HeadingSmallWords = new Set([
    "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "with", "by", "at", "from", "vs",
    "de", "da", "do", "das", "dos", "e", "o", "os", "as", "em", "no", "na", "nos", "nas", "para",
    "com", "por", "um", "uma", "ao", "aos"
]);
