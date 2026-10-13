import type { GitRunner } from "./GitRunner";

const LOG_ARGS = ["log", "-n", "40", "--no-merges", "--format=%s"];

const CONVENTIONAL_RE = /^[a-zA-Z]+(\([^)]*\))?!?: \S/;

/**
 * Commit type Stillmark uses for its own commits: `docs` for planning documents, `chore` for setup.
 */
export type StillmarkCommitKind = "docs" | "chore";

/**
 * Infers a commit subject template from recent git history.
 *
 * Only the convention is learned (whether the repo uses `type: subject`), never a type or scope:
 * scopes such as `(t)` or `(auth)` describe who or what made a specific change and must not be
 * copied onto Stillmark commits. The type comes from what Stillmark is committing.
 *
 * @param subjects - Recent commit subject lines (newest first)
 * @param kind - Type used when the repo follows conventional commits
 * @returns Template with `{summary}` placeholder, or `{summary}` when no convention is found
 */
export function inferCommitMessageTemplateFromSubjects(
    subjects: string[],
    kind: StillmarkCommitKind = "docs"
): string {
    const lines = subjects.map((line) => line.trim()).filter(Boolean);

    if (lines.length === 0) {
        return "{summary}";
    }

    const conventional = lines.filter((line) => CONVENTIONAL_RE.test(line)).length;

    return conventional >= Math.ceil(lines.length * 0.4) ? `${kind}: {summary}` : "{summary}";
}

/**
 * Loads recent subjects via git and infers the team's commit message template.
 */
export async function inferCommitMessageTemplate(
    gitRunner: GitRunner,
    cwd: string,
    kind: StillmarkCommitKind = "docs"
): Promise<string> {
    const log = await gitRunner.capture(cwd, LOG_ARGS);

    if (!log.ok) {
        return "{summary}";
    }

    const subjects = log.stdout.split("\n").filter((line) => line.trim());

    return inferCommitMessageTemplateFromSubjects(subjects, kind);
}

/**
 * Builds a commit subject from config override or learned template.
 */
export async function resolveCommitMessage(
    cwd: string,
    summary: string,
    configuredTemplate: string | undefined,
    gitRunner: GitRunner,
    kind: StillmarkCommitKind = "docs"
): Promise<{ message: string; template: string; learned: boolean }> {
    const body = summary.trim().slice(0, 72);

    if (configuredTemplate?.trim()) {
        const template = configuredTemplate.trim();

        return {
            message: template.replace("{summary}", body),
            template,
            learned: false
        };
    }

    const template = await inferCommitMessageTemplate(gitRunner, cwd, kind);

    const message = template.includes("{summary}")
        ? template.replace("{summary}", body)
        : `${template}: ${body}`;

    return {
        message,
        template,
        learned: true
    };
}
