import fs from "node:fs";

import { loadConfig, resolveDetailLevel, resolveGitEnabled, resolveGitPush, type GitOverride } from "../config";
import { parseRoadmap } from "../documents";
import { GitRunner, resolveCommitMessage } from "../git";
import { findDuplicateRoadmap } from "../guards";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { GitResult, OperationResult } from "../results/OperationResult";
import { scanTodos, TodoTag, type TodoComment } from "../todos";
import { addRoadmapItem } from "./RoadmapOperations";

/**
 * A code comment as reported by `roadmap todos`: where it is, and whether the roadmap already has it.
 */
export interface RoadmapTodo extends TodoComment {
    
    /** Roadmap ID of the matching item, when the TODO is already on the roadmap. */
    onRoadmap?: string;
    /** Roadmap ID created by `--add`. */
    added?: string;
    /** Why `--add` left it out (looks like a secret, or failed to write). */
    skipped?: string;
}

/**
 * Result of `roadmap todos`: every TODO / FIXME found, plus what `--add` did with each.
 */
export interface RoadmapTodosResult extends OperationResult {
    
    todos: RoadmapTodo[];
}

export interface RoadmapTodosOptions {
    
    /** Add every TODO not on the roadmap yet to `## Backlog`. */
    add?: boolean;
    gitOverride?: GitOverride;
    gitRunner?: GitRunner;
}

function locationText(todo: TodoComment): string {
    const first = todo.locations[0];
    const more = todo.locations.length > 1 ? ` (+${todo.locations.length - 1} more)` : "";

    return `${first.file}:${first.line}${more}`;
}

/**
 * Lists the TODO and FIXME comments in the code and, with `add`, puts the new ones on the roadmap:
 * FIXME as high priority, TODO as medium, one Backlog item each. Comments already on the roadmap,
 * duplicates, and anything that looks like a secret are left out. With roadmap detail `extended`,
 * each item notes where the comment lives. Commits once at the end when git integration is on.
 */
export async function roadmapTodos(paths: ProjectPaths, options: RoadmapTodosOptions = {}): Promise<RoadmapTodosResult> {
    const gitRunner = options.gitRunner ?? new GitRunner();

    const hasRoadmap = fs.existsSync(paths.roadmap);

    if (options.add && !hasRoadmap) {
        return { ok: false, changed: false, action: "roadmap todos", summary: "ROADMAP.md not found; run stillmark init first", todos: [] };
    }

    const found = await scanTodos(paths.root, gitRunner);
    const doc = hasRoadmap ? parseRoadmap(fs.readFileSync(paths.roadmap, "utf8")) : undefined;
    const todos: RoadmapTodo[] = found.map((todo) => ({ ...todo, onRoadmap: doc && findDuplicateRoadmap(doc, todo.text) }));
    const pending = todos.filter((todo) => !todo.onRoadmap);

    if (!options.add) {
        return {
            ok: true,
            changed: false,
            action: "roadmap todos",
            location: paths.roadmap,
            summary: found.length === 0
                ? "No TODO or FIXME comments found"
                : `Found ${found.length} TODO/FIXME comment${found.length === 1 ? "" : "s"}, ${pending.length} not on the roadmap yet. Add them with stillmark roadmap todos --add`,
            todos
        };
    }

    const config = loadConfig(paths);
    const withSource = resolveDetailLevel(config.detail, "roadmap") === "extended";

    for (const todo of pending) {
        const result = await addRoadmapItem(paths, {
            description: todo.text,
            priority: todo.tag === TodoTag.FIXME ? "high" : "medium",
            details: withSource ? [`from: ${locationText(todo)}`] : [],
            gitOverride: "force-off",
            gitRunner
        });

        if (result.ok && result.itemId) {
            todo.added = result.itemId;
        } else {
            todo.onRoadmap = result.duplicateOf;
            todo.skipped = result.duplicateOf ? undefined : result.sensitiveFindings ? "looks like a secret" : result.summary ?? "not added";
        }
    }

    const added = todos.filter((todo) => todo.added).length;
    const skipped = todos.filter((todo) => todo.skipped).length;
    let git: GitResult = { status: "skipped" };

    if (added > 0 && resolveGitEnabled(config, options.gitOverride ?? "default")) {
        const summary = `Add ${added} code TODO${added === 1 ? "" : "s"} to the roadmap`;
        const resolved = await resolveCommitMessage(paths.root, summary, config.git.commitMessage, gitRunner);
        const result = await gitRunner.commitRoadmap(paths.root, resolved.message, resolveGitPush(config, true));

        git = result.status === "failed" ? { status: "failed", detail: result.detail } : { status: result.status };
    }

    return {
        ok: true,
        changed: added > 0,
        action: "roadmap todos",
        location: paths.roadmap,
        summary: `Added ${added} TODO/FIXME comment${added === 1 ? "" : "s"} to ## Backlog`
            + (todos.length - added - skipped > 0 ? `, ${todos.length - added - skipped} already on the roadmap` : "")
            + (skipped > 0 ? `, ${skipped} left out` : ""),
        todos,
        git
    };
}
