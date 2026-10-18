import type { SiteMessages } from "./en-US";

/**
 * Portuguese copy for the site shell, the home page, and the docs overview.
 * Topic pages keep their copy in `topics/`.
 */
export const ptBR: SiteMessages = {
    ui: {
        skipToContent: "Pular para o conteúdo principal",
        home: "Início do Stillmark",
        github: "Stillmark no GitHub",
        switchLanguage: "Switch language to English",
        nav: {
            label: "Principal",
            docs: "Documentação",
            commands: "Comandos",
            install: "Instalar"
        },
        copy: {
            copy: "Copiar",
            copied: "Copiado",
            failed: "Não foi possível copiar. Selecione o texto e copie você mesmo.",
            ready: "Pronto para colar."
        },
        entry: {
            youSay: "Você diz",
            runs: "O Stillmark roda",
            changes: "O que muda",
            excerpt: "Linha alterada marcada"
        },
        compare: {
            before: "Antes",
            after: "Depois",
            without: "Sem Stillmark",
            with: "Com Stillmark",
            label: "Arraste para comparar o antes e o depois"
        },
        commands: {
            title: "Comandos",
            chatHint: "Cada um também funciona no chat: digite /stillmark seguido das mesmas palavras.",
            command: "Comando",
            description: "O que faz",
            count: "comandos"
        },
        topic: {
            onThisPage: "Nesta página",
            contrast: "Sem e com o Stillmark",
            tryIt: "Experimente",
            tryItHint: "Digite isto no chat do seu agente. O Stillmark escolhe o comando certo.",
            examples: "Exemplos"
        },
        pager: {
            label: "Mais documentação",
            previous: "Anterior",
            next: "Próxima"
        },
        docsNav: {
            label: "Documentação",
            browse: "Navegar pela documentação",
            overview: "Visão geral"
        },
        groups: {
            start: "Primeiros passos",
            planning: "Planejamento",
            quality: "Qualidade",
            workflow: "Fluxo de trabalho"
        },
        install: {
            agentLabel: "Cole no chat do seu agente",
            cliLabel: "Ou rode no terminal",
            promptTemplate: "Leia e execute o guia de instalação em markdown em {url}. Siga todos os passos desse arquivo para instalar o Stillmark neste repositório."
        },
        footer: {
            tagline: "O Stillmark mantém o seu roadmap, o plano privado e o checklist de testes em dia enquanto um agente de IA trabalha.",
            license: "Licença MIT",
            installGuide: "Guia de instalação para agentes"
        }
    },
    home: {
        meta: {
            title: "Stillmark - transforme a bagunça da IA em trabalho que dá orgulho de entregar",
            description: "Diga o que deve mudar. O Stillmark atualiza o seu roadmap, o plano de tarefas privado e o checklist de testes, e corrige as telas que você apontar."
        },
        hero: {
            headlineFirst: "Transforme a bagunça da IA",
            headlineSecond: "em trabalho que dá orgulho de entregar.",
            lead: "Diga ao seu agente de IA o que deve mudar, em palavras simples. O Stillmark mantém em ordem o roadmap, o seu plano de tarefas privado e o checklist de testes, corrige as telas que você aponta e mexe só nas linhas que você pediu. Cada mudança datada e assinada.",
            primary: "Instalar",
            secondary: "Ler a documentação",
            worksWith: "Funciona com"
        },
        design: {
            title: "Aponte para a tela. Receba a correção.",
            lead: "Selecione o que está estranho na sua versão local e diga em palavras simples. O agente corrige no código e lembra do seu gosto para a próxima vez. Arraste a alça para comparar.",
            say: "Esses cards estão apertados demais.",
            more: "Mais sobre design",
            mock: {
                heading: "Escolha um plano",
                period: "/mês",
                cta: "Escolher plano",
                badge: "Popular",
                plans: [
                    { name: "Starter", price: "US$ 0", feature: "1 projeto" },
                    { name: "Pro", price: "US$ 12", feature: "10 projetos" },
                    { name: "Team", price: "US$ 29", feature: "Projetos ilimitados" }
                ]
            }
        },
        picker: {
            title: "Comece pelo que você quer mudar.",
            lead: "Escolha um tópico e arraste a alça para ver como é trabalhar sem o Stillmark e com ele.",
            tabsLabel: "Tópicos",
            openDocs: "Mais sobre"
        },
        why: {
            title: "O agente decide. O comando escreve.",
            lead: "Pedir para uma IA editar um arquivo de planejamento direto funciona até deixar de funcionar: ela reescreve o arquivo de cabeça, renumera itens, perde uma linha ou adiciona o mesmo objetivo duas vezes. O Stillmark divide o trabalho. A skill ensina o seu agente a entender o que você quis dizer, e uma pequena ferramenta de linha de comando faz a mudança de verdade, sempre do mesmo jeito. Sobra bem menos espaço para a IA inventar coisas.",
            without: {
                title: "O agente edita o arquivo sozinho",
                items: [
                    "Reescreve o arquivo inteiro para mudar uma linha",
                    "Pode inventar um ID ou repetir um que já existe",
                    "Deixa passar fácil um item duplicado ou uma senha colada",
                    "Cada vez sai de um jeito um pouco diferente"
                ]
            },
            with: {
                title: "O agente pede ao Stillmark",
                items: [
                    "Só muda a linha que você pediu",
                    "Cada item recebe o próximo ID livre e fica com ele",
                    "Duplicados e qualquer coisa que pareça segredo são recusados",
                    "Mesmo resultado toda vez, com um relatório do que mudou"
                ]
            }
        },
        features: {
            title: "Um lugar para o plano, o trabalho e a prova.",
            items: [
                {
                    slug: "roadmap",
                    file: "ROADMAP.md",
                    title: "Um roadmap que o time compartilha",
                    body: "Os objetivos de longo prazo ficam no repositório. Cada um mantém o ID, a prioridade e as datas enquanto vai do backlog até concluído."
                },
                {
                    slug: "plan",
                    file: "TASK_PLAN.md",
                    title: "Um plano de tarefas que é só seu",
                    body: "Os passos da funcionalidade atual ficam na sua máquina, nunca vão para o commit, e são marcados conforme o agente trabalha."
                },
                {
                    slug: "coverage",
                    file: "COVERAGE.md",
                    title: "Um checklist do que está testado",
                    body: "Cada caso que importa fica listado, então você vê o que está coberto e o que ainda precisa de teste."
                },
                {
                    slug: "roadmap",
                    file: "",
                    title: "Nada entra por engano",
                    body: "Tudo que parece senha ou chave é recusado antes de chegar a um arquivo compartilhado, assim como um objetivo que já existe."
                }
            ]
        },
        log: {
            title: "O Stillmark em ação",
            lead: "Cada pedido vira uma linha datada no arquivo certo. Os recusados ficam no registro, riscados, para você ver o que foi barrado e por quê.",
            columns: {
                time: "Hora",
                said: "Você disse",
                entry: "Entrada",
                result: "Resultado",
                file: "Arquivo"
            },
            rows: [
                { time: "09:12", said: "Tira a exportação de cobrança deste marco.", entry: "R-014", result: "adiado", file: "ROADMAP.md", refused: false },
                { time: "09:31", said: "Adiciona uma tarefa para repetir webhooks no 429.", entry: "T-007", result: "adicionado, privado", file: "TASK_PLAN.md", refused: false },
                { time: "09:40", said: "Coloca repetir no 429 no plano.", entry: "T-007", result: "duplicado recusado", file: "TASK_PLAN.md", refused: true },
                { time: "09:47", said: "O caso de bloqueio de conta já está testado.", entry: "lockout", result: "marcado", file: "COVERAGE.md", refused: false }
            ]
        },
        install: {
            title: "Instale o Stillmark",
            lead: "Três passos, cerca de um minuto.",
            steps: [
                {
                    title: "Prepare o projeto",
                    body: "Rode isto na pasta do projeto. Cria o roadmap, a pasta do plano privado e o arquivo de configurações."
                },
                {
                    title: "Adicione o /stillmark ao seu editor",
                    body: "Escolha o seu editor. O seu agente aprende o comando /stillmark e a skill por trás dele."
                },
                {
                    title: "Diga o que deve mudar",
                    body: "Digite /stillmark e um pedido em palavras simples. O Stillmark encontra o arquivo certo e a linha certa."
                }
            ],
            example: "/stillmark adiciona SSO para clientes enterprise, prioridade alta",
            agentsLabel: "Editor",
            shortcut: "Prefere um passo só? Cole isto no chat do seu agente e ele faz os dois primeiros para você."
        }
    },
    docs: {
        meta: {
            title: "Documentação do Stillmark",
            description: "O que o Stillmark faz, tópico por tópico: instalação, configurações, roadmap, plano, cobertura, design, README, changelog, escrita clara, git e notificações."
        },
        title: "Comece com o Stillmark",
        lead: "O Stillmark mantém alguns arquivos do projeto em dia enquanto o seu agente de IA trabalha. Instale uma vez e peça mudanças em palavras simples.",
        getStarted: {
            title: "Primeiros passos",
            body: "Cole o prompt no chat do seu agente ou rode o comando você mesmo na pasta do projeto."
        },
        working: {
            title: "No que você está trabalhando?",
            lead: "Escolha o mais próximo. Cada cartão mostra algo que você pode digitar agora.",
            cards: [
                { slug: "roadmap", title: "Planejando o próximo marco", body: "Adicione, adie e conclua objetivos que o time inteiro vê." },
                { slug: "plan", title: "Construindo uma funcionalidade", body: "Divida o trabalho em tarefas privadas e marque conforme avança." },
                { slug: "coverage", title: "Testando o que você fez", body: "Mantenha a lista dos casos que importam e marque o que já foi testado." },
                { slug: "design", title: "Corrigindo uma tela", body: "Aponte o que está estranho e receba a correção do mesmo jeito da próxima vez." }
            ]
        },
        reference: {
            title: "Referência de comandos",
            lead: "Todos os tópicos, agrupados pelo que cuidam. Cada página lista os comandos com um exemplo."
        }
    }
};
