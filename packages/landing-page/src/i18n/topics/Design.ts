import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 05: fixing screens from the browser and remembering design choices.
 */
export const DesignTopic: TopicDefinition = {
    id: TopicId.DESIGN,
    slug: "design",
    group: TopicGroup.QUALITY,
    copy: {
        "en-US": {
            label: "Design",
            title: "Fix screens by pointing at them",
            lead: "Select what looks wrong in your running app and say what should change. The agent finds that piece in your code, fixes it there, and remembers your taste for next time. It only edits your local preview, never a live site.",
            summary: "Point at a screen in your local preview, say what is wrong, and get it fixed in the code.",
            contrast: {
                without: {
                    frame: "Agent chat",
                    lines: [
                        { text: "you: The cards on the pricing page are too cramped.", tone: ContrastTone.PLAIN },
                        { text: "agent: Which cards? I changed three files.", tone: ContrastTone.PLAIN },
                        { text: "It fixed the wrong component", tone: ContrastTone.BAD },
                        { text: "Next week it uses pure black again", tone: ContrastTone.BAD }
                    ],
                    caption: "Describing a screen in words turns into guesswork, and your taste is forgotten."
                },
                with: {
                    frame: "Local preview",
                    lines: [
                        { text: "You click the cards and say what is wrong", tone: ContrastTone.GOOD },
                        { text: "The fix lands in the piece you pointed at", tone: ContrastTone.GOOD },
                        { text: "Remembered: never pure black for text", tone: ContrastTone.GOOD }
                    ],
                    caption: "Point at the screen, get it fixed in the right place, and keep your taste for next time."
                }
            },
            examples: [
                {
                    title: "Point and say",
                    say: "These cards are too cramped.",
                    run: "/stillmark design more room between the pricing cards",
                    file: "src/components/PricingCards.vue",
                    lines: [
                        ".pricing-cards {",
                        "  display: grid;",
                        "  gap: 2rem;",
                        "}"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Was 0.5rem." },
                    result: "With the cards selected in your browser, the agent finds the matching component and changes it at the source, then checks the screen at desktop and phone width."
                },
                {
                    title: "Remember your taste",
                    say: "We never use pure black for text.",
                    run: "/stillmark design",
                    file: ".stillmark/learnings/design/overview.md",
                    lines: [
                        "# Design learnings",
                        "- Text is #1f1f1f, never pure black",
                        "- Cards keep a 2rem gap"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Read again next session." },
                    result: "Lasting preferences become short notes that the agent reads in later sessions, so fixes stay consistent."
                },
                {
                    title: "Share with the team",
                    say: "Keep our design notes in the repo.",
                    run: "stillmark config set --design-system=true",
                    file: ".gitignore",
                    lines: [
                        "# Stillmark",
                        ".stillmark/plans/",
                        ".stillmark/learnings/design/"
                    ],
                    mark: { line: 2, kind: MarkKind.STRIKE, note: "Now shared in git." },
                    result: "Design notes are private by default. Turning sharing on takes them out of .gitignore so everyone works from the same notes."
                }
            ],
            commands: [
                { command: "/stillmark design <what to change>", description: "In chat: fix spacing, text, color, or layout in plain language" },
                { command: "/stillmark design", description: "In chat, with an element selected in your local preview: fix what you point at" },
                { command: "stillmark config set --design-system=true", description: "Share design notes in git (false keeps them on your machine)" }
            ]
        },
        "pt-BR": {
            label: "Design",
            title: "Corrija telas apontando para elas",
            lead: "Selecione o que parece errado no app rodando e diga o que deve mudar. O agente encontra essa parte no código, corrige lá e lembra do seu gosto para a próxima vez. Ele só mexe na sua versão local, nunca num site no ar.",
            summary: "Aponte para uma tela na versão local, diga o que está errado e receba a correção no código.",
            contrast: {
                without: {
                    frame: "Chat com o agente",
                    lines: [
                        { text: "você: Os cards da página de preços estão apertados.", tone: ContrastTone.PLAIN },
                        { text: "agente: Quais cards? Mexi em três arquivos.", tone: ContrastTone.PLAIN },
                        { text: "Ele corrigiu a parte errada", tone: ContrastTone.BAD },
                        { text: "Na semana seguinte volta a usar preto puro", tone: ContrastTone.BAD }
                    ],
                    caption: "Descrever uma tela com palavras vira chute, e o seu gosto é esquecido."
                },
                with: {
                    frame: "Versão local",
                    lines: [
                        { text: "Você clica nos cards e diz o que está errado", tone: ContrastTone.GOOD },
                        { text: "A correção vai para a parte que você apontou", tone: ContrastTone.GOOD },
                        { text: "Lembrado: nunca preto puro no texto", tone: ContrastTone.GOOD }
                    ],
                    caption: "Aponte para a tela, receba a correção no lugar certo e o seu gosto fica guardado."
                }
            },
            examples: [
                {
                    title: "Aponte e fale",
                    say: "Esses cards estão apertados demais.",
                    run: "/stillmark design mais espaço entre os cards de preço",
                    file: "src/components/PricingCards.vue",
                    lines: [
                        ".pricing-cards {",
                        "  display: grid;",
                        "  gap: 2rem;",
                        "}"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Era 0.5rem." },
                    result: "Com os cards selecionados no navegador, o agente encontra o componente certo e muda na origem, depois confere a tela na largura de computador e de celular."
                },
                {
                    title: "Lembra do seu gosto",
                    say: "A gente nunca usa preto puro no texto.",
                    run: "/stillmark design",
                    file: ".stillmark/learnings/design/overview.md",
                    lines: [
                        "# Design learnings",
                        "- Text is #1f1f1f, never pure black",
                        "- Cards keep a 2rem gap"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Lido de novo na próxima sessão." },
                    result: "Preferências duradouras viram notas curtas que o agente lê nas próximas sessões, então as correções continuam consistentes."
                },
                {
                    title: "Compartilhe com o time",
                    say: "Guarda nossas notas de design no repositório.",
                    run: "stillmark config set --design-system=true",
                    file: ".gitignore",
                    lines: [
                        "# Stillmark",
                        ".stillmark/plans/",
                        ".stillmark/learnings/design/"
                    ],
                    mark: { line: 2, kind: MarkKind.STRIKE, note: "Agora vai pro git." },
                    result: "As notas de design são privadas por padrão. Ao ligar o compartilhamento, elas saem do .gitignore e todo mundo trabalha com as mesmas notas."
                }
            ],
            commands: [
                { command: "/stillmark design <o que mudar>", description: "No chat: corrige espaçamento, texto, cor ou layout em linguagem simples" },
                { command: "/stillmark design", description: "No chat, com um elemento selecionado na versão local: corrige o que você apontou" },
                { command: "stillmark config set --design-system=true", description: "Compartilha as notas de design no git (false mantém na sua máquina)" }
            ]
        }
    }
};
