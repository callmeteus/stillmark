import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REQUEST_TIMEOUT_MS = 4000;

/**
 * npm package name of the CLI.
 */
export const PackageName = "stillmark";

/**
 * Where Stillmark publishes release assets when npm is empty or unreachable.
 */
export const DefaultGitHubRepo = {
    owner: "callmeteus",
    repo: "stillmark"
} as const;

/**
 * How the updater learned the latest version.
 */
export type ReleaseChannel = "npm" | "github";

/**
 * Result of resolving the newest published CLI version.
 */
export interface ResolvedLatestRelease {

    version: string;
    channel: ReleaseChannel;
    /**
     * Set when npm was tried first and failed before GitHub succeeded.
     */
    npmError?: string;
}

/**
 * Install commands the agent can show when the CLI is not on npm yet.
 */
export interface CliInstallHints {

    /**
     * Channel that supplied `latest` on the last successful check.
     */
    preferred: ReleaseChannel | null;
    npmGlobal: string;
    githubLatest: string;
    githubVersion: string | null;
}

function readStillmarkPackageJson(): { repository?: { url?: string } } | null {
    let dir = path.dirname(fileURLToPath(import.meta.url));

    for (let depth = 0; depth < 6; depth++) {
        const candidate = path.join(dir, "package.json");

        if (fs.existsSync(candidate)) {
            const pkg = JSON.parse(fs.readFileSync(candidate, "utf8")) as { name?: string; repository?: { url?: string } };

            if (pkg.name === PackageName) {
                return pkg;
            }
        }

        dir = path.dirname(dir);
    }

    return null;
}

/**
 * Parses `owner` and `repo` from the packaged `repository.url`, with a stable default.
 *
 * @returns GitHub coordinates for release downloads.
 */
export function readGitHubRepoFromPackage(): { owner: string; repo: string } {
    const url = readStillmarkPackageJson()?.repository?.url ?? "";
    const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/i);

    if (match) {
        return { owner: match[1], repo: match[2] };
    }

    return { ...DefaultGitHubRepo };
}

/**
 * Asset URL for a tagged GitHub release (`stillmark.tgz`).
 *
 * @param owner - GitHub owner.
 * @param repo - GitHub repository name.
 * @param version - Semver without a leading `v`.
 * @returns Direct download URL for `npm install -g <url>`.
 */
export function githubReleaseTgzUrl(owner: string, repo: string, version: string): string {
    const tag = version.trim().replace(/^v/, "");
    const prefixed = version.startsWith("v") ? version.trim() : `v${tag}`;

    return `https://github.com/${owner}/${repo}/releases/download/${prefixed}/stillmark.tgz`;
}

/**
 * Rolling latest release asset (follows GitHub redirects to the newest tag).
 *
 * @param owner - GitHub owner.
 * @param repo - GitHub repository name.
 * @returns URL documented in the install guide.
 */
export function githubLatestTgzUrl(owner: string, repo: string): string {
    return `https://github.com/${owner}/${repo}/releases/latest/download/stillmark.tgz`;
}

/**
 * Reads `latest` from the public npm registry.
 *
 * @param packageName - Package to query (defaults to Stillmark).
 * @returns Published version string.
 */
export async function fetchLatestFromNpm(packageName: string = PackageName): Promise<string> {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
        throw new Error(`npm registry answered ${response.status} for ${packageName}`);
    }

    const body = (await response.json()) as { version?: unknown };

    if (typeof body.version !== "string") {
        throw new Error(`npm registry returned no version for ${packageName}`);
    }

    return body.version;
}

/**
 * Reads the newest GitHub release tag for the Stillmark repo.
 *
 * @param owner - GitHub owner.
 * @param repo - GitHub repository name.
 * @returns Semver without a leading `v`.
 */
export async function fetchLatestFromGitHub(owner: string, repo: string): Promise<string> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "stillmark-cli"
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
        throw new Error(`GitHub releases answered ${response.status} for ${owner}/${repo}`);
    }

    const body = (await response.json()) as { tag_name?: unknown };

    if (typeof body.tag_name !== "string" || !body.tag_name.trim()) {
        throw new Error(`GitHub releases returned no tag for ${owner}/${repo}`);
    }

    return body.tag_name.trim().replace(/^v/, "");
}

/**
 * Tries npm first, then GitHub releases (for repos not published to npm yet).
 *
 * @param packageName - npm package name.
 * @param github - Repository that ships `stillmark.tgz` on releases.
 * @returns Version and which channel answered.
 */
export async function resolveLatestRelease(
    packageName: string = PackageName,
    github: { owner: string; repo: string } = readGitHubRepoFromPackage()
): Promise<ResolvedLatestRelease> {
    try {
        const version = await fetchLatestFromNpm(packageName);

        return { version, channel: "npm" };
    } catch (npmErr) {
        const npmError = npmErr instanceof Error ? npmErr.message : String(npmErr);

        try {
            const version = await fetchLatestFromGitHub(github.owner, github.repo);

            return { version, channel: "github", npmError };
        } catch (githubErr) {
            const githubError = githubErr instanceof Error ? githubErr.message : String(githubErr);

            throw new Error(`${npmError}; ${githubError}`);
        }
    }
}

/**
 * Global install commands for the current or latest CLI version.
 *
 * @param latest - Version from the last registry check, if any.
 * @param channel - Channel that supplied `latest`.
 * @returns Hints for humans and agents (npm may fail when the package is not published).
 */
export function buildCliInstallHints(
    latest: string | null,
    channel: ReleaseChannel | null
): CliInstallHints {
    const github = readGitHubRepoFromPackage();
    const npmGlobal = latest === null
        ? `npm install -g ${PackageName}`
        : `npm install -g ${PackageName}@${latest}`;

    return {
        preferred: channel,
        npmGlobal,
        githubLatest: githubLatestTgzUrl(github.owner, github.repo),
        githubVersion: latest === null ? null : githubReleaseTgzUrl(github.owner, github.repo, latest)
    };
}

/**
 * Command to upgrade the CLI and refresh agent templates.
 *
 * @param latest - Target version.
 * @param channel - Where that version was resolved.
 * @returns Single shell line for agents.
 */
export function recommendedCliUpgradeCommand(latest: string, channel: ReleaseChannel): string {
    if (channel === "npm") {
        return `npx -y ${PackageName}@${latest} update apply --json`;
    }

    const github = readGitHubRepoFromPackage();
    const tgz = githubReleaseTgzUrl(github.owner, github.repo, latest);

    return `npm install -g ${tgz} && ${PackageName} update apply --json`;
}
