import { MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 01: setting Stillmark up in a project and in the editor.
 */
export const InstallTopic: TopicDefinition = {
    id: TopicId.INSTALL,
    slug: "install",
    group: TopicGroup.START,
    copy: {
        "en-US": {
            label: "Install",
            title: "Install Stillmark",
            lead: "One command sets up the project files. A second one teaches your editor the /stillmark command. You can also paste a single prompt and let your agent do both.",
            summary: "Set up the project files and add /stillmark to Cursor, Claude Code, or Codex.",
            examples: [
                {
                    title: "Start in a repo",
                    say: "Set up Stillmark in this repo.",
                    run: "npx stillmark@latest init",
                    file: "your project",
                    lines: [
                        "ROADMAP.md",
                        "stillmark.config.json",
                        ".gitignore",
                        ".stillmark/plans/",
                        ".stillmark/learnings/design/overview.md",
                        ".stillmark/learnings/code-style/overview.md"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Private, never committed." },
                    result: "Creates the roadmap, the private plan folder, and the settings file. The plan folder is added to .gitignore so it stays on your machine."
                },
                {
                    title: "Teach your editor",
                    say: "Install it for Cursor.",
                    run: "stillmark install --agent cursor",
                    file: ".cursor/",
                    lines: [
                        ".cursor/",
                        "  commands/stillmark.md",
                        "  skills/stillmark/SKILL.md",
                        "  skills/stillmark/reference/"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Adds /stillmark to the chat." },
                    result: "Your editor learns the /stillmark command and the skill behind it. Claude Code and Codex install the same way with --agent claude or --agent codex."
                },
                {
                    title: "Every project at once",
                    say: "Make it work in all my projects.",
                    run: "stillmark install --agent claude --global",
                    file: "~/.claude/",
                    lines: [
                        "~/.claude/",
                        "  commands/stillmark.md",
                        "  skills/stillmark/SKILL.md"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Once, in your home folder." },
                    result: "Installs once in your home folder. Projects then skip their own copy unless you add --force."
                },
                {
                    title: "Stay current",
                    say: "Update Stillmark.",
                    run: "stillmark update apply",
                    file: "stillmark.config.json",
                    lines: [
                        "\"update\": {",
                        "  \"auto\": true,",
                        "  \"intervalHours\": 24",
                        "}"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Checks once a day." },
                    result: "Stillmark looks for a new version once a day on its own. update apply refreshes the agent files you installed, in the project and in your home folder."
                }
            ],
            commands: [
                { command: "npx stillmark@latest init", description: "Create the roadmap, the private plan folder, and the settings file" },
                { command: "npx stillmark@latest init --todos", description: "Same, and put the TODO and FIXME comments already in the code on the roadmap" },
                { command: "stillmark install --agent cursor|claude|codex", description: "Add the /stillmark command and skill to your editor" },
                { command: "stillmark install --agent cursor --global", description: "Install once for every project on this computer (--force keeps a project copy too)" },
                { command: "stillmark update", description: "Look for a new version now and then, once a day by default (--force checks right away)" },
                { command: "stillmark update apply", description: "Refresh the installed agent files to the latest version" }
            ]
        },
        "pt-BR": {
            label: "Instalar",
            title: "Instale o Stillmark",
            lead: "Um comando prepara os arquivos do projeto. Outro ensina o comando /stillmark ao seu editor. Você também pode colar um único pedido e deixar o agente fazer as duas coisas.",
            summary: "Prepare os arquivos do projeto e adicione /stillmark ao Cursor, Claude Code ou Codex.",
            examples: [
                {
                    title: "Comece num repositório",
                    say: "Configura o Stillmark neste repositório.",
                    run: "npx stillmark@latest init",
                    file: "seu projeto",
                    lines: [
                        "ROADMAP.md",
                        "stillmark.config.json",
                        ".gitignore",
                        ".stillmark/plans/",
                        ".stillmark/learnings/design/overview.md",
                        ".stillmark/learnings/code-style/overview.md"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Privado, nunca vai pro git." },
                    result: "Cria o roadmap, a pasta privada do plano e o arquivo de configurações. A pasta do plano entra no .gitignore e fica só na sua máquina."
                },
                {
                    title: "Ensine o seu editor",
                    say: "Instala pro Cursor.",
                    run: "stillmark install --agent cursor",
                    file: ".cursor/",
                    lines: [
                        ".cursor/",
                        "  commands/stillmark.md",
                        "  skills/stillmark/SKILL.md",
                        "  skills/stillmark/reference/"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Coloca /stillmark no chat." },
                    result: "O editor aprende o comando /stillmark e a skill por trás dele. Claude Code e Codex instalam do mesmo jeito, com --agent claude ou --agent codex."
                },
                {
                    title: "Todos os projetos de uma vez",
                    say: "Faz funcionar em todos os meus projetos.",
                    run: "stillmark install --agent claude --global",
                    file: "~/.claude/",
                    lines: [
                        "~/.claude/",
                        "  commands/stillmark.md",
                        "  skills/stillmark/SKILL.md"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Uma vez, na sua pasta pessoal." },
                    result: "Instala uma vez na sua pasta pessoal. Os projetos deixam de ter cópia própria, a não ser que você use --force."
                },
                {
                    title: "Sempre atualizado",
                    say: "Atualiza o Stillmark.",
                    run: "stillmark update apply",
                    file: "stillmark.config.json",
                    lines: [
                        "\"update\": {",
                        "  \"auto\": true,",
                        "  \"intervalHours\": 24",
                        "}"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Confere uma vez por dia." },
                    result: "O Stillmark procura versão nova sozinho, uma vez por dia. O update apply atualiza os arquivos do agente que você instalou, no projeto e na sua pasta pessoal."
                }
            ],
            commands: [
                { command: "npx stillmark@latest init", description: "Cria o roadmap, a pasta privada do plano e o arquivo de configurações" },
                { command: "npx stillmark@latest init --todos", description: "O mesmo, e já coloca no roadmap os comentários TODO e FIXME que estão no código" },
                { command: "stillmark install --agent cursor|claude|codex", description: "Adiciona o comando /stillmark e a skill ao seu editor" },
                { command: "stillmark install --agent cursor --global", description: "Instala uma vez para todos os projetos deste computador (--force mantém também uma cópia no projeto)" },
                { command: "stillmark update", description: "Procura versão nova de tempos em tempos, uma vez por dia por padrão (--force confere na hora)" },
                { command: "stillmark update apply", description: "Atualiza os arquivos do agente instalados para a versão mais recente" }
            ]
        }
    }
};
