import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export { PackageName } from "./ReleaseChannels";

/**
 * Resolves the latest published version of a package (npm only; tests and custom injectors).
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

            if (pkg.name === StillmarkPackageName && pkg.version) {
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

import { fetchLatestFromNpm, PackageName as StillmarkPackageName } from "./ReleaseChannels";

/**
 * Read `latest` from the public npm registry.
 */
export const fetchLatestVersion: LatestVersionFetcher = fetchLatestFromNpm;
