# COVERAGE.md playbook (via `/stillmark`)

`COVERAGE.md` lives at the project root. Checkbox-only checklist: area headings and lines. No percentages, prose blocks, or tables.

## Dispatch (text after `/stillmark`)

| Invocation | Do |
|---|---|
| `coverage` alone (no more tokens) | Print [help text](#help-text) **verbatim** (pt-BR). Touch nothing. |
| `coverage update` | [Update workflow](#update-workflow) |
| `coverage validate` / `coverage summary` / other `coverage …` CLI shapes | Run `stillmark coverage … --json` |
| `coverage <free text>` | [Free-text workflow](#free-text-workflow) |
| No `coverage` keyword but user asks to edit checklist / tests / "marca coberto" | Same as free-text workflow |

Legacy `/coverage …` in docs means `/stillmark coverage …`.

### Help text

Reply with exactly this (pt-BR, user-facing):

```
/stillmark coverage                 mostra esta ajuda
/stillmark coverage update          atualiza o COVERAGE.md com o que mudou no código e nos testes desde a última atualização
/stillmark coverage <texto>         faz o que o texto pedir no COVERAGE.md
                                    ex.: /stillmark coverage adiciona casos pro módulo de auth
                                         /stillmark coverage marca o dispatch 405 como coberto
                                         /stillmark coverage fecha o item do pid file como NOTFIXED, o script não usa pid file

Repo: o que foi @mencionado, senão o que o chat está mexendo, senão o cwd.
Arquivo: <repo>/COVERAGE.md
```

## Target file

1. Repo = `@`-mentioned repo, else repo this chat edits, else cwd git root. Ask once if ambiguous.
2. File = `<repo>/COVERAGE.md`. If missing, ask before `stillmark coverage init`.

## Format

```bash
stillmark coverage validate --json
```

- Area titles, case text, and NOTFIXED reasons in `language.resolved.coverage` from `stillmark config status --json` (English when unset). The structure stays fixed: `# <Project> test coverage`, `## N.` numbering, tags, and the `NOTFIXED` keyword.
- `## N. <Area>`, `###` / `####`, `- [x]` / `- [ ]`, optional `[happy]` `[sad]` `[edge]` `[security]`.
- `NOTFIXED` only in last `## N. NOTFIXED` area, always `[x]`, suffix ` - NOTFIXED: <reason>`.
- Detail level comes from `stillmark config status --json` -> `detail.coverage`. **compact** (default): case lines only. **extended**: optional 2-space indented detail lines right under a case (what the test exercises, inputs, expected result). Never put detail lines under headings.

## Update workflow

1. Resolve repo and file.
2. Legacy format? Migrate first.
3. `stillmark coverage update --json` for git hints.
4. Reconcile sections and checkboxes with code and tests.
5. Sweep open `[ ]` against real tests.
6. `stillmark coverage validate --json` until `ok`.
7. Report in pt-BR; commit only if user grants.

## Free-text workflow

| Request | Do |
|---|---|
| add cases for X | Read X; `stillmark coverage add` when it fits. |
| mark X covered | Find test first; `stillmark coverage check "<case>"`. |
| uncheck X | `stillmark coverage uncheck "<case>"`. |
| NOTFIXED + reason | Move to NOTFIXED area; reason in the coverage language. |
| migrate / legacy | Checkbox format, then validate. |

## CLI helpers

```bash
stillmark coverage init
stillmark coverage validate --json
stillmark coverage summary --json
stillmark coverage update --json
stillmark coverage check "<substring>" --json
stillmark coverage uncheck "<substring>" --json
stillmark coverage add "<heading>" "<case>" --tag=happy --json
stillmark coverage add "<heading>" "<case>" --tag=happy --details "<what the test does>" --json  # extended only
```

## Never

- Check a box without a test that proves the case.
- Add prose, tables, or percentages (indented case details are allowed only when `detail.coverage` is extended).
- Commit without user permission.
