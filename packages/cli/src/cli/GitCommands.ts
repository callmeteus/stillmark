import { loadConfig, resolveLanguage, writeConfig } from "../config";
import {
    attributionHookStatus,
    commitAllPending,
    commitSetupFiles,
    CommitType,
    CommitTypeSource,
    inferCommitType,
    installAttributionHook,
    listSetupFiles,
    onlyStillmarkFiles,
    pushCommitSummaryFromTokens,
    pushPending,
    readPendingChanges,
    removeAttributionHook,
    resolveCommitMessage,
    type AttributionHookStatus,
    type GitRunner
} from "../git";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";

export type AttributionHookResult = OperationResult & { attributionHook: AttributionHookStatus };

/**
 * Built-in commit summaries per base language; other languages fall back to English and the agent passes `--message`.
 */
const COMMIT_SUMMARIES: Record<string, { setup: string; update: string }> = {
    en: { setup: "set up Stillmark", update: "update Stillmark" },
    pt: { setup: "configura o Stillmark", update: "atualiza o Stillmark" },
    es: { setup: "configura Stillmark", update: "actualiza Stillmark" }
};

function commitSummary(paths: ProjectPaths, kind: "setup" | "update"): { language: string; summary: string } {
    const language = resolveLanguage(loadConfig(paths).language, "commits");
    const summaries = COMMIT_SUMMARIES[language.split("-")[0]] ?? COMMIT_SUMMARIES.en;

    return { language, summary: summaries[kind] };
}

function hookSummary(status: AttributionHookStatus, enabled: boolean): string {
    if (!status.gitRepo) {
        return "Not a git repository; the commit attribution hook was not touched";
    }

    if (status.foreign) {
        return `${status.hookPath} already exists and was not written by Stillmark; it was left alone. Merge it by hand, or move it away and run stillmark git hook install`;
    }

    if (status.installed) {
        return "Commits from agents will have Cursor and Claude attribution removed";
    }

    return enabled
        ? "Commit attribution hook is not installed; run stillmark git hook install"
        : "Agent attribution is kept in commits";
}

/**
 * Applies `git.stripAgentAttribution`: installs the hook when on, removes Stillmark's hook when off.
 */
export async function syncAttributionHook(paths: ProjectPaths, runner: GitRunner): Promise<AttributionHookResult> {
    const enabled = loadConfig(paths).git.stripAgentAttribution;
    const before = await attributionHookStatus(paths.root, runner);
    const after = enabled
        ? await installAttributionHook(paths.root, runner)
        : await removeAttributionHook(paths.root, runner);

    return {
        ok: !after.foreign || !enabled,
        changed: before.installed !== after.installed,
        action: "git hook",
        location: after.installed ? after.hookPath : undefined,
        summary: hookSummary(after, enabled),
        attributionHook: after
    };
}

/**
 * `stillmark git hook [status|install|remove]`.
 */
export async function runGitHook(
    paths: ProjectPaths,
    sub: string | undefined,
    runner: GitRunner
): Promise<AttributionHookResult> {
    const enabled = loadConfig(paths).git.stripAgentAttribution;

    if (sub === "install" || sub === "remove") {
        const before = await attributionHookStatus(paths.root, runner);
        const after = sub === "install"
            ? await installAttributionHook(paths.root, runner)
            : await removeAttributionHook(paths.root, runner);

        return {
            ok: after.gitRepo && !(sub === "install" && after.foreign),
            changed: before.installed !== after.installed,
            action: `git hook ${sub}`,
            location: after.installed ? after.hookPath : undefined,
            summary: hookSummary(after, sub === "install"),
            attributionHook: after
        };
    }

    const status = await attributionHookStatus(paths.root, runner);

    return {
        ok: true,
        changed: false,
        action: "git hook status",
        location: status.installed ? status.hookPath : undefined,
        summary: hookSummary(status, enabled),
        attributionHook: status
    };
}

/**
 * Commit subject proposed for pending changes, or the type to use when the agent still has to write the summary.
 */
interface CommitProposal {
    message?: string;
    language: string;
    type?: string;
    typeSource?: CommitTypeSource;
    warning?: string;
    /**
     * True when nobody gave a summary and the changes are not only Stillmark files: the agent writes one
     * from the diff instead of Stillmark inventing it.
     */
    needsSummary: boolean;
}

/**
 * Proposes a commit subject from `--message`, the given summary words, or (only for Stillmark files)
 * the built-in "update Stillmark" summary. The type follows the pending changes.
 */
async function proposeCommitMessage(
    paths: ProjectPaths,
    runner: GitRunner,
    flags: Record<string, string | boolean>,
    summaryWords: string
): Promise<CommitProposal> {
    const { language, summary: fallbackSummary } = commitSummary(paths, "update");
    const fromFlags = typeof flags.message === "string" ? flags.message.trim() : "";

    if (fromFlags) {
        return { message: fromFlags, language, needsSummary: false };
    }

    const changes = await readPendingChanges(paths.root, runner);
    const summary = summaryWords || (onlyStillmarkFiles(changes) ? fallbackSummary : "");

    if (!summary) {
        const guess = inferCommitType("", changes);

        return { language, type: guess.type.toLowerCase(), typeSource: guess.source, needsSummary: true };
    }

    const resolved = await resolveCommitMessage(paths.root, summary, loadConfig(paths).git.commitMessage, runner, { changes });

    return {
        message: resolved.message,
        language,
        type: resolved.type,
        typeSource: resolved.typeSource,
        warning: resolved.warning,
        needsSummary: false
    };
}

function needsSummaryNote(proposal: CommitProposal): string {
    return `No summary given: read the diff, write one line in ${proposal.language} that says what changed, and pass --message "${proposal.type ?? "feat"}: <summary>" (type inferred from the changed files${proposal.typeSource === CommitTypeSource.DEFAULT ? "; confirm it fits" : ""})`;
}

/**
 * `stillmark git push [--with-commit] [--message "<subject>"] [summary words]`.
 */
async function runGitPush(
    paths: ProjectPaths,
    rest: string[],
    runner: GitRunner,
    flags: Record<string, string | boolean>
): Promise<OperationResult> {
    const withCommit = flags.withCommit === true;
    const config = loadConfig(paths);
    let committed = false;
    let commitMessage: string | undefined;
    let commitLanguage: string | undefined;

    if (withCommit) {
        if (config.git.stripAgentAttribution) {
            await installAttributionHook(paths.root, runner);
        }

        const proposal = await proposeCommitMessage(paths, runner, flags, pushCommitSummaryFromTokens(rest));

        if (proposal.message === undefined) {
            return {
                ok: false,
                changed: false,
                action: "git push",
                summary: `Nothing committed. ${needsSummaryNote(proposal)}`,
                committed: false,
                commitLanguage: proposal.language,
                commitType: proposal.type,
                needsSummary: true
            } as OperationResult;
        }

        commitMessage = proposal.message;
        commitLanguage = proposal.language;
        const commit = await commitAllPending(paths.root, runner, commitMessage);

        if (!commit.committed && commit.detail !== "Nothing to commit") {
            return {
                ok: false,
                changed: false,
                action: "git push",
                summary: commit.detail ?? "Commit failed",
                committed: false,
                commitMessage,
                commitLanguage
            } as OperationResult;
        }

        if (commit.committed) {
            committed = true;
        }
    }

    const result = await pushPending(paths.root, runner);
    const pending = result.needsCommit
        ? `${result.uncommitted.length} uncommitted file(s); use AskQuestion (commit with proposed message, custom message, or cancel) or rerun with --with-commit after the user agrees`
        : "";
    const outcome = !result.gitRepo || result.detail
        ? result.detail ?? "Push failed"
        : result.pushed
            ? `Pushed ${result.ahead} commit(s) of ${result.branch} to ${result.upstream ?? `origin/${result.branch}`}`
            : `Nothing to push; ${result.branch} matches ${result.upstream}`;

    const proposal = result.needsCommit
        ? await proposeCommitMessage(paths, runner, flags, pushCommitSummaryFromTokens(rest))
        : undefined;

    if (proposal) {
        commitLanguage = proposal.language;
    }

    const commitNote = committed ? `Committed with: ${commitMessage}` : "";
    const summaryParts = [
        outcome,
        commitNote,
        pending,
        proposal?.needsSummary ? needsSummaryNote(proposal) : proposal?.warning
    ].filter(Boolean);

    return {
        ok: result.gitRepo && result.detail === undefined,
        changed: result.pushed || committed,
        action: "git push",
        summary: summaryParts.join(". "),
        proposedMessage: proposal?.message,
        commitType: proposal?.type,
        commitTypeSource: proposal?.typeSource,
        needsSummary: proposal?.needsSummary,
        commitLanguage,
        committed: withCommit ? committed : undefined,
        commitMessage: withCommit ? commitMessage : undefined,
        ...result
    } as OperationResult;
}

/**
 * `stillmark git <sub> ...`: `push`, `hook [status|install|remove]`, `setup-files`, `setup-commit`,
 * or `message-style [summary]` (alias `suggest`).
 */
export async function runGitCommand(
    paths: ProjectPaths,
    args: string[],
    runner: GitRunner,
    flags: Record<string, string | boolean> = {}
): Promise<OperationResult> {
    const [sub, ...rest] = args;

    if (sub === "hook") {
        return runGitHook(paths, rest[0], runner);
    }

    if (sub === "setup-files") {
        const listed = await listSetupFiles(paths, runner);
        const { language, summary } = commitSummary(paths, "setup");
        const proposedMessage = listed.gitRepo
            ? (await resolveCommitMessage(paths.root, summary, loadConfig(paths).git.commitMessage, runner, { kind: CommitType.CHORE })).message
            : undefined;

        return {
            ok: listed.gitRepo,
            changed: false,
            action: "git setup-files",
            summary: listed.gitRepo
                ? listed.files.length > 0
                    ? `Stillmark files to commit: ${listed.files.join(", ")}; proposed message: ${proposedMessage}`
                    : "No Stillmark files with pending changes"
                : "Not a git repository",
            setupFiles: listed,
            proposedMessage,
            commitLanguage: language
        } as OperationResult;
    }

    if (sub === "setup-commit") {
        const config = loadConfig(paths);

        if (config.git.stripAgentAttribution) {
            await installAttributionHook(paths.root, runner);
        }

        const message = typeof flags.message === "string" && flags.message.trim()
            ? flags.message.trim()
            : (await resolveCommitMessage(paths.root, commitSummary(paths, "setup").summary, config.git.commitMessage, runner, {
                kind: CommitType.CHORE
            })).message;
        const result = await commitSetupFiles(paths, runner, message);
        const push = result.committed && config.git.autoPush && result.topLevel
            ? await runner.run(result.topLevel, ["push"])
            : undefined;
        const pushNote = push === undefined ? "" : push.ok ? "; pushed" : `; push failed: ${push.stderr.trim()}`;

        return {
            ok: result.committed || result.detail === "Nothing to commit",
            changed: result.committed,
            action: "git setup-commit",
            summary: result.committed
                ? `Committed ${result.files.length} Stillmark file(s): ${message}${pushNote}`
                : result.detail,
            setupFiles: result,
            pushed: push?.ok ?? false
        } as OperationResult;
    }

    if (sub === "push") {
        return runGitPush(paths, rest, runner, flags);
    }

    if (sub === "message-style" || sub === "suggest") {
        const proposal = await proposeCommitMessage(paths, runner, {}, pushCommitSummaryFromTokens(rest));

        return {
            ok: true,
            changed: false,
            action: "git-message-style",
            summary: proposal.message === undefined
                ? needsSummaryNote(proposal)
                : [proposal.message, proposal.warning].filter(Boolean).join(". "),
            proposedMessage: proposal.message,
            commitType: proposal.type,
            commitTypeSource: proposal.typeSource,
            needsSummary: proposal.needsSummary,
            commitLanguage: proposal.language
        } as OperationResult;
    }

    return {
        ok: false,
        changed: false,
        summary: "Usage: stillmark git push [--with-commit] [--message \"<msg>\"] [summary] | git message-style [summary] | git hook [status|install|remove] | git setup-files | git setup-commit [--message \"<msg>\"]"
    };
}

/**
 * `stillmark config set --strip-attribution=true|false`: saves the setting, then installs or removes the hook.
 */
export async function runConfigSetStripAttribution(
    paths: ProjectPaths,
    flags: Record<string, string | boolean>,
    runner: GitRunner
): Promise<OperationResult> {
    const value = String(flags.stripAttribution).toLowerCase();

    if (value !== "true" && value !== "false") {
        return { ok: false, changed: false, summary: "Use --strip-attribution=true or --strip-attribution=false" };
    }

    const config = loadConfig(paths);

    config.git = { ...config.git, stripAgentAttribution: value === "true" };
    writeConfig(paths, config);

    const synced = await syncAttributionHook(paths, runner);

    return { ...synced, changed: true, action: "config-set", config } as OperationResult;
}

/**
 * `stillmark config set --auto-push=true|false`: whether commits are pushed right after.
 */
export function runConfigSetAutoPush(paths: ProjectPaths, flags: Record<string, string | boolean>): OperationResult {
    const value = String(flags.autoPush).toLowerCase();

    if (value !== "true" && value !== "false") {
        return { ok: false, changed: false, summary: "Use --auto-push=true or --auto-push=false" };
    }

    const config = loadConfig(paths);

    config.git = { ...config.git, autoPush: value === "true" };
    writeConfig(paths, config);

    return {
        ok: true,
        changed: true,
        action: "config-set",
        summary: value === "true" ? "Commits will be pushed right after" : "Commits will stay local until you push",
        config
    } as OperationResult;
}
