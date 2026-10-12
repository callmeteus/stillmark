import fs from "node:fs";

import { installAgent, type AgentId } from "../adapters";
import { loadConfig, type GitOverride } from "../config";
import { parseTaskPlan } from "../documents";
import { GitRunner, resolveCommitMessage } from "../git";
import { classifyIntent } from "../intent";
import { applyPlanChange } from "../long-running";
import {
    addCoverageCase,
    checkCoverageCase,
    coverageSummary,
    coverageUpdateHints,
    initCoverage,
    uncheckCoverageCase,
    validateCoverageDocument
} from "../coverage";
import {
    addPlanTask,
    addRoadmapItem,
    initProject,
    initTaskPlan,
    moveToPlan,
    moveToRoadmap,
    updatePlanTask,
    updateRoadmapItem
} from "../operations";
import { resolveProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

export interface CliOptions {
    json: boolean;
    root: string;
    gitOverride: GitOverride;
    gitRunner?: GitRunner;
}

function parseFlags(argv: string[]): {
    flags: Record<string, string | boolean>;
    positional: string[];
} {
    const flags: Record<string, string | boolean> = {};
    const positional: string[] = [];

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === "--json") {
            flags.json = true;
        } else
        if (arg === "--git") {
            flags.git = true;
        } else
        if (arg === "--no-git") {
            flags.noGit = true;
        } else
        if (arg === "--accept-scope-change") {
            flags.acceptScopeChange = true;
        } else
        if (arg === "--allow-sensitive") {
            flags.allowSensitive = true;
        } else
        if (arg === "--confirm") {
            flags.confirm = true;
        } else
        if (arg.startsWith("--root=")) {
            flags.root = arg.slice("--root=".length);
        } else
        if (arg === "--root" && argv[i + 1]) {
            flags.root = argv[++i];
        } else
        if (arg.startsWith("--agent=")) {
            flags.agent = arg.slice("--agent=".length);
        } else
        if (arg === "--agent" && argv[i + 1]) {
            flags.agent = argv[++i];
        } else
        if (arg.startsWith("--tag=")) {
            flags.tag = arg.slice("--tag=".length);
        } else
        if (arg === "--tag" && argv[i + 1]) {
            flags.tag = argv[++i];
        } else
        if (arg === "--checked") {
            flags.checked = true;
        } else {
            positional.push(arg);
        }
    }

    return { flags, positional };
}

function output(result: OperationResult, json: boolean): void {
    if (json) {
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log(result.summary ?? JSON.stringify(result));
    }
}

function gitOverrideFromFlags(
    flags: Record<string, string | boolean>
): GitOverride {
    if (flags.git) {
        return "force-on";
    }

    if (flags.noGit) {
        return "force-off";
    }

    return "default";
}

/**
 * Main CLI entry.
 */
export async function runCli(argv: string[]): Promise<number> {
    const args = argv.slice(2);
    const { flags, positional } = parseFlags(args);
    const root = (flags.root as string) ?? process.cwd();
    const paths = resolveProjectPaths(root);
    const json = Boolean(flags.json);
    const gitOverride = gitOverrideFromFlags(flags);
    const gitRunner = new GitRunner();

    const cmd = positional[0];
    const sub = positional[1];

    try {
        if (cmd === "init") {
            output(initProject(paths), json);

            return 0;
        }

        if (cmd === "classify") {
            const text = positional.slice(1).join(" ");
            const hasPlan = fs.existsSync(paths.taskPlan);
            let objective = "";

            if (hasPlan) {
                objective = parseTaskPlan(
                    fs.readFileSync(paths.taskPlan, "utf8")
                ).objective;
            }

            output(
                classifyIntent({
                    text,
                    hasActivePlan: hasPlan,
                    objectiveSnippet: objective
                }),
                json
            );

            return 0;
        }

        if (cmd === "install") {
            const agent = (flags.agent as AgentId) ?? (sub as AgentId);
            const result = installAgent(paths.root, agent);
            output(
                {
                    ok: true,
                    changed: true,
                    summary: `Installed ${agent} templates`,
                    location: result.installed.join(", ")
                },
                json
            );

            return 0;
        }

        if (cmd === "long-running") {
            if (sub === "apply" && positional[2]) {
                const desc = positional.slice(2).join(" ");
                output(
                    applyPlanChange(paths, {
                        description: desc,
                        acceptScopeChange: Boolean(flags.acceptScopeChange)
                    }),
                    json
                );

                return 0;
            }

            output(
                {
                    ok: false,
                    changed: false,
                    summary: "Usage: stillmark long-running apply <description>"
                },
                json
            );

            return 1;
        }

        if (cmd === "roadmap") {
            if (sub === "add" && positional[2]) {
                const desc = positional.slice(2).join(" ");
                const planRaw = fs.existsSync(paths.taskPlan)
                    ? fs.readFileSync(paths.taskPlan, "utf8")
                    : undefined;
                output(
                    await addRoadmapItem(paths, {
                        description: desc,
                        allowSensitive: Boolean(flags.allowSensitive),
                        gitOverride,
                        privatePlanRaw: planRaw,
                        gitRunner
                    }),
                    json
                );

                return 0;
            }

            if (sub === "defer" && positional[2]) {
                output(
                    updateRoadmapItem(paths, {
                        query: positional.slice(2).join(" "),
                        defer: true
                    }),
                    json
                );

                return 0;
            }

            if (sub === "priority" && positional[2] && positional[3]) {
                output(
                    updateRoadmapItem(paths, {
                        query: positional[2],
                        priority: positional[3]
                    }),
                    json
                );

                return 0;
            }

            output(
                {
                    ok: true,
                    changed: false,
                    summary: fs.existsSync(paths.roadmap)
                        ? fs.readFileSync(paths.roadmap, "utf8").slice(0, 2000)
                        : "No ROADMAP.md"
                },
                json
            );

            return 0;
        }

        if (cmd === "plan") {
            if (sub === "init") {
                const objective = positional.slice(2).join(" ") || undefined;
                output(initTaskPlan(paths, objective), json);

                return 0;
            }

            if (sub === "add" && positional[2]) {
                output(
                    addPlanTask(paths, {
                        description: positional.slice(2).join(" "),
                        acceptScopeChange: Boolean(flags.acceptScopeChange)
                    }),
                    json
                );

                return 0;
            }

            if (sub === "blocked" && positional[2] && positional[3]) {
                output(
                    updatePlanTask(paths, {
                        query: positional[2],
                        blockedBy: positional.slice(3).join(" ")
                    }),
                    json
                );

                return 0;
            }

            output(
                {
                    ok: true,
                    changed: false,
                    summary: fs.existsSync(paths.taskPlan)
                        ? fs.readFileSync(paths.taskPlan, "utf8").slice(0, 2000)
                        : "No TASK_PLAN.md"
                },
                json
            );

            return 0;
        }

        if (cmd === "add" && positional[1]) {
            const text = positional.slice(1).join(" ");
            const classified = classifyIntent({
                text,
                hasActivePlan: fs.existsSync(paths.taskPlan)
            });

            if (classified.needsClarification) {
                output(classified, json);

                return 1;
            }

            const dest = classified.summary;

            if (dest === "roadmap") {
                output(
                    await addRoadmapItem(paths, {
                        description: text,
                        gitOverride,
                        gitRunner
                    }),
                    json
                );
            } else {
                output(
                    addPlanTask(paths, {
                        description: text,
                        acceptScopeChange: Boolean(flags.acceptScopeChange)
                    }),
                    json
                );
            }

            return 0;
        }

        if (cmd === "git") {
            if (sub === "commit-style" || sub === "suggest") {
                const summary =
                    positional.slice(2).join(" ") || "Atualização do Stillmark";
                const config = loadConfig(paths);
                const resolved = await resolveCommitMessage(
                    paths.root,
                    summary,
                    config.git.commitMessage,
                    gitRunner
                );
                output(
                    {
                        ok: true,
                        changed: false,
                        action: "git-commit-style",
                        summary: resolved.message,
                        commitMessage: resolved
                    },
                    json
                );

                return 0;
            }

            output(
                {
                    ok: false,
                    changed: false,
                    summary: "Usage: stillmark git commit-style [summary text]"
                },
                json
            );

            return 1;
        }

        if (cmd === "coverage") {
            if (sub === "init") {
                output(initCoverage(paths), json);

                return 0;
            }

            if (sub === "validate" || sub === "summary") {
                const result = sub === "summary"
                    ? coverageSummary(paths)
                    : validateCoverageDocument(paths);
                output(result, json);

                return result.ok ? 0 : 1;
            }

            if (sub === "update") {
                output(
                    await coverageUpdateHints(paths, gitRunner),
                    json
                );

                return 0;
            }

            if (sub === "check" && positional[2]) {
                const result = checkCoverageCase(
                    paths,
                    positional.slice(2).join(" ")
                );
                output(result, json);

                return result.ok ? 0 : 1;
            }

            if (sub === "uncheck" && positional[2]) {
                const result = uncheckCoverageCase(
                    paths,
                    positional.slice(2).join(" ")
                );
                output(result, json);

                return result.ok ? 0 : 1;
            }

            if (sub === "add" && positional[2] && positional[3]) {
                const tag = flags.tag as string | undefined;
                const allowedTag =
                    tag === "happy" ||
                    tag === "sad" ||
                    tag === "edge" ||
                    tag === "security"
                        ? tag
                        : undefined;
                const result = addCoverageCase(
                    paths,
                    positional[2],
                    positional.slice(3).join(" "),
                    {
                        tag: allowedTag,
                        checked: Boolean(flags.checked)
                    }
                );
                output(result, json);

                return result.ok ? 0 : 1;
            }

            output(
                {
                    ok: false,
                    changed: false,
                    summary:
                        "Usage: stillmark coverage init | validate | summary | update | check | uncheck | add"
                },
                json
            );

            return 1;
        }

        if (cmd === "move" && positional[1] && positional[2] === "to") {
            const target = positional[3];
            const item = positional[1];
            const confirm = Boolean(flags.confirm);

            if (target === "roadmap") {
                output(
                    await moveToRoadmap(paths, item, confirm, gitRunner),
                    json
                );
            } else
            if (target === "plan") {
                output(await moveToPlan(paths, item, confirm), json);
            } else {
                output(
                    { ok: false, changed: false, summary: "Unknown move target" },
                    json
                );

                return 1;
            }

            return 0;
        }

        output(
            {
                ok: false,
                changed: false,
                summary:
                    "Usage: stillmark init | classify | roadmap | plan | git | coverage | add | move | install | long-running"
            },
            json
        );

        return 1;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        output({ ok: false, changed: false, summary: message }, json);

        return 1;
    }
}
