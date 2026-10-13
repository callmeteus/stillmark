export const enUS = {
    meta: {
        title: "Stillmark - roadmap, plan, and coverage CLI for AI agents",
        description:
            "Roadmap, private task plan, and test coverage checklist management for AI coding agents."
    },
    nav: {
        getStarted: "Get started",
        coverage: "Coverage",
        design: "Design",
        planning: "Planning",
        commands: "Commands",
        github: "GitHub",
        githubUnavailable: "Repository link not configured yet",
        skipToContent: "Skip to main content",
        home: "Stillmark home"
    },
    quickStart: {
        title: "Get started in your repo",
        steps: [
            {
                title: "Send the install prompt",
                body:
                    "Copy the prompt from the top of the page and paste it into your agent chat. The linked guide lists every command, including `/stillmark init`."
            },
            {
                title: "Install agent templates",
                body: "Pick your editor and run the matching command to add the stillmark skill."
            },
            {
                title: "Plan with your agent",
                body:
                    "Use `/stillmark` for everything: planning, `/stillmark coverage` for the test checklist, and `/stillmark design` for UI feedback."
            }
        ]
    },
    copy: {
        copy: "Copy prompt",
        copyShort: "Copy",
        copied: "Copied",
        failed: "Could not copy. Select the prompt and copy manually.",
        manualHint: "You can also select the prompt text and copy it yourself.",
        readyInTerminal: "Ready to paste into your agent chat."
    },
    hero: {
        title: "Plan in plain language. Ship with a clear trail.",
        subtitle:
            "Say what should change. Stillmark updates your roadmap, private task plan, and test checklist - and fixes the design of screens you point at in the browser. No hand-editing markdown.",
        installLabel: "Ask your agent to install",
        installCliLabel: "Run in your terminal",
        installTabGroupLabel: "Install method",
        installModeAgentLabel: "Agent",
        installModeCliLabel: "CLI",
        cliInstallCommand: "npx stillmark@latest init",
        cliInstallHint: "Requires Node.js. Then run stillmark install --agent with your editor.",
        installPromptTemplate:
            "Read and execute the markdown install guide at {url}. Follow every step in that file to install Stillmark in this repository.",
        installScopeGroupLabel: "Where to install",
        installScopeProjectLabel: "This project",
        installScopeGlobalLabel: "Global",
        installPromptGlobalTemplate:
            "Read and execute the markdown install guide at {url}. Follow the global install steps in that file so Stillmark works in every project on this computer.",
        cliInstallGlobalCommand: "npx stillmark@latest install --agent cursor --global",
        cliInstallGlobalHint: "Requires Node.js. Swap cursor for claude or codex. Works in every project.",
        demo: {
            label: "Example revisions",
            requestLabel: "You say",
            commandLabel: "Stillmark runs",
            revisionColumn: "Rev",
            changeColumn: "Change",
            sharedTag: "Shared",
            localTag: "Local only",
            requests: [
                {
                    say: "Push the billing export out of this milestone.",
                    run: "/stillmark roadmap defer \"billing export\""
                },
                {
                    say: "Add a task to retry webhooks on 429.",
                    run: "/stillmark plan add \"Retry on HTTP 429\""
                },
                {
                    say: "The lockout case is tested now.",
                    run: "/stillmark coverage check \"lockout\""
                }
            ],
            roadmap: ["## Milestone A", "- [ ] **R-012** Team invites", "## Deferred", "- [ ] **R-014** Billing export"],
            plan: ["## Objective", "Webhooks v2", "### T-006 Sign payloads", "### T-007 Retry on HTTP 429"],
            coverage: [
                "## Auth",
                "- [x] [happy] login with valid password",
                "- [ ] [edge] expired session",
                "- [x] [sad] lockout after 5 failed tries"
            ],
            revisions: ["Roadmap: R-014 deferred", "Plan: T-007 added on your machine", "Coverage: lockout checked"]
        }
    },
    howItWorks: {
        title: "How it works",
        lead:
            "You describe what should change in chat. Stillmark keeps strategy, current work, and test tracking in three clear buckets.",
        legendShared: "Solid line: committed with the repo",
        legendLocal: "Dashed line: stays on your machine",
        items: [
            {
                title: "Roadmap",
                badge: "Shared with the team",
                body: "Long-term goals and priorities everyone can see in the repo.",
                file: "ROADMAP.md"
            },
            {
                title: "Current plan",
                badge: "Private on your machine",
                body: "Concrete tasks for what you are building right now, without publishing half-baked plans.",
                file: ".stillmark/plans/TASK_PLAN.md"
            },
            {
                title: "Test checklist",
                badge: "Shared with the team",
                body: "A simple list of what is already covered by tests, so nothing important is forgotten.",
                file: "COVERAGE.md"
            }
        ]
    },
    coverage: {
        title: "Test coverage companion",
        lead:
            "COVERAGE.md is a checkbox-only checklist grouped by area. No percentages or prose blocks - just cases tagged happy, sad, edge, or security that track what is actually tested.",
        points: [
            {
                title: "Via /stillmark coverage",
                body: "`/stillmark coverage` shows help, `/stillmark coverage update` reconciles with git changes, and free text after `/stillmark coverage` edits the checklist in plain language."
            },
            {
                title: "Strict format",
                body: "`/stillmark coverage validate` catches legacy prose, wrong tags, and empty headings before you commit."
            },
            {
                title: "Git-aware updates",
                body: "`/stillmark coverage update` lists source and test files that changed since the last COVERAGE.md commit so the agent knows what to reconcile."
            }
        ],
        sample: [
            "## Auth",
            "- [x] [happy] login with valid password",
            "- [x] [sad] lockout after 5 failed tries",
            "- [ ] [security] reset link expires after use",
            "## Billing",
            "- [ ] [edge] invoice with zero items"
        ]
    },
    design: {
        title: "UI design companion",
        lead:
            "Point at what looks wrong in your running app and say what should change. Stillmark connects that feedback to your project instead of one-off tweaks.",
        points: [
            {
                title: "Browser selection",
                body: "Select an element on your local preview. The agent finds the matching screen or component in your codebase."
            },
            {
                title: "Via /stillmark design",
                body: "Ask for spacing, type, color, or layout in plain language, or open with `/stillmark design` and a short brief."
            },
            {
                title: "Consistent polish",
                body: "Design playbooks ship inside the stillmark skill so visual fixes stay aligned across sessions."
            }
        ]
    },
    planning: {
        title: "Planning companion",
        lead:
            "Turn vague intent into a shared roadmap and a private task list without hand-editing markdown for every change.",
        points: [
            {
                title: "Natural language",
                body: "`/stillmark` handles adds, deferrals, priorities, and moves. The CLI keeps sections, IDs, and history intact."
            },
            {
                title: "Scope and privacy",
                body: "Sensitive roadmap content and work outside the current objective are flagged before they land in shared files."
            },
            {
                title: "Long-running work",
                body: "When a task spans many agent turns, approved plan updates are saved so execution can continue safely."
            }
        ],
        sample: [
            "### T-007 Retry on HTTP 429",
            "status: in-progress",
            "priority: high",
            "depends: T-006",
            "#### Acceptance criteria",
            "- Retries three times with backoff"
        ]
    },
    workspace: {
        title: "Workspace preferences",
        lead:
            "Stillmark keeps task plans on your machine by default and asks once how much of .stillmark you want in git.",
        points: [
            {
                title: "Private task plans",
                body: "Active execution plans stay local. Only the roadmap and test checklist are meant for the team repo."
            },
            {
                title: "/stillmark config",
                body: "On first use, `/stillmark config status` asks whether `.stillmark/learnings/design/` should be versioned with the project."
            },
            {
                title: "Optional roadmap git",
                body: "When you enable it in config, Stillmark can commit or push ROADMAP.md for you - never the private plan folder."
            },
            {
                title: "Learns from you",
                body: "Commit subjects follow your recent git log (`/stillmark git message-style`). Design and code habits accumulate as markdown under `.stillmark/learnings/design/` and `.stillmark/learnings/code-style/`, like Cursor rules."
            }
        ],
        tree: [
            { path: "ROADMAP.md", note: "shared", local: false },
            { path: "COVERAGE.md", note: "shared", local: false },
            { path: "stillmark.config.json", note: "shared", local: false },
            { path: ".stillmark/plans/", note: "on your machine", local: true },
            { path: ".stillmark/learnings/design/", note: "local until you opt in", local: true }
        ]
    },
    agents: {
        tabGroupLabel: "Installation agent",
        items: [
            { label: "Cursor", command: "stillmark install --agent cursor" },
            { label: "Claude", command: "stillmark install --agent claude" },
            { label: "Codex", command: "stillmark install --agent codex" }
        ]
    },
    commands: {
        title: "Command reference",
        lead: "Every terminal command also works through your agent. Switch the view to see either form.",
        modeAgentLabel: "Agent (/stillmark)",
        modeConsoleLabel: "Terminal",
        modeGroupLabel: "Command reference view",
        tableCommand: "Command",
        tableDescription: "What it does",
        rows: [
            ["stillmark init", "Create ROADMAP.md, stillmark.config.json, and .stillmark/plans/"],
            ["stillmark install --agent cursor|claude|codex", "Install agent skills and shared instructions (`--global` for every project)"],
            ["stillmark config status", "First-run prompt state and sharing flags (`--json`)"],
            ["stillmark config set --design-system=…", "Keep design learnings local or version .stillmark/learnings/design in git (`--prompted`)"],
            ["stillmark config set --detail=…", "Compact entries or entries with details below them, for everything or one document (`--module=coverage|roadmap|plan`)"],
            ["stillmark update", "Looks for a new version on its own, once a day by default (`--force` checks now, `apply` updates)"],
            ["stillmark config set --auto-update=…", "Turn automatic update checks on or off, or change how often they run (`--update-interval=<hours>`)"],
            ["stillmark classify \"…\"", "Route ambiguous text to roadmap vs plan"],
            ["stillmark add \"…\"", "Add using classify, then roadmap or plan"],
            ["stillmark roadmap add \"…\"", "Add a public roadmap item"],
            ["stillmark roadmap done \"…\"", "Mark a roadmap item as done"],
            ["stillmark roadmap add \"…\" --done --commit=<sha>", "Record work that already shipped, dated by the commit that delivered it"],
            ["stillmark config set --roadmap-dates=false", "Stop adding dates to roadmap items (on by default)"],
            ["stillmark config set --strip-attribution=false", "Keep \"Co-authored-by\" lines from Cursor and Claude in commits (removed by default)"],
            ["stillmark roadmap defer \"…\"", "Move a roadmap item to deferred"],
            ["stillmark roadmap priority \"…\" <level>", "Change roadmap priority"],
            ["stillmark plan init [objective]", "Start TASK_PLAN.md for the current objective"],
            ["stillmark plan scope --in-scope \"…\"", "Set the objective, what is in, and what stays out of the current plan (`--out-of-scope`, `--replace`)"],
            ["stillmark plan add \"…\" --priority=high", "Add a task to the active plan, with optional priority"],
            ["stillmark plan priority \"…\" <level>", "Change a plan task priority"],
            ["stillmark plan blocked \"…\" <reason>", "Mark a plan task blocked"],
            ["stillmark move \"…\" to plan", "Promote roadmap work into the plan (`--confirm`)"],
            ["stillmark move \"…\" to roadmap", "Move work back to the roadmap (`--confirm`)"],
            ["stillmark long-running apply \"…\"", "Persist an authorized in-scope plan change"],
            ["stillmark git message-style \"…\"", "Preview commit subject learned from git log"],
            ["stillmark coverage init", "Create a starter COVERAGE.md"],
            ["stillmark coverage validate", "Validate checkbox format (exit 1 on errors)"],
            ["stillmark coverage summary", "Print checklist stats without full validation noise"],
            ["stillmark coverage update", "List source and test files changed since last COVERAGE commit"],
            ["stillmark coverage check \"…\"", "Check off a case by substring match"],
            ["stillmark coverage uncheck \"…\"", "Uncheck a case"],
            ["stillmark coverage add \"<heading>\" \"…\"", "Add a tagged case under a heading"]
        ],
        agentOnlyRows: [
            ["/stillmark coverage", "Print help only (no file changes)"],
            ["/stillmark coverage <text>", "Free-text COVERAGE.md edits"],
            ["/stillmark design …", "UI fixes; browser selection on your local dev preview"]
        ]
    },
    close: {
        title: "Add Stillmark to your repo",
        body: "One command creates ROADMAP.md, the private plan folder, and the config. Then install the skill for your editor.",
        agentLink: "Prefer to let your agent do it? Copy the install prompt"
    },
    footer: {
        tagline: "Stillmark - roadmap, plan, and coverage companion for agentic development.",
        license: "MIT License",
        backToInstall: "Back to install"
    }
};

export type Messages = typeof enUS;
