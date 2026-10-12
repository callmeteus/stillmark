import type { GitRunner } from "./GitRunner";

const LOG_ARGS = ["log", "-n", "40", "--no-merges", "--format=%s"];

/**
 * Infers a commit subject template from recent git history.
 *
 * @param subjects - Recent commit subject lines (newest first)
 * @returns Template with `{summary}` placeholder, or `{summary}` when no pattern is found
 */
export function inferCommitMessageTemplateFromSubjects(
    subjects: string[]
): string {
    const prefixes: string[] = [];

    for (const line of subjects) {
        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        const colon = trimmed.indexOf(": ");

        if (colon > 0 && colon <= 48) {
            prefixes.push(trimmed.slice(0, colon));
        }
    }

    if (prefixes.length === 0) {
        return "{summary}";
    }

    const counts = new Map<string, number>();

    for (const prefix of prefixes) {
        counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }

    let dominant = prefixes[0];
    let dominantCount = 0;

    for (const [prefix, count] of counts) {
        if (count > dominantCount) {
            dominant = prefix;
            dominantCount = count;
        }
    }

    const typeCounts = new Map<string, number>();

    for (const prefix of prefixes) {
        const match = prefix.match(/^([a-zA-Z]+)/);

        if (match) {
            const key = match[1].toLowerCase();
            typeCounts.set(key, (typeCounts.get(key) ?? 0) + 1);
        }
    }

    let dominantType = "";
    let typeCount = 0;

    for (const [type, count] of typeCounts) {
        if (count > typeCount) {
            dominantType = type;
            typeCount = count;
        }
    }

    const dominantHasScope = /^\w+\([^)]+\)$/.test(dominant);

    if (
        dominantType &&
        typeCount >= Math.ceil(prefixes.length * 0.4) &&
        !dominantHasScope
    ) {
        const scoped = prefixes.filter((prefix) => {
            return prefix.toLowerCase().startsWith(`${dominantType}(`);
        });

        if (scoped.length >= 2) {
            const scopeCounts = new Map<string, number>();

            for (const prefix of scoped) {
                scopeCounts.set(prefix, (scopeCounts.get(prefix) ?? 0) + 1);
            }

            let bestScoped = scoped[0];
            let bestScopedCount = 0;

            for (const [prefix, count] of scopeCounts) {
                if (count > bestScopedCount) {
                    bestScoped = prefix;
                    bestScopedCount = count;
                }
            }

            return `${bestScoped}: {summary}`;
        }
    }

    return `${dominant}: {summary}`;
}

/**
 * Loads recent subjects via git and infers the team's commit message template.
 */
export async function inferCommitMessageTemplate(
    gitRunner: GitRunner,
    cwd: string
): Promise<string> {
    const log = await gitRunner.capture(cwd, LOG_ARGS);

    if (!log.ok) {
        return "{summary}";
    }

    const subjects = log.stdout.split("\n").filter((line) => line.trim());

    return inferCommitMessageTemplateFromSubjects(subjects);
}

/**
 * Builds a commit subject from config override or learned template.
 */
export async function resolveCommitMessage(
    cwd: string,
    summary: string,
    configuredTemplate: string | undefined,
    gitRunner: GitRunner
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

    const template = await inferCommitMessageTemplate(gitRunner, cwd);

    const message = template.includes("{summary}")
        ? template.replace("{summary}", body)
        : `${template}: ${body}`;

    return {
        message,
        template,
        learned: true
    };
}
