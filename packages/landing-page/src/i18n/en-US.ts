export const enUS = {
    meta: {
        title: "Stillmark - roadmap, plan, and coverage CLI for AI agents",
        description:
            "Roadmap, private task plan, and test coverage checklist management for AI coding agents."
    },
    nav: {
        getStarted: "Get started",
        coverage: "Coverage",
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
                    "Use /stillmark for planning and design (browser selection + feedback). Use /coverage to keep COVERAGE.md aligned with tests."
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
        installPromptTemplate:
            "Read and execute the markdown install guide at {url}. Follow every step in that file to install Stillmark in this repository."
    },
    howItWorks: {
        title: "How it works",
        diagramActor: "User / Agent",
        diagramAria:
            "Agent intent flows through Stillmark into roadmap, task plan, and coverage checklist files.",
        publicLabel: "git",
        privateLabel: "local",
        diagramCoverageSkill: "/coverage",
        body:
            "Long-term goals live in the roadmap. Concrete work for the current objective lives in the private task plan under .stillmark/plans/. Test cases live in COVERAGE.md. Agents call the CLI with --json; /stillmark also handles UI fixes and stillmark config set records whether .stillmark/design-system/ is shared in git."
    },
    coverage: {
        title: "Test coverage companion",
        lead:
            "COVERAGE.md is a checkbox-only checklist grouped by area. No percentages or prose blocks - just cases tagged happy, sad, edge, or security that track what is actually tested.",
        points: [
            {
                title: "Agent skill",
                body: "Cursor and Claude installs include a /coverage skill. It prints help, runs update workflows, and edits the file in plain language."
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
            },
            {
                title: "COVERAGE.md companion",
                body: "Validate, check off, and add test cases with stillmark coverage while /coverage handles natural language."
            },
            {
                title: "Embedded design",
                body: "/stillmark design or casual feedback with a browser selection on your dev preview. Design playbooks ship inside the stillmark skill."
            },
            {
                title: "Local vs shared .stillmark",
                body: "Task plans always stay local. stillmark config status asks once whether to version design-system files in git."
            }
        ]
    },
    agents: {
        stepLabel: "Step 2",
        title: "Install agent templates",
        intro: "Choose your agent and copy the matching install command. Cursor and Claude also install the /coverage skill.",
        items: [
            { label: "Cursor", command: "stillmark install --agent cursor" },
            { label: "Claude", command: "stillmark install --agent claude" },
            { label: "Codex", command: "stillmark install --agent codex" }
        ]
    },
    commands: {
        title: "Command reference",
        intro: "Run from the project root. Add --json when an agent drives the CLI.",
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
            ["stillmark coverage add \"<heading>\" \"…\"", "Add a tagged case under a heading"],
            ["/stillmark", "Planning, config, and embedded design (selection + UI feedback)"],
            ["/coverage", "Agent skill: help, update workflow, free-text checklist edits"]
        ]
    },
    footer: {
        tagline: "Stillmark - roadmap, plan, and coverage companion for agentic development."
    }
};

export type Messages = typeof enUS;
