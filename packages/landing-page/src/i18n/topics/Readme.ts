import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 08: writing and checking README files from project facts.
 */
export const ReadmeTopic: TopicDefinition = {
    id: TopicId.README,
    slug: "readme",
    group: TopicGroup.QUALITY,
    copy: {
        "en-US": {
            label: "README",
            title: "A README that matches the project",
            lead: "Stillmark reads what is really in the project, like scripts, environment variables, license, and docs, and builds the README from that. It then checks the result for commands that do not exist and facts that got lost.",
            summary: "Write or rework a README from real project facts, then check it for mistakes.",
            contrast: {
                without: {
                    frame: "README.md written by the agent",
                    lines: [
                        { text: "Run it with npm run serve", tone: ContrastTone.PLAIN },
                        { text: "That script does not exist", tone: ContrastTone.BAD },
                        { text: "The required API_KEY is never mentioned", tone: ContrastTone.BAD },
                        { text: "License: MIT (the project is Apache)", tone: ContrastTone.BAD }
                    ],
                    caption: "A README written from memory reads well and gets the facts wrong."
                },
                with: {
                    frame: "README.md",
                    lines: [
                        { text: "Run it with npm run dev, taken from package.json", tone: ContrastTone.GOOD },
                        { text: "API_KEY listed with the other settings", tone: ContrastTone.GOOD },
                        { text: "License: Apache-2.0, read from the project", tone: ContrastTone.GOOD }
                    ],
                    caption: "Built from what is really in the project, then checked for commands that do not exist."
                }
            },
            examples: [
                {
                    title: "Pick a layout",
                    say: "Which README layouts can I use?",
                    run: "stillmark readme templates",
                    file: "terminal",
                    lines: [
                        "app-root · package · cli",
                        "standard · showcase · makeareadme",
                        "funnel · service · minimal"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Nine to choose from." },
                    result: "Nine proven layouts, from a full app root to a minimal package. If you do not pick, one is suggested and the agent asks you first."
                },
                {
                    title: "Write it from facts",
                    say: "Write a README for this package.",
                    run: "stillmark readme plan --template=package",
                    file: "README.md",
                    lines: [
                        "# @acme/billing",
                        "## Overview",
                        "## Run",
                        "## Environment",
                        "## License"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "From your .env.example." },
                    result: "The outline is filled with what the project really has. The old README is saved first so you can bring it back."
                },
                {
                    title: "Check before you commit",
                    say: "Check the README.",
                    run: "stillmark readme check",
                    file: "README.md",
                    lines: [
                        "## Development",
                        "npm run deploy:prod",
                        "See the [setup guide](docs/setup.md)"
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "No such script." },
                    result: "Flags commands the project does not have, broken links, unfinished text, missing sections, and facts the old README had that are gone."
                }
            ],
            commands: [
                { command: "stillmark readme templates", description: "List the nine README layouts" },
                { command: "stillmark readme plan --template=<id>", description: "Start a README from the project's real facts (the old one is kept)" },
                { command: "stillmark readme check", description: "Find unknown commands, broken links, unfinished text, and lost facts" },
                { command: "stillmark readme restore", description: "Bring back the README as it was before" }
            ]
        },
        "pt-BR": {
            label: "README",
            title: "Um README fiel ao projeto",
            lead: "O Stillmark lê o que existe de verdade no projeto, como scripts, variáveis de ambiente, licença e documentação, e monta o README a partir disso. Depois confere se ficou algum comando que não existe ou informação perdida.",
            summary: "Escreva ou refaça um README com fatos reais do projeto e confira os erros.",
            contrast: {
                without: {
                    frame: "README.md escrito pelo agente",
                    lines: [
                        { text: "Rode com npm run serve", tone: ContrastTone.PLAIN },
                        { text: "Esse script não existe", tone: ContrastTone.BAD },
                        { text: "A API_KEY obrigatória nem aparece", tone: ContrastTone.BAD },
                        { text: "Licença: MIT (o projeto é Apache)", tone: ContrastTone.BAD }
                    ],
                    caption: "Um README escrito de cabeça fica bonito e erra os fatos."
                },
                with: {
                    frame: "README.md",
                    lines: [
                        { text: "Rode com npm run dev, tirado do package.json", tone: ContrastTone.GOOD },
                        { text: "API_KEY listada junto com as outras configurações", tone: ContrastTone.GOOD },
                        { text: "Licença: Apache-2.0, lida do projeto", tone: ContrastTone.GOOD }
                    ],
                    caption: "Montado com o que existe de verdade no projeto e conferido contra comandos que não existem."
                }
            },
            examples: [
                {
                    title: "Escolha um formato",
                    say: "Quais formatos de README eu posso usar?",
                    run: "stillmark readme templates",
                    file: "terminal",
                    lines: [
                        "app-root · package · cli",
                        "standard · showcase · makeareadme",
                        "funnel · service · minimal"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Nove para escolher." },
                    result: "Nove formatos testados, do app completo ao pacote mínimo. Se você não escolher, um é sugerido e o agente pergunta antes."
                },
                {
                    title: "Escreva com fatos",
                    say: "Escreve um README para este pacote.",
                    run: "stillmark readme plan --template=package",
                    file: "README.md",
                    lines: [
                        "# @acme/billing",
                        "## Overview",
                        "## Run",
                        "## Environment",
                        "## License"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Vindo do seu .env.example." },
                    result: "O roteiro é preenchido com o que o projeto realmente tem. O README antigo é guardado antes, para você poder voltar."
                },
                {
                    title: "Confira antes do commit",
                    say: "Confere o README.",
                    run: "stillmark readme check",
                    file: "README.md",
                    lines: [
                        "## Development",
                        "npm run deploy:prod",
                        "See the [setup guide](docs/setup.md)"
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Esse script não existe." },
                    result: "Aponta comandos que o projeto não tem, links quebrados, texto inacabado, seções faltando e informações do README antigo que sumiram."
                }
            ],
            commands: [
                { command: "stillmark readme templates", description: "Lista os nove formatos de README" },
                { command: "stillmark readme plan --template=<id>", description: "Começa um README com os fatos reais do projeto (o antigo é guardado)" },
                { command: "stillmark readme check", description: "Encontra comandos desconhecidos, links quebrados, texto inacabado e informações perdidas" },
                { command: "stillmark readme restore", description: "Traz de volta o README como estava antes" }
            ]
        }
    }
};
