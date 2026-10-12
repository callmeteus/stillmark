import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { GitRunner, type ProcessSpawner } from "../../src/git";
import { writeDefaultConfig } from "../../src/config";
import { addRoadmapItem } from "../../src/operations/RoadmapOperations";
import { createTempProject } from "../helpers/TempProject";

describe("GitIntegration", () => {
    it("does not spawn processes when git is off", async () => {
        const spawner = vi.fn<ProcessSpawner>();
        const { paths, cleanup } = createTempProject();
        const runner = new GitRunner(spawner);

        await addRoadmapItem(paths, {
            description: "Observability",
            gitOverride: "force-off",
            gitRunner: runner
        });

        expect(spawner).not.toHaveBeenCalled();
        cleanup();
    });

    it("commits only ROADMAP.md when autoCommit enabled", async () => {
        const calls: string[][] = [];
        const spawner: ProcessSpawner = async (_cmd, args) => {
            calls.push(args);

            if (args[0] === "ls-files") {
                return { code: 1, stdout: "", stderr: "" };
            }

            if (args[0] === "log") {
                return {
                    code: 0,
                    stdout: "feat(t): commit de exemplo\n",
                    stderr: ""
                };
            }

            return { code: 0, stdout: "", stderr: "" };
        };
        const { paths, cleanup } = createTempProject();
        writeDefaultConfig(paths);
        fs.writeFileSync(
            paths.config,
            JSON.stringify({
                git: {
                    autoCommit: true,
                    autoPush: false
                }
            }),
            "utf8"
        );

        const runner = new GitRunner(spawner);
        await addRoadmapItem(paths, {
            description: "Metrics",
            gitOverride: "force-on",
            gitRunner: runner
        });

        expect(calls.some((a) => a[0] === "add" && a[1] === "ROADMAP.md")).toBe(
            true
        );
        const addCalls = calls.filter((a) => a[0] === "add");
        expect(addCalls.every((a) => !a.some((part) => part.includes(".stillmark")))).toBe(
            true
        );

        const commitCall = calls.find((a) => a[0] === "commit");
        expect(commitCall?.[2]).toBe("feat(t): Metrics");

        cleanup();
    });

    it("refuses when .stillmark is tracked", async () => {
        const spawner: ProcessSpawner = async (_cmd, args) => {
            if (args[0] === "ls-files") {
                return { code: 0, stdout: ".stillmark/plans/TASK_PLAN.md\n", stderr: "" };
            }

            return { code: 0, stdout: "", stderr: "" };
        };
        const runner = new GitRunner(spawner);
        const result = await runner.commitRoadmap("/tmp", "msg", false);

        expect(result.status).toBe("failed");
    });
});
