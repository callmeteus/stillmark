---
name: coverage
description: >-
  Maintains a sub-repo's COVERAGE.md as a checkbox-only test coverage checklist
  grouped by area, in English. `/coverage` alone prints help, `/coverage update`
  reconciles the file with what changed in code and tests (and migrates a legacy
  prose-style file to the format), and `/coverage <free text>` applies the
  requested edit (add cases, mark covered, close as NOTFIXED, migrate). Use when
  the user runs /coverage or asks to update, fix or migrate a COVERAGE.md.
disable-model-invocation: true
---

# Coverage

`COVERAGE.md` lives at the root of each sub-repo (`luckymaker-proxy/COVERAGE.md`, `luckymaker/COVERAGE.md`, ...). It is **only** a checklist: area headings and checkbox lines. No numbers, no prose, no tables.

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
/coverage update          atualiza o COVERAGE.md com o que mudou no c├│digo e nos testes desde a ├║ltima atualiza├º├úo
/coverage <texto>         faz o que o texto pedir no COVERAGE.md
                          ex.: /coverage adiciona casos pro waf/session.lua
                               /coverage marca o dispatch 405 como coberto
                               /coverage fecha o item do pid file como NOTFIXED, o script n├úo usa pid file

Repo: o que foi @mencionado, sen├úo o que o chat t├í mexendo, sen├úo o cwd.
Arquivo: <repo>/COVERAGE.md
```

## Target file

1. Repo = the one the user `@`-mentioned, else the sub-repo this chat is editing, else the cwd's git root. If still ambiguous (several candidates), ask once with `AskQuestion`.
2. File = `<repo>/COVERAGE.md`. If it does not exist, ask before creating one: a first survey is a large job (read every module, list cases per area).

## Format (the pattern)

Every `COVERAGE.md` follows exactly this shape. The validator enforces it.

```markdown
# <Project> test coverage

## How to read this document

Items are grouped by area, then by file or route. Each item is one test case, tagged with its kind:

- `[happy]` valid input, expected flow.
- `[sad]` invalid input, failing dependency, domain error.
- `[edge]` limits, empty, null, concurrency, cache, timing.
- `[security]` auth, spoofing, injection, replay, leaks.

`[x]` means the test exists. `[ ]` means it is still missing.
An item closed on purpose without a test or a fix stays `[x]` with ` - NOTFIXED: <reason>` at the end of the line. Those items live in [N. NOTFIXED](#n-notfixed).

## 1. <Area>

### `<path/to/file.lua>` or `<METHOD /route>`

- [x] [happy] <case>
- [ ] [sad] <case>

#### <optional sub-group>

**<Optional bold group label>**
- [x] <case>

## N. NOTFIXED

### <Area name>

#### <short item title>

- [x] [edge] <case>. - NOTFIXED: <one-sentence reason>
```

Rules:

- **English only**, except text inside backticks (product strings, payloads, i18n stay as-is).
- Allowed lines after the "How to read" block: blank, `## N. <Area>` (numbered 1..N in order), `###` / `####` headings, `- [x] ` / `- [ ] ` checkboxes, `**Label**` group labels. Nothing else.
- **Forbidden:** "Current coverage" / "Missing cases" / "How to test" blocks, risk notes, descriptions under headings, tables, numbered lists, appendices, summary sections, `---` separators.
- Tag is optional; when present it is the first token after the box and one of `[happy]`, `[sad]`, `[edge]`, `[security]`.
- A heading or label with no checkbox under it is removed.
- `NOTFIXED` items exist **only** in the last section, grouped by area, always `[x]`, with the reason on the same line. Keep the `N` in the "How to read" link in sync with that section's number.
- Dates are ISO (`2026-10-11`). Decimals use a dot. No em dash (`ÔÇö`); use `-`.
- One case per line. Write the case so a reader knows what to assert, not how the suite is wired.

## Update workflow

Copy this checklist:

```
- [ ] 1. Resolve repo and file
- [ ] 2. Legacy format? Migrate first
- [ ] 3. Find what changed since the last COVERAGE.md commit
- [ ] 4. Reconcile sections and boxes
- [ ] 5. Sweep open [ ] items
- [ ] 6. Validate until exit 0
- [ ] 7. Report and commit
```

**1. Resolve** per [Target file](#target-file).

**2. Legacy format.** Run the validator. If it reports prose, tables, Portuguese tags (`[feliz]`, `[triste]`, `[borda]`, `[seguran├ºa]`) or a missing "How to read" block, migrate before anything else:

- Keep `##`/`###`/`####` area headings and every checkbox line. Numbered `N. [x] ...` items become `- [x] ...`.
- Drop everything else (intro, numbers, tables, "Cobertura atual" / "Casos que faltam" / "Como testar", risk lines, survey/bug/priority sections, appendices). Drop sections that end up with no checkbox.
- Renumber the remaining `##` areas from 1. Rewrite any checkbox text that points at a removed section.
- Translate to English. For big files, split by `##` area into `/tmp/coverage_<repo>/srcN.md` and run parallel `Task` subagents (`generalPurpose`), one per part, with these constraints: same line count, same structure, keep checkbox state, translate tags (`feliz`ÔåÆ`happy`, `triste`ÔåÆ`sad`, `borda`ÔåÆ`edge`, `seguran├ºa`ÔåÆ`security`), never touch backtick content, no em dash, no Portuguese left outside backticks. Each subagent must report input/output line and checkbox counts. Concatenate, then convert `DD/MM/YYYY` dates to ISO and decimal commas to dots.
- Prepend the title and the fixed "How to read" block.
- Before/after checkbox count must match (except lines you deliberately removed with their section). Say so in the report.

**3. What changed.**

```bash
base=$(git log -1 --format=%H -- COVERAGE.md)
git diff --name-status "$base" HEAD
git status --short
```

Keep source and test paths (specs, `tests/`, `*_spec.lua`, `*.test.ts`, `*.spec.ts`). Ignore lockfiles, docs, assets.

**4. Reconcile.** For each change:

| Change | Edit |
|---|---|
| New source file / route / module | Add a `###` under the right area with its cases (at least one `[happy]` and one `[sad]`; `[edge]` / `[security]` when they apply). `[ ]` unless a test already proves it. |
| Deleted source file | Remove its section and any NOTFIXED entry about it. |
| Renamed / moved | Rename the heading, keep the boxes. |
| New or changed test | Read the test. Mark `[x]` only for cases the test actually exercises: it calls the changed function or drives the real path. Constructor-only tests, harnesses in `src/`, or a file named after a module that never imports it do not count. Add a box if the test covers a case not listed yet. |
| Deleted test | Uncheck the cases it was the only proof for. |
| Behavior changed in source | Update the affected case text in place; uncheck if the existing test no longer asserts the new behavior. |

**5. Sweep.** For each remaining `- [ ]`, grep the test folders for the function/route name. If a test now covers it, read it and check the box. Do not run the full suite for this; the file tracks cases, not percentages.

**6. Validate.**

```bash
node .cursor/skills/coverage/scripts/ValidateCoverage.mjs <repo>/COVERAGE.md
```

Errors must be fixed until exit 0. Warnings about Portuguese words outside backticks must be checked one by one (fix real Portuguese, ignore proper names).

**7. Report** in pt-BR, short: boxes checked, boxes added, sections added/removed, per area. Then follow `no-auto-commit`:

- Live grant on a task branch: `git add -- COVERAGE.md`, commit, push.
- No grant: suggest the subject in one fenced block.
- Subject shape: `docs: <what changed in the checklist>` (e.g. `docs: COVERAGE.md cobre o dispatch 405 e o vanity com h├¡fen`). Migration: `docs: COVERAGE.md no padr├úo de checkboxes em ingl├¬s`.

## Free-text workflow

Treat the text as an edit request on `COVERAGE.md`, inside the format:

| Request looks like | Do |
|---|---|
| "adiciona casos pro X" | Read X, add its section with cases (`[ ]` unless a test proves it). |
| "marca X como coberto" | Find the test first. No test that exercises it ÔåÆ do not check it; say so. |
| "fecha X como NOTFIXED, <motivo>" | Move the line to the NOTFIXED section under its area with `#### <short title>`, keep `[x]`, append ` - NOTFIXED: <reason>` in English. |
| "migra" / file in legacy format | Step 2 of the update workflow. |
| "reabre X" / NOTFIXED no longer holds | Move it back to its area as `[ ]` without the suffix. |
| Anything that needs prose, numbers or tables | Refuse that part: the file is checkbox-only. Offer the info in chat instead. |

Then run steps 6 and 7.

## Never

- Check a box without reading a test that proves the case.
- Add prose, tables, percentages, "how to test" notes or appendices back.
- Run the repo's full test suite or anything that touches prod/staging.
- Commit without a live grant, or on master/main.
