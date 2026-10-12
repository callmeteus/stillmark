---
name: coverage
description: >-
  Maintains COVERAGE.md as a checkbox-only test coverage checklist grouped by
  area, in English. `/coverage` alone prints help, `/coverage update` reconciles
  the file with code and test changes, and `/coverage <free text>` applies the
  requested edit. Use when the user runs /coverage or asks to update COVERAGE.md.
disable-model-invocation: true
---

# Coverage (Stillmark companion)

`COVERAGE.md` lives at the project root. It is **only** a checklist: area headings and checkbox lines. No numbers, no prose, no tables.

Stillmark provides deterministic helpers; agents reconcile meaning and tests.

## Dispatch by argument

| Invocation | Do |
|---|---|
| `/coverage` (no argument) | Print the help below **verbatim** and stop. Touch nothing. |
| `/coverage update` | [Update workflow](#update-workflow) |
| `/coverage <anything else>` | [Free-text workflow](#free-text-workflow) |

### Help text

Reply with exactly this (pt-BR, user-facing):

```
/coverage                 mostra esta ajuda
/coverage update          atualiza o COVERAGE.md com o que mudou no código e nos testes desde a última atualização
/coverage <texto>         faz o que o texto pedir no COVERAGE.md
                          ex.: /coverage adiciona casos pro waf/session.lua
                               /coverage marca o dispatch 405 como coberto
                               /coverage fecha o item do pid file como NOTFIXED, o script não usa pid file

Repo: o que foi @mencionado, senão o que o chat está mexendo, senão o cwd.
Arquivo: <repo>/COVERAGE.md
```

## Target file

1. Repo = the one the user `@`-mentioned, else the repo this chat is editing, else the cwd git root. If ambiguous, ask once.
2. File = `<repo>/COVERAGE.md`. If it does not exist, ask before creating (`stillmark coverage init` only after the user agrees).

## Format

Follow the checkbox-only shape enforced by:

```bash
stillmark coverage validate --json
```

Rules (summary):

- **English only**, except text inside backticks.
- Allowed after "How to read": blank lines, `## N. <Area>`, `###` / `####`, `- [x]` / `- [ ]`, `**Label**`.
- Tags: `[happy]`, `[sad]`, `[edge]`, `[security]` (optional).
- `NOTFIXED` items only in the last `## N. NOTFIXED` area, always `[x]`, suffix ` - NOTFIXED: <reason>`.
- No em dash; dates ISO; one case per line.

## Update workflow

```
- [ ] 1. Resolve repo and file
- [ ] 2. Legacy format? Migrate first (agent-led)
- [ ] 3. Git hints since last COVERAGE.md commit
- [ ] 4. Reconcile sections and boxes
- [ ] 5. Sweep open [ ] items against tests
- [ ] 6. Validate until stillmark reports ok
- [ ] 7. Report and commit (user grants only)
```

**3. What changed:**

```bash
stillmark coverage update --json
```

**6. Validate:**

```bash
stillmark coverage validate --json
```

**7. Report** in pt-BR. Never commit without explicit user grant.

## CLI helpers

```bash
stillmark coverage init
stillmark coverage validate --json
stillmark coverage summary --json
stillmark coverage update --json
stillmark coverage check "<substring>" --json
stillmark coverage uncheck "<substring>" --json
stillmark coverage add "<### heading match>" "<case text>" --tag=happy --json
```

## Never

- Check a box without a test that proves the case.
- Add prose, tables, or percentages to COVERAGE.md.
- Run the full test suite or touch production for this task.
- Commit without user permission.
