import fs from "node:fs";

import {
    allRoadmapIds,
    findRoadmapItem,
    insertAfterLine,
    nextId,
    parseRoadmap,
    spliceLines
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
}

function formatRoadmapItem(
    id: string,
    title: string,
    priority: string,
    details: string[]
): string {
    const detailBlock = details.map((line) => `\n  ${line}`).join("");

    return `- [ ] **${id}** ${title}\n  priority: ${priority} · status: planned${detailBlock}`;
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

    const sectionName = options.section ?? "Backlog";
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
    const block = formatRoadmapItem(id, options.description, priority, details);
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
        summary: `Added ${id} to ## ${section.title}`,
        git: gitResult
    };
}

export interface UpdateRoadmapOptions {
    query: string;
    priority?: string;
    status?: string;
    defer?: boolean;
}

/**
 * Update roadmap item metadata or defer to Deferred section.
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

    if (options.defer) {
        const without = spliceLines(raw, item.itemSpan, "");
        const deferredSection = doc.sections.find((s) => s.title === "Deferred");
        let working = without;

        if (!deferredSection) {
            working = `${working.trimEnd()}\n\n## Deferred\n`;
        }

        const redoc = parseRoadmap(working);
        const def = redoc.sections.find((s) => s.title === "Deferred");
        const meta = item.metadataLine.replace(/status:\s*\w+/, "status: deferred");
        const block = `- [ ] **${item.id}** ${item.title}\n  ${meta || "priority: medium · status: deferred"}`;
        const at = def
            ? def.items.length > 0
                ? def.items[def.items.length - 1].itemSpan.endLine - 1
                : def.headerSpan.endLine
            : working.split(/\r?\n/).length - 1;

        working = insertAfterLine(working, at, block);
        fs.writeFileSync(paths.roadmap, working, "utf8");

        return {
            ok: true,
            changed: true,
            action: "roadmap defer",
            itemId: item.id,
            summary: `Deferred ${item.id}`
        };
    }

    let meta = item.metadataLine || "  priority: medium · status: planned";

    if (options.priority) {
        meta = meta.replace(/priority:\s*\w+/, `priority: ${options.priority}`);

        if (!/priority:/.test(meta)) {
            meta = `${meta} · priority: ${options.priority}`;
        }
    }

    if (options.status) {
        meta = meta.replace(/status:\s*[\w-]+/, `status: ${options.status}`);

        if (!/status:/.test(meta)) {
            meta = `${meta} · status: ${options.status}`;
        }
    }

    const updated = spliceLines(raw, item.metadataSpan, meta.trimStart());
    fs.writeFileSync(paths.roadmap, updated, "utf8");

    return {
        ok: true,
        changed: true,
        action: "roadmap update",
        itemId: item.id,
        summary: `Updated ${item.id}`
    };
}
