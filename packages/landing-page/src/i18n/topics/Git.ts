import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic 06: commits, commit messages, and pushing.
 */
export const GitTopic: TopicDefinition = {
    id: TopicId.GIT,
    slug: "git",
    group: TopicGroup.WORKFLOW,
    copy: {
        "en-US": {
            label: "Git",
            title: "Commits and pushes, on your terms",
            lead: "Stillmark writes commit messages the way your repo already does, removes the credit lines editors add, and never commits anything you did not decide on. Pushing sends only what is already committed.",
            summary: "Commit messages in your repo's style, no agent credit lines, and pushes that never commit for you.",
            contrast: {
                without: {
                    frame: "git log",
                    lines: [
                        { text: "Updated the webhook retry logic to properly handle 429 errors", tone: ContrastTone.PLAIN },
                        { text: "Co-authored-by: the editor's agent", tone: ContrastTone.BAD },
                        { text: "Also committed a half-finished file you never picked", tone: ContrastTone.BAD }
                    ],
                    caption: "Long messages in a style nobody on the team uses, credit lines, and files you never chose."
                },
                with: {
                    frame: "git log",
                    lines: [
                        { text: "fix(webhooks): retry on 429", tone: ContrastTone.GOOD },
                        { text: "No editor credit lines", tone: ContrastTone.GOOD },
                        { text: "Only what you decided goes into the commit", tone: ContrastTone.GOOD }
                    ],
                    caption: "Messages in your repo's own style, and nothing committed behind your back."
                }
            },
            examples: [
                {
                    title: "Push safely",
                    say: "Push my work.",
                    run: "stillmark git push",
                    file: "terminal",
                    lines: [
                        "Pushed 2 commit(s) of main to origin/main",
                        "1 uncommitted file(s) left out"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "You decide about these." },
                    result: "Only commits you already made are pushed. Files not committed yet are listed so the agent asks you before doing anything with them."
                },
                {
                    title: "Messages in your style",
                    say: "What should this commit say?",
                    run: "stillmark git message-style \"retry webhooks on 429\"",
                    file: "terminal",
                    lines: [
                        "chore: retry webhooks on 429"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Matches your recent commits." },
                    result: "Stillmark reads your recent commit subjects. If the repo uses prefixes like feat: or chore:, the message does too; otherwise it stays plain."
                },
                {
                    title: "No agent credit lines",
                    say: "Keep editor credits out of my commits.",
                    run: "stillmark git hook install",
                    file: "commit message",
                    lines: [
                        "Retry webhooks on 429",
                        "",
                        "Co-authored-by: Cursor <cursoragent@cursor.com>"
                    ],
                    mark: { line: 2, kind: MarkKind.STRIKE, note: "Removed before the commit." },
                    result: "A small git hook removes the co-author and \"made with\" lines that Cursor and Claude add. It is on by default and set up by init."
                },
                {
                    title: "Commit only Stillmark files",
                    say: "Commit the Stillmark setup.",
                    run: "stillmark git setup-commit",
                    file: "staged files",
                    lines: [
                        "stillmark.config.json",
                        "ROADMAP.md",
                        ".gitignore",
                        ".stillmark/plans/"
                    ],
                    mark: { line: 3, kind: MarkKind.STRIKE, note: "Never included." },
                    result: "Commits exactly the Stillmark files that changed, never your private plan, then pushes if automatic push is on."
                }
            ],
            commands: [
                { command: "stillmark git push", description: "Send your commits; anything not committed yet is listed so you decide first" },
                { command: "stillmark git message-style \"…\"", description: "Suggest a commit message in the style of your recent commits" },
                { command: "stillmark git hook install", description: "Remove agent credit lines from every commit message (status and remove also work)" },
                { command: "stillmark git setup-files", description: "List the Stillmark files waiting to be committed" },
                { command: "stillmark git setup-commit --message \"…\"", description: "Commit only those files, then push if automatic push is on" },
                { command: "stillmark config set --auto-push=false", description: "Keep commits on your machine instead of pushing them (pushed by default)" },
                { command: "stillmark config set --strip-attribution=false", description: "Keep the credit lines from Cursor and Claude (removed by default)" }
            ]
        },
        "pt-BR": {
            label: "Git",
            title: "Commits e pushes do seu jeito",
            lead: "O Stillmark escreve mensagens de commit do jeito que o seu repositório já escreve, tira as linhas de crédito que os editores adicionam e nunca faz commit do que você não decidiu. O push envia só o que já está commitado.",
            summary: "Mensagens no estilo do seu repositório, sem crédito do agente, e push que nunca faz commit por você.",
            contrast: {
                without: {
                    frame: "git log",
                    lines: [
                        { text: "Atualizei a lógica de repetição dos webhooks para tratar erros 429", tone: ContrastTone.PLAIN },
                        { text: "Co-authored-by: o agente do editor", tone: ContrastTone.BAD },
                        { text: "Ainda levou um arquivo pela metade que você não escolheu", tone: ContrastTone.BAD }
                    ],
                    caption: "Mensagens longas num estilo que ninguém do time usa, linha de crédito e arquivos que você não escolheu."
                },
                with: {
                    frame: "git log",
                    lines: [
                        { text: "fix(webhooks): repete no erro 429", tone: ContrastTone.GOOD },
                        { text: "Sem linha de crédito do editor", tone: ContrastTone.GOOD },
                        { text: "Só entra no commit o que você decidiu", tone: ContrastTone.GOOD }
                    ],
                    caption: "Mensagens no estilo do seu repositório e nada commitado pelas suas costas."
                }
            },
            examples: [
                {
                    title: "Push com segurança",
                    say: "Manda o meu trabalho.",
                    run: "stillmark git push",
                    file: "terminal",
                    lines: [
                        "Pushed 2 commit(s) of main to origin/main",
                        "1 uncommitted file(s) left out"
                    ],
                    mark: { line: 1, kind: MarkKind.CIRCLE, note: "Você decide sobre estes." },
                    result: "Só os commits que você já fez são enviados. Arquivos ainda sem commit aparecem numa lista, e o agente pergunta antes de fazer qualquer coisa com eles."
                },
                {
                    title: "Mensagens no seu estilo",
                    say: "O que esse commit deve dizer?",
                    run: "stillmark git message-style \"repetir webhooks no 429\"",
                    file: "terminal",
                    lines: [
                        "chore: repetir webhooks no 429"
                    ],
                    mark: { line: 0, kind: MarkKind.CIRCLE, note: "Igual aos seus últimos commits." },
                    result: "O Stillmark lê os assuntos dos seus commits recentes. Se o repositório usa prefixos como feat: ou chore:, a mensagem usa também; se não, fica simples."
                },
                {
                    title: "Sem crédito do agente",
                    say: "Tira os créditos do editor dos meus commits.",
                    run: "stillmark git hook install",
                    file: "mensagem do commit",
                    lines: [
                        "Repetir webhooks no 429",
                        "",
                        "Co-authored-by: Cursor <cursoragent@cursor.com>"
                    ],
                    mark: { line: 2, kind: MarkKind.STRIKE, note: "Removido antes do commit." },
                    result: "Um pequeno gancho do git remove as linhas de coautoria e de \"feito com\" que o Cursor e o Claude adicionam. Vem ligado por padrão e o init já instala."
                },
                {
                    title: "Commit só dos arquivos do Stillmark",
                    say: "Faz o commit da configuração do Stillmark.",
                    run: "stillmark git setup-commit",
                    file: "arquivos no commit",
                    lines: [
                        "stillmark.config.json",
                        "ROADMAP.md",
                        ".gitignore",
                        ".stillmark/plans/"
                    ],
                    mark: { line: 3, kind: MarkKind.STRIKE, note: "Nunca entra." },
                    result: "Faz commit exatamente dos arquivos do Stillmark que mudaram, nunca do seu plano privado, e depois envia se o push automático estiver ligado."
                }
            ],
            commands: [
                { command: "stillmark git push", description: "Envia seus commits; o que ainda não tem commit aparece numa lista para você decidir antes" },
                { command: "stillmark git message-style \"…\"", description: "Sugere uma mensagem de commit no estilo dos seus commits recentes" },
                { command: "stillmark git hook install", description: "Tira as linhas de crédito do agente de toda mensagem de commit (status e remove também funcionam)" },
                { command: "stillmark git setup-files", description: "Lista os arquivos do Stillmark esperando commit" },
                { command: "stillmark git setup-commit --message \"…\"", description: "Faz commit só desses arquivos e envia se o push automático estiver ligado" },
                { command: "stillmark config set --auto-push=false", description: "Mantém os commits na sua máquina em vez de enviar (envia por padrão)" },
                { command: "stillmark config set --strip-attribution=false", description: "Mantém as linhas de crédito do Cursor e do Claude (removidas por padrão)" }
            ]
        }
    }
};
