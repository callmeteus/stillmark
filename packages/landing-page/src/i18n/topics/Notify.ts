import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 07: messages on Telegram, Discord, or Slack when the agent stops.
 */
export const NotifyTopic: TopicDefinition = {
    id: TopicId.NOTIFY,
    slug: "notify",
    group: TopicGroup.WORKFLOW,
    copy: {
        "en-US": {
            label: "Notify",
            title: "Know when the agent is done",
            lead: "Get a message on Telegram, Discord, or Slack when the agent finishes, fails, or needs an answer from you. Tokens and links are saved in your home folder, outside every repository.",
            summary: "A message on Telegram, Discord, or Slack when the agent finishes, fails, or needs you.",
            contrast: {
                without: {
                    frame: "Your phone, two hours later",
                    lines: [
                        { text: "No new messages", tone: ContrastTone.PLAIN },
                        { text: "The agent stopped two hours ago", tone: ContrastTone.BAD },
                        { text: "It was waiting for your answer the whole time", tone: ContrastTone.BAD }
                    ],
                    caption: "Most editors can't tell you when the agent stops. You come back and find it stuck on a question."
                },
                with: {
                    frame: "Telegram",
                    lines: [
                        { text: "billing · done: retry on 429 is ready", tone: ContrastTone.GOOD },
                        { text: "zorro · waiting: Can I delete the old table?", tone: ContrastTone.GOOD },
                        { text: "fuzzly · failed: two tests broke", tone: ContrastTone.PLAIN }
                    ],
                    caption: "A message on Telegram, Discord, or Slack the moment it finishes, fails, or needs you."
                }
            },
            examples: [
                {
                    title: "Add a channel",
                    say: "Message me on Telegram when you finish.",
                    run: "stillmark notify add telegram --token=<bot token>",
                    file: "~/.stillmark/notify.json",
                    lines: [
                        "{",
                        "  \"enabled\": true,",
                        "  \"channels\": [",
                        "    { \"type\": \"telegram\", \"token\": \"…\" }",
                        "  ]",
                        "}"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Outside every repository." },
                    result: "Send one message to your bot and the chat is found on its own. Discord and Slack take a webhook link instead of a token."
                },
                {
                    title: "Hear about every stop",
                    say: "Tell me every time you stop.",
                    run: "stillmark notify hook install --agent=cursor",
                    file: "~/.cursor/hooks.json",
                    lines: [
                        "\"stop\": [",
                        "  { \"command\": \"stillmark notify run-hook --agent=cursor\" }",
                        "]"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Runs when the agent stops." },
                    result: "Each time the agent stops you get the project name, whether it finished, failed, or is waiting for you, and the start of its last reply. A reply that ends in a question counts as waiting."
                },
                {
                    title: "Pause for a while",
                    say: "Mute the notifications for today.",
                    run: "stillmark notify off",
                    file: "~/.stillmark/notify.json",
                    lines: [
                        "{",
                        "  \"enabled\": false,"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Paused, channels kept." },
                    result: "Every channel goes quiet without being deleted. notify on brings them back."
                }
            ],
            commands: [
                { command: "stillmark notify", description: "List your channels, with tokens and links hidden" },
                { command: "stillmark notify add telegram --token=<bot token>", description: "Add a Telegram bot; the chat is found after you message it" },
                { command: "stillmark notify add discord|slack|webhook --url=<link>", description: "Add a Discord, Slack, or other webhook channel" },
                { command: "stillmark notify test", description: "Send a test message to each channel (or to one by name)" },
                { command: "stillmark notify off", description: "Pause every channel (on resumes them)" },
                { command: "stillmark notify remove <name>", description: "Delete a channel" },
                { command: "stillmark notify send \"…\" --status=done", description: "Send your own message: done, failed, waiting, or stopped" },
                { command: "stillmark notify hook install --agent=cursor|claude", description: "Send a message every time the agent stops (status and remove also work)" }
            ]
        },
        "pt-BR": {
            label: "Avisos",
            title: "Saiba quando o agente terminou",
            lead: "Receba uma mensagem no Telegram, Discord ou Slack quando o agente terminar, falhar ou precisar de uma resposta sua. Tokens e links ficam guardados na sua pasta pessoal, fora de qualquer repositório.",
            summary: "Uma mensagem no Telegram, Discord ou Slack quando o agente termina, falha ou precisa de você.",
            contrast: {
                without: {
                    frame: "Seu celular, duas horas depois",
                    lines: [
                        { text: "Nenhuma mensagem nova", tone: ContrastTone.PLAIN },
                        { text: "O agente parou há duas horas", tone: ContrastTone.BAD },
                        { text: "Ele estava esperando a sua resposta o tempo todo", tone: ContrastTone.BAD }
                    ],
                    caption: "A maioria dos editores não avisa quando o agente para. Você volta e encontra ele travado numa pergunta."
                },
                with: {
                    frame: "Telegram",
                    lines: [
                        { text: "billing · terminou: repetição no 429 pronta", tone: ContrastTone.GOOD },
                        { text: "zorro · esperando: Posso apagar a tabela antiga?", tone: ContrastTone.GOOD },
                        { text: "fuzzly · falhou: dois testes quebraram", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Uma mensagem no Telegram, Discord ou Slack na hora em que ele termina, falha ou precisa de você."
                }
            },
            examples: [
                {
                    title: "Adicione um canal",
                    say: "Me avisa no Telegram quando terminar.",
                    run: "stillmark notify add telegram --token=<token do bot>",
                    file: "~/.stillmark/notify.json",
                    lines: [
                        "{",
                        "  \"enabled\": true,",
                        "  \"channels\": [",
                        "    { \"type\": \"telegram\", \"token\": \"…\" }",
                        "  ]",
                        "}"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Fora de qualquer repositório." },
                    result: "Mande uma mensagem para o seu bot e a conversa é encontrada sozinha. Discord e Slack usam um link de webhook no lugar do token."
                },
                {
                    title: "Aviso a cada parada",
                    say: "Me avisa toda vez que você parar.",
                    run: "stillmark notify hook install --agent=cursor",
                    file: "~/.cursor/hooks.json",
                    lines: [
                        "\"stop\": [",
                        "  { \"command\": \"stillmark notify run-hook --agent=cursor\" }",
                        "]"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Roda quando o agente para." },
                    result: "Cada vez que o agente para, você recebe o nome do projeto, se ele terminou, falhou ou está esperando você, e o começo da última resposta. Resposta que termina em pergunta conta como esperando."
                },
                {
                    title: "Pausa por um tempo",
                    say: "Silencia os avisos por hoje.",
                    run: "stillmark notify off",
                    file: "~/.stillmark/notify.json",
                    lines: [
                        "{",
                        "  \"enabled\": false,"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Pausado, canais mantidos." },
                    result: "Todos os canais ficam em silêncio sem serem apagados. O notify on traz de volta."
                }
            ],
            commands: [
                { command: "stillmark notify", description: "Lista os seus canais, com tokens e links escondidos" },
                { command: "stillmark notify add telegram --token=<token do bot>", description: "Adiciona um bot do Telegram; a conversa é encontrada depois que você manda uma mensagem para ele" },
                { command: "stillmark notify add discord|slack|webhook --url=<link>", description: "Adiciona um canal do Discord, do Slack ou outro webhook" },
                { command: "stillmark notify test", description: "Manda uma mensagem de teste para cada canal (ou para um, pelo nome)" },
                { command: "stillmark notify off", description: "Pausa todos os canais (on volta a avisar)" },
                { command: "stillmark notify remove <nome>", description: "Apaga um canal" },
                { command: "stillmark notify send \"…\" --status=done", description: "Manda a sua própria mensagem: done, failed, waiting ou stopped" },
                { command: "stillmark notify hook install --agent=cursor|claude", description: "Manda uma mensagem toda vez que o agente para (status e remove também funcionam)" }
            ]
        }
    }
};
