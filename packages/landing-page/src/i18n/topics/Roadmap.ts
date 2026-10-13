import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 02: the shared roadmap in ROADMAP.md.
 */
export const RoadmapTopic: TopicDefinition = {
    id: TopicId.ROADMAP,
    slug: "roadmap",
    group: TopicGroup.PLANNING,
    copy: {
        "en-US": {
            label: "Roadmap",
            title: "The roadmap, shared with the team",
            lead: "ROADMAP.md holds the long-term goals everyone sees in the repo. You say what should change, Stillmark finds the item, keeps its ID and history, and moves only what you asked.",
            summary: "Add, defer, finish, and reprioritize goals in ROADMAP.md without editing markdown.",
            contrast: {
                without: {
                    frame: "Agent chat, three weeks later",
                    lines: [
                        { text: "you: Did we ever plan the billing export?", tone: ContrastTone.PLAIN },
                        { text: "agent: I can't find it. Should I add it?", tone: ContrastTone.PLAIN },
                        { text: "The idea lived in an old chat that's gone", tone: ContrastTone.BAD },
                        { text: "Nobody else on the team ever saw it", tone: ContrastTone.BAD },
                        { text: "Dozens of TODOs sit in the code where nobody looks", tone: ContrastTone.BAD }
                    ],
                    caption: "With no roadmap, goals live in chats that disappear."
                },
                with: {
                    frame: "ROADMAP.md",
                    lines: [
                        { text: "R-014 Billing export · deferred", tone: ContrastTone.GOOD },
                        { text: "R-016 SSO for enterprise · high priority", tone: ContrastTone.GOOD },
                        { text: "R-013 Invoice PDF · done on Oct 11", tone: ContrastTone.GOOD },
                        { text: "R-019 Retry webhooks on 429 · from a FIXME", tone: ContrastTone.GOOD },
                        { text: "In the repo, where the whole team sees it", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Every goal in one shared file, with its ID, priority, and history."
                }
            },
            examples: [
                {
                    title: "Defer an item",
                    say: "Push the billing export out of this milestone.",
                    run: "stillmark roadmap defer \"billing export\"",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-012** Payment retry engine",
                        "## Deferred",
                        "- [ ] **R-014** Billing export",
                        "  priority: medium · status: deferred"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Moved out of this milestone." },
                    result: "The item moves to Deferred with its ID, details, and history intact. Nothing else in the file is touched."
                },
                {
                    title: "Add a goal",
                    say: "Add SSO for enterprise customers, high priority.",
                    run: "stillmark roadmap add \"SSO for enterprise customers\" --priority=high",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-016** SSO for enterprise customers",
                        "  priority: high · status: planned · added: 2026-10-13"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Next ID, dated today." },
                    result: "A new item gets the next free ID and today's date. Details and acceptance criteria can go below it."
                },
                {
                    title: "Record shipped work",
                    say: "Invoice PDF shipped in a1b2c3d.",
                    run: "stillmark roadmap done \"invoice PDF\" --commit=a1b2c3d",
                    file: "ROADMAP.md",
                    lines: [
                        "## Done",
                        "- [x] **R-013** Invoice PDF generation",
                        "  priority: medium · status: done · done: 2026-10-11"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Dated by the commit." },
                    result: "The item is checked and moved to Done, dated by the day that commit was made, not by today."
                },
                {
                    title: "Collect the TODOs in your code",
                    say: "Put the TODOs from the code on the roadmap.",
                    run: "stillmark roadmap todos --add",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-019** Retry failed webhooks on 429",
                        "  priority: high · status: planned · added: 2026-10-13",
                        "- [ ] **R-020** Cache the currency lookup",
                        "  priority: medium · status: planned · added: 2026-10-13"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "From a FIXME, so high priority." },
                    result: "Every TODO and FIXME comment left in the code becomes a Backlog item, FIXME as high priority. Ones already on the roadmap and anything that looks like a secret are left out, so running it again adds nothing. Without --add it only lists them, and stillmark init --todos does it while setting up."
                },
                {
                    title: "Keep secrets out",
                    say: "Add: rotate the token sk-live-4f9a on the billing server.",
                    run: "stillmark roadmap add \"Rotate token sk-live-4f9a\"",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-017** Rotate token sk-live-4f9a"
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Refused: looks like a secret." },
                    result: "The roadmap is shared, so anything that looks like a password, key, email address, or private network address is refused before it is written. --allow-sensitive lets it through on purpose."
                },
                {
                    title: "No duplicates",
                    say: "Put the billing export on the roadmap.",
                    run: "stillmark roadmap add \"Billing export\"",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-018** Billing export"
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Already there as R-014." },
                    result: "An item that matches one already on the roadmap is refused, and the answer points to the existing one."
                }
            ],
            commands: [
                { command: "stillmark roadmap", description: "Show the roadmap" },
                { command: "stillmark roadmap add \"…\" --priority=high", description: "Add an item, with optional details and acceptance criteria" },
                { command: "stillmark roadmap add \"…\" --done --commit=<sha>", description: "Record work that already shipped, dated by the commit that delivered it" },
                { command: "stillmark roadmap done \"…\"", description: "Mark an item as done (--commit or --date sets the day)" },
                { command: "stillmark roadmap defer \"…\"", description: "Move an item to Deferred" },
                { command: "stillmark roadmap todos", description: "List the TODO and FIXME comments in the code and which ones the roadmap already has" },
                { command: "stillmark roadmap todos --add", description: "Put every new TODO and FIXME comment on the roadmap" },
                { command: "stillmark roadmap priority \"…\" <level>", description: "Change priority: critical, high, medium, or low" },
                { command: "stillmark add \"…\"", description: "Let Stillmark decide whether it belongs on the roadmap or in the current plan" },
                { command: "stillmark classify \"…\"", description: "Ask where a request belongs without writing anything" },
                { command: "stillmark config set --roadmap-dates=false", description: "Stop adding dates to roadmap items (on by default)" }
            ]
        },
        "pt-BR": {
            label: "Roadmap",
            title: "O roadmap, compartilhado com o time",
            lead: "O ROADMAP.md guarda os objetivos de longo prazo que todos veem no repositório. Você diz o que deve mudar, o Stillmark encontra o item, mantém o ID e o histórico e mexe só no que você pediu.",
            summary: "Adicione, adie, conclua e mude a prioridade de objetivos no ROADMAP.md sem editar markdown.",
            contrast: {
                without: {
                    frame: "Chat com o agente, três semanas depois",
                    lines: [
                        { text: "você: A gente chegou a planejar a exportação de cobrança?", tone: ContrastTone.PLAIN },
                        { text: "agente: Não encontrei. Quer que eu adicione?", tone: ContrastTone.PLAIN },
                        { text: "A ideia ficou num chat antigo que já sumiu", tone: ContrastTone.BAD },
                        { text: "Ninguém mais do time chegou a ver", tone: ContrastTone.BAD },
                        { text: "Dezenas de TODOs parados no código, onde ninguém olha", tone: ContrastTone.BAD }
                    ],
                    caption: "Sem roadmap, os objetivos ficam em chats que desaparecem."
                },
                with: {
                    frame: "ROADMAP.md",
                    lines: [
                        { text: "R-014 Exportação de cobrança · adiado", tone: ContrastTone.GOOD },
                        { text: "R-016 SSO para empresas · prioridade alta", tone: ContrastTone.GOOD },
                        { text: "R-013 PDF da fatura · concluído em 11/10", tone: ContrastTone.GOOD },
                        { text: "R-019 Repetir webhooks no 429 · veio de um FIXME", tone: ContrastTone.GOOD },
                        { text: "No repositório, onde o time inteiro vê", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Todo objetivo num arquivo compartilhado, com ID, prioridade e histórico."
                }
            },
            examples: [
                {
                    title: "Adiar um item",
                    say: "Tira a exportação de cobrança deste marco.",
                    run: "stillmark roadmap defer \"exportação de cobrança\"",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-012** Motor de nova tentativa de pagamento",
                        "## Deferred",
                        "- [ ] **R-014** Exportação de cobrança",
                        "  priority: medium · status: deferred"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Saiu deste marco." },
                    result: "O item vai para Deferred com ID, detalhes e histórico preservados. Nada mais no arquivo é alterado."
                },
                {
                    title: "Adicionar um objetivo",
                    say: "Adiciona SSO para clientes enterprise, prioridade alta.",
                    run: "stillmark roadmap add \"SSO para clientes enterprise\" --priority=high",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-016** SSO para clientes enterprise",
                        "  priority: high · status: planned · added: 2026-10-13"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Próximo ID, com a data de hoje." },
                    result: "O item novo recebe o próximo ID livre e a data de hoje. Detalhes e critérios de aceite podem ficar logo abaixo."
                },
                {
                    title: "Registrar o que já saiu",
                    say: "O PDF da fatura saiu no a1b2c3d.",
                    run: "stillmark roadmap done \"PDF da fatura\" --commit=a1b2c3d",
                    file: "ROADMAP.md",
                    lines: [
                        "## Done",
                        "- [x] **R-013** Geração do PDF da fatura",
                        "  priority: medium · status: done · done: 2026-10-11"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Data do commit." },
                    result: "O item é marcado e vai para Done, com a data do dia daquele commit, não a de hoje."
                },
                {
                    title: "Junte os TODOs do código",
                    say: "Coloca os TODOs do código no roadmap.",
                    run: "stillmark roadmap todos --add",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-019** Repetir webhooks que falharam com 429",
                        "  priority: high · status: planned · added: 2026-10-13",
                        "- [ ] **R-020** Guardar em cache a consulta de moedas",
                        "  priority: medium · status: planned · added: 2026-10-13"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Veio de um FIXME, prioridade alta." },
                    result: "Cada comentário TODO e FIXME deixado no código vira um item do Backlog, com FIXME em prioridade alta. O que já está no roadmap e tudo que parece segredo fica de fora, então rodar de novo não adiciona nada. Sem o --add ele só lista, e o stillmark init --todos faz isso já na configuração."
                },
                {
                    title: "Segredos ficam de fora",
                    say: "Adiciona: trocar o token sk-live-4f9a do servidor de cobrança.",
                    run: "stillmark roadmap add \"Trocar o token sk-live-4f9a\"",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-017** Trocar o token sk-live-4f9a"
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Recusado: parece um segredo." },
                    result: "O roadmap é compartilhado, então tudo que parece senha, chave, e-mail ou endereço de rede privada é recusado antes de ser escrito. O --allow-sensitive libera de propósito."
                },
                {
                    title: "Sem duplicados",
                    say: "Coloca a exportação de cobrança no roadmap.",
                    run: "stillmark roadmap add \"Exportação de cobrança\"",
                    file: "ROADMAP.md",
                    lines: [
                        "## Backlog",
                        "- [ ] **R-018** Exportação de cobrança"
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Já existe como R-014." },
                    result: "Um item igual a outro que já está no roadmap é recusado, e a resposta aponta para o que já existe."
                }
            ],
            commands: [
                { command: "stillmark roadmap", description: "Mostra o roadmap" },
                { command: "stillmark roadmap add \"…\" --priority=high", description: "Adiciona um item, com detalhes e critérios de aceite opcionais" },
                { command: "stillmark roadmap add \"…\" --done --commit=<sha>", description: "Registra algo que já foi entregue, com a data do commit que entregou" },
                { command: "stillmark roadmap done \"…\"", description: "Marca um item como concluído (--commit ou --date define o dia)" },
                { command: "stillmark roadmap defer \"…\"", description: "Move um item para Deferred" },
                { command: "stillmark roadmap todos", description: "Lista os comentários TODO e FIXME do código e quais o roadmap já tem" },
                { command: "stillmark roadmap todos --add", description: "Coloca todo comentário TODO e FIXME novo no roadmap" },
                { command: "stillmark roadmap priority \"…\" <nível>", description: "Muda a prioridade: critical, high, medium ou low" },
                { command: "stillmark add \"…\"", description: "Deixa o Stillmark decidir se vai para o roadmap ou para o plano atual" },
                { command: "stillmark classify \"…\"", description: "Pergunta onde um pedido se encaixa, sem escrever nada" },
                { command: "stillmark config set --roadmap-dates=false", description: "Para de colocar datas nos itens do roadmap (ligado por padrão)" }
            ]
        }
    }
};
