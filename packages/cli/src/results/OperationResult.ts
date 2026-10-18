export type GitResultStatus =
    | "skipped"
    | "committed"
    | "pushed"
    | "failed";

export interface GitResult {
    
    status: GitResultStatus;
    detail?: string;
}

import type { CoverageValidationResult } from "../coverage/ValidateCoverage";
import type { CoverageUpdateHints } from "../coverage/CoverageUpdateHints";
import type { ResolvedCommitMessage } from "../git/CommitMessageStyle";

export interface OperationResult {
    
    ok: boolean;
    changed: boolean;
    action?: string;
    location?: string;
    /** Markdown link to `location` that agents paste verbatim so the user can open the file. */
    link?: string;
    itemId?: string;
    summary?: string;
    needsClarification?: boolean;
    clarificationQuestion?: string;
    duplicateOf?: string;
    outOfScope?: boolean;
    scopeMessage?: string;
    alternatives?: string[];
    sensitiveFindings?: { kind: string; detail: string }[];
    git?: GitResult;
    dependentsAffected?: string[];
    requiresConfirm?: boolean;
    coverage?: CoverageValidationResult;
    coverageUpdate?: CoverageUpdateHints;
    /**
     * Suggestion from `git message-style`, or the subject `git push --with-commit` committed with.
     */
    commitMessage?: ResolvedCommitMessage | string;
}
