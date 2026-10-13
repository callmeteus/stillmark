# Tests

- Vitest in `packages/cli/tests/unit/`, files in PascalCase (`PlanChecklist.test.ts`); fixtures in `tests/fixtures/`, helpers in `tests/helpers/`.
- Use `createTempProject()` for a throwaway project and always `cleanup()` in `finally`.
- Drive the real CLI through `runCli([...args, "--json", "--root=<tmp>"])` and read the last JSON line from a mocked `console.log`.
- Git behavior is tested against real temporary repositories; set the identity with `vi.stubEnv` (`GIT_AUTHOR_*`, `GIT_COMMITTER_*`).
- Cover happy and sad paths: a refused input must leave the file byte-for-byte unchanged.
- Before handing off: `npm run lint`, `npm run typecheck`, `npx vitest run`, `npm run build` in `packages/cli`, and `npm test` in `packages/landing-page`.
