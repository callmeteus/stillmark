import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 09: language, detail level, short replies, and updates.
 */
export const SettingsTopic: TopicDefinition = {
    id: TopicId.SETTINGS,
    slug: "settings",
    group: TopicGroup.START,
    copy: {
        "en-US": {
            label: "Settings",
            title: "Make it work your way",
            lead: "Every preference lives in stillmark.config.json, committed with the project so the whole team shares it. Pick the language of each file, how much detail entries carry, and how short the agent's replies should be.",
            summary: "Language per file, detail level, shorter agent replies, and automatic updates.",
            contrast: {
                without: {
                    frame: "Every new chat",
                    lines: [
                        { text: "you: Commit messages in Portuguese, please.", tone: ContrastTone.PLAIN },
                        { text: "you: Shorter answers, please.", tone: ContrastTone.PLAIN },
                        { text: "Forgotten the next day", tone: ContrastTone.BAD },
                        { text: "Each teammate gets different results", tone: ContrastTone.BAD }
                    ],
                    caption: "Preferences said in chat get lost, so you repeat them forever."
                },
                with: {
                    frame: "stillmark.config.json",
                    lines: [
                        { text: "Commit messages in Portuguese", tone: ContrastTone.GOOD },
                        { text: "Roadmap items kept to one line", tone: ContrastTone.GOOD },
                        { text: "Short replies", tone: ContrastTone.GOOD },
                        { text: "Saved in the repo, so the whole team shares it", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Said once, saved with the project, and followed by every agent on the team."
                }
            },
            examples: [
                {
                    title: "Language per file",
                    say: "Write commit messages in Portuguese.",
                    run: "stillmark config set --language=pt-BR --module=commits",
                    file: "stillmark.config.json",
                    lines: [
                        "\"language\": {",
                        "  \"global\": \"en\",",
                        "  \"commits\": \"pt-BR\"",
                        "}"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Only commits change." },
                    result: "Choose one language for everything or a different one for the roadmap, the plan, the checklist, the changelog, the docs, and the commits."
                },
                {
                    title: "Short or detailed entries",
                    say: "Keep roadmap items to one line.",
                    run: "stillmark config set --detail=compact --module=roadmap",
                    file: "stillmark.config.json",
                    lines: [
                        "\"detail\": {",
                        "  \"roadmap\": \"compact\"",
                        "}"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "One line per item." },
                    result: "Compact keeps each entry to its title line. Extended adds details below it. Set it for everything or one file at a time."
                },
                {
                    title: "Shorter replies",
                    say: "Shorter answers, please.",
                    run: "stillmark caveman full --save",
                    file: "stillmark.config.json",
                    lines: [
                        "\"caveman\": {",
                        "  \"level\": \"full\"",
                        "}"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Commands and errors kept whole." },
                    result: "Replies drop the filler but keep commands, links, and error messages exactly as they are. Without --save it lasts only for this conversation."
                },
                {
                    title: "Lighter instruction files",
                    say: "Make AGENTS.md cheaper to read.",
                    run: "stillmark caveman compress AGENTS.md",
                    file: ".stillmark/plans/caveman/originals/",
                    lines: [
                        "AGENTS.md"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Readable copy kept." },
                    result: "The agent rewrites the file in fewer words and the readable original is kept. verify compares the two, restore brings the original back."
                }
            ],
            commands: [
                { command: "stillmark config status", description: "Show your settings and what is shared in git" },
                { command: "stillmark config set --language=pt-BR", description: "Language of the roadmap, plans, checklist, and commits (--module picks one of them)" },
                { command: "stillmark config set --detail=compact", description: "Compact or detailed entries, for everything or one file (--module=coverage|roadmap|plan)" },
                { command: "stillmark config set --caveman=full", description: "Shorter agent replies for everyone on the project: off, lite, full, or ultra" },
                { command: "stillmark caveman on|off", description: "Short replies for this conversation only (--save keeps the choice)" },
                { command: "stillmark caveman", description: "How much the short replies cost per message and how much smaller files save" },
                { command: "stillmark caveman compress <file>", description: "Shrink an instructions file, keeping the readable original (verify and restore also work)" },
                { command: "stillmark config set --auto-update=false", description: "Turn automatic update checks off, or change how often with --update-interval=<hours>" }
            ]
        },
        "pt-BR": {
            label: "Ajustes",
            title: "Do jeito que você trabalha",
            lead: "Toda preferência fica no stillmark.config.json, que vai para o repositório junto com o projeto, então o time inteiro compartilha. Escolha o idioma de cada arquivo, quanto detalhe cada entrada leva e quão curtas devem ser as respostas do agente.",
            summary: "Idioma por arquivo, nível de detalhe, respostas mais curtas e atualizações automáticas.",
            contrast: {
                without: {
                    frame: "Todo chat novo",
                    lines: [
                        { text: "você: Mensagens de commit em português, por favor.", tone: ContrastTone.PLAIN },
                        { text: "você: Respostas mais curtas, por favor.", tone: ContrastTone.PLAIN },
                        { text: "Esquecido no dia seguinte", tone: ContrastTone.BAD },
                        { text: "Cada pessoa do time recebe um resultado diferente", tone: ContrastTone.BAD }
                    ],
                    caption: "Preferência dita no chat se perde, e você repete para sempre."
                },
                with: {
                    frame: "stillmark.config.json",
                    lines: [
                        { text: "Mensagens de commit em português", tone: ContrastTone.GOOD },
                        { text: "Itens do roadmap em uma linha", tone: ContrastTone.GOOD },
                        { text: "Respostas curtas", tone: ContrastTone.GOOD },
                        { text: "Guardado no repositório, então o time inteiro compartilha", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Dito uma vez, guardado no projeto e seguido por todo agente do time."
                }
            },
            examples: [
                {
                    title: "Idioma por arquivo",
                    say: "Escreve as mensagens de commit em português.",
                    run: "stillmark config set --language=pt-BR --module=commits",
                    file: "stillmark.config.json",
                    lines: [
                        "\"language\": {",
                        "  \"global\": \"en\",",
                        "  \"commits\": \"pt-BR\"",
                        "}"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Só os commits mudam." },
                    result: "Escolha um idioma para tudo ou um diferente para o roadmap, o plano, o checklist, o changelog, a documentação e os commits."
                },
                {
                    title: "Entradas curtas ou detalhadas",
                    say: "Deixa os itens do roadmap em uma linha só.",
                    run: "stillmark config set --detail=compact --module=roadmap",
                    file: "stillmark.config.json",
                    lines: [
                        "\"detail\": {",
                        "  \"roadmap\": \"compact\"",
                        "}"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Uma linha por item." },
                    result: "O compacto deixa cada entrada só com o título. O estendido coloca detalhes embaixo. Vale para tudo ou para um arquivo de cada vez."
                },
                {
                    title: "Respostas mais curtas",
                    say: "Respostas mais curtas, por favor.",
                    run: "stillmark caveman full --save",
                    file: "stillmark.config.json",
                    lines: [
                        "\"caveman\": {",
                        "  \"level\": \"full\"",
                        "}"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Comandos e erros intactos." },
                    result: "As respostas perdem a enrolação, mas mantêm comandos, links e mensagens de erro exatamente como são. Sem --save, vale só para esta conversa."
                },
                {
                    title: "Arquivos de instrução mais leves",
                    say: "Deixa o AGENTS.md mais barato de ler.",
                    run: "stillmark caveman compress AGENTS.md",
                    file: ".stillmark/plans/caveman/originals/",
                    lines: [
                        "AGENTS.md"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Cópia legível guardada." },
                    result: "O agente reescreve o arquivo com menos palavras e o original legível fica guardado. O verify compara os dois, o restore traz o original de volta."
                }
            ],
            commands: [
                { command: "stillmark config status", description: "Mostra suas configurações e o que vai para o git" },
                { command: "stillmark config set --language=pt-BR", description: "Idioma do roadmap, dos planos, do checklist e dos commits (--module escolhe um deles)" },
                { command: "stillmark config set --detail=compact", description: "Entradas compactas ou detalhadas, para tudo ou um arquivo (--module=coverage|roadmap|plan)" },
                { command: "stillmark config set --caveman=full", description: "Respostas mais curtas para todo mundo no projeto: off, lite, full ou ultra" },
                { command: "stillmark caveman on|off", description: "Respostas curtas só nesta conversa (--save guarda a escolha)" },
                { command: "stillmark caveman", description: "Quanto as respostas curtas custam por mensagem e quanto os arquivos menores economizam" },
                { command: "stillmark caveman compress <arquivo>", description: "Encolhe um arquivo de instruções e guarda o original legível (verify e restore também funcionam)" },
                { command: "stillmark config set --auto-update=false", description: "Desliga a procura automática por atualizações, ou muda a frequência com --update-interval=<horas>" }
            ]
        }
    }
};
