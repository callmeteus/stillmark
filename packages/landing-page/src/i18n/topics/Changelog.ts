import { ContrastTone, MarkKind, TopicGroup, TopicId, type TopicDefinition } from "./TopicContent";

/**
 * Guide topic: the public CHANGELOG.md built from releases, finished roadmap items, and commits.
 */
export const ChangelogTopic: TopicDefinition = {
    id: TopicId.CHANGELOG,
    slug: "changelog",
    group: TopicGroup.QUALITY,
    copy: {
        "en-US": {
            label: "Changelog",
            title: "A changelog your users can read",
            lead: "CHANGELOG.md tells the people who use your project what changed in each version. Stillmark builds it from your past releases and finished roadmap items, adds new work as it is finished, and never rewrites what was already released.",
            summary: "Build CHANGELOG.md from your history and keep it current as work is finished.",
            contrast: {
                without: {
                    frame: "Release notes, the night before",
                    lines: [
                        { text: "v1.4: various fixes and improvements", tone: ContrastTone.PLAIN },
                        { text: "Nobody remembers what shipped since v1.3", tone: ContrastTone.BAD },
                        { text: "The commit log is full of wip and refactor", tone: ContrastTone.BAD }
                    ],
                    caption: "Without a changelog, users never learn what changed, and writing one later means digging through months of commits."
                },
                with: {
                    frame: "CHANGELOG.md",
                    lines: [
                        { text: "1.4.0 · Oct 13 · Invoices download as PDF", tone: ContrastTone.GOOD },
                        { text: "Fixed: wrong totals on the invoice page", tone: ContrastTone.GOOD },
                        { text: "Built from your releases and finished roadmap items", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Every version with its date, in words your users understand, updated as work is finished."
                }
            },
            examples: [
                {
                    title: "Start from your history",
                    say: "Create a changelog from what we already shipped.",
                    run: "stillmark changelog sync",
                    file: "CHANGELOG.md",
                    lines: [
                        "## [Unreleased]",
                        "### Added",
                        "- Dark mode",
                        "## [1.3.0] - 2026-09-02",
                        "### Added",
                        "- Invoices download as PDF"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Dated by the release." },
                    result: "Versions come from your release tags, or from version changes in package.json. Each one lists the roadmap items finished before it, or its feature and fix commits when the roadmap has none."
                },
                {
                    title: "Finished work shows up by itself",
                    say: "The dark mode is done.",
                    run: "stillmark roadmap done \"dark mode\"",
                    file: "CHANGELOG.md",
                    lines: [
                        "## [Unreleased]",
                        "### Added",
                        "- Dark mode"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Listed when it was finished." },
                    result: "Once the project has a changelog, finishing a roadmap item also lists it under Unreleased. After you tag the next version, the next update moves it into that version."
                },
                {
                    title: "Released entries stay as written",
                    say: "Update the changelog.",
                    run: "stillmark changelog sync",
                    file: "CHANGELOG.md",
                    lines: [
                        "## [1.3.0] - 2026-09-02",
                        "### Added",
                        "- Download invoices as a spreadsheet"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Your wording, kept." },
                    result: "Only new versions and new entries are added. Versions already listed are never rewritten, so wording you improved by hand stays."
                },
                {
                    title: "Check before you release",
                    say: "Check the changelog.",
                    run: "stillmark changelog check",
                    file: "CHANGELOG.md",
                    lines: [
                        "### Fixed",
                        "- Updated src/core/Auth.ts"
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Reads like code, not a change." },
                    result: "Flags file names, setting names, and anything that looks like a password or an email address, plus versions without a date or out of order."
                }
            ],
            commands: [
                { command: "stillmark changelog", description: "Preview what an update would add, without writing anything" },
                { command: "stillmark changelog sync", description: "Create the changelog from your history, or add what is new" },
                { command: "stillmark changelog add \"…\" --group=fixed", description: "Add a change yourself: added, changed, fixed, removed, deprecated, or security" },
                { command: "stillmark changelog check", description: "Find missing dates, versions out of order, technical wording, and secrets" },
                { command: "stillmark config set --language=pt-BR --module=changelog", description: "Write the changelog in another language" }
            ]
        },
        "pt-BR": {
            label: "Changelog",
            title: "Um changelog que os usuários entendem",
            lead: "O CHANGELOG.md conta para quem usa o projeto o que mudou em cada versão. O Stillmark monta o arquivo a partir das versões que já saíram e dos itens concluídos do roadmap, acrescenta o que for sendo terminado e nunca reescreve o que já foi lançado.",
            summary: "Monte o CHANGELOG.md a partir do histórico e mantenha em dia conforme o trabalho termina.",
            contrast: {
                without: {
                    frame: "Notas da versão, na noite anterior",
                    lines: [
                        { text: "v1.4: correções e melhorias diversas", tone: ContrastTone.PLAIN },
                        { text: "Ninguém lembra o que saiu desde a v1.3", tone: ContrastTone.BAD },
                        { text: "O histórico de commits é só wip e refactor", tone: ContrastTone.BAD }
                    ],
                    caption: "Sem changelog, os usuários nunca sabem o que mudou, e escrever um depois significa revirar meses de commits."
                },
                with: {
                    frame: "CHANGELOG.md",
                    lines: [
                        { text: "1.4.0 · 13/10 · Faturas baixam em PDF", tone: ContrastTone.GOOD },
                        { text: "Corrigido: totais errados na página da fatura", tone: ContrastTone.GOOD },
                        { text: "Montado com as suas versões e os itens concluídos do roadmap", tone: ContrastTone.PLAIN }
                    ],
                    caption: "Cada versão com a sua data, em palavras que os usuários entendem, atualizado conforme o trabalho termina."
                }
            },
            examples: [
                {
                    title: "Comece pelo histórico",
                    say: "Cria um changelog com o que a gente já entregou.",
                    run: "stillmark changelog sync",
                    file: "CHANGELOG.md",
                    lines: [
                        "## [Unreleased]",
                        "### Added",
                        "- Modo escuro",
                        "## [1.3.0] - 2026-09-02",
                        "### Added",
                        "- Faturas baixam em PDF"
                    ],
                    mark: { line: 3, kind: MarkKind.CIRCLE, note: "Data da versão." },
                    result: "As versões vêm das tags de release ou das mudanças de versão no package.json. Cada uma lista os itens do roadmap concluídos antes dela, ou os commits de novidade e correção quando o roadmap não tem nenhum."
                },
                {
                    title: "O que termina entra sozinho",
                    say: "O modo escuro está pronto.",
                    run: "stillmark roadmap done \"modo escuro\"",
                    file: "CHANGELOG.md",
                    lines: [
                        "## [Unreleased]",
                        "### Added",
                        "- Modo escuro"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "Entrou quando foi concluído." },
                    result: "Quando o projeto já tem changelog, concluir um item do roadmap também coloca ele em Unreleased. Depois que você marca a próxima versão, a próxima atualização leva o item para ela."
                },
                {
                    title: "O que já saiu fica como está",
                    say: "Atualiza o changelog.",
                    run: "stillmark changelog sync",
                    file: "CHANGELOG.md",
                    lines: [
                        "## [1.3.0] - 2026-09-02",
                        "### Added",
                        "- Baixe as faturas em planilha"
                    ],
                    mark: { line: 2, kind: MarkKind.CIRCLE, note: "O seu texto, mantido." },
                    result: "Só versões e entradas novas são acrescentadas. Versões que já estão no arquivo nunca são reescritas, então o texto que você melhorou à mão continua lá."
                },
                {
                    title: "Confira antes de lançar",
                    say: "Confere o changelog.",
                    run: "stillmark changelog check",
                    file: "CHANGELOG.md",
                    lines: [
                        "### Fixed",
                        "- Atualizado src/core/Auth.ts"
                    ],
                    mark: { line: 1, kind: MarkKind.STRIKE, note: "Parece código, não uma mudança." },
                    result: "Aponta nomes de arquivo, nomes de configuração e tudo que parece senha ou e-mail, além de versões sem data ou fora de ordem."
                }
            ],
            commands: [
                { command: "stillmark changelog", description: "Mostra o que uma atualização acrescentaria, sem escrever nada" },
                { command: "stillmark changelog sync", description: "Cria o changelog a partir do histórico, ou acrescenta o que é novo" },
                { command: "stillmark changelog add \"…\" --group=fixed", description: "Adiciona uma mudança você mesmo: added, changed, fixed, removed, deprecated ou security" },
                { command: "stillmark changelog check", description: "Encontra datas faltando, versões fora de ordem, texto técnico e segredos" },
                { command: "stillmark config set --language=pt-BR --module=changelog", description: "Escreve o changelog em outro idioma" }
            ]
        }
    }
};
