import fs from "node:fs";

import { loadConfig, resolveLanguage } from "../config";
import { GitRunner } from "../git";
import { normalizeTitle, scanForSensitiveContent } from "../guards";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import {
    appendEntry,
    buildSection,
    ChangeGroup,
    emptyChangelog,
    insertSection,
    listedTexts,
    parseChangelog,
    removeEntries,
    renderChangelog,
    UNRELEASED,
    type ChangelogDocument,
    type ChangelogSection,
    type NewChangelogEntry
} from "./ChangelogDocument";
import { plainEntryText, readChangelogHistory, ReleaseSource } from "./ChangelogSources";

/**
 * Result of `changelog sync` (and of `changelog`, which previews the same sync).
 */
export interface ChangelogSyncResult extends OperationResult {
    created: boolean;
    releasesAdded: string[];
    entriesAdded: number;
    /** Unreleased entries moved into a release that was cut since the last sync. */
    entriesMoved: number;
    source: ReleaseSource;
    versionFile?: string;
    /** Done roadmap items left out because they have no `done:` date. */
    undated: string[];
    /** How many entries were left out because they look like secrets or personal data. */
    sensitive: number;
}

export interface SyncChangelogOptions {
    /** Report what would change without writing (plain `stillmark changelog`). */
    dryRun?: boolean;
    gitRunner?: GitRunner;
}

function loadDocument(paths: ProjectPaths): { doc: ChangelogDocument; exists: boolean } {
    if (fs.existsSync(paths.changelog)) {
        return { doc: parseChangelog(fs.readFileSync(paths.changelog, "utf8")), exists: true };
    }

    return { doc: emptyChangelog(resolveLanguage(loadConfig(paths).language, "changelog")), exists: false };
}

function unreleasedSection(doc: ChangelogDocument): ChangelogSection {
    const existing = doc.sections.find((section) => section.version === UNRELEASED);

    if (existing) {
        return existing;
    }

    const section = buildSection(UNRELEASED, undefined, []);

    insertSection(doc, section);

    return section;
}

/**
 * Keeps entries whose text is not listed yet, dropping repeats inside the batch too.
 */
function freshEntries(entries: NewChangelogEntry[], listed: Set<string>): NewChangelogEntry[] {
    const seen = new Set(listed);

    return entries.filter((entry) => {
        const key = normalizeTitle(entry.text);

        if (!key || seen.has(key)) {
            return false;
        }

        seen.add(key);

        return true;
    });
}

function plural(count: number, word: string, many = `${word}s`): string {
    return `${count} ${count === 1 ? word : many}`;
}

function syncSummary(result: Omit<ChangelogSyncResult, "summary">, dryRun: boolean): string {
    const parts: string[] = [];

    if (result.created) {
        parts.push(`${dryRun ? "Would create" : "Created"} CHANGELOG.md with ${plural(result.entriesAdded, "entry", "entries")}`
            + (result.releasesAdded.length > 0 ? ` in ${plural(result.releasesAdded.length, "release")} (${result.releasesAdded.join(", ")})` : ""));
    } else
    if (result.entriesAdded > 0 || result.releasesAdded.length > 0 || result.entriesMoved > 0) {
        parts.push(`${dryRun ? "Would add" : "Added"} ${plural(result.entriesAdded, "entry", "entries")}`
            + (result.releasesAdded.length > 0 ? `, new ${plural(result.releasesAdded.length, "release")} ${result.releasesAdded.join(", ")}` : "")
            + (result.entriesMoved > 0 ? `, ${plural(result.entriesMoved, "entry", "entries")} moved out of Unreleased` : ""));
    } else {
        parts.push("CHANGELOG.md is up to date");
    }

    if (result.source === ReleaseSource.NONE) {
        parts.push("no version tags or package version found, so every entry is under Unreleased");
    }

    if (result.undated.length > 0) {
        parts.push(`${plural(result.undated.length, "done roadmap item")} without a done date left out (${result.undated.join(", ")}): set one with stillmark roadmap done "<item>" --commit=<ref>`);
    }

    if (result.sensitive > 0) {
        parts.push(`${plural(result.sensitive, "entry", "entries")} left out because they look like secrets or personal data`);
    }

    return parts.join("; ");
}

/**
 * `stillmark changelog sync`: creates CHANGELOG.md from the project history, or brings it up to date.
 * Releases already in the file are never rewritten; a newly cut release takes its entries out of Unreleased.
 * Plain `stillmark changelog` runs the same steps with `dryRun` and only reports them.
 */
export async function syncChangelog(paths: ProjectPaths, options: SyncChangelogOptions = {}): Promise<ChangelogSyncResult> {
    const { doc, exists } = loadDocument(paths);
    const history = await readChangelogHistory(paths, options.gitRunner ?? new GitRunner());
    const releasesAdded: string[] = [];
    let entriesAdded = 0;
    let entriesMoved = 0;

    if (!exists) {
        unreleasedSection(doc);
    }

    for (const bucket of history.buckets) {
        const release = bucket.release;

        if (!release || doc.sections.some((section) => section.version === release.version)) {
            continue;
        }

        const unreleased = doc.sections.find((section) => section.version === UNRELEASED);

        if (unreleased) {
            entriesMoved += removeEntries(unreleased, new Set(bucket.entries.map((entry) => normalizeTitle(entry.text))));
        }

        const entries = freshEntries(bucket.entries, listedTexts(doc));

        if (entries.length > 0) {
            insertSection(doc, buildSection(release.version, release.date, entries));
            releasesAdded.push(release.version);
            entriesAdded += entries.length;
        }
    }

    const pending = freshEntries(history.buckets[history.buckets.length - 1].entries, listedTexts(doc));

    if (pending.length > 0) {
        const unreleased = unreleasedSection(doc);

        for (const entry of pending) {
            appendEntry(unreleased, entry);
        }

        entriesAdded += pending.length;
    }

    entriesAdded = Math.max(0, entriesAdded - entriesMoved);

    const changed = !exists || entriesAdded > 0 || entriesMoved > 0 || releasesAdded.length > 0;

    if (changed && !options.dryRun) {
        fs.writeFileSync(paths.changelog, renderChangelog(doc), "utf8");
    }

    const result = {
        ok: true,
        changed: changed && !options.dryRun,
        action: options.dryRun ? "changelog status" : "changelog sync",
        location: paths.changelog,
        created: !exists,
        releasesAdded,
        entriesAdded,
        entriesMoved,
        source: history.source,
        versionFile: history.versionFile,
        undated: history.undated,
        sensitive: history.sensitive.length
    };

    return { ...result, summary: syncSummary(result, Boolean(options.dryRun)) };
}

export interface AddChangelogEntryOptions {
    group?: ChangeGroup;
    /** Only write when CHANGELOG.md already exists (used when a roadmap item is marked done). */
    onlyIfExists?: boolean;
}

/**
 * `stillmark changelog add "<text>"`: one plain-language entry under Unreleased, skipped when it is
 * already listed anywhere in the file and refused when it looks like a secret or personal data.
 */
export function addChangelogEntry(paths: ProjectPaths, text: string, options: AddChangelogEntryOptions = {}): OperationResult {
    const entryText = plainEntryText(text);

    if (!entryText) {
        return { ok: false, changed: false, action: "changelog add", summary: "Write what changed for the people who use the project" };
    }

    if (options.onlyIfExists && !fs.existsSync(paths.changelog)) {
        return { ok: true, changed: false, action: "changelog add", summary: "No CHANGELOG.md" };
    }

    const findings = scanForSensitiveContent(entryText);

    if (findings.length > 0) {
        return {
            ok: false,
            changed: false,
            action: "changelog add",
            summary: "This entry looks like it contains a secret or personal data; CHANGELOG.md is public, so it was not added",
            sensitiveFindings: findings
        };
    }

    const { doc } = loadDocument(paths);

    if (listedTexts(doc).has(normalizeTitle(entryText))) {
        return { ok: true, changed: false, action: "changelog add", location: paths.changelog, summary: "Already in CHANGELOG.md" };
    }

    appendEntry(unreleasedSection(doc), { group: options.group ?? ChangeGroup.ADDED, text: entryText });
    fs.writeFileSync(paths.changelog, renderChangelog(doc), "utf8");

    return { ok: true, changed: true, action: "changelog add", location: paths.changelog, summary: `Added to Unreleased in CHANGELOG.md: ${entryText}` };
}
