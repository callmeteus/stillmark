/**
 * English copy for the site shell, the home page, and the docs overview.
 * Topic pages keep their copy in `topics/`.
 */
export const enUS = {
    ui: {
        skipToContent: "Skip to main content",
        home: "Stillmark home",
        github: "Stillmark on GitHub",
        switchLanguage: "Mudar idioma para português",
        nav: {
            label: "Main",
            docs: "Docs",
            commands: "Commands",
            install: "Install"
        },
        copy: {
            copy: "Copy",
            copied: "Copied",
            failed: "Could not copy. Select the text and copy it yourself.",
            ready: "Ready to paste."
        },
        entry: {
            youSay: "You say",
            runs: "Stillmark runs",
            changes: "What changes",
            excerpt: "Changed line marked"
        },
        compare: {
            before: "Before",
            after: "After",
            without: "Without Stillmark",
            with: "With Stillmark",
            label: "Drag to compare before and after"
        },
        commands: {
            title: "Commands",
            chatHint: "Each one also works in chat: type /stillmark followed by the same words.",
            command: "Command",
            description: "What it does",
            count: "commands"
        },
        topic: {
            onThisPage: "On this page",
            contrast: "Without and with Stillmark",
            tryIt: "Try it",
            tryItHint: "Type this in your agent chat. Stillmark picks the right command.",
            examples: "Examples"
        },
        pager: {
            label: "More docs",
            previous: "Previous",
            next: "Next"
        },
        docsNav: {
            label: "Docs",
            browse: "Browse the docs",
            overview: "Overview"
        },
        groups: {
            start: "Get started",
            planning: "Planning",
            quality: "Quality",
            workflow: "Workflow"
        },
        install: {
            agentLabel: "Paste in your agent chat",
            cliLabel: "Or run in your terminal",
            promptTemplate: "Read and execute the markdown install guide at {url}. Follow every step in that file to install Stillmark in this repository."
        },
        footer: {
            tagline: "Stillmark keeps your roadmap, private plan, and test checklist current while an AI agent works.",
            license: "MIT License",
            installGuide: "Install guide for agents"
        }
    },
    home: {
        meta: {
            title: "Stillmark - turn AI slop into work you're proud to ship",
            description: "Say what should change. Stillmark updates your roadmap, private task plan, and test checklist, and fixes the screens you point at."
        },
        hero: {
            headlineFirst: "Turn AI slop",
            headlineSecond: "into work you're proud to ship.",
            lead: "Tell your AI agent what should change, in plain words. Stillmark keeps the roadmap, your private task plan, and the test checklist in order, fixes the screens you point at, and touches only the lines you asked for. Every change dated and signed.",
            primary: "Install",
            secondary: "Read the docs",
            worksWith: "Works with"
        },
        design: {
            title: "Point at the screen. Get it fixed.",
            lead: "Select what looks off in your local preview and say it in plain words. The agent fixes it in the code and remembers your taste for next time. Drag the handle to compare.",
            say: "These cards are too cramped.",
            more: "More about design",
            mock: {
                heading: "Pick a plan",
                period: "/month",
                cta: "Choose plan",
                badge: "Popular",
                plans: [
                    { name: "Starter", price: "$0", feature: "1 project" },
                    { name: "Pro", price: "$12", feature: "10 projects" },
                    { name: "Team", price: "$29", feature: "Unlimited projects" }
                ]
            }
        },
        picker: {
            title: "Start with what you want to change.",
            lead: "Pick a topic and drag the handle to see what working looks like without Stillmark and with it.",
            tabsLabel: "Topics",
            openDocs: "More about"
        },
        why: {
            title: "The agent decides. The command writes.",
            lead: "Asking an AI to edit a planning file directly works until it doesn't: it rewrites the file from memory, renumbers items, loses a line, or adds the same goal twice. Stillmark splits the job. The skill teaches your agent to understand what you meant, and a small command line tool makes the actual change, the same way every time. Less room for the AI to make things up.",
            without: {
                title: "The agent edits the file itself",
                items: [
                    "Rewrites the whole file to change one line",
                    "Can invent an ID or reuse one that already exists",
                    "Easily misses a duplicate or a pasted password",
                    "Every run comes out a little different"
                ]
            },
            with: {
                title: "The agent asks Stillmark",
                items: [
                    "Only the line you asked for changes",
                    "Each item gets the next free ID and keeps it",
                    "Duplicates and anything that looks like a secret are refused",
                    "Same result every time, with a report of exactly what changed"
                ]
            }
        },
        features: {
            title: "One place for the plan, the work, and the proof.",
            items: [
                {
                    slug: "roadmap",
                    file: "ROADMAP.md",
                    title: "A roadmap the team shares",
                    body: "Long-term goals live in the repo. Each one keeps its ID, priority, and dates while it moves from backlog to done."
                },
                {
                    slug: "plan",
                    file: "TASK_PLAN.md",
                    title: "A task plan that stays yours",
                    body: "The steps of the current feature stay on your machine, never committed, and are checked off as the agent works."
                },
                {
                    slug: "coverage",
                    file: "COVERAGE.md",
                    title: "A checklist of what is tested",
                    body: "Every case you care about is listed, so you can see what is covered and what still needs a test."
                },
                {
                    slug: "roadmap",
                    file: "",
                    title: "Nothing slips in by accident",
                    body: "Anything that looks like a password or key is refused before it reaches a shared file, and so is a goal that already exists."
                }
            ]
        },
        log: {
            title: "Stillmark in action",
            lead: "Every request becomes a dated line in the right file. Refused ones stay in the log, struck through, so you see what was stopped and why.",
            columns: {
                time: "Time",
                said: "You said",
                entry: "Entry",
                result: "Result",
                file: "File"
            },
            rows: [
                { time: "09:12", said: "Push the billing export out of this milestone.", entry: "R-014", result: "deferred", file: "ROADMAP.md", refused: false },
                { time: "09:31", said: "Add a task to retry webhooks on 429.", entry: "T-007", result: "added, private", file: "TASK_PLAN.md", refused: false },
                { time: "09:40", said: "Add retry on 429 to the plan.", entry: "T-007", result: "duplicate refused", file: "TASK_PLAN.md", refused: true },
                { time: "09:47", said: "The lockout case is tested now.", entry: "lockout", result: "checked", file: "COVERAGE.md", refused: false }
            ]
        },
        install: {
            title: "Install Stillmark",
            lead: "Three steps, about a minute.",
            steps: [
                {
                    title: "Set up the project",
                    body: "Run this in the project folder. It creates the roadmap, the private plan folder, and the settings file."
                },
                {
                    title: "Add /stillmark to your editor",
                    body: "Pick your editor. Your agent learns the /stillmark command and the skill behind it."
                },
                {
                    title: "Say what should change",
                    body: "Type /stillmark and a request in plain words. Stillmark finds the right file and the right line."
                }
            ],
            example: "/stillmark add SSO for enterprise customers, high priority",
            agentsLabel: "Editor",
            shortcut: "Prefer one step? Paste this in your agent chat and it does the first two for you."
        }
    },
    docs: {
        meta: {
            title: "Stillmark docs",
            description: "What Stillmark does, topic by topic: install, settings, roadmap, plan, coverage, design, README, changelog, clear writing, git, and notifications."
        },
        title: "Start with Stillmark",
        lead: "Stillmark keeps a few project files current while your AI agent works. Install it once, then ask for changes in plain words.",
        getStarted: {
            title: "Get started",
            body: "Paste the prompt in your agent chat, or run the command yourself in the project folder."
        },
        working: {
            title: "What are you working on?",
            lead: "Pick the closest one. Each card shows something you can type right away.",
            cards: [
                { slug: "roadmap", title: "Planning the next milestone", body: "Add, defer, and finish goals the whole team sees." },
                { slug: "plan", title: "Building a feature", body: "Break the work into private tasks and check them off." },
                { slug: "coverage", title: "Testing what you built", body: "Keep a list of the cases that matter and mark them tested." },
                { slug: "design", title: "Fixing a screen", body: "Point at what looks off and get it fixed the same way next time." }
            ]
        },
        reference: {
            title: "Command reference",
            lead: "Every topic, grouped by what it looks after. Each page lists its commands with an example."
        }
    }
};

export type SiteMessages = typeof enUS;
