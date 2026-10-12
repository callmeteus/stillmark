import { spawn } from "node:child_process";

export interface GitCommand {
    args: string[];
    cwd: string;
}

export type ProcessSpawner = (
    command: string,
    args: string[],
    cwd: string
) => Promise<{ code: number; stdout: string; stderr: string }>;

/**
 * Default spawner using child_process (injectable for tests).
 */
export function defaultSpawner(
    command: string,
    args: string[],
    cwd: string
): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
        const child = spawn(command, args, { cwd, shell: false });
        let stdout = "";
        let stderr = "";

        child.stdout?.on("data", (chunk: Buffer) => {
            stdout += chunk.toString();
        });
        child.stderr?.on("data", (chunk: Buffer) => {
            stderr += chunk.toString();
        });
        child.on("close", (code) => {
            resolve({ code: code ?? 1, stdout, stderr });
        });
    });
}

export class GitRunner {
    private readonly spawner: ProcessSpawner;

    public constructor(spawner: ProcessSpawner = defaultSpawner) {
        this.spawner = spawner;
    }

    public async run(
        cwd: string,
        args: string[]
    ): Promise<{ ok: boolean; stderr: string }> {
        const result = await this.spawner("git", args, cwd);

        return { ok: result.code === 0, stderr: result.stderr };
    }

    /**
     * Runs git and returns stdout (for diff/log helpers).
     */
    public async capture(
        cwd: string,
        args: string[]
    ): Promise<{ ok: boolean; stdout: string; stderr: string }> {
        const result = await this.spawner("git", args, cwd);

        return {
            ok: result.code === 0,
            stdout: result.stdout,
            stderr: result.stderr
        };
    }

    /**
     * Returns true if the local `.stillmark` directory is tracked by git.
     */
    public async isStillmarkLocalTracked(cwd: string): Promise<boolean> {
        const result = await this.run(cwd, [
            "ls-files",
            "--error-unmatch",
            ".stillmark"
        ]);

        return result.ok;
    }

    public async commitRoadmap(
        cwd: string,
        message: string,
        push: boolean
    ): Promise<{ status: "committed" | "pushed" | "failed"; detail?: string }> {
        const tracked = await this.isStillmarkLocalTracked(cwd);

        if (tracked) {
            return {
                status: "failed",
                detail: ".stillmark is tracked by git; refuse to commit roadmap"
            };
        }

        const add = await this.run(cwd, ["add", "ROADMAP.md"]);

        if (!add.ok) {
            return { status: "failed", detail: add.stderr };
        }

        const commit = await this.run(cwd, ["commit", "-m", message]);

        if (!commit.ok) {
            return { status: "failed", detail: commit.stderr };
        }

        if (!push) {
            return { status: "committed" };
        }

        const pushResult = await this.run(cwd, ["push"]);

        if (!pushResult.ok) {
            return { status: "failed", detail: pushResult.stderr };
        }

        return { status: "pushed" };
    }
}
