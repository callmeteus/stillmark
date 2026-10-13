import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 04: the test checklist in COVERAGE.md.
 */
export const CoverageTopic: TopicDefinition = {
    id: TopicId.COVERAGE,
    slug: "coverage",
    group: TopicGroup.PLANNING,
    copy: {
        "en-US": {
            label: "Coverage",
            title: "The test checklist",
            lead: "COVERAGE.md lists what should be tested, grouped by area and file. Each case is one checkbox tagged happy, sad, edge, or security. No percentages, just what is covered and what is still missing.",
            summary: "Track which test cases exist and which are missing, one checkbox per case.",
            contrast: {
                without: {
                    frame: "Agent chat, before a release",
                    lines: [
                        { text: "you: Is account lockout tested?", tone: ContrastTone.PLAIN },
                        { text: "agent: I think so. Let me search the tests.", tone: ContrastTone.PLAIN },
                        { text: "Nobody knows which cases are missing", tone: ContrastTone.BAD },
                        { text: "A good-looking percentage hides the gap", tone: ContrastTone.BAD }
                    ],
                    caption: "Without a checklist, you find the missing test when the bug shows up."
                },
                with: {
                    frame: "COVERAGE.md",
                    lines: [
                        { text: "Lockout after 5 tries · sad · tested", tone: ContrastTone.GOOD },
                        { text: "Login with the right password · happy · tested", tone: ContrastTone.GOOD },
                        { text: "Invoice with zero items · edge · missing", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Every case is one checkbox, so what is missing shows at a glance."
                }
            },
            examples: [
                {
                    title: "Check a case",
                    say: "The lockout case is tested now.",
                    run: "stillmark coverage check \"lockout\"",
                    file: "COVERAGE.md",
                    lines: [
                        "### `src/auth/Login.ts`",
                        "- [x] [happy] login with a valid password",
                        "- [x] [sad] lockout after 5 failed tries",
                        "- [ ] [edge] expired session"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Checked." },
                    result: "The case that matches your words is checked. Nothing else moves."
                },
                {
                    title: "Add a missing case",
                    say: "We still need a test for an invoice with zero items.",
                    run: "stillmark coverage add \"Invoice.ts\" \"invoice with zero items\" --tag=edge",
                    file: "COVERAGE.md",
                    lines: [
                        "### `src/billing/Invoice.ts`",
                        "- [x] [happy] total with tax",
                        "- [ ] [edge] invoice with zero items"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Added, still missing." },
                    result: "The case lands under the right file, unchecked, so everyone sees it is still to do."
                },
                {
                    title: "Catch up with the code",
                    say: "What changed since the checklist was last updated?",
                    run: "stillmark coverage update",
                    file: "terminal",
                    lines: [
                        "Changed paths (relevant for coverage first)",
                        "M  tests/billing/Invoice.test.ts",
                        "M  src/billing/Invoice.ts"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "The agent reviews these." },
                    result: "Lists the source and test files changed since COVERAGE.md was last committed, tests first, so the agent knows what to check or add."
                },
                {
                    title: "Keep the format clean",
                    say: "Is the checklist well formed?",
                    run: "stillmark coverage validate",
                    file: "COVERAGE.md",
                    lines: [
                        "## Billing",
                        "- [ ] [edge] invoice with zero items"
                    ],
                    mark: { line: 0, kind: MarkKind.STRIKE, note: "Needs a number: ## 2. Billing" },
                    result: "Format mistakes are reported with their line number and the check fails, so they are caught before a commit."
                }
            ],
            commands: [
                { command: "stillmark coverage init", description: "Create a starter COVERAGE.md" },
                { command: "stillmark coverage check \"…\"", description: "Check off the case that matches your words" },
                { command: "stillmark coverage uncheck \"…\"", description: "Uncheck a case" },
                { command: "stillmark coverage add \"<heading>\" \"…\" --tag=edge", description: "Add a case under a heading, tagged happy, sad, edge, or security (--checked if it already exists)" },
                { command: "stillmark coverage update", description: "List the files changed since COVERAGE.md was last committed" },
                { command: "stillmark coverage summary", description: "Count checked and missing cases" },
                { command: "stillmark coverage validate", description: "Check the format and fail on mistakes" },
                { command: "/stillmark coverage", description: "In chat: show help without changing anything" },
                { command: "/stillmark coverage <text>", description: "In chat: edit the checklist in plain language" }
            ]
        },
        "pt-BR": {
            label: "Cobertura",
            title: "O checklist de testes",
            lead: "O COVERAGE.md lista o que deve ser testado, agrupado por área e por arquivo. Cada caso é uma caixinha marcada como happy, sad, edge ou security. Sem porcentagens, só o que está coberto e o que ainda falta.",
            summary: "Acompanhe quais casos de teste existem e quais faltam, uma caixinha por caso.",
            contrast: {
                without: {
                    frame: "Chat com o agente, antes de lançar",
                    lines: [
                        { text: "você: O bloqueio de conta está testado?", tone: ContrastTone.PLAIN },
                        { text: "agente: Acho que sim. Vou procurar nos testes.", tone: ContrastTone.PLAIN },
                        { text: "Ninguém sabe quais casos faltam", tone: ContrastTone.BAD },
                        { text: "Uma porcentagem bonita esconde o buraco", tone: ContrastTone.BAD }
                    ],
                    caption: "Sem checklist, você descobre o teste que faltava quando o bug aparece."
                },
                with: {
                    frame: "COVERAGE.md",
                    lines: [
                        { text: "Bloqueio após 5 tentativas · sad · testado", tone: ContrastTone.GOOD },
                        { text: "Login com a senha certa · happy · testado", tone: ContrastTone.GOOD },
                        { text: "Fatura sem nenhum item · edge · falta", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Cada caso é uma caixinha, então o que falta aparece de cara."
                }
            },
            examples: [
                {
                    title: "Marque um caso",
                    say: "O caso do bloqueio está testado agora.",
                    run: "stillmark coverage check \"bloqueio\"",
                    file: "COVERAGE.md",
                    lines: [
                        "### `src/auth/Login.ts`",
                        "- [x] [happy] login com senha válida",
                        "- [x] [sad] bloqueio após 5 tentativas erradas",
                        "- [ ] [edge] sessão expirada"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Marcado." },
                    result: "O caso que bate com as suas palavras é marcado. Nada mais muda."
                },
                {
                    title: "Adicione um caso que falta",
                    say: "Ainda falta um teste para fatura sem nenhum item.",
                    run: "stillmark coverage add \"Invoice.ts\" \"fatura sem nenhum item\" --tag=edge",
                    file: "COVERAGE.md",
                    lines: [
                        "### `src/billing/Invoice.ts`",
                        "- [x] [happy] total com imposto",
                        "- [ ] [edge] fatura sem nenhum item"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Adicionado, ainda falta." },
                    result: "O caso entra embaixo do arquivo certo, desmarcado, para todo mundo ver que ainda está por fazer."
                },
                {
                    title: "Acompanhe o código",
                    say: "O que mudou desde a última atualização do checklist?",
                    run: "stillmark coverage update",
                    file: "terminal",
                    lines: [
                        "Changed paths (relevant for coverage first)",
                        "M  tests/billing/Invoice.test.ts",
                        "M  src/billing/Invoice.ts"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "O agente revisa estes." },
                    result: "Lista os arquivos de código e de teste que mudaram desde o último commit do COVERAGE.md, testes primeiro, para o agente saber o que marcar ou adicionar."
                },
                {
                    title: "Formato sempre certo",
                    say: "O checklist está no formato certo?",
                    run: "stillmark coverage validate",
                    file: "COVERAGE.md",
                    lines: [
                        "## Cobrança",
                        "- [ ] [edge] fatura sem nenhum item"
                    ],
                    mark: { line: 0, kind: MarkKind.STRIKE, note: "Falta o número: ## 2. Cobrança" },
                    result: "Erros de formato aparecem com o número da linha e a verificação falha, para serem pegos antes do commit."
                }
            ],
            commands: [
                { command: "stillmark coverage init", description: "Cria um COVERAGE.md inicial" },
                { command: "stillmark coverage check \"…\"", description: "Marca o caso que bate com as suas palavras" },
                { command: "stillmark coverage uncheck \"…\"", description: "Desmarca um caso" },
                { command: "stillmark coverage add \"<título>\" \"…\" --tag=edge", description: "Adiciona um caso embaixo de um título, como happy, sad, edge ou security (--checked se o teste já existe)" },
                { command: "stillmark coverage update", description: "Lista os arquivos que mudaram desde o último commit do COVERAGE.md" },
                { command: "stillmark coverage summary", description: "Conta os casos marcados e os que faltam" },
                { command: "stillmark coverage validate", description: "Confere o formato e falha se houver erro" },
                { command: "/stillmark coverage", description: "No chat: mostra a ajuda sem mudar nada" },
                { command: "/stillmark coverage <texto>", description: "No chat: edita o checklist em linguagem simples" }
            ]
        }
    }
};
