# stillmark-monorepo test coverage

## How to read this document

Items are grouped by area, then by file or route. Each item is one test case, tagged with its kind:

- `[happy]` valid input, expected flow.
- `[sad]` invalid input, failing dependency, domain error.
- `[edge]` limits, empty, null, concurrency, cache, timing.
- `[security]` auth, spoofing, injection, replay, leaks.
`[x]` means the test exists. `[ ]` means it is still missing.
## 1. CLI parsing and help

### `packages/cli/src/cli/ParseFlags.ts`

- [x] [happy] Options never become positional text
- [x] [edge] Text after `--` and negative numbers stay positional

### `packages/cli/src/cli/Help.ts`

- [x] [happy] `plan add --help` shows usage instead of creating a task
- [x] [sad] Unknown options are refused without writing

## 2. Roadmap

### `packages/cli/src/operations/RoadmapOperations.ts`

- [x] [happy] Add item without overwriting unrelated content
- [x] [happy] `roadmap add --done` records past work under Done
- [x] [happy] `roadmap done` moves an item to Done keeping priority and details
- [x] [edge] `roadmap done` is idempotent and reports unknown items
- [x] [edge] Metadata stays indented after `roadmap priority`
- [x] [happy] `add --done` routes to the roadmap
- [x] [happy] Writes `added` and `done` dates by default
- [x] [happy] Takes the delivery date from a commit
- [x] [edge] Backfills the date of an item that is already done
- [x] [edge] Writes no dates when roadmap dates are off
- [x] [sad] Refuses invalid dates, unknown commits, and both date flags together
- [x] [sad] Refuses roadmap details while roadmap is compact
- [x] [happy] Writes roadmap details and acceptance as indented lines
- [ ] [happy] `roadmap defer` moves an item to Deferred

### `packages/cli/src/todos/ScanTodos.ts`

- [x] [happy] Finds TODO and FIXME comments across comment styles
- [x] [edge] Ignores prose files, lowercase words, empty tags, build output, and node_modules
- [x] [edge] Ignores markers inside string literals and wrapped doc sentences
- [x] [edge] Merges the same comment from several files and keeps FIXME
- [x] [happy] Uses the git file list so ignored files are skipped
- [x] [edge] Shortens very long comments to one roadmap line
### `packages/cli/src/operations/RoadmapTodos.ts`

- [x] [happy] Lists comments without writing and flags the ones already on the roadmap
- [x] [happy] Adds new comments to Backlog with FIXME as high priority
- [x] [edge] A second run adds nothing
- [x] [security] Leaves out comments that look like secrets
- [x] [happy] Notes the source file when roadmap detail is extended
- [x] [happy] Runs from the CLI as roadmap todos and init --todos
- [x] [sad] Lists without a roadmap but refuses to add before init
## 3. Task plan

### `packages/cli/src/operations/PlanOperations.ts`

- [x] [happy] Add task without resetting progress
- [x] [happy] Writes given acceptance criteria and verification instead of placeholders
- [x] [edge] Keeps criteria sections in compact mode when criteria are given
- [x] [happy] Writes extended tasks with details by default
- [x] [happy] Writes compact tasks without criteria sections
- [x] [happy] `--priority` on plan add and `plan priority` change the task priority
- [x] [sad] Refuses unknown priorities without writing

### `packages/cli/src/operations/PlanScope.ts`

- [x] [happy] Replaces placeholders with real objective and scope entries
- [x] [edge] Appends without duplicates and replaces with `--replace`
- [x] [happy] Sets scope from `plan init` flags and shows it with `plan scope`
- [x] [sad] Refuses when there is no plan

### `packages/cli/src/documents/PlanChecklist.ts`

- [x] [happy] A fresh plan ends with an empty checklist after History
- [x] [happy] Lists tasks and checks them on `plan done`
- [x] [happy] Groups and prefixes tasks by phase, strikes cancelled tasks
- [x] [sad] Rejects unknown statuses without touching the plan
- [x] [edge] Overwrites manual checklist edits and keeps History before it

## 4. Guards and routing

### `packages/cli/src/guards`

- [x] [happy] Detects near-duplicate roadmap items
- [x] [happy] Detects near-duplicate plan tasks
- [x] [sad] Refuses out-of-scope plan add without authorization
- [x] [edge] Ignores `(Not set)` and `(define)` placeholders in scope checks
- [x] [security] Blocks secrets on roadmap add
- [x] [security] Does not leak verification notes into the roadmap on move

### `packages/cli/src/intent`

- [x] [happy] Routes natural-language examples to roadmap or plan
- [x] [edge] Returns needsClarification when ambiguous

### `packages/cli/src/operations/MoveOperations.ts`

- [x] [happy] Moves roadmap to plan with metadata and reference
- [x] [happy] Moves plan to roadmap without duplicate body
- [x] [happy] Carries roadmap details into an extended plan on move
- [ ] [sad] Moving a plan task with dependents requires `--confirm`

### `packages/cli/src/long-running`

- [x] [happy] Incorporates authorized plan changes and preserves state

## 5. Coverage companion

### `packages/cli/src/coverage`

- [x] [happy] Creates and validates COVERAGE.md
- [x] [happy] Checks and unchecks a case by substring
- [x] [happy] Adds a case under a heading
- [x] [edge] Does not recreate an existing file on init
- [x] [happy] Accepts the default template and matches the reference validator
- [x] [sad] Rejects prose outside checkboxes
- [x] [happy] Summary includes totals and errors
- [x] [sad] Rejects detail lines in compact mode or away from a case
- [x] [happy] Accepts and writes indented details in extended mode

- [x] [edge] Adds cases to a CRLF file without mixing line endings
## 6. Config and project setup

### `packages/cli/src/config`

- [x] [happy] Detail defaults: plan extended, coverage and roadmap compact
- [x] [happy] Global detail overrides built-ins and modules override global
- [x] [sad] Drops invalid detail and update values from config
- [x] [happy] `config set --detail` writes, reports, and clears module overrides
- [x] [happy] Reports needsFirstRunPrompt until the user answers

### `packages/cli/src/operations/InitProject.ts`

- [x] [happy] Creates `.stillmark/plans` and appends granular gitignore rules
- [x] [edge] Does not duplicate gitignore entries
- [x] [happy] Keeps plans ignored and toggles design learnings gitignore
- [x] [edge] Migrates the legacy `.stillmark/` gitignore rule

## 7. Git integration

### `packages/cli/src/git`

- [x] [happy] Does not spawn processes when git is off
- [x] [happy] Auto-commit commits only ROADMAP.md
- [x] [security] Refuses when `.stillmark/plans` is tracked
- [x] [happy] Commit message style learns the conventional format without copying scopes
- [x] [happy] Uses the configured template when set
- [x] [edge] Falls back to summary only without a conventional history
- [x] [happy] Attribution hook strips Cursor and Claude trailers
- [x] [edge] Keeps attribution when the setting is off
- [x] [security] Never overwrites a commit-msg hook it did not write
- [x] [edge] Hook status works and does nothing outside a git repository
- [x] [happy] Setup commit commits only Stillmark files, leaving other work untouched
- [x] [sad] Setup commit reports nothing to commit and refuses outside git

- [x] [happy] Git push sets the upstream on first push, then pushes only new commits
- [x] [security] Git push never commits and lists uncommitted files
- [x] [sad] Git push refuses outside git, without a remote, and reports a failed push
- [x] [happy] Commit type follows the change: docs-only, tests, CI, or config files, then the summary verb, then new source files
- [x] [edge] Never copies the type of the last commit and keeps a type the summary already has, dropping (t)
- [x] [edge] Never cuts a long subject; warns over 72 characters instead
- [x] [sad] Without a summary, asks for one instead of proposing a generic message for changes beyond Stillmark files, and refuses to commit
## 8. Install and update

### `packages/cli/src/update`

- [x] [happy] Defaults to daily automatic checks and updates only given fields
- [x] [happy] Version comparison orders prereleases first
- [x] [happy] Recommends npx when a newer CLI exists
- [x] [edge] Skips the registry until the interval passes, unless forced
- [x] [edge] Does not contact the registry when automatic checks are off
- [x] [sad] Records the check even when the registry fails
- [x] [happy] Refreshes agent files written by an older CLI and leaves edited current ones alone
- [x] [happy] Installs globally into the home directory, only the prompt for codex
- [x] [happy] Links source templates in dev mode without writing through the link
- [x] [edge] Skips the project copy when the agent is installed globally
- [x] [sad] Refuses an unknown agent and ignores agents never installed
- [x] [happy] Shared instructions contain the required rules

## 9. Caveman mode

### `packages/cli/src/caveman`

- [x] [happy] Off by default and hands agents no rules
- [x] [happy] Turns on with plain words and grows the rules per level
- [x] [sad] Refuses unknown levels without writing the config
- [x] [edge] Falls back to off when the config holds an invalid level
- [x] [happy] Accepts a shorter rewrite that keeps code, links, paths, and headings exact
- [x] [sad] Reports lost frontmatter, code blocks, headings, inline code, URLs, and paths
- [x] [edge] Reports a rewrite that is not smaller and ignores Windows line endings
- [x] [happy] Keeps the original, verifies the rewrite, reports savings, and restores
- [x] [edge] Compressing again reuses the kept original
- [x] [security] Refuses Stillmark documents and files outside the project
- [x] [sad] Refuses verify and restore before compress, missing files, and other formats
- [x] [happy] Turns on or off for the conversation only without touching the config
- [x] [happy] Saves the level with --save
## 10. Notifications

### `packages/cli/src/notify`

- [x] [security] Stores channels in the user home and masks tokens and webhook URLs in output
- [x] [sad] Refuses wrong Discord or Slack addresses, plain http, invalid URLs, and unknown types
- [x] [happy] Finds the Telegram chat from the last message sent to the bot
- [x] [sad] Explains what to do when the bot has no messages or the token is wrong
- [x] [happy] Sends the right payload to Telegram, Discord, Slack, and webhooks in the project language
- [x] [edge] Keeps sending to the other channels when one fails
- [x] [happy] Pauses without losing channels; test still sends while paused; remove works
- [x] [happy] Installs the Cursor stop hook once, keeping other hooks, and removes it
- [x] [happy] Installs the Claude Code Stop and Notification hooks, keeping other settings
- [x] [happy] Reads finished, failed, stopped, and waiting from the hook payload with a short summary
- [x] [edge] The hook sends without channels or offline without ever throwing
- [x] [edge] Keeps notifications short and skips code blocks in the summary
- [x] [security] Desktop notification command per platform with the text kept out of the script
- [x] [happy] Adds a desktop channel with nothing to configure and shows status as title, summary as body
- [x] [edge] Reports a missing notification program without stopping the other channels
- [x] [happy] Installs the Codex notify program at the top of config.toml once and removes it leaving the rest as written
- [x] [sad] Never replaces another Codex notify program and ignores notify keys inside tables
- [x] [happy] Reads the Codex event from the last argument: folder, last reply, and questions as waiting
## 11. Landing page

### `packages/landing-page`

- [x] [happy] Astro build produces a static GitHub Pages artifact
- [ ] [happy] Locale toggle switches every message between English and Portuguese
- [ ] [happy] Copy buttons copy the install prompt and show the copied state
- [x] [happy] Every topic, including changelog, builds its docs page
- [x] [happy] The clear writing topic builds its docs page in both languages

## 12. README generator

### `packages/cli/src/readme`
- [x] [happy] Every template uses catalog sections and maps headings in English, Portuguese, and Spanish
- [x] [happy] Reads scripts as commands for the detected package manager, bin, env var names, and linkable docs
- [x] [happy] Suggests app-root, package, cli, service, standard, or minimal from the project shape
- [x] [happy] Plan without a template suggests one and asks the user to pick
- [x] [happy] Plan backs up the README, maps existing headings, and lists URLs, ports, and env vars to keep
- [x] [sad] Refuses unknown templates, files outside the project, and non-markdown files
- [x] [sad] Check reports missing and empty sections, heading jumps, placeholders, unknown scripts and make targets, broken links, and lost facts
- [x] [edge] Ignores placeholders inside code and badge URLs
- [x] [happy] Restore brings the previous README back
- [x] [edge] Keeps the backup during a rewrite and refreshes it after a passing check

## 13. Changelog

### `packages/cli/src/changelog`
- [x] [happy] Keeps only feat, fix, and perf commits as entries, in sentence case
- [x] [edge] Creates a changelog with only Unreleased when there is no history, intro in the document language
- [x] [happy] Previews a sync without writing
- [x] [happy] Places done roadmap items in the release that shipped them, newest release first
- [x] [security] Falls back to feat and fix commits for releases without roadmap items and leaves secrets out
- [x] [happy] Adds new work to Unreleased, moves it into a new tag, and never rewrites released text
- [x] [edge] Uses version bumps of the project package.json when there are no tags
- [x] [sad] Reports done roadmap items without a date when releases exist
- [x] [happy] Adds plain entries under Unreleased by group, once, and refuses secrets
- [x] [happy] Lists roadmap items finished today only when the project keeps a changelog
- [x] [sad] Check finds structure errors, personal data, and technical wording

## 14. Clear writing

### `packages/cli/src/text`

- [x] [happy] Detects English, Portuguese, and Spanish, and falls back when the text is too short
- [x] [happy] Finds English marks of generated text with their line, excerpt, and fix
- [x] [happy] Uses the Portuguese catalog for Portuguese text
- [x] [edge] Checks each paragraph of a mixed document with its own language
- [x] [edge] Ignores code, inline code, URLs, frontmatter, and tables
- [x] [happy] Leaves clear text alone; long sentences and title-case headings only warn
- [x] [happy] Rewrite keeps the original and returns the rules and steps for the detected language
- [x] [security] Check during a rewrite flags lost facts and invented numbers, links, and code
- [x] [happy] A passing check accepts the rewrite; restore brings the original back
- [x] [sad] Refuses missing files, other file kinds, and Stillmark-managed documents for rewrite
- [x] [happy] Writing rules follow the configured or requested language and always forbid inventing facts
