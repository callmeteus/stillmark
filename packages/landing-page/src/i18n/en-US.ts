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
                    "Ask your agent to add or move work in plain language. Use /coverage to keep COVERAGE.md aligned with tests."
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
            "Say what should change. Stillmark updates your roadmap, private task plan, and test checklist - no hand-editing markdown.",
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
            "Long-term goals live in the roadmap. Concrete work for the current objective lives in the private task plan. Test cases live in COVERAGE.md as checkboxes your agent reconciles with real tests via /coverage and stillmark coverage validate."
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
        tableCommand: "Command",
        tableDescription: "What it does",
        rows: [
            ["stillmark roadmap add", "Add a roadmap item"],
            ["stillmark plan add", "Add a task to the active plan"],
            ["stillmark add", "Infer roadmap vs plan"],
            ["stillmark move … to plan", "Promote roadmap work into the plan"],
            ["stillmark long-running apply", "Apply an in-scope change during execution"],
            ["stillmark git commit-style", "Preview commit subject learned from git log"],
            ["stillmark coverage init", "Create a starter COVERAGE.md"],
            ["stillmark coverage validate", "Validate checkbox format (exit 1 on errors)"],
            ["stillmark coverage update", "Git hints since last COVERAGE.md commit"],
            ["/coverage", "Agent skill: help, update workflow, free-text edits"]
        ]
    },
    footer: {
        tagline: "Stillmark - roadmap, plan, and coverage companion for agentic development."
    }
};

export type Messages = typeof enUS;
