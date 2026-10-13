import type { Messages } from "./en-US";

export const ptBR: Messages = {
    meta: {
        title: "Stillmark - CLI de roadmap, plano e cobertura para agentes de IA",
        description:
            "Gestão de roadmap, plano de tarefas privado e checklist de cobertura de testes para agentes de código com IA."
    },
    nav: {
        getStarted: "Começar",
        coverage: "Cobertura",
        design: "Design",
        planning: "Planejamento",
        commands: "Comandos",
        github: "GitHub",
        githubUnavailable: "Link do repositório ainda não configurado",
        skipToContent: "Ir para o conteúdo principal",
        home: "Início do Stillmark"
    },
    quickStart: {
        title: "Comece no seu repositório",
        steps: [
            {
                title: "Enviar o prompt de instalação",
                body:
                    "Copie o prompt do topo da página e cole no chat do agente. O guia linkado lista cada comando, incluindo `/stillmark init`."
            },
            {
                title: "Instalar templates do agente",
                body: "Escolha o seu editor e execute o comando correspondente para adicionar a skill stillmark."
            },
            {
                title: "Planejar com o agente",
                body:
                    "Use `/stillmark` para tudo: planejamento, `/stillmark coverage` para o checklist de testes e `/stillmark design` para feedback de interface."
            }
        ]
    },
    copy: {
        copy: "Copiar prompt",
        copyShort: "Copiar",
        copied: "Copiado",
        failed: "Não foi possível copiar. Selecione o prompt e copie manualmente.",
        manualHint: "Você também pode selecionar o texto do prompt e copiar manualmente.",
        readyInTerminal: "Pronto para colar no chat do agente."
    },
    hero: {
        title: "Planeje em linguagem natural. Execute com rastro claro.",
        subtitle:
            "Diga o que precisa mudar. O Stillmark atualiza roadmap, plano privado e checklist de testes - e ajusta o design das telas que você apontar no navegador. Sem editar markdown na mão.",
        installLabel: "Peça ao agente para instalar",
        installCliLabel: "Execute no terminal",
        installTabGroupLabel: "Forma de instalação",
        installModeAgentLabel: "Agente",
        installModeCliLabel: "CLI",
        cliInstallCommand: "npx stillmark@latest init",
        cliInstallHint: "Requer Node.js. Depois rode stillmark install --agent com seu editor.",
        installPromptTemplate:
            "Leia e execute o markdown do guia de instalação em {url}. Siga cada passo desse arquivo para instalar o Stillmark neste repositório.",
        installScopeGroupLabel: "Onde instalar",
        installScopeProjectLabel: "Este projeto",
        installScopeGlobalLabel: "Global",
        installPromptGlobalTemplate:
            "Leia e execute o markdown do guia de instalação em {url}. Siga os passos da instalação global desse arquivo para o Stillmark funcionar em todos os projetos deste computador.",
        cliInstallGlobalCommand: "npx stillmark@latest install --agent cursor --global",
        cliInstallGlobalHint: "Requer Node.js. Troque cursor por claude ou codex. Vale para todos os projetos.",
        demo: {
            label: "Revisões de exemplo",
            requestLabel: "Você diz",
            commandLabel: "O Stillmark executa",
            revisionColumn: "Rev",
            changeColumn: "Mudança",
            sharedTag: "Compartilhado",
            localTag: "Só na sua máquina",
            requests: [
                {
                    say: "Tira a exportação de faturas deste marco.",
                    run: "/stillmark roadmap defer \"exportação de faturas\""
                },
                {
                    say: "Adiciona uma tarefa para repetir webhooks no 429.",
                    run: "/stillmark plan add \"Repetir no HTTP 429\""
                },
                {
                    say: "O caso de bloqueio já tem teste.",
                    run: "/stillmark coverage check \"bloqueio\""
                }
            ],
            roadmap: [
                "## Milestone A",
                "- [ ] **R-012** Convites de equipe",
                "## Deferred",
                "- [ ] **R-014** Exportação de faturas"
            ],
            plan: ["## Objective", "Webhooks v2", "### T-006 Assinar payloads", "### T-007 Repetir no HTTP 429"],
            coverage: [
                "## Auth",
                "- [x] [happy] login com senha válida",
                "- [ ] [edge] sessão expirada",
                "- [x] [sad] bloqueio após 5 tentativas"
            ],
            revisions: [
                "Roadmap: R-014 adiado",
                "Plano: T-007 adicionado na sua máquina",
                "Cobertura: bloqueio marcado"
            ]
        }
    },
    howItWorks: {
        title: "Como funciona",
        lead:
            "Você descreve o que precisa mudar no chat. O Stillmark organiza estratégia, trabalho do momento e testes em três blocos claros.",
        legendShared: "Linha contínua: vai junto com o repositório",
        legendLocal: "Linha tracejada: fica na sua máquina",
        items: [
            {
                title: "Roadmap",
                badge: "Compartilhado com o time",
                body: "Metas e prioridades de longo prazo que todo mundo vê no repositório.",
                file: "ROADMAP.md"
            },
            {
                title: "Plano atual",
                badge: "Privado na sua máquina",
                body: "Tarefas concretas do que você está entregando agora, sem publicar plano pela metade.",
                file: ".stillmark/plans/TASK_PLAN.md"
            },
            {
                title: "Checklist de testes",
                badge: "Compartilhado com o time",
                body: "Lista simples do que já está coberto por testes, para não esquecer o que importa.",
                file: "COVERAGE.md"
            }
        ]
    },
    coverage: {
        title: "Companheiro de cobertura de testes",
        lead:
            "O COVERAGE.md é um checklist só com caixas, agrupado por área. Sem porcentagens nem blocos de texto - apenas casos marcados como happy, sad, edge ou security que registram o que de fato está testado.",
        points: [
            {
                title: "Via /stillmark coverage",
                body: "`/stillmark coverage` mostra ajuda, `/stillmark coverage update` reconcilia com mudanças no git e texto livre após `/stillmark coverage` edita o checklist em linguagem natural."
            },
            {
                title: "Formato rígido",
                body: "O `/stillmark coverage validate` detecta texto legado, tags erradas e títulos vazios antes do commit."
            },
            {
                title: "Updates com git",
                body: "O `/stillmark coverage update` lista arquivos de código e de teste alterados desde o último commit do COVERAGE.md para o agente saber o que reconciliar."
            }
        ],
        sample: [
            "## Auth",
            "- [x] [happy] login com senha válida",
            "- [x] [sad] bloqueio após 5 tentativas",
            "- [ ] [security] link de redefinição expira após o uso",
            "## Billing",
            "- [ ] [edge] fatura sem itens"
        ]
    },
    design: {
        title: "Companheiro de design de UI",
        lead:
            "Aponte o que está errado no app em execução e diga o que mudar. O Stillmark liga esse feedback ao seu projeto em vez de remendos soltos.",
        points: [
            {
                title: "Seleção no browser",
                body: "Selecione um elemento no preview local. O agente encontra a tela ou o componente correspondente no código."
            },
            {
                title: "Via /stillmark design",
                body: "Peça ajustes de espaçamento, tipografia, cor ou layout em linguagem natural, ou comece com `/stillmark design` e um brief curto."
            },
            {
                title: "Polimento consistente",
                body: "Playbooks de design vêm na skill stillmark para o visual ficar alinhado entre sessões."
            }
        ]
    },
    planning: {
        title: "Companheiro de planejamento",
        lead:
            "Transforme intenção vaga em roadmap compartilhado e lista de tarefas privada, sem editar markdown a cada mudança.",
        points: [
            {
                title: "Linguagem natural",
                body: "`/stillmark` cuida de adições, adiamentos, prioridades e movimentações. O CLI preserva seções, IDs e histórico."
            },
            {
                title: "Escopo e privacidade",
                body: "Conteúdo sensível no roadmap e trabalho fora do objetivo atual são sinalizados antes de ir para arquivos compartilhados."
            },
            {
                title: "Trabalho longo",
                body: "Quando uma tarefa atravessa várias rodadas do agente, atualizações aprovadas do plano são salvas para a execução continuar com segurança."
            }
        ],
        sample: [
            "### T-007 Repetir no HTTP 429",
            "status: in-progress",
            "priority: high",
            "depends: T-006",
            "#### Acceptance criteria",
            "- Repete três vezes com backoff"
        ]
    },
    workspace: {
        title: "Preferências do workspace",
        lead:
            "O Stillmark mantém planos de tarefa na sua máquina por padrão e pergunta uma vez quanto do .stillmark você quer versionar no git.",
        points: [
            {
                title: "Planos privados",
                body: "Planos de execução ativos ficam locais. Só o roadmap e o checklist de testes são pensados para o repositório do time."
            },
            {
                title: "/stillmark config",
                body: "No primeiro uso, `/stillmark config status` pergunta se `.stillmark/learnings/design/` entra no controle de versão do projeto."
            },
            {
                title: "Git opcional no roadmap",
                body: "Se você habilitar na config, o Stillmark pode commitar ou enviar o ROADMAP.md - nunca a pasta privada de planos."
            },
            {
                title: "Aprende com você",
                body: "Assuntos de commit seguem o seu git log (`/stillmark git message-style`). Hábitos de design e de código viram markdown em `.stillmark/learnings/design/` e `.stillmark/learnings/code-style/`, no estilo de Cursor rules."
            }
        ],
        tree: [
            { path: "ROADMAP.md", note: "compartilhado", local: false },
            { path: "COVERAGE.md", note: "compartilhado", local: false },
            { path: "stillmark.config.json", note: "compartilhado", local: false },
            { path: ".stillmark/plans/", note: "na sua máquina", local: true },
            { path: ".stillmark/learnings/design/", note: "local até você optar", local: true }
        ]
    },
    agents: {
        tabGroupLabel: "Agente de instalação",
        items: [
            { label: "Cursor", command: "stillmark install --agent cursor" },
            { label: "Claude", command: "stillmark install --agent claude" },
            { label: "Codex", command: "stillmark install --agent codex" }
        ]
    },
    commands: {
        title: "Referência de comandos",
        lead: "Todo comando do terminal também funciona pelo agente. Troque a visualização para ver cada forma.",
        modeAgentLabel: "Agente (/stillmark)",
        modeConsoleLabel: "Terminal",
        modeGroupLabel: "Visualização da referência de comandos",
        tableCommand: "Comando",
        tableDescription: "O que faz",
        rows: [
            ["stillmark init", "Cria ROADMAP.md, stillmark.config.json e .stillmark/plans/"],
            ["stillmark install --agent cursor|claude|codex", "Instala skills e instruções do agente (`--global` para todos os projetos)"],
            ["stillmark config status", "Estado do primeiro uso e flags de compartilhamento (`--json`)"],
            ["stillmark config set --design-system=…", "Learnings de design locais ou versionar .stillmark/learnings/design no git (`--prompted`)"],
            ["stillmark config set --detail=…", "Itens compactos ou com detalhes embaixo, para tudo ou para um documento só (`--module=coverage|roadmap|plan`)"],
            ["stillmark update", "Procura uma versão nova sozinho, uma vez por dia por padrão (`--force` verifica agora, `apply` atualiza)"],
            ["stillmark config set --auto-update=…", "Liga ou desliga a verificação automática, ou muda a frequência (`--update-interval=<horas>`)"],
            ["stillmark classify \"…\"", "Encaminha texto ambíguo para roadmap ou plano"],
            ["stillmark add \"…\"", "Adiciona via classify, no roadmap ou plano"],
            ["stillmark roadmap add \"…\"", "Adiciona item público ao roadmap"],
            ["stillmark roadmap done \"…\"", "Marca item do roadmap como concluído"],
            ["stillmark roadmap add \"…\" --done --commit=<sha>", "Registra no roadmap algo que já foi entregue, com a data do commit que entregou"],
            ["stillmark config set --roadmap-dates=false", "Para de colocar datas nos itens do roadmap (ligado por padrão)"],
            ["stillmark config set --strip-attribution=false", "Mantém as linhas \"Co-authored-by\" do Cursor e do Claude nos commits (removidas por padrão)"],
            ["stillmark git push", "Envia as mudanças já salvas; o que ainda não foi salvo aparece na lista para você decidir antes"],
            ["stillmark config set --auto-push=false", "Deixa os commits só na sua máquina, sem enviar (enviados por padrão)"],
            ["stillmark config set --language=pt-BR", "Escolhe o idioma do roadmap, dos planos, da cobertura e dos commits, para todos ou um de cada vez"],
            ["stillmark config set --caveman=full", "Respostas mais curtas do agente, mantendo comandos, links e erros intactos (desligado por padrão; `lite`, `full` ou `ultra`)"],
            ["stillmark caveman on|off", "Respostas curtas só nesta conversa (`--save` guarda a escolha)"],
            ["stillmark caveman compress <arquivo>", "Enxuga um arquivo de instruções do agente e guarda o original legível (`verify` confere, `restore` devolve)"],
            ["stillmark caveman", "Quanto as respostas curtas custam por mensagem e quanto os arquivos enxutos economizam"],
            ["stillmark roadmap defer \"…\"", "Move item do roadmap para adiados"],
            ["stillmark roadmap priority \"…\" <nível>", "Altera prioridade no roadmap"],
            ["stillmark plan init [objetivo]", "Inicia TASK_PLAN.md para o objetivo atual"],
            ["stillmark plan scope --in-scope \"…\"", "Define objetivo, o que entra e o que fica fora do plano atual (`--out-of-scope`, `--replace`)"],
            ["stillmark plan add \"…\" --priority=high", "Adiciona tarefa ao plano ativo, com prioridade opcional"],
            ["stillmark plan done \"…\"", "Conclui uma tarefa e marca o item no checklist do fim do plano"],
            ["stillmark plan phase \"…\" <fase>", "Agrupa a tarefa em uma fase no checklist do plano"],
            ["stillmark plan priority \"…\" <nível>", "Altera a prioridade de uma tarefa do plano"],
            ["stillmark plan blocked \"…\" <motivo>", "Marca tarefa do plano como bloqueada"],
            ["stillmark move \"…\" to plan", "Promove trabalho do roadmap para o plano (`--confirm`)"],
            ["stillmark move \"…\" to roadmap", "Devolve trabalho ao roadmap (`--confirm`)"],
            ["stillmark long-running apply \"…\"", "Persiste mudança autorizada no plano em execução"],
            ["stillmark git message-style \"…\"", "Pré-visualiza assunto de commit a partir do git log"],
            ["stillmark coverage init", "Cria um COVERAGE.md inicial"],
            ["stillmark coverage validate", "Valida formato de checkboxes (exit 1 se houver erro)"],
            ["stillmark coverage summary", "Resumo do checklist sem ruído de validação completa"],
            ["stillmark coverage update", "Lista código e testes alterados desde o último commit do COVERAGE"],
            ["stillmark coverage check \"…\"", "Marca caso por correspondência parcial"],
            ["stillmark coverage uncheck \"…\"", "Desmarca caso"],
            ["stillmark coverage add \"<título>\" \"…\"", "Adiciona caso com tag sob um título"]
        ],
        agentOnlyRows: [
            ["/stillmark coverage", "Mostra ajuda apenas (sem alterar arquivos)"],
            ["/stillmark coverage <texto>", "Edição em texto livre do COVERAGE.md"],
            ["/stillmark design …", "Ajustes de UI; seleção no browser no preview local"]
        ]
    },
    close: {
        title: "Adicione o Stillmark ao seu repositório",
        body: "Um comando cria o ROADMAP.md, a pasta privada de planos e a configuração. Depois instale a skill do seu editor.",
        agentLink: "Prefere que o agente faça isso? Copie o prompt de instalação"
    },
    footer: {
        tagline: "Stillmark - roadmap, plano e cobertura para desenvolvimento com agentes.",
        license: "Licença MIT",
        backToInstall: "Voltar para a instalação"
    }
};
