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
        skipToContent: "Ir para o conteúdo principal"
    },
    quickStart: {
        title: "Comece no seu repositório",
        steps: [
            {
                title: "Enviar o prompt de instalação",
                body:
                    "Copie o prompt acima e cole no chat do agente. O markdown linkado lista cada comando, incluindo stillmark init."
            },
            {
                title: "Instalar templates do agente",
                body:
                    "Execute stillmark install --agent com cursor, claude ou codex para instalar os templates.",
                linkHref: "#agents",
                linkLabel: "Ver comandos de instalação"
            },
            {
                title: "Planejar com o agente",
                body:
                    "Use /stillmark para tudo: planejamento, /stillmark coverage para o checklist de testes e design (seleção no browser + feedback)."
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
            "Diga o que precisa mudar. O Stillmark atualiza roadmap, plano privado e checklist de testes - e UI embutida via /stillmark, sem editar markdown na mão.",
        installLabel: "Peça ao agente para instalar",
        installCliLabel: "Execute no terminal",
        installTabGroupLabel: "Forma de instalação",
        installModeAgentLabel: "Agente",
        installModeCliLabel: "CLI",
        cliInstallCommand: "npx stillmark@latest init",
        cliInstallHint: "Requer Node.js. Depois rode stillmark install --agent com seu editor.",
        installPromptTemplate:
            "Leia e execute o markdown do guia de instalação em {url}. Siga cada passo desse arquivo para instalar o Stillmark neste repositório."
    },
    howItWorks: {
        title: "Como funciona",
        lead:
            "Você descreve o que precisa mudar no chat. O Stillmark organiza estratégia, trabalho do momento e testes em três blocos claros.",
        items: [
            {
                title: "Roadmap",
                badge: "Compartilhado com o time",
                body: "Metas e prioridades de longo prazo que todo mundo vê no repositório."
            },
            {
                title: "Plano atual",
                badge: "Privado na sua máquina",
                body: "Tarefas concretas do que você está entregando agora, sem publicar plano pela metade."
            },
            {
                title: "Checklist de testes",
                badge: "Compartilhado com o time",
                body: "Lista simples do que já está coberto por testes, para não esquecer o que importa."
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
                body: "/stillmark coverage mostra ajuda, /stillmark coverage update reconcilia com mudanças no git e texto livre após /stillmark coverage edita o checklist em linguagem natural."
            },
            {
                title: "Formato rígido",
                body: "O stillmark coverage validate detecta texto legado, tags erradas e títulos vazios antes do commit."
            },
            {
                title: "Updates com git",
                body: "O stillmark coverage update lista arquivos de código e de teste alterados desde o último commit do COVERAGE.md para o agente saber o que reconciliar."
            }
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
                body: "Peça ajustes de espaçamento, tipografia, cor ou layout em linguagem natural, ou comece com /stillmark design e um brief curto."
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
                body: "/stillmark cuida de adições, adiamentos, prioridades e movimentações. O CLI preserva seções, IDs e histórico."
            },
            {
                title: "Escopo e privacidade",
                body: "Conteúdo sensível no roadmap e trabalho fora do objetivo atual são sinalizados antes de ir para arquivos compartilhados."
            },
            {
                title: "Trabalho longo",
                body: "Quando uma tarefa atravessa várias rodadas do agente, atualizações aprovadas do plano são salvas para a execução continuar com segurança."
            }
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
                title: "stillmark config",
                body: "No primeiro uso, stillmark config status pergunta se `.stillmark/learnings/design/` entra no controle de versão do projeto."
            },
            {
                title: "Git opcional no roadmap",
                body: "Se você habilitar na config, o Stillmark pode commitar ou enviar o ROADMAP.md - nunca a pasta privada de planos."
            }
        ]
    },
    features: {
        title: "Recursos",
        items: [
            {
                title: "Linguagem natural e comandos",
                body: "Adicione, adie, repriorize e mova itens sem editar markdown manualmente."
            },
            {
                title: "Escritas incrementais seguras",
                body: "Os parsers preservam seções, IDs e histórico não relacionados."
            },
            {
                title: "Guardas de escopo e privacidade",
                body: "Trabalho fora do escopo e conteúdo sensível no roadmap são bloqueados por padrão."
            },
            {
                title: "Modo long-running",
                body: "Mudanças autorizadas no plano são salvas antes de o agente continuar."
            },
            {
                title: "Aprende com você",
                body: "Assuntos de commit seguem o seu git log (stillmark git commit-style). Hábitos de design e de código viram markdown em `.stillmark/learnings/design/` e `.stillmark/learnings/code-style/`, no estilo de Cursor rules."
            },
            {
                title: "Git opcional no roadmap",
                body: "Commit ou push só do ROADMAP.md quando você habilitar na configuração."
            }
        ]
    },
    agents: {
        stepLabel: "Passo 2",
        title: "Instalar templates do agente",
        intro: "Uma skill stillmark cobre planejamento, cobertura e design via /stillmark.",
        tabGroupLabel: "Agente de instalação",
        items: [
            { label: "Cursor", command: "stillmark install --agent cursor" },
            { label: "Claude", command: "stillmark install --agent claude" },
            { label: "Codex", command: "stillmark install --agent codex" }
        ]
    },
    commands: {
        title: "Referência de comandos",
        modeAgentLabel: "Agente (/stillmark)",
        modeConsoleLabel: "Terminal",
        modeGroupLabel: "Visualização da referência de comandos",
        tableCommand: "Comando",
        tableDescription: "O que faz",
        rows: [
            ["stillmark init", "Cria ROADMAP.md, stillmark.config.json e .stillmark/plans/"],
            ["stillmark install --agent cursor|claude|codex", "Instala skills e instruções do agente"],
            ["stillmark config status", "Estado do primeiro uso e flags de compartilhamento (--json)"],
            ["stillmark config set --design-system=…", "Learnings de design locais ou versionar .stillmark/learnings/design no git (--prompted)"],
            ["stillmark classify \"…\"", "Encaminha texto ambíguo para roadmap ou plano"],
            ["stillmark add \"…\"", "Adiciona via classify, no roadmap ou plano"],
            ["stillmark roadmap add \"…\"", "Adiciona item público ao roadmap"],
            ["stillmark roadmap defer \"…\"", "Move item do roadmap para adiados"],
            ["stillmark roadmap priority \"…\" <nível>", "Altera prioridade no roadmap"],
            ["stillmark plan init [objetivo]", "Inicia TASK_PLAN.md para o objetivo atual"],
            ["stillmark plan add \"…\"", "Adiciona tarefa ao plano ativo"],
            ["stillmark plan blocked \"…\" <motivo>", "Marca tarefa do plano como bloqueada"],
            ["stillmark move \"…\" to plan", "Promove trabalho do roadmap para o plano (--confirm)"],
            ["stillmark move \"…\" to roadmap", "Devolve trabalho ao roadmap (--confirm)"],
            ["stillmark long-running apply \"…\"", "Persiste mudança autorizada no plano em execução"],
            ["stillmark git commit-style \"…\"", "Pré-visualiza assunto de commit a partir do git log"],
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
    footer: {
        tagline: "Stillmark - roadmap, plano e cobertura para desenvolvimento com agentes."
    }
};
