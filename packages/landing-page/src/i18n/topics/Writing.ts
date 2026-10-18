import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic: clear writing without the marks of generated text, and never inventing facts.
 */
export const WritingTopic: TopicDefinition = {
    id: TopicId.WRITING,
    slug: "writing",
    group: TopicGroup.QUALITY,
    copy: {
        "en-US": {
            label: "Clear writing",
            title: "Text that reads like a person wrote it",
            lead: "Your agent writes the roadmap, the changelog, the README, and the commit messages. Stillmark finds the phrases that make text sound generated, in English and in Portuguese, helps the agent rewrite them, and checks that no fact was lost or made up along the way.",
            summary: "Find and fix the phrases that make text sound generated, without inventing anything.",
            contrast: {
                without: {
                    frame: "Launch post, first draft",
                    lines: [
                        { text: "It's not just a feature, it's a new way to work.", tone: ContrastTone.BAD },
                        { text: "It's important to note that it's seamless.", tone: ContrastTone.BAD },
                        { text: "Used by 10,000 teams. Let that sink in.", tone: ContrastTone.BAD }
                    ],
                    caption: "Filler, sales words, and a number nobody gave the agent. Readers notice, and the made-up number reads as true."
                },
                with: {
                    frame: "Launch post, after the check",
                    lines: [
                        { text: "Two people can now edit the same document at once.", tone: ContrastTone.GOOD },
                        { text: "Comments stay on their sentence when the text changes.", tone: ContrastTone.GOOD },
                        { text: "Only facts from the original or from you", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Plain sentences that say what changed, with nothing added that you did not say."
                }
            },
            examples: [
                {
                    title: "Find what sounds generated",
                    say: "Check the launch post.",
                    run: "stillmark text check docs/launch.md",
                    file: "docs/launch.md",
                    lines: [
                        "# Shared drafts",
                        "It's not just a feature, it's a new way to work.",
                        "Comments stay on their sentence."
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Arguing with a claim nobody made." },
                    result: "Each problem comes with its line, why it hurts the reader, and how to fix it. Small things, like a very long sentence, are listed as worth a look and do not block."
                },
                {
                    title: "English and Portuguese, each with its own rules",
                    say: "Clarify this text.",
                    run: "stillmark text check -- \"Simples assim, a equipe não perde mais arquivos.\"",
                    file: "Text",
                    lines: [
                        "Simples assim, a equipe não perde mais arquivos."
                    ],
                    mark: { line: 0, kind: MarkKind.STRIKE, note: "A closing punchline, in Portuguese." },
                    result: "Stillmark first works out the language of each paragraph, then uses the phrases of that language. A file that mixes English and Portuguese gets the right rules in each part."
                },
                {
                    title: "Rewrite without making things up",
                    say: "Rewrite the launch post so it sounds natural.",
                    run: "stillmark text rewrite docs/launch.md",
                    file: "docs/launch.md",
                    lines: [
                        "Teams use it every day.",
                        "Teams use it 40 times a day."
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "This number was not in the original." },
                    result: "The original is kept while the agent rewrites. The next check compares both versions and flags any number, link, or piece of code that was lost or added."
                },
                {
                    title: "The same rules for everything the agent writes",
                    say: "Which writing rules do you follow?",
                    run: "stillmark text rules --language=pt-BR",
                    file: "Rules",
                    lines: [
                        "One idea per sentence.",
                        "Never invent names, numbers, or dates."
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Always part of the rules." },
                    result: "Roadmap items, test cases, the changelog, the README, and commit messages all follow these rules. When a detail is missing, the agent keeps the sentence vague or asks you instead of guessing."
                }
            ],
            commands: [
                { command: "stillmark text check docs/launch.md", description: "List the phrases that make a file sound generated, line by line" },
                { command: "stillmark text check -- \"…\"", description: "Check a piece of text instead of a file" },
                { command: "stillmark text rewrite docs/launch.md", description: "Keep the original and let the agent rewrite the file" },
                { command: "stillmark text restore docs/launch.md", description: "Put the original back" },
                { command: "stillmark text rules --language=pt-BR", description: "Show the writing rules for one language" }
            ]
        },
        "pt-BR": {
            label: "Escrita clara",
            title: "Texto que parece escrito por uma pessoa",
            lead: "O agente escreve o roadmap, o changelog, o README e as mensagens de commit. O Stillmark encontra as frases que fazem o texto parecer gerado, em inglês e em português, ajuda o agente a reescrever e confere se nenhum fato se perdeu ou foi inventado no caminho.",
            summary: "Encontre e corrija as frases que fazem o texto parecer gerado, sem inventar nada.",
            contrast: {
                without: {
                    frame: "Post de lançamento, primeira versão",
                    lines: [
                        { text: "Não é apenas um recurso, é uma nova forma de trabalhar.", tone: ContrastTone.BAD },
                        { text: "É importante destacar que é revolucionário.", tone: ContrastTone.BAD },
                        { text: "Usado por 10 mil equipes. Simples assim.", tone: ContrastTone.BAD }
                    ],
                    caption: "Enrolação, palavras de propaganda e um número que ninguém passou para o agente. Quem lê percebe, e o número inventado parece verdade."
                },
                with: {
                    frame: "Post de lançamento, depois da revisão",
                    lines: [
                        { text: "Agora duas pessoas editam o mesmo documento ao mesmo tempo.", tone: ContrastTone.GOOD },
                        { text: "Os comentários ficam na frase certa quando o texto muda.", tone: ContrastTone.GOOD },
                        { text: "Só fatos do texto original ou ditos por você", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Frases simples que dizem o que mudou, sem nada que você não tenha dito."
                }
            },
            examples: [
                {
                    title: "Encontre o que parece gerado",
                    say: "Confere o post de lançamento.",
                    run: "stillmark text check docs/lancamento.md",
                    file: "docs/lancamento.md",
                    lines: [
                        "# Rascunhos compartilhados",
                        "Não é apenas um recurso, é uma nova forma de trabalhar.",
                        "Os comentários ficam na frase certa."
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Rebate algo que ninguém disse." },
                    result: "Cada problema vem com a linha, o motivo de atrapalhar a leitura e como corrigir. Coisas pequenas, como uma frase longa demais, aparecem como sugestão e não bloqueiam."
                },
                {
                    title: "Inglês e português, cada um com as suas regras",
                    say: "Clarifica esse texto.",
                    run: "stillmark text check -- \"Simples assim, a equipe não perde mais arquivos.\"",
                    file: "Texto",
                    lines: [
                        "Simples assim, a equipe não perde mais arquivos."
                    ],
                    mark: { line: 0, kind: MarkKind.STRIKE, note: "Frase de efeito no fim, em português." },
                    result: "O Stillmark primeiro descobre o idioma de cada parágrafo e depois usa as frases daquele idioma. Um arquivo que mistura inglês e português recebe as regras certas em cada parte."
                },
                {
                    title: "Reescreva sem inventar",
                    say: "Reescreve o post para soar natural.",
                    run: "stillmark text rewrite docs/lancamento.md",
                    file: "docs/lancamento.md",
                    lines: [
                        "As equipes usam todo dia.",
                        "As equipes usam 40 vezes por dia."
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Esse número não estava no original." },
                    result: "O original fica guardado enquanto o agente reescreve. A próxima conferência compara as duas versões e aponta qualquer número, link ou trecho de código que sumiu ou apareceu."
                },
                {
                    title: "As mesmas regras para tudo que o agente escreve",
                    say: "Quais regras de escrita você segue?",
                    run: "stillmark text rules --language=pt-BR",
                    file: "Regras",
                    lines: [
                        "Uma ideia por frase.",
                        "Nunca invente nomes, números ou datas."
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Sempre faz parte das regras." },
                    result: "Itens do roadmap, casos de teste, changelog, README e mensagens de commit seguem essas regras. Quando falta um detalhe, o agente deixa a frase mais geral ou pergunta, em vez de chutar."
                }
            ],
            commands: [
                { command: "stillmark text check docs/lancamento.md", description: "Lista as frases que fazem um arquivo parecer gerado, linha por linha" },
                { command: "stillmark text check -- \"…\"", description: "Confere um trecho de texto em vez de um arquivo" },
                { command: "stillmark text rewrite docs/lancamento.md", description: "Guarda o original e deixa o agente reescrever o arquivo" },
                { command: "stillmark text restore docs/lancamento.md", description: "Coloca o original de volta" },
                { command: "stillmark text rules --language=pt-BR", description: "Mostra as regras de escrita de um idioma" }
            ]
        }
    }
};
