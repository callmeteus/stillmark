import fs from "node:fs";

import {
    allRoadmapIds,
    findRoadmapItem,
    insertAfterLine,
    nextId,
    parseRoadmap,
    setMetaField,
    spliceLines,
    todayIsoDate,
    type RoadmapItem
} from "../documents";
import { findDuplicateRoadmap } from "../guards";
import { scanForSensitiveContent } from "../guards/PrivacyGuard";
import type { GitResult, OperationResult } from "../results/OperationResult";
import type { ProjectPaths } from "../paths/ProjectPaths";
import {
    compactDetailsMessage,
    loadConfig,
    resolveDetailLevel,
    resolveGitEnabled,
    resolveGitPush,
    type GitOverride
} from "../config";
import { GitRunner, resolveCommitMessage } from "../git";
import { addChangelogEntry, roadmapEntryGroup } from "../changelog";

export interface AddRoadmapOptions {
    description: string;
    section?: string;
    priority?: string;
    allowSensitive?: boolean;
    gitOverride?: GitOverride;
    privatePlanRaw?: string;
    gitRunner?: GitRunner;
    /**
     * Indented detail lines under the item; requires roadmap detail `extended`.
     */
    details?: string[];
    /**
     * Acceptance criteria written as indented `  - ` lines; allowed in compact and extended.
     */
    acceptance?: string[];
    /**
     * Records work that is already finished: checked item with `status: done` under `## Done`.
     */
    done?: boolean;
    /**
     * `YYYY-MM-DD` for the `added:` (or `done:` with `done`) field; defaults to today.
     * Ignored when `roadmap.dates` is off.
     */
    date?: string;
}

const DONE_SECTION = "Done";
const DEFERRED_SECTION = "Deferred";

function formatRoadmapItem(
    id: string,
    title: string,
    priority: string,
    details: string[],
    acceptance: string[],
    done: boolean,
    date: string | undefined
): string {
    const detailBlock = details.map((line) => `\n  ${line}`).join("");
    const acceptanceBlock = acceptance.map((line) => `\n  - ${line}`).join("");
    const box = done ? "x" : " ";
    const status = done ? "done" : "planned";
    const dateField = date ? ` · ${done ? "done" : "added"}: ${date}` : "";

    return `- [${box}] **${id}** ${title}\n  priority: ${priority} · status: ${status}${dateField}${detailBlock}${acceptanceBlock}`;
}

/**
 * Lists work finished today under Unreleased when the project keeps a CHANGELOG.md.
 * Backfilled dates are left to `changelog sync`, which places them in the right release.
 */
function listInChangelog(paths: ProjectPaths, title: string, date: string | undefined): string {
    if (date !== undefined && date !== todayIsoDate()) {
        return "";
    }

    const result = addChangelogEntry(paths, title, { onlyIfExists: true, group: roadmapEntryGroup(title) });

    return result.changed ? "; listed under Unreleased in CHANGELOG.md" : "";
}

/**
 * Moves an item to the end of a section (created at the end of the file when missing),
 * rewriting its checkbox and status while keeping priority, other fields, and any indented lines.
 */
function moveItemToSection(
    raw: string,
    item: RoadmapItem,
    sectionTitle: string,
    status: string,
    checked: boolean,
    fields: Record<string, string> = {}
): string {
    let working = spliceLines(raw, item.itemSpan, "");

    if (!parseRoadmap(working).sections.some((s) => s.title === sectionTitle)) {
        working = `${working.trimEnd()}\n\n## ${sectionTitle}\n`;
    }

    const section = parseRoadmap(working).sections.find((s) => s.title === sectionTitle);
    const original = raw.split(/\r?\n/).slice(item.itemSpan.startLine, item.itemSpan.endLine);
    const meta = Object.entries(fields).reduce(
        (line, [key, value]) => setMetaField(line, key, value),
        item.metadataLine
            ? item.metadataLine.trim().replace(/status:\s*[\w-]+/, `status: ${status}`)
            : `priority: medium · status: ${status}`
    );
    const extra = original.slice(item.metadataLine ? 2 : 1);
    const block = [`- [${checked ? "x" : " "}] **${item.id}** ${item.title}`, `  ${meta}`, ...extra].join("\n");
    const at = section
        ? section.items.length > 0
            ? section.items[section.items.length - 1].itemSpan.endLine - 1
            : section.headerSpan.endLine
        : working.split(/\r?\n/).length - 1;

    return insertAfterLine(working, at, block);
}

/**
 * Add item to ROADMAP.md incrementally.
 */
export async function addRoadmapItem(
    paths: ProjectPaths,
    options: AddRoadmapOptions
): Promise<OperationResult> {
    if (!fs.existsSync(paths.roadmap)) {
        return {
            ok: false,
            changed: false,
            summary: "ROADMAP.md not found; run stillmark init first"
        };
    }

    const config = loadConfig(paths);
    const details = options.details ?? [];

    if (details.length > 0 && resolveDetailLevel(config.detail, "roadmap") === "compact") {
        return {
            ok: false,
            changed: false,
            action: "roadmap add",
            summary: compactDetailsMessage("roadmap")
        };
    }

    const raw = fs.readFileSync(paths.roadmap, "utf8");
    const doc = parseRoadmap(raw);
    const duplicateOf = findDuplicateRoadmap(doc, options.description);

    if (duplicateOf) {
        return {
            ok: false,
            changed: false,
            duplicateOf,
            action: "roadmap add"
        };
    }

    const findings = scanForSensitiveContent(
        options.description,
        options.privatePlanRaw
    );

    if (findings.length > 0 && !options.allowSensitive) {
        return {
            ok: false,
            changed: false,
            sensitiveFindings: findings,
            action: "roadmap add"
        };
    }

    const done = Boolean(options.done);
    const sectionName = options.section ?? (done ? DONE_SECTION : "Backlog");
    let section = doc.sections.find(
        (s) => s.title.toLowerCase() === sectionName.toLowerCase()
    );

    let updated = raw;

    if (!section) {
        const append = `\n## ${sectionName}\n`;
        updated = raw.endsWith("\n") ? raw + append.trimStart() : `${raw}\n${append}`;
        const redoc = parseRoadmap(updated);
        section = redoc.sections.find((s) => s.title === sectionName);

        if (!section) {
            return { ok: false, changed: false, summary: "Failed to create section" };
        }

        doc.sections = redoc.sections;
    }

    const ids = allRoadmapIds(parseRoadmap(updated));
    const id = nextId("R", ids);
    const priority = options.priority ?? "medium";
    const date = config.roadmap.dates ? options.date ?? todayIsoDate() : undefined;
    const block = formatRoadmapItem(id, options.description, priority, details, options.acceptance ?? [], done, date);
    const insertAt =
        section.items.length > 0
            ? section.items[section.items.length - 1].itemSpan.endLine - 1
            : section.headerSpan.endLine;

    updated = insertAfterLine(updated, insertAt, block);
    fs.writeFileSync(paths.roadmap, updated, "utf8");

    const gitRunner = options.gitRunner ?? new GitRunner();
    let gitResult: GitResult = { status: "skipped" };

    if (resolveGitEnabled(config, options.gitOverride ?? "default")) {
        const resolved = await resolveCommitMessage(
            paths.root,
            options.description,
            config.git.commitMessage,
            gitRunner
        );
        const result = await gitRunner.commitRoadmap(
            paths.root,
            resolved.message,
            resolveGitPush(config, true)
        );

        gitResult =
            result.status === "pushed"
                ? { status: "pushed" }
                : result.status === "committed"
                  ? { status: "committed" }
                  : { status: "failed", detail: result.detail };
    }

    return {
        ok: true,
        changed: true,
        action: "roadmap add",
        location: paths.roadmap,
        itemId: id,
        summary: `Added ${id} to ## ${section.title}${done ? listInChangelog(paths, options.description, options.date) : ""}`,
        git: gitResult
    };
}

export interface UpdateRoadmapOptions {
    query: string;
    priority?: string;
    status?: string;
    defer?: boolean;
    /** Check the item, set `status: done`, and move it to `## Done`. */
    done?: boolean;
    /**
     * Explicit `YYYY-MM-DD` for `done:`; defaults to today. On an item that is already done,
     * an explicit date rewrites its `done:` field in place (used to backfill dates from commits).
     */
    date?: string;
}

/**
 * Update roadmap item metadata, defer it to Deferred, or mark it done.
 */
export function updateRoadmapItem(
    paths: ProjectPaths,
    options: UpdateRoadmapOptions
): OperationResult {
    const raw = fs.readFileSync(paths.roadmap, "utf8");
    const doc = parseRoadmap(raw);
    const item = findRoadmapItem(doc, options.query);

    if (!item) {
        return { ok: false, changed: false, summary: "Roadmap item not found" };
    }

    if (options.done) {
        const datesOn = loadConfig(paths).roadmap.dates;

        if (item.checked && item.sectionTitle === DONE_SECTION) {
            if (datesOn && options.date && item.metadataLine) {
                const meta = setMetaField(item.metadataLine, "done", options.date);

                if (meta !== item.metadataLine) {
                    fs.writeFileSync(paths.roadmap, spliceLines(raw, item.metadataSpan, meta), "utf8");

                    return {
                        ok: true,
                        changed: true,
                        action: "roadmap done",
                        location: paths.roadmap,
                        itemId: item.id,
                        summary: `Set ${item.id} done date to ${options.date}`
                    };
                }
            }

            return {
                ok: true,
                changed: false,
                action: "roadmap done",
                location: paths.roadmap,
                itemId: item.id,
                summary: `${item.id} is already done`
            };
        }

        const fields: Record<string, string> = datesOn ? { done: options.date ?? todayIsoDate() } : {};

        fs.writeFileSync(paths.roadmap, moveItemToSection(raw, item, DONE_SECTION, "done", true, fields), "utf8");

        return {
            ok: true,
            changed: true,
            action: "roadmap done",
            location: paths.roadmap,
            itemId: item.id,
            summary: `Marked ${item.id} done in ## ${DONE_SECTION}${fields.done ? ` on ${fields.done}` : ""}${listInChangelog(paths, item.title, options.date)}`
        };
    }

    if (options.defer) {
        fs.writeFileSync(paths.roadmap, moveItemToSection(raw, item, DEFERRED_SECTION, "deferred", false), "utf8");

        return {
            ok: true,
            changed: true,
            action: "roadmap defer",
            location: paths.roadmap,
            itemId: item.id,
            summary: `Deferred ${item.id}`
        };
    }

    let meta = item.metadataLine || "  priority: medium · status: planned";

    if (options.priority) {
        meta = setMetaField(meta, "priority", options.priority);
    }

    if (options.status) {
        meta = setMetaField(meta, "status", options.status);
    }

    // The parser only treats indented lines as item metadata.
    const updated = spliceLines(raw, item.metadataSpan, `  ${meta.trimStart()}`);
    fs.writeFileSync(paths.roadmap, updated, "utf8");

    return {
        ok: true,
        changed: true,
        action: "roadmap update",
        itemId: item.id,
        summary: `Updated ${item.id}`
    };
}
