import { APOS, phrases, TextSeverity, type TextPattern } from "./TextPatterns";

/**
 * Marks of generated text in English prose.
 */
export const EnglishPatterns: TextPattern[] = [
    {
        id: "chat-residue",
        severity: TextSeverity.HIGH,
        regex: phrases([
            "i hope this helps",
            "let me know if",
            "great question",
            "certainly!",
            "as an ai(?: language model)?",
            "as of my (?:last )?(?:knowledge )?(?:cutoff|update)",
            `i${APOS}d be happy to`,
            "feel free to (?:reach out|ask)",
            `here${APOS}s (?:a|an|the) (?:breakdown|overview|summary)`
        ]),
        message: "Chat reply left inside the text",
        fix: "Delete it; the text is not a conversation"
    },
    {
        id: "negative-parallelism",
        severity: TextSeverity.HIGH,
        regex: phrases([
            "not (?:just|only|merely|simply) [^.;!?\\n]{1,80}?,? but(?: also)?",
            `(?:it|this|that)(?:${APOS}s| is) not [^.;!?\\n]{1,60}?(?:[,;\\u2014]| - ) ?(?:it|this|that)(?:${APOS}s| is)`,
            `(?:isn${APOS}t|is not|aren${APOS}t|are not) (?:just |only |merely )?about [^.;!?\\n]{1,60}?[,;\\u2014] ?(?:it${APOS}s|they${APOS}re|it is)`
        ]),
        message: "\"Not X, but Y\" contrast against a claim nobody made",
        fix: "State Y directly"
    },
    {
        id: "staged-opener",
        severity: TextSeverity.HIGH,
        regex: phrases([
            `here${APOS}s the (?:thing|catch|kicker)`,
            `here${APOS}s why`,
            "the truth is",
            `let${APOS}s be (?:clear|honest)`,
            "make no mistake",
            "honestly\\?",
            "the result\\?",
            "the best part\\?"
        ]),
        message: "Staged run-up before the point",
        fix: "Start with the point itself"
    },
    {
        id: "one-line-closer",
        severity: TextSeverity.HIGH,
        regex: phrases([
            "let that sink in",
            `and that${APOS}s the point`,
            `that${APOS}s the power of`,
            "full stop",
            "and that changes everything",
            "simple as that",
            "the rest is history"
        ]),
        message: "Punchline closer that adds no information",
        fix: "Delete it, or end on the last real fact"
    },
    {
        id: "significance-inflation",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "stands as a testament",
            "(?:is|serves as) a testament to",
            "a pivotal (?:moment|role|step)",
            "plays? an? (?:crucial|vital|key|pivotal|significant) role",
            "underscores? the importance",
            "marks? a turning point",
            "game[- ]changer",
            "paradigm shift",
            `in today${APOS}s (?:fast[- ]paced |digital |modern )?(?:world|landscape)`,
            "ever[- ](?:evolving|changing) landscape",
            "(?:rich|vibrant) tapestry"
        ]),
        message: "Inflated importance instead of a fact",
        fix: "Say what it does or what changed, with the real detail"
    },
    {
        id: "filler-phrase",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            `it(?:${APOS}s| is) (?:important|worth) (?:to )?(?:note|noting|remember|mention|mentioning) that`,
            "at its core",
            "when it comes to",
            "in conclusion",
            "at the end of the day",
            "needless to say",
            "it goes without saying",
            "in order to"
        ]),
        message: "Filler phrase",
        fix: "Delete it and keep the rest of the sentence (\"in order to\" becomes \"to\")"
    },
    {
        id: "copula-avoidance",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "serves as (?:a|an|the)",
            "stands as (?:a|an|the)",
            "functions as (?:a|an|the)",
            "boasts (?:a|an)"
        ]),
        message: "Roundabout verb where \"is\" or \"has\" fits",
        fix: "Use \"is\", \"are\", or \"has\""
    },
    {
        id: "vague-attribution",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "experts (?:say|agree|argue|believe|suggest)",
            "studies (?:show|suggest|have shown)",
            "research (?:shows|suggests|has shown)",
            "many (?:people )?believe",
            "some (?:would )?argue",
            "it is widely (?:believed|accepted|known)"
        ]),
        message: "Claim credited to unnamed sources",
        fix: "Name the source from the material, or drop the claim; never invent one"
    },
    {
        id: "promotional",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "cutting[- ]edge",
            "state[- ]of[- ]the[- ]art",
            "world[- ]class",
            "best[- ]in[- ]class",
            "revolutionary",
            "unparalleled",
            "breathtaking",
            "seamless(?:ly)?",
            "effortless(?:ly)?",
            "supercharge[sd]?",
            "unlock the (?:power|potential)"
        ]),
        message: "Sales language",
        fix: "Replace it with what the thing actually does"
    },
    {
        id: "trailing-analysis",
        severity: TextSeverity.MEDIUM,
        regex: /, (?:highlighting|underscoring|emphasizing|showcasing|reflecting|demonstrating|symbolizing|fostering|cementing|solidifying) (?:the|its|their|a|an|his|her|how)(?![\p{L}\p{N}])/giu,
        message: "Trailing \"-ing\" clause that comments on the fact instead of adding one",
        fix: "End the sentence at the fact, or turn the comment into a sentence with evidence"
    },
    {
        id: "ai-vocabulary",
        severity: TextSeverity.LOW,
        regex: phrases([
            "delv(?:e|es|ed|ing)",
            "tapestry",
            "multifaceted",
            "intricate",
            "meticulous(?:ly)?",
            "realm",
            "holistic",
            "synergy",
            "bolster(?:s|ed)?",
            "embark(?:s|ed)? on",
            "navigate the complexities",
            "foster(?:s|ed|ing)?",
            "nestled",
            "vibrant",
            "showcas(?:e|es|ed|ing)",
            "underscor(?:e|es|ed|ing)",
            "pivotal",
            "crucial",
            "leverag(?:e|es|ed|ing)"
        ]),
        message: "Word that generated text overuses",
        fix: "Use the plain word (look into, show, use, important) or cut it"
    },
    {
        id: "hedging",
        severity: TextSeverity.LOW,
        regex: phrases([
            "could potentially",
            "may potentially",
            "might possibly",
            "may possibly",
            "arguably",
            "to some extent"
        ]),
        message: "Stacked hedging",
        fix: "Hedge once, where the uncertainty really is"
    },
    {
        id: "transition-overuse",
        severity: TextSeverity.LOW,
        regex: /(?:^|(?<=[.!?]\s))(?:additionally|furthermore|moreover|in addition|that said),/gimu,
        message: "Mechanical transition at the start of a sentence",
        fix: "Delete it when the link between sentences is already clear"
    }
];
