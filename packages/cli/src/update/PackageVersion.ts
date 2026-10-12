import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * npm package name of the CLI.
 */
export const PackageName = "stillmark";

const REGISTRY_TIMEOUT_MS = 3000;

/**
 * Resolves the latest published version of a package.
 */
export type LatestVersionFetcher = (packageName: string) => Promise<string>;

/**
 * Version of the running CLI, read from the nearest `stillmark` package.json.
 */
export function readPackageVersion(): string {
    let dir = path.dirname(fileURLToPath(import.meta.url));

    for (let depth = 0; depth < 6; depth++) {
        const candidate = path.join(dir, "package.json");

        if (fs.existsSync(candidate)) {
            const pkg = JSON.parse(fs.readFileSync(candidate, "utf8")) as { name?: string; version?: string };

            if (pkg.name === PackageName && pkg.version) {
                return pkg.version;
            }
        }

        dir = path.dirname(dir);
    }

    return "0.0.0";
}

function versionParts(version: string): { core: number[]; prerelease: boolean } {
    const [core, prerelease] = version.trim().replace(/^v/, "").split("-", 2);

    return {
        core: core.split(".").map((part) => Number.parseInt(part, 10) || 0),
        prerelease: prerelease !== undefined
    };
}

/**
 * Compare two semver strings: negative when `a < b`, positive when `a > b`, 0 when equal.
 * A prerelease sorts before its release; prerelease identifiers are not compared further.
 */
export function compareVersions(a: string, b: string): number {
    const left = versionParts(a);
    const right = versionParts(b);

    for (let i = 0; i < 3; i++) {
        const diff = (left.core[i] ?? 0) - (right.core[i] ?? 0);

        if (diff !== 0) {
            return diff;
        }
    }

    if (left.prerelease === right.prerelease) {
        return 0;
    }

    return left.prerelease ? -1 : 1;
}

/**
 * Read `latest` from the public npm registry.
 */
export const fetchLatestVersion: LatestVersionFetcher = async (packageName) => {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`, {
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });

    if (!response.ok) {
        throw new Error(`npm registry answered ${response.status} for ${packageName}`);
    }

    const body = (await response.json()) as { version?: unknown };

    if (typeof body.version !== "string") {
        throw new Error(`npm registry returned no version for ${packageName}`);
    }

    return body.version;
};
