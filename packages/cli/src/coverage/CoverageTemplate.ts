import { HOW_TO_READ_LINES } from "./ValidateCoverage";

/**
 * Builds a starter COVERAGE.md for a project.
 */
export function buildDefaultCoverage(projectName: string): string {
    const title = projectName.trim() || "Project";
    const howToRead = [
        "## How to read this document",
        "",
        "Items are grouped by area, then by file or route. Each item is one test case, tagged with its kind:",
        "",
        ...HOW_TO_READ_LINES,
        ""
    ].join("\n");

    const body = [
        "## 1. Core",
        "",
        "### `src/index.ts`",
        "",
        "- [ ] [happy] Primary entry path succeeds with valid input",
        "- [ ] [sad] Primary entry path rejects invalid input",
        ""
    ].join("\n");

    return `# ${title} test coverage\n\n${howToRead}${body}`;
}

/**
 * Resolves a display name for COVERAGE.md from package.json or directory name.
 */
export function resolveCoverageProjectName(root: string, readPackageJson: () => string | null): string {
    const raw = readPackageJson();

    if (raw) {
        try {
            const parsed = JSON.parse(raw) as { name?: string };

            if (parsed.name) {
                return parsed.name.replace(/^@[^/]+\//, "");
            }
        } catch {
            // fall through
        }
    }

    const base = root.replace(/[/\\]+$/, "").split(/[/\\]/).pop();

    return base ?? "Project";
}
