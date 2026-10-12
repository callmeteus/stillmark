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
        skipToContent: "Skip to main content"
    },
    quickStart: {
        title: "Get started in your repo",
        steps: [
            {
                title: "Send the install prompt",
                body:
                    "Copy the prompt above and paste it into your agent chat. The linked markdown lists every command, including stillmark init."
            },
            {
                title: "Install agent templates",
                body:
                    "Run stillmark install --agent with cursor, claude, or codex to add agent templates.",
                linkHref: "#agents",
                linkLabel: "See install commands"
            },
            {
                title: "Plan with your agent",
                body:
                    "Use /stillmark for everything: planning, /stillmark coverage for the test checklist, and design (browser selection + feedback)."
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
            "Say what should change. Stillmark updates your roadmap, private task plan, and test checklist - plus embedded UI work through /stillmark, without hand-editing markdown.",
        installLabel: "Ask your agent to install",
        installCliLabel: "Run in your terminal",
        installTabGroupLabel: "Install method",
        installModeAgentLabel: "Agent",
        installModeCliLabel: "CLI",
        cliInstallCommand: "npx stillmark@latest init",
        cliInstallHint: "Requires Node.js. Then run stillmark install --agent with your editor.",
        installPromptTemplate:
            "Read and execute the markdown install guide at {url}. Follow every step in that file to install Stillmark in this repository."
    },
    howItWorks: {
        title: "How it works",
        lead:
            "You describe what should change in chat. Stillmark keeps strategy, current work, and test tracking in three clear buckets.",
        items: [
            {
                title: "Roadmap",
                badge: "Shared with the team",
                body: "Long-term goals and priorities everyone can see in the repo."
            },
            {
                title: "Current plan",
                badge: "Private on your machine",
                body: "Concrete tasks for what you are building right now, without publishing half-baked plans."
            },
            {
                title: "Test checklist",
                badge: "Shared with the team",
                body: "A simple list of what is already covered by tests, so nothing important is forgotten."
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
                body: "/stillmark coverage shows help, /stillmark coverage update reconciles with git changes, and free text after /stillmark coverage edits the checklist in plain language."
            },
            {
                title: "Strict format",
                body: "stillmark coverage validate catches legacy prose, wrong tags, and empty headings before you commit."
            },
            {
                title: "Git-aware updates",
                body: "stillmark coverage update lists source and test files that changed since the last COVERAGE.md commit so the agent knows what to reconcile."
            }
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
                body: "Ask for spacing, type, color, or layout in plain language, or open with /stillmark design and a short brief."
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
                body: "/stillmark handles adds, deferrals, priorities, and moves. The CLI keeps sections, IDs, and history intact."
            },
            {
                title: "Scope and privacy",
                body: "Sensitive roadmap content and work outside the current objective are flagged before they land in shared files."
            },
            {
                title: "Long-running work",
                body: "When a task spans many agent turns, approved plan updates are saved so execution can continue safely."
            }
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
                title: "stillmark config",
                body: "On first use, stillmark config status asks whether design reference files under .stillmark should be versioned with the project."
            },
            {
                title: "Optional roadmap git",
                body: "When you enable it in config, Stillmark can commit or push ROADMAP.md for you - never the private plan folder."
            }
        ]
    },
    features: {
        title: "Features",
        items: [
            {
                title: "Natural language and commands",
                body: "Add, defer, reprioritize, and move items without hand-editing markdown."
            },
            {
                title: "Safe incremental writes",
                body: "Parsers preserve unrelated sections, IDs, and history."
            },
            {
                title: "Scope and privacy guards",
                body: "Out-of-scope work and sensitive roadmap content are blocked by default."
            },
            {
                title: "Long-running mode",
                body: "Authorized plan changes persist before the agent continues execution."
            },
            {
                title: "Learns from you",
                body: "Commit messages follow your recent git history instead of a fixed roadmap template. Preview with stillmark git commit-style."
            },
            {
                title: "Optional git for roadmap",
                body: "Auto-commit or push ROADMAP.md only when you enable it in config."
            }
        ]
    },
    agents: {
        stepLabel: "Step 2",
        title: "Install agent templates",
        intro: "One stillmark skill handles planning, coverage, and design through /stillmark.",
        tabGroupLabel: "Installation agent",
        items: [
            { label: "Cursor", command: "stillmark install --agent cursor" },
            { label: "Claude", command: "stillmark install --agent claude" },
            { label: "Codex", command: "stillmark install --agent codex" }
        ]
    },
    commands: {
        title: "Command reference",
        modeAgentLabel: "Agent (/stillmark)",
        modeConsoleLabel: "Terminal",
        modeGroupLabel: "Command reference view",
        tableCommand: "Command",
        tableDescription: "What it does",
        rows: [
            ["stillmark init", "Create ROADMAP.md, stillmark.config.json, and .stillmark/plans/"],
            ["stillmark install --agent cursor|claude|codex", "Install agent skills and shared instructions"],
            ["stillmark config status", "First-run prompt state and sharing flags (--json)"],
            ["stillmark config set --design-system=…", "Keep design-system local or version it in git (--prompted)"],
            ["stillmark classify \"…\"", "Route ambiguous text to roadmap vs plan"],
            ["stillmark add \"…\"", "Add using classify, then roadmap or plan"],
            ["stillmark roadmap add \"…\"", "Add a public roadmap item"],
            ["stillmark roadmap defer \"…\"", "Move a roadmap item to deferred"],
            ["stillmark roadmap priority \"…\" <level>", "Change roadmap priority"],
            ["stillmark plan init [objective]", "Start TASK_PLAN.md for the current objective"],
            ["stillmark plan add \"…\"", "Add a task to the active plan"],
            ["stillmark plan blocked \"…\" <reason>", "Mark a plan task blocked"],
            ["stillmark move \"…\" to plan", "Promote roadmap work into the plan (--confirm)"],
            ["stillmark move \"…\" to roadmap", "Move work back to the roadmap (--confirm)"],
            ["stillmark long-running apply \"…\"", "Persist an authorized in-scope plan change"],
            ["stillmark git commit-style \"…\"", "Preview commit subject learned from git log"],
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
    footer: {
        tagline: "Stillmark - roadmap, plan, and coverage companion for agentic development."
    }
};

export type Messages = typeof enUS;
