# Guia de instalação do Stillmark

Execute estes passos na **raiz do projeto** onde os arquivos de planejamento devem ficar.

## 1. Adicionar a CLI

Instale pela [última release no GitHub](https://github.com/callmeteus/stillmark/releases/latest) (arquivo `stillmark.tgz`):

```bash
npm install -g https://github.com/callmeteus/stillmark/releases/latest/download/stillmark.tgz
```

## 2. Inicializar os arquivos de planejamento

```bash
stillmark init
```

Cria `ROADMAP.md`, `stillmark.config.json` e `.stillmark/plans/` (incluído no `.gitignore`). O plano de tarefas é criado quando você inicia um com `stillmark plan init`.

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

## 4. Opcional: checklist de cobertura de testes

Quando o time quiser um checklist compartilhado de casos de teste no git:

```bash
stillmark coverage init
```

Depois use a skill do agente `/coverage` (instalada com os templates Cursor e Claude) ou `stillmark coverage validate --json` após editar.

## 5. Verificar

Confirme que `ROADMAP.md` existe, que `.stillmark/` está no `.gitignore` e que `.stillmark/plans/` foi criado. Use `stillmark --help` se algum passo falhar.
