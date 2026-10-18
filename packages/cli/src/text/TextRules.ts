import { TextLanguage } from "./TextLanguage";

/**
 * Facts are not style material: what a rewrite may never add or drop.
 */
export const NoInventionRules: string[] = [
    "Never invent facts. Every name, number, date, version, quote, source, example, or result must come from the original text, the code, or the user.",
    "When a sentence needs a detail the material does not have, keep it vague, drop the claim, or ask the user. A made-up detail is worse than a vague one, because readers take it as true.",
    "Keep the meaning: negations, conditions, limits, and uncertainty stay. \"May\", \"must\", and \"will\" (\"pode\", \"deve\", \"vai\") are not interchangeable.",
    "Keep code, commands, file paths, URLs, IDs, numbers with their units, and frontmatter exactly as they are."
];

/**
 * Rules for every language.
 */
export const SharedWritingRules: string[] = [
    "Write for one reader and one task. Lead with what the reader needs; put background after.",
    "One idea per sentence. Name who does what: the actor before the action.",
    "Use one name for one thing. Do not rotate synonyms to sound varied.",
    "Prefer the plain word and the plain verb (\"is\", \"has\", \"uses\") over a roundabout one.",
    "Cut filler, staged openers, punchline closers, and sentences that only say something is important.",
    "Use a hyphen, comma, colon, or parentheses; never an em dash. No decorative emoji. Bold only what the reader must not miss.",
    "Do not pad: no summary of what was just said, no repeat of what the reader already knows, no closing offer of more help.",
    "Fix only what hurts the reader. Consistent terms, tables, and parallel lists are fine in reference docs."
];

const ENGLISH_RULES: string[] = [
    "Say the thing instead of contrasting it with a claim nobody made (\"not X, but Y\").",
    "Drop overused words such as delve, pivotal, crucial, showcase, underscore, seamless, and leverage.",
    "End sentences at the fact; no trailing \"-ing\" clause that comments on it (\", highlighting ...\").",
    "Use sentence case in headings unless the project uses title case on purpose."
];

const PORTUGUESE_RULES: string[] = [
    "Write in Brazilian Portuguese with every accent (não, ação, você, também, é).",
    "Say the thing instead of contrasting it with a claim nobody made (\"não é X, é Y\", \"não só X, mas Y\").",
    "Cut empty openers such as \"é importante destacar que\", \"vale ressaltar que\", \"nesse sentido\", and empty transitions such as \"além disso\" or \"dessa forma\" when the link is already clear.",
    "Prefer verbs to nouns made from verbs (\"decidir\" over \"tomar a decisão de\"), \"para\" over \"a fim de\", and \"é\" over \"se configura como\".",
    "No gerundismo (\"vou estar enviando\" becomes \"vou enviar\"); no trailing gerund that comments on the fact (\", destacando ...\").",
    "Headings capitalize only the first word and proper names. Avoid avoidable anglicisms when a common Portuguese word exists."
];

/**
 * Writing rules for a language: shared rules, the language's own rules, then the no-invention rules.
 */
export function writingRules(language: TextLanguage): string[] {
    const own = language === TextLanguage.EN
        ? ENGLISH_RULES
        : language === TextLanguage.PT ? PORTUGUESE_RULES : [];

    return [...SharedWritingRules, ...own, ...NoInventionRules];
}
