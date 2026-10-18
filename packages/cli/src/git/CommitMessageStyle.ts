import { CommitType, CommitTypeSource, inferCommitType, splitSummaryPrefix, type FileChange } from "./CommitType";
import type { GitRunner } from "./GitRunner";

const LOG_ARGS = ["log", "-n", "40", "--no-merges", "--format=%s"];

const CONVENTIONAL_RE = /^[a-zA-Z]+(\([^)]*\))?!?: \S/;

const TEMPLATE_PREFIX_RE = /^[a-zA-Z]+(\([^)]*\))?!?:\s*/;

/**
 * Subject length git tools and hosts show without cutting.
 */
export const MaxSubjectLength = 72;

/**
 * How the commit type is chosen.
 */
export type CommitMessageOptions =
    | {
        /**
         * Fixed type for files Stillmark commits itself: `docs` for planning documents, `chore` for setup.
         */
        kind: CommitType;
    }
    | {
        /**
         * Pending changes; the type is inferred from them and from the summary.
         */
        changes: FileChange[];
    };

/**
 * Commit subject plus how it was built.
 */
export interface ResolvedCommitMessage {
    message: string;
    template: string;
    learned: boolean;
    /**
     * Conventional type in the subject (`feat`), absent when the repo does not use conventional commits.
     */
    type?: string;
    typeSource?: CommitTypeSource;
    /**
     * Set when the subject is longer than {@link MaxSubjectLength}; the text is never cut.
     */
    warning?: string;
}

/**
 * Infers a commit subject template from recent git history.
 *
 * Only the convention is learned (whether the repo uses `type: subject`), never a type or scope:
 * scopes such as `(t)` or `(auth)` describe who or what made a specific change and must not be
 * copied onto other commits. The type comes from what is being committed.
 *
 * @param subjects - Recent commit subject lines (newest first)
 * @param prefix - Rendered `type(scope)!` used when the repo follows conventional commits
 * @returns Template with `{summary}` placeholder, or `{summary}` when no convention is found
 */
export function inferCommitMessageTemplateFromSubjects(subjects: string[], prefix: string): string {
    const lines = subjects.map((line) => line.trim()).filter(Boolean);

    if (lines.length === 0) {
        return "{summary}";
    }

    const conventional = lines.filter((line) => CONVENTIONAL_RE.test(line)).length;

    return conventional >= Math.ceil(lines.length * 0.4) ? `${prefix}: {summary}` : "{summary}";
}

/**
 * Loads recent subjects via git and infers the team's commit message template.
 */
export async function inferCommitMessageTemplate(gitRunner: GitRunner, cwd: string, prefix: string): Promise<string> {
    const log = await gitRunner.capture(cwd, LOG_ARGS);

    if (!log.ok) {
        return "{summary}";
    }

    const subjects = log.stdout.split("\n").filter((line) => line.trim());

    return inferCommitMessageTemplateFromSubjects(subjects, prefix);
}

function renderPrefix(type: CommitType, scope?: string, breaking = false): string {
    return `${type.toLowerCase()}${scope ? `(${scope})` : ""}${breaking ? "!" : ""}`;
}

function fillTemplate(template: string, body: string): string {
    return template.includes("{summary}") ? template.replace("{summary}", body) : `${template}: ${body}`;
}

/**
 * Builds a commit subject. The type matches what is committed: a fixed `kind` for Stillmark's own
 * files, otherwise inferred from the summary and the pending changes. The summary is never cut;
 * a long subject only adds a warning.
 */
export async function resolveCommitMessage(
    cwd: string,
    summary: string,
    configuredTemplate: string | undefined,
    gitRunner: GitRunner,
    options: CommitMessageOptions
): Promise<ResolvedCommitMessage> {
    const inferred = "kind" in options
        ? { ...splitSummaryPrefix(summary), type: options.kind, source: CommitTypeSource.STILLMARK }
        : inferCommitType(summary, options.changes);
    const prefix = renderPrefix(inferred.type, inferred.scope, inferred.breaking);
    const configured = configuredTemplate?.trim();
    let template: string;

    if (configured) {
        template = "kind" in options || !TEMPLATE_PREFIX_RE.test(configured)
            ? configured
            : configured.replace(TEMPLATE_PREFIX_RE, `${prefix}: `);
    } else {
        template = await inferCommitMessageTemplate(gitRunner, cwd, prefix);
    }

    const message = fillTemplate(template, inferred.summary);
    const conventional = CONVENTIONAL_RE.test(message);

    return {
        message,
        template,
        learned: !configured,
        type: conventional ? message.slice(0, message.search(/[(!:]/)).toLowerCase() : undefined,
        typeSource: conventional ? inferred.source : undefined,
        warning: message.length > MaxSubjectLength
            ? `Subject has ${message.length} characters (over ${MaxSubjectLength}); shorten the summary instead of cutting it`
            : undefined
    };
}
