import { phrases, TextSeverity, type TextPattern } from "./TextPatterns";

/**
 * Marks of generated text in Portuguese prose (Brazilian usage first).
 */
export const PortuguesePatterns: TextPattern[] = [
    {
        id: "chat-residue",
        severity: TextSeverity.HIGH,
        regex: phrases([
            "espero (?:que isso |ter )?ajud(?:e|ar|ado)",
            "fico à disposição",
            "qualquer dúvida,? (?:é só|estou)",
            "(?:ótima|excelente) pergunta",
            "claro!",
            "com certeza!",
            "como (?:um modelo de linguagem|uma inteligência artificial|uma ia)",
            "se quiser,? posso",
            "aqui está (?:um|uma|o|a) (?:resumo|panorama|visão geral)"
        ]),
        message: "Chat reply left inside the text",
        fix: "Delete it; the text is not a conversation"
    },
    {
        id: "negative-parallelism",
        severity: TextSeverity.HIGH,
        regex: phrases([
            "não (?:é|se trata de) (?:apenas|só|somente|simplesmente) [^.;!?\\n]{1,80}?(?:[,;\\u2014]| - ) ?(?:é|mas)",
            "não (?:apenas|só|somente) [^.;!?\\n]{1,80}?,? mas(?: também)?",
            "não é sobre [^.;!?\\n]{1,60}?[,;\\u2014] ?é sobre"
        ]),
        message: "\"Não é X, é Y\" contrast against a claim nobody made",
        fix: "State Y directly"
    },
    {
        id: "staged-opener",
        severity: TextSeverity.HIGH,
        regex: phrases([
            "a verdade é que",
            "sejamos (?:honestos|sinceros|claros)",
            "vamos (?:direto ao ponto|ser sinceros)",
            "aqui está o (?:ponto|segredo)",
            "sabe o que (?:é|isso significa)\\?",
            "o resultado\\?",
            "e o melhor\\?",
            "o detalhe\\?"
        ]),
        message: "Staged run-up before the point",
        fix: "Start with the point itself"
    },
    {
        id: "one-line-closer",
        severity: TextSeverity.HIGH,
        regex: phrases([
            "simples assim",
            "pense nisso",
            "e isso muda tudo",
            "ponto final",
            "fica a reflexão",
            "e é isso que importa"
        ]),
        message: "Punchline closer that adds no information",
        fix: "Delete it, or end on the last real fact"
    },
    {
        id: "significance-inflation",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "(?:é|representa|serve como) um (?:verdadeiro )?testemunho",
            "momento (?:crucial|decisivo|marcante|histórico)",
            "(?:desempenha|exerce|tem) um papel (?:crucial|fundamental|essencial|vital|central)",
            "(?:ressalta|reforça|sublinha) a importância",
            "divisor de águas",
            "mudança de paradigma",
            "no mundo (?:atual|de hoje|moderno|contemporâneo)",
            "nos dias de hoje",
            "cenário (?:atual )?em constante (?:evolução|mudança|transformação)",
            "rica tapeçaria"
        ]),
        message: "Inflated importance instead of a fact",
        fix: "Say what it does or what changed, with the real detail"
    },
    {
        id: "filler-phrase",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "é (?:importante|fundamental|essencial|válido) (?:destacar|ressaltar|notar|lembrar|mencionar|salientar|observar) que",
            "vale (?:a pena )?(?:destacar|ressaltar|lembrar|mencionar|notar|salientar) que",
            "cabe (?:destacar|ressaltar|mencionar|salientar) que",
            "nesse sentido",
            "neste sentido",
            "em suma",
            "em conclusão",
            "por fim,? mas não menos importante",
            "no final das contas",
            "desnecessário dizer",
            "no que (?:diz respeito|se refere) (?:a|ao|à)",
            "a fim de",
            "com o objetivo de"
        ]),
        message: "Filler phrase",
        fix: "Delete it and keep the rest of the sentence (\"a fim de\" becomes \"para\")"
    },
    {
        id: "copula-avoidance",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "se configura como",
            "se constitui como",
            "se apresenta como",
            "se posiciona como",
            "atua como um",
            "funciona como um"
        ]),
        message: "Roundabout verb where \"é\" or \"tem\" fits",
        fix: "Use \"é\", \"são\", or \"tem\""
    },
    {
        id: "vague-attribution",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "especialistas (?:dizem|afirmam|apontam|concordam|acreditam|recomendam)",
            "segundo especialistas",
            "estudos (?:mostram|apontam|indicam|comprovam|sugerem)",
            "pesquisas (?:mostram|apontam|indicam|comprovam|sugerem)",
            "muitos acreditam",
            "há quem diga",
            "é amplamente (?:aceito|reconhecido|conhecido|sabido)"
        ]),
        message: "Claim credited to unnamed sources",
        fix: "Name the source from the material, or drop the claim; never invent one"
    },
    {
        id: "promotional",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "de última geração",
            "de ponta",
            "revolucionári[oa]s?",
            "incomparáve(?:l|is)",
            "de classe mundial",
            "sem igual",
            "deslumbrantes?",
            "inovador(?:a|es|as)?",
            "transformador(?:a|es|as)?",
            "potencializ(?:a|ar|e|am)",
            "sem complicação",
            "sem esforço"
        ]),
        message: "Sales language",
        fix: "Replace it with what the thing actually does"
    },
    {
        id: "trailing-analysis",
        severity: TextSeverity.MEDIUM,
        regex: /, (?:destacando|ressaltando|evidenciando|reforçando|demonstrando|refletindo|consolidando|simbolizando|sublinhando|mostrando) (?:a|o|as|os|sua|seu|suas|seus|como|que)(?![\p{L}\p{N}])/giu,
        message: "Trailing gerund clause that comments on the fact instead of adding one",
        fix: "End the sentence at the fact, or turn the comment into a sentence with evidence"
    },
    {
        id: "gerundismo",
        severity: TextSeverity.MEDIUM,
        regex: phrases([
            "(?:vou|vamos|vai|vão|irei|iremos|irá|irão) estar \\p{L}+ndo",
            "estare(?:i|mos) \\p{L}+ndo"
        ]),
        message: "\"Vou estar fazendo\" construction",
        fix: "Use the simple form: \"vou enviar\", \"enviaremos\""
    },
    {
        id: "ai-vocabulary",
        severity: TextSeverity.LOW,
        regex: phrases([
            "mergulh(?:ar|e|amos|ando) (?:fundo )?(?:em|no|na|nos|nas)",
            "tapeçaria",
            "multifacetad[oa]s?",
            "intrincad[oa]s?",
            "meticulos[oa]s?",
            "holístic[oa]s?",
            "sinergia",
            "alavanc(?:ar|a|e|ando)",
            "fomentar",
            "impulsion(?:ar|a|e|ando)",
            "jornada",
            "desbrav(?:ar|e|ando)",
            "robust[oa]s?",
            "crucia(?:l|is)",
            "vibrantes?",
            "elevar (?:o|a|seu|sua) (?:nível|patamar)"
        ]),
        message: "Word that generated text overuses",
        fix: "Use the plain word (ver, usar, aumentar, importante) or cut it"
    },
    {
        id: "hedging",
        severity: TextSeverity.LOW,
        regex: phrases([
            "pode(?:ria)? potencialmente",
            "talvez possa",
            "de certa forma",
            "de alguma forma",
            "em certa medida"
        ]),
        message: "Stacked hedging",
        fix: "Hedge once, where the uncertainty really is"
    },
    {
        id: "transition-overuse",
        severity: TextSeverity.LOW,
        regex: /(?:^|(?<=[.!?]\s))(?:além disso|ademais|outrossim|dessa forma|desse modo|nesse contexto|por outro lado),/gimu,
        message: "Mechanical transition at the start of a sentence",
        fix: "Delete it when the link between sentences is already clear"
    }
];
