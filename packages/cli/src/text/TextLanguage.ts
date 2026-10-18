/**
 * Languages with their own pattern catalog and writing rules. Anything else gets the shared rules only.
 */
export enum TextLanguage {
    EN = "EN",
    PT = "PT",
    OTHER = "OTHER"
}

/**
 * Fewest stopword hits before a guess counts; shorter text falls back to the surrounding language.
 */
const MIN_HITS = 3;

const ENGLISH = new Set([
    "the", "and", "of", "to", "is", "are", "was", "were", "that", "this", "with", "for", "it", "be",
    "on", "not", "you", "your", "an", "or", "by", "from", "have", "has", "will", "can", "which",
    "when", "what", "there", "they", "we", "but", "if", "into", "its", "their", "than"
]);

const PORTUGUESE = new Set([
    "de", "que", "não", "para", "com", "uma", "um", "os", "da", "dos", "das", "em", "é", "por",
    "mais", "na", "ao", "aos", "você", "isso", "esse", "essa", "este", "esta", "está", "são",
    "mas", "também", "pelo", "pela", "já", "quando", "ou", "foi", "ser", "tem", "sem", "seu",
    "sua", "e", "nos", "nas", "pode", "fica", "então"
]);

/**
 * Spanish shares many words with Portuguese; these tell them apart so Portuguese patterns stay off Spanish text.
 */
const SPANISH = new Set([
    "el", "los", "las", "del", "y", "con", "es", "lo", "pero", "muy", "también", "una", "su",
    "sus", "al", "puede", "esta", "cuando", "sin", "hay"
]);

function hits(words: string[], set: Set<string>): number {
    return words.reduce((count, word) => count + (set.has(word) ? 1 : 0), 0);
}

/**
 * Guesses the language of a piece of prose from its most common short words.
 * Returns `undefined` when the text is too short to tell.
 */
export function detectLanguage(text: string): TextLanguage | undefined {
    const words = text.toLowerCase().match(/[\p{L}']+/gu) ?? [];
    const scores: [TextLanguage, number][] = [
        [TextLanguage.EN, hits(words, ENGLISH)],
        [TextLanguage.PT, hits(words, PORTUGUESE)],
        [TextLanguage.OTHER, hits(words, SPANISH)]
    ];
    const [best, bestHits] = scores.reduce((top, entry) => (entry[1] > top[1] ? entry : top));

    if (bestHits < MIN_HITS) {
        return undefined;
    }

    return best;
}

/**
 * Maps a BCP-47 tag (`pt-BR`, `en`) or a bare code to a text language.
 */
export function languageFromTag(tag: string | undefined): TextLanguage | undefined {
    if (tag === undefined) {
        return undefined;
    }

    const code = tag.trim().toLowerCase().split(/[-_]/)[0];

    if (code === "en") {
        return TextLanguage.EN;
    } else
    if (code === "pt") {
        return TextLanguage.PT;
    } else
    if (/^[a-z]{2,3}$/.test(code)) {
        return TextLanguage.OTHER;
    }

    return undefined;
}
