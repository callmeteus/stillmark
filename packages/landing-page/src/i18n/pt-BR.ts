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
                    "Peça ao agente para adicionar ou mover trabalho em linguagem natural. Use /coverage para manter o COVERAGE.md alinhado aos testes."
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
            "Diga o que precisa mudar. O Stillmark atualiza o roadmap, o plano privado e o checklist de testes - sem editar markdown na mão.",
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
        diagramCoverageSkill: "/coverage",
        body:
            "Metas de longo prazo ficam no roadmap. O trabalho concreto do objetivo atual fica no plano privado. Os casos de teste ficam no COVERAGE.md como checkboxes que o agente reconcilia com testes reais via /coverage e stillmark coverage validate."
    },
    coverage: {
        title: "Companheiro de cobertura de testes",
        lead:
            "O COVERAGE.md é um checklist só com caixas, agrupado por área. Sem porcentagens nem blocos de texto - apenas casos marcados como happy, sad, edge ou security que registram o que de fato está testado.",
        points: [
            {
                title: "Skill do agente",
                body: "As instalações Cursor e Claude incluem a skill /coverage. Ela mostra ajuda, conduz o fluxo de update e edita o arquivo em linguagem natural."
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
                body: "Valide, marque e adicione casos com stillmark coverage enquanto o /coverage trata linguagem natural."
            }
        ]
    },
    agents: {
        stepLabel: "Passo 2",
        title: "Instalar templates do agente",
        intro: "Escolha o agente e copie o comando de instalação correspondente. Cursor e Claude também instalam a skill /coverage.",
        items: [
            { label: "Cursor", command: "stillmark install --agent cursor" },
            { label: "Claude", command: "stillmark install --agent claude" },
            { label: "Codex", command: "stillmark install --agent codex" }
        ]
    },
    commands: {
        title: "Referência de comandos",
        tableCommand: "Comando",
        tableDescription: "O que faz",
        rows: [
            ["stillmark roadmap add", "Adiciona item ao roadmap"],
            ["stillmark plan add", "Adiciona tarefa ao plano ativo"],
            ["stillmark add", "Infere roadmap ou plano"],
            ["stillmark move … to plan", "Promove item do roadmap para o plano"],
            ["stillmark long-running apply", "Aplica mudança no escopo durante a execução"],
            ["stillmark git commit-style", "Pré-visualiza commit no estilo do seu git log"],
            ["stillmark coverage init", "Cria um COVERAGE.md inicial"],
            ["stillmark coverage validate", "Valida o formato de checkboxes (erro com exit 1)"],
            ["stillmark coverage update", "Dicas de git desde o último commit do COVERAGE.md"],
            ["/coverage", "Skill do agente: ajuda, update e edições em texto livre"]
        ]
    },
    footer: {
        tagline: "Stillmark - roadmap, plano e cobertura para desenvolvimento com agentes."
    }
};
