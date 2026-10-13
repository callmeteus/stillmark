import fs from "node:fs";
import path from "node:path";

import { normalizeTitle } from "../guards";
import { GitRunner } from "../git";

/**
 * Comment tag that marks pending work in source code.
 */
export enum TodoTag {
    TODO = "TODO",
    FIXME = "FIXME"
}

/**
 * One place in the code where a TODO / FIXME comment appears.
 */
export interface TodoLocation {
    /** Path relative to the project root, with forward slashes. */
    file: string;
    /** 1-based line number. */
    line: number;
}

/**
 * A pending-work comment found in the code. Comments with the same text in several files
 * are merged into one entry with every location.
 */
export interface TodoComment {
    tag: TodoTag;
    text: string;
    locations: TodoLocation[];
}

/** Directories never scanned, even without git. */
const SKIPPED_DIRS = new Set(["node_modules", "dist", "build", "out", "coverage", "vendor", "target", "bin", "obj", ".git", ".stillmark"]);

/** Files that are prose, data, or generated; a TODO there is not a code comment. */
const SKIPPED_EXTENSIONS = new Set([
    ".md", ".mdx", ".txt", ".json", ".lock", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
    ".pdf", ".zip", ".gz", ".woff", ".woff2", ".ttf", ".otf", ".map", ".snap", ".csv"
]);

const MAX_FILE_BYTES = 512 * 1024;
const MAX_TEXT_LENGTH = 140;

/**
 * A TODO / FIXME right after a comment marker (`//`, `/*`, `#`, `<!--`, `--`, `;`, `%`), with an optional
 * `(owner)` and `:` / `-` separator. Uppercase only, so words like "todo list" are ignored.
 */
const TODO_PATTERN = /(?:\/\/+|\/\*+|#|<!--|--|;|^\s*%)\s*@?(TODO|FIXME)\b(?:\([^)]*\))?\s*[:-]?\s*(.*)$/;

/**
 * Inside a block comment (`* TODO: ...`) the colon is required, so a doc sentence that merely
 * starts with the word on a wrapped line is not taken for a TODO.
 */
const BLOCK_TODO_PATTERN = /^\s*\*\s*@?(TODO|FIXME)(?:\([^)]*\))?:\s*(.*)$/;

/**
 * True when the comment marker sits inside a string literal: an odd number of quotes before it.
 */
function insideString(prefix: string): boolean {
    const unescaped = prefix.replace(/\\./g, "");

    return ["\"", "'", "`"].some((quote) => (unescaped.split(quote).length - 1) % 2 === 1);
}

/**
 * The tag and text of a TODO / FIXME comment on one line, if any.
 */
function matchTodo(content: string): { tag: TodoTag; body: string } | undefined {
    const match = TODO_PATTERN.exec(content) ?? BLOCK_TODO_PATTERN.exec(content);

    if (!match || insideString(content.slice(0, match.index))) {
        return undefined;
    }

    const body = cleanText(match[2]);

    return body.length > 0 ? { tag: match[1] as TodoTag, body } : undefined;
}

/**
 * Text of a TODO comment without closing comment markers, trimmed and shortened to one roadmap line.
 */
function cleanText(raw: string): string {
    const text = raw.replace(/\s*(\*\/|-->)\s*$/, "").replace(/^[!:.\-\s]+/, "").replace(/\s+/g, " ").trim();

    return text.length > MAX_TEXT_LENGTH ? `${text.slice(0, MAX_TEXT_LENGTH - 1).trimEnd()}…` : text;
}

/**
 * Files tracked or not ignored by git; `undefined` when the folder is not a git repository.
 */
async function gitFiles(root: string, gitRunner: GitRunner): Promise<string[] | undefined> {
    const result = await gitRunner.capture(root, ["ls-files", "--cached", "--others", "--exclude-standard"]);

    return result.ok ? result.stdout.split(/\r?\n/).filter(Boolean) : undefined;
}

/**
 * Every file under `root`, skipping dot folders and build output.
 */
function walkFiles(root: string, dir = ""): string[] {
    const files: string[] = [];

    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = dir ? `${dir}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            if (!SKIPPED_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
                files.push(...walkFiles(root, rel));
            }
        } else
        if (entry.isFile()) {
            files.push(rel);
        }
    }

    return files;
}

function isScannable(rel: string): boolean {
    const parts = rel.split("/");
    const name = parts[parts.length - 1];

    return !parts.slice(0, -1).some((part) => SKIPPED_DIRS.has(part))
        && !SKIPPED_EXTENSIONS.has(path.extname(name).toLowerCase())
        && !name.includes(".min.");
}

/**
 * File text, or `undefined` for large or binary files.
 */
function readText(file: string): string | undefined {
    const stat = fs.statSync(file, { throwIfNoEntry: false });

    if (!stat || !stat.isFile() || stat.size > MAX_FILE_BYTES) {
        return undefined;
    }

    const text = fs.readFileSync(file, "utf8");

    return text.slice(0, 8000).includes("\0") ? undefined : text;
}

/**
 * Finds TODO and FIXME comments in the project's code. Uses git's file list when available,
 * so ignored files are skipped; otherwise walks the folder without build output and dot folders.
 */
export async function scanTodos(root: string, gitRunner: GitRunner = new GitRunner()): Promise<TodoComment[]> {
    const files = ((await gitFiles(root, gitRunner)) ?? walkFiles(root)).filter(isScannable).sort();
    const byText = new Map<string, TodoComment>();

    for (const rel of files) {
        const text = readText(path.join(root, rel));

        if (text === undefined) {
            continue;
        }

        text.split(/\r?\n/).forEach((content, index) => {
            const todo = matchTodo(content);

            if (!todo) {
                return;
            }

            const key = normalizeTitle(todo.body);
            const location = { file: rel, line: index + 1 };
            const existing = byText.get(key);

            if (existing) {
                existing.locations.push(location);

                if (todo.tag === TodoTag.FIXME) {
                    existing.tag = TodoTag.FIXME;
                }
            } else {
                byText.set(key, { tag: todo.tag, text: todo.body, locations: [location] });
            }
        });
    }

    return [...byText.values()];
}
