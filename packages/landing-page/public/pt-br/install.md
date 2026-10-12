# Guia de instalação do Stillmark

Execute estes passos na **raiz do projeto** onde os arquivos de planejamento devem ficar.

## Projeto ou global

O prompt que trouxe você até aqui diz qual opção o usuário escolheu:

- **Este projeto** (padrão): execute todos os passos abaixo. A skill fica dentro deste repositório.
- **Global (todos os projetos)**: execute o passo 1, depois o passo 3 com `--global`, e pule os passos 2, 4 e 5. A skill vai para a pasta do usuário (`~/.cursor`, `~/.claude` ou `~/.codex`) e funciona em qualquer repositório; cada projeto ganha os arquivos de planejamento no primeiro `/stillmark` usado nele.

Se o prompt não disser, pergunte uma vez ao usuário qual ele prefere.

## 1. Adicionar a CLI

Instale pela [última release no GitHub](https://github.com/callmeteus/stillmark/releases/latest) (arquivo `stillmark.tgz`):

```bash
npm install -g https://github.com/callmeteus/stillmark/releases/latest/download/stillmark.tgz
```

## 2. Inicializar os arquivos de planejamento

```bash
stillmark init
```

Cria `ROADMAP.md`, `stillmark.config.json` e `.stillmark/plans/` (sempre no `.gitignore`). No primeiro `/stillmark`, o agente pode perguntar se você quer versionar `.stillmark/learnings/design/` no git; os planos de tarefa continuam locais. O plano de tarefas é criado quando você inicia um com `stillmark plan init`.

## 3. Instalar templates do agente

Escolha o agente que você usa:

```bash
stillmark install --agent cursor
```

```bash
stillmark install --agent claude
```

```bash
stillmark install --agent codex
```

Instalação global (todos os projetos): adicione `--global`, por exemplo:

```bash
stillmark install --agent cursor --global
```

## 4. Primeiro `/stillmark` (compartilhamento opcional)

O agente pode executar:

```bash
stillmark config status --json
```

Se perguntar, escolha se `.stillmark/learnings/design/` entra no git. Planos em `.stillmark/plans/` continuam sempre locais.

```bash
stillmark config set --design-system=true --prompted --json
```

Opcional: os itens são compactos por padrão (o plano de tarefas é extenso). Para escrever detalhes embaixo de cada caso de teste, item do roadmap ou tarefa:

```bash
stillmark config set --detail=extended --json
# ou só para o COVERAGE.md:
stillmark config set --detail=extended --module=coverage --json
```

Atualizações: o agente procura uma versão nova do Stillmark sozinho, uma vez por dia, e atualiza os próprios arquivos quando sai uma. Para mudar a frequência ou desligar:

```bash
# a cada 6 horas
stillmark config set --update-interval=6 --json
# desligar
stillmark config set --auto-update=false --json
```

## 5. Opcional: checklist de cobertura de testes

Quando o time quiser um checklist compartilhado de casos de teste no git:

```bash
stillmark coverage init
```

Depois use `/stillmark coverage …` no agente (mesmos fluxos que `stillmark coverage …`) ou `stillmark coverage validate --json` após editar.

## 6. Verificar

Confirme que `ROADMAP.md` existe, que `.stillmark/` está no `.gitignore` e que `.stillmark/plans/` foi criado. Use `stillmark --help` se algum passo falhar.
