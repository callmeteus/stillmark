import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 03: the private task plan in .stillmark/plans/TASK_PLAN.md.
 */
export const PlanTopic: TopicDefinition = {
    id: TopicId.PLAN,
    slug: "plan",
    group: TopicGroup.PLANNING,
    copy: {
        "en-US": {
            label: "Plan",
            title: "The plan, private on your machine",
            lead: "TASK_PLAN.md is the list of concrete tasks for what you are building right now. It never leaves your computer, so half-finished thinking does not end up in the repo. Stillmark also keeps the work inside the goal you set.",
            summary: "A private task list for the current work, with a goal, a scope, and a checklist.",
            contrast: {
                without: {
                    frame: "Agent chat, two hours in",
                    lines: [
                        { text: "you: Is step 3 done?", tone: ContrastTone.PLAIN },
                        { text: "agent: Which step 3? Let me look again.", tone: ContrastTone.PLAIN },
                        { text: "It also started redesigning the dashboard", tone: ContrastTone.BAD },
                        { text: "A new chat starts from zero", tone: ContrastTone.BAD }
                    ],
                    caption: "Long work drifts off target and is forgotten when the chat starts over."
                },
                with: {
                    frame: "TASK_PLAN.md · only on your computer",
                    lines: [
                        { text: "Goal: webhooks v2 (the dashboard is out)", tone: ContrastTone.PLAIN },
                        { text: "T-001 Sign webhook payloads · done", tone: ContrastTone.GOOD },
                        { text: "T-002 Retry on 429 · in progress", tone: ContrastTone.GOOD },
                        { text: "Dashboard redesign: out of scope, asks you first", tone: ContrastTone.GOOD }
                    ],
                    caption: "A private checklist the agent picks up where it stopped, inside the goal you set."
                }
            },
            examples: [
                {
                    title: "Set the goal",
                    say: "Start a plan for webhooks v2. The dashboard is not part of it.",
                    run: "stillmark plan init \"Webhooks v2\" --out-of-scope \"Dashboard\"",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "## Objective",
                        "Webhooks v2",
                        "## Scope",
                        "### Out of scope",
                        "- Dashboard"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Stays on your machine." },
                    result: "The plan starts with one goal and what stays out of it. The file lives in a folder git ignores."
                },
                {
                    title: "Add a task",
                    say: "Add a task to retry webhooks on 429.",
                    run: "stillmark plan add \"Retry on HTTP 429\" --priority=high",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "### T-007 Retry on HTTP 429",
                        "status: pending",
                        "priority: high"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Added, private." },
                    result: "The task gets the next ID, a status, and a priority. Acceptance criteria and checks can go below it."
                },
                {
                    title: "Stay on target",
                    say: "Also redesign the dashboard.",
                    run: "stillmark plan add \"Redesign the dashboard\"",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "### T-008 Redesign the dashboard"
                    ],
                    mark: { line: 0, kind: MarkKind.STRIKE, note: "Out of scope: asks you first." },
                    result: "Work outside the goal is stopped and the agent asks you. Once you agree, --accept-scope-change adds it."
                },
                {
                    title: "Finish a task",
                    say: "Signing is finished.",
                    run: "stillmark plan done \"sign payloads\"",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "## Checklist",
                        "- [x] T-006 - Sign payloads",
                        "- [ ] T-007 - Retry on HTTP 429"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Checked at the end of the plan." },
                    result: "The task is marked done and the checklist at the end of the plan is rebuilt, so you see progress at a glance."
                },
                {
                    title: "Pull from the roadmap",
                    say: "Bring the billing export into this plan.",
                    run: "stillmark move \"billing export\" to plan --confirm",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "### T-009 Billing export",
                        "status: pending-approval"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Waits for your OK." },
                    result: "The roadmap item becomes a task waiting for your approval, and the roadmap keeps a note pointing to it."
                }
            ],
            commands: [
                { command: "stillmark plan", description: "Show the current plan" },
                { command: "stillmark plan init \"<objective>\"", description: "Start the plan for what you are building now" },
                { command: "stillmark plan scope --in-scope \"…\" --out-of-scope \"…\"", description: "Set what is in and what stays out (--objective changes the goal, --replace starts over)" },
                { command: "stillmark plan add \"…\" --priority=high", description: "Add a task (--phase groups it, --accept-scope-change allows work outside the goal)" },
                { command: "stillmark plan done \"…\"", description: "Finish a task and check it in the checklist" },
                { command: "stillmark plan status \"…\" <status>", description: "Set pending, pending-approval, in-progress, blocked, done, or cancelled" },
                { command: "stillmark plan phase \"…\" <phase>", description: "Group a task under a phase in the checklist" },
                { command: "stillmark plan priority \"…\" <level>", description: "Change a task's priority" },
                { command: "stillmark plan blocked \"…\" \"<reason>\"", description: "Mark a task as blocked and say why" },
                { command: "stillmark move \"…\" to plan --confirm", description: "Bring a roadmap item into the plan" },
                { command: "stillmark move \"…\" to roadmap --confirm", description: "Send a task back to the roadmap" },
                { command: "stillmark long-running apply \"…\"", description: "Save an approved plan change during long work so it can continue safely" }
            ]
        },
        "pt-BR": {
            label: "Plano",
            title: "O plano, privado na sua máquina",
            lead: "O TASK_PLAN.md é a lista de tarefas concretas do que você está construindo agora. Ele nunca sai do seu computador, então ideias pela metade não vão parar no repositório. O Stillmark também mantém o trabalho dentro do objetivo que você definiu.",
            summary: "Uma lista privada de tarefas do trabalho atual, com objetivo, escopo e checklist.",
            contrast: {
                without: {
                    frame: "Chat com o agente, duas horas depois",
                    lines: [
                        { text: "você: O passo 3 já foi?", tone: ContrastTone.PLAIN },
                        { text: "agente: Qual passo 3? Vou olhar de novo.", tone: ContrastTone.PLAIN },
                        { text: "Ele também começou a redesenhar o painel", tone: ContrastTone.BAD },
                        { text: "Um chat novo começa do zero", tone: ContrastTone.BAD }
                    ],
                    caption: "Trabalho longo sai do alvo e é esquecido quando o chat recomeça."
                },
                with: {
                    frame: "TASK_PLAN.md · só no seu computador",
                    lines: [
                        { text: "Objetivo: webhooks v2 (o painel não entra)", tone: ContrastTone.PLAIN },
                        { text: "T-001 Assinar os webhooks · concluída", tone: ContrastTone.GOOD },
                        { text: "T-002 Repetir no erro 429 · em andamento", tone: ContrastTone.GOOD },
                        { text: "Redesenho do painel: fora do escopo, pergunta antes", tone: ContrastTone.GOOD }
                    ],
                    caption: "Um checklist privado que o agente retoma de onde parou, dentro do objetivo que você definiu."
                }
            },
            examples: [
                {
                    title: "Defina o objetivo",
                    say: "Começa um plano para os webhooks v2. O painel não entra.",
                    run: "stillmark plan init \"Webhooks v2\" --out-of-scope \"Painel\"",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "## Objective",
                        "Webhooks v2",
                        "## Scope",
                        "### Out of scope",
                        "- Painel"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Fica na sua máquina." },
                    result: "O plano começa com um objetivo e o que fica de fora. O arquivo mora numa pasta que o git ignora."
                },
                {
                    title: "Adicione uma tarefa",
                    say: "Adiciona uma tarefa para repetir os webhooks no erro 429.",
                    run: "stillmark plan add \"Repetir no HTTP 429\" --priority=high",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "### T-007 Repetir no HTTP 429",
                        "status: pending",
                        "priority: high"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Adicionada, privada." },
                    result: "A tarefa recebe o próximo ID, um status e uma prioridade. Critérios de aceite e verificações podem ficar logo abaixo."
                },
                {
                    title: "Sem desviar do alvo",
                    say: "Aproveita e redesenha o painel.",
                    run: "stillmark plan add \"Redesenhar o painel\"",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "### T-008 Redesenhar o painel"
                    ],
                    mark: { line: 0, kind: MarkKind.STRIKE, note: "Fora do escopo: pergunta antes." },
                    result: "Trabalho fora do objetivo é barrado e o agente pergunta a você. Se você concordar, o --accept-scope-change adiciona."
                },
                {
                    title: "Conclua uma tarefa",
                    say: "A assinatura terminou.",
                    run: "stillmark plan done \"assinar payloads\"",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "## Checklist",
                        "- [x] T-006 - Assinar payloads",
                        "- [ ] T-007 - Repetir no HTTP 429"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Marcada no fim do plano." },
                    result: "A tarefa fica como concluída e o checklist no fim do plano é refeito, para você ver o progresso de relance."
                },
                {
                    title: "Traga do roadmap",
                    say: "Traz a exportação de cobrança para este plano.",
                    run: "stillmark move \"exportação de cobrança\" to plan --confirm",
                    file: ".stillmark/plans/TASK_PLAN.md",
                    lines: [
                        "### T-009 Exportação de cobrança",
                        "status: pending-approval"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Espera o seu ok." },
                    result: "O item do roadmap vira uma tarefa esperando a sua aprovação, e o roadmap guarda uma nota apontando para ela."
                }
            ],
            commands: [
                { command: "stillmark plan", description: "Mostra o plano atual" },
                { command: "stillmark plan init \"<objetivo>\"", description: "Começa o plano do que você está construindo agora" },
                { command: "stillmark plan scope --in-scope \"…\" --out-of-scope \"…\"", description: "Define o que entra e o que fica de fora (--objective muda o objetivo, --replace recomeça)" },
                { command: "stillmark plan add \"…\" --priority=high", description: "Adiciona uma tarefa (--phase agrupa, --accept-scope-change aceita trabalho fora do objetivo)" },
                { command: "stillmark plan done \"…\"", description: "Conclui uma tarefa e marca no checklist" },
                { command: "stillmark plan status \"…\" <status>", description: "Define pending, pending-approval, in-progress, blocked, done ou cancelled" },
                { command: "stillmark plan phase \"…\" <fase>", description: "Agrupa uma tarefa numa fase do checklist" },
                { command: "stillmark plan priority \"…\" <nível>", description: "Muda a prioridade de uma tarefa" },
                { command: "stillmark plan blocked \"…\" \"<motivo>\"", description: "Marca uma tarefa como bloqueada e diz por quê" },
                { command: "stillmark move \"…\" to plan --confirm", description: "Traz um item do roadmap para o plano" },
                { command: "stillmark move \"…\" to roadmap --confirm", description: "Devolve uma tarefa para o roadmap" },
                { command: "stillmark long-running apply \"…\"", description: "Salva uma mudança aprovada no plano durante um trabalho longo, para ele continuar com segurança" }
            ]
        }
    }
};
