import fs from "node:fs";
import path from "node:path";

import { isIsoDate, parseRoadmap } from "../documents";
import type { GitRunner } from "../git";
import { scanForSensitiveContent } from "../guards";
import type { ProjectPaths } from "../paths/ProjectPaths";
import { ChangeGroup, type NewChangelogEntry } from "./ChangelogDocument";

/**
 * Where release versions and dates came from.
 */
export enum ReleaseSource {
    TAGS = "TAGS",
    PACKAGE_VERSION = "PACKAGE_VERSION",
    NONE = "NONE"
}

/**
 * A past release: version label, release date, and the git ref that marks it.
 */
export interface ReleasePoint {
    version: string;
    date: string;
    ref: string;
}

/**
 * Entries for one release, or for Unreleased when `release` is undefined.
 */
export interface ChangelogBucket {
    release?: ReleasePoint;
    entries: NewChangelogEntry[];
}

/**
 * Everything the history says should be in CHANGELOG.md.
 */
export interface ChangelogHistory {
    source: ReleaseSource;
    /** Version file whose bumps marked releases, when `source` is `PACKAGE_VERSION`. */
    versionFile?: string;
    /** Oldest release first, Unreleased last. */
    buckets: ChangelogBucket[];
    /** Done roadmap items without a `done:` date; they cannot be placed in a release. */
    undated: string[];
    /** Texts left out because they look like secrets or personal data. */
    sensitive: string[];
}

const VERSION_TAG_RE = /^v?\d+\.\d+/;
const VERSION_LINE_RE = /^\+\s*"version"\s*:\s*"([^"]+)"/;
const CONVENTIONAL_RE = /^(\w+)(?:\([^)]*\))?!?:\s*(.+)$/;
const DONE_DATE_RE = /(?:^|·\s*|\s)done:\s*(\d{4}-\d{2}-\d{2})/;
const FIX_TITLE_RE = /^(?:fix|fixes|fixed|corrige|corrigir|arregla)\b/i;

const COMMIT_GROUPS: Record<string, ChangeGroup> = {
    feat: ChangeGroup.ADDED,
    fix: ChangeGroup.FIXED,
    perf: ChangeGroup.CHANGED
};

/**
 * Sentence case without a trailing period, so commits and roadmap titles read the same way.
 */
export function plainEntryText(text: string): string {
    const trimmed = text.trim().replace(/\.+$/, "");

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Group for a finished roadmap item: Fixed when the title starts with a fix verb, Added otherwise.
 */
export function roadmapEntryGroup(title: string): ChangeGroup {
    return FIX_TITLE_RE.test(title.trim()) ? ChangeGroup.FIXED : ChangeGroup.ADDED;
}

/**
 * Turns a conventional commit subject into a changelog entry; `undefined` for internal work
 * (docs, chore, refactor, tests, CI, merges) and commits without a type.
 */
export function commitEntry(subject: string): NewChangelogEntry | undefined {
    const match = CONVENTIONAL_RE.exec(subject.trim());
    const group = match ? COMMIT_GROUPS[match[1].toLowerCase()] : undefined;

    return group && match ? { group, text: plainEntryText(match[2]) } : undefined;
}

async function tagReleases(root: string, git: GitRunner): Promise<ReleasePoint[]> {
    const result = await git.capture(root, [
        "for-each-ref",
        "--sort=creatordate",
        "--format=%(refname:short)%09%(creatordate:short)",
        "refs/tags"
    ]);

    if (!result.ok) {
        return [];
    }

    return result.stdout
        .split(/\r?\n/)
        .map((line) => line.split("\t"))
        .filter(([tag, date]) => tag && VERSION_TAG_RE.test(tag) && isIsoDate(date ?? ""))
        .map(([tag, date]) => ({ version: tag.replace(/^v(?=\d)/, ""), date, ref: tag }));
}

/**
 * The package.json that carries the project version: the root one when it is public and versioned,
 * otherwise the only public versioned package tracked by git. `undefined` when it is ambiguous.
 */
async function versionFile(root: string, git: GitRunner): Promise<string | undefined> {
    const listed = await git.capture(root, ["ls-files", "package.json", "*/package.json", "*/*/package.json"]);
    const files = listed.ok ? listed.stdout.split(/\r?\n/).filter((file) => file && !file.includes("node_modules")) : [];
    const versioned = files.filter((file) => {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) as { version?: unknown; private?: unknown };

            return typeof pkg.version === "string" && pkg.private !== true;
        } catch {
            return false;
        }
    });

    return versioned.includes("package.json") ? "package.json" : versioned.length === 1 ? versioned[0] : undefined;
}

async function packageReleases(root: string, file: string, git: GitRunner): Promise<ReleasePoint[]> {
    const result = await git.capture(root, ["log", "--reverse", "-U0", "-G\"version\"", "--format=@@%H%x09%cs", "--", file]);

    if (!result.ok) {
        return [];
    }

    const releases: ReleasePoint[] = [];
    let commit: { ref: string; date: string } | undefined;

    for (const line of result.stdout.split(/\r?\n/)) {
        if (line.startsWith("@@") && line.includes("\t")) {
            const [ref, date] = line.slice(2).split("\t");

            commit = { ref, date };
            continue;
        }

        const version = VERSION_LINE_RE.exec(line)?.[1];

        if (version && commit && !releases.some((release) => release.version === version)) {
            releases.push({ version, ...commit });
        }
    }

    return releases;
}

async function commitsIn(root: string, range: string, git: GitRunner): Promise<NewChangelogEntry[]> {
    const result = await git.capture(root, ["log", "--no-merges", "--reverse", "--format=%s", range]);

    return result.ok
        ? result.stdout.split(/\r?\n/).map(commitEntry).filter((entry): entry is NewChangelogEntry => entry !== undefined)
        : [];
}

function doneRoadmapItems(paths: ProjectPaths): { entries: { entry: NewChangelogEntry; date?: string }[]; undated: string[] } {
    if (!fs.existsSync(paths.roadmap)) {
        return { entries: [], undated: [] };
    }

    const items = parseRoadmap(fs.readFileSync(paths.roadmap, "utf8")).sections
        .filter((section) => section.title === "Done")
        .flatMap((section) => section.items.filter((item) => item.checked));
    const entries = items.map((item) => ({
        entry: { group: roadmapEntryGroup(item.title), text: plainEntryText(item.title) },
        date: DONE_DATE_RE.exec(item.metadataLine)?.[1],
        id: item.id
    }));

    return {
        entries,
        undated: entries.filter((item) => !item.date).map((item) => item.id)
    };
}

/**
 * Reads releases (version tags, or version bumps of the project package.json when there are no tags)
 * and fills each one: done roadmap items placed by their `done:` date, or, for releases without any,
 * the `feat` / `fix` / `perf` commits in that range. Undated roadmap items only count when there is no
 * release yet. Anything that looks like a secret or personal data is left out.
 */
export async function readChangelogHistory(paths: ProjectPaths, git: GitRunner): Promise<ChangelogHistory> {
    const tags = await tagReleases(paths.root, git);
    const file = tags.length > 0 ? undefined : await versionFile(paths.root, git);
    const releases = tags.length > 0 ? tags : file ? await packageReleases(paths.root, file, git) : [];
    const source = tags.length > 0 ? ReleaseSource.TAGS : releases.length > 0 ? ReleaseSource.PACKAGE_VERSION : ReleaseSource.NONE;
    const roadmap = doneRoadmapItems(paths);
    const buckets: ChangelogBucket[] = [...releases.map((release) => ({ release, entries: [] as NewChangelogEntry[] })), { entries: [] }];

    for (const { entry, date } of roadmap.entries) {
        if (!date && releases.length > 0) {
            continue;
        }

        const index = date ? releases.findIndex((release) => release.date >= date) : -1;

        buckets[index < 0 ? buckets.length - 1 : index].entries.push(entry);
    }

    for (const [index, bucket] of buckets.entries()) {
        if (bucket.entries.length > 0) {
            continue;
        }

        const previous = buckets[index - 1]?.release?.ref;
        const end = bucket.release?.ref ?? "HEAD";

        bucket.entries = await commitsIn(paths.root, previous ? `${previous}..${end}` : end, git);
    }

    const sensitive: string[] = [];

    for (const bucket of buckets) {
        bucket.entries = bucket.entries.filter((entry) => {
            const clean = scanForSensitiveContent(entry.text).length === 0;

            if (!clean) {
                sensitive.push(entry.text);
            }

            return clean;
        });
    }

    return {
        source,
        versionFile: source === ReleaseSource.PACKAGE_VERSION ? file : undefined,
        buckets,
        undated: releases.length > 0 ? roadmap.undated : [],
        sensitive
    };
}
