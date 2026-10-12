/**
 * One path entry from git diff/status during coverage update.
 */
export interface CoverageChangedFile {
    status: string;
    path: string;
    relevant: boolean;
}

/**
 * Git diff hints returned by coverage update.
 */
export interface CoverageUpdateHints {
    baseCommit: string | null;
    changedFiles: CoverageChangedFile[];
}
