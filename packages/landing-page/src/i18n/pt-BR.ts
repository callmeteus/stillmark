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
        installPromptTemplate:
            "Leia e execute o markdown do guia de instalação em {url}. Siga cada passo desse arquivo para instalar o Stillmark neste repositório."
    },
    howItWorks: {
        title: "Como funciona",
        diagramActor: "Usuário / Agente",
        diagramAria:
            "A intenção do agente passa pelo Stillmark para roadmap, plano de tarefas e checklist de cobertura.",
        publicLabel: "git",
        privateLabel: "local",
        diagramCoverageSkill: "/stillmark coverage",
        body:
            "Metas de longo prazo ficam no roadmap. O trabalho concreto fica no plano privado em .stillmark/plans/. Os casos de teste ficam no COVERAGE.md. Um único comando: /stillmark espelha o CLI inteiro (incluindo stillmark coverage …) com --json, além de design embutido e stillmark config para compartilhar .stillmark/design-system/."
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
                body: "Mensagens de commit seguem o seu git log recente, sem template fixo de roadmap. Pré-visualize com stillmark git commit-style."
            },
            {
                title: "Git opcional no roadmap",
                body: "Commit ou push só do ROADMAP.md quando você habilitar na configuração."
            },
            {
                title: "Companheiro COVERAGE.md",
                body: "Valide, marque e adicione casos com stillmark coverage ou /stillmark coverage … pelo agente."
            },
            {
                title: "Design embutido",
                body: "/stillmark design ou feedback informal com elemento selecionado no preview local. Playbooks de design vêm na skill stillmark."
            },
            {
                title: "Local vs compartilhado em .stillmark",
                body: "Planos de tarefa ficam sempre locais. stillmark config status pergunta uma vez se o design-system versiona no git."
            }
        ]
    },
    agents: {
        stepLabel: "Passo 2",
        title: "Instalar templates do agente",
        intro: "Escolha o agente e copie o comando de instalação correspondente. Uma skill stillmark cobre planejamento, cobertura e design via /stillmark.",
        items: [
            { label: "Cursor", command: "stillmark install --agent cursor" },
            { label: "Claude", command: "stillmark install --agent claude" },
            { label: "Codex", command: "stillmark install --agent codex" }
        ]
    },
    commands: {
        title: "Referência de comandos",
        intro: "Execute na raiz do projeto. Use --json quando o agente chama o CLI.",
        tableCommand: "Comando",
        tableDescription: "O que faz",
        rows: [
            ["stillmark init", "Cria ROADMAP.md, stillmark.config.json e .stillmark/plans/"],
            ["stillmark install --agent cursor|claude|codex", "Instala skills e instruções do agente"],
            ["stillmark config status", "Estado do primeiro uso e flags de compartilhamento (--json)"],
            ["stillmark config set --design-system=…", "Design-system local ou versionado no git (--prompted)"],
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
            ["stillmark coverage add \"<título>\" \"…\"", "Adiciona caso com tag sob um título"],
            ["/stillmark", "Espelho do CLI com --json, cobertura e design embutidos"],
            ["/stillmark coverage", "Ajuda, fluxo de update ou edição em texto livre do COVERAGE.md"],
            ["/stillmark coverage update", "Reconcilia o checklist com código e testes desde o último commit"]
        ]
    },
    footer: {
        tagline: "Stillmark - roadmap, plano e cobertura para desenvolvimento com agentes."
    }
};
