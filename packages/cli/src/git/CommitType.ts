import path from "node:path";

import type { GitRunner } from "./GitRunner";

/**
 * Conventional commit types. Rendered in lowercase in the subject (`feat: ...`).
 */
export enum CommitType {
    FEAT = "FEAT",
    FIX = "FIX",
    DOCS = "DOCS",
    TEST = "TEST",
    REFACTOR = "REFACTOR",
    PERF = "PERF",
    STYLE = "STYLE",
    BUILD = "BUILD",
    CI = "CI",
    CHORE = "CHORE"
}

/**
 * Where an inferred commit type came from, so the agent knows how much to trust it.
 */
export enum CommitTypeSource {
    /**
     * Stillmark commits its own files with a fixed type.
     */
    STILLMARK = "STILLMARK",
    /**
     * The summary already started with `type:`.
     */
    SUMMARY_PREFIX = "SUMMARY_PREFIX",
    /**
     * Every changed file belongs to one kind (docs, tests, CI, config).
     */
    FILES = "FILES",
    /**
     * A verb in the summary ("corrige", "adds", "refatora").
     */
    SUMMARY_WORDS = "SUMMARY_WORDS",
    /**
     * New source files with no other signal.
     */
    NEW_FILES = "NEW_FILES",
    /**
     * Nothing to go on; the agent should confirm the type.
     */
    DEFAULT = "DEFAULT"
}

/**
 * One changed file in the work tree.
 */
export interface FileChange {
    /**
     * Repo-relative path with forward slashes (the new path for renames).
     */
    path: string;
    /**
     * True for new or untracked files.
     */
    added: boolean;
}

/**
 * Type picked for a commit and why.
 */
export interface InferredCommitType {
    type: CommitType;
    source: CommitTypeSource;
    /**
     * Summary without a leading `type(scope):` and without agent markers such as `(t)`.
     */
    summary: string;
    /**
     * Scope the summary itself carried (never an agent marker), kept as written.
     */
    scope?: string;
    breaking: boolean;
}

enum FileKind {
    DOCS = "DOCS",
    TEST = "TEST",
    CI = "CI",
    CONFIG = "CONFIG",
    SOURCE = "SOURCE"
}

const PREFIX_RE = /^([a-z]+)(?:\(([^)]*)\))?(!)?:\s*/i;
const AGENT_SCOPE_RE = /^(?:t|no-?t)$/i;
const STILLMARK_FILES = new Set(["roadmap.md", "coverage.md", "changelog.md", "stillmark.config.json"]);
const DOC_EXTENSIONS = new Set([".md", ".mdx", ".txt", ".rst", ".adoc"]);
const CONFIG_NAMES = new Set([
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb", ".gitignore", ".gitattributes",
    ".npmrc", ".nvmrc", ".editorconfig", "dockerfile", "docker-compose.yml", "docker-compose.yaml", "makefile"
]);

/**
 * Summary words per type, checked in this order. English, Portuguese, and Spanish.
 */
const SUMMARY_WORDS: [CommitType, RegExp][] = [
    [CommitType.FIX, /(?<![\p{L}])(?:fix(?:es|ed)?|bug|corrig\p{L}*|consert\p{L}*|arruma\p{L}*|resolve (?:o |um )?(?:bug|erro|problema)|evita (?:erro|falha)|soluciona\p{L}*)(?![\p{L}])/iu],
    [CommitType.PERF, /(?<![\p{L}])(?:perf|performance|faster|speed(?:s)? up|desempenho|otimiza\p{L}*|optimi[sz]e\p{L}*|acelera\p{L}*|mais rápid\p{L}*)(?![\p{L}])/iu],
    [CommitType.REFACTOR, /(?<![\p{L}])(?:refactor\p{L}*|refatora\p{L}*|reorganiz\p{L}*|reorgani[sz]e\p{L}*|extrai|extract\p{L}*|simplifica\p{L}*|simplif(?:y|ies)|renomeia|rename\p{L}*)(?![\p{L}])/iu],
    [CommitType.DOCS, /(?<![\p{L}])(?:docs?|documenta\p{L}*|document(?:s|ed)?|readme)(?![\p{L}])/iu],
    [CommitType.TEST, /(?<![\p{L}])(?:tests?|testes?|pruebas?|spec)(?![\p{L}])/iu],
    [CommitType.FEAT, /(?<![\p{L}])(?:add(?:s|ed)?|adiciona\p{L}*|agrega\p{L}*|cria\p{L}*|create(?:s|d)?|implementa\p{L}*|implement(?:s|ed)?|nov[oa]s?|nuev[oa]s?|new|suporte|support(?:s)?|permite|allow(?:s)?|habilita\p{L}*|enable(?:s|d)?|introduz\p{L}*|introduce\p{L}*)(?![\p{L}])/iu],
    [CommitType.CHORE, /(?<![\p{L}])(?:release|bump|deps?|dependências|dependencies|ignora|ignore(?:s|d)?|gitignore|limpa|cleanup)(?![\p{L}])/iu]
];

function isKnownType(value: string): value is Lowercase<CommitType> {
    return (Object.values(CommitType) as string[]).includes(value.toUpperCase());
}

function fileKind(file: string): FileKind {
    const lower = file.toLowerCase();
    const base = path.posix.basename(lower);
    const ext = path.posix.extname(lower);

    if (/(^|\/)(?:tests?|__tests__|spec)\//.test(lower) || /\.(?:test|spec)\.[a-z0-9]+$/.test(lower)) {
        return FileKind.TEST;
    } else
    if (lower.startsWith(".github/workflows/") || base === ".gitlab-ci.yml" || lower.startsWith(".circleci/")) {
        return FileKind.CI;
    } else
    if (STILLMARK_FILES.has(base) || lower.startsWith(".stillmark/") || lower.startsWith("docs/") || DOC_EXTENSIONS.has(ext)) {
        return FileKind.DOCS;
    } else
    if (CONFIG_NAMES.has(base) || /^tsconfig.*\.json$/.test(base) || /\.config\.[cm]?[jt]s$/.test(base) || /^\.?eslintrc/.test(base)) {
        return FileKind.CONFIG;
    }

    return FileKind.SOURCE;
}

const KIND_TYPES: Record<Exclude<FileKind, FileKind.SOURCE>, CommitType> = {
    [FileKind.DOCS]: CommitType.DOCS,
    [FileKind.TEST]: CommitType.TEST,
    [FileKind.CI]: CommitType.CI,
    [FileKind.CONFIG]: CommitType.CHORE
};

/**
 * Splits a leading `type(scope)!:` off a summary. Agent markers such as `(t)` are dropped, never kept as a scope.
 */
export function splitSummaryPrefix(summary: string): { type?: CommitType; scope?: string; breaking: boolean; summary: string } {
    const trimmed = summary.trim();
    const match = PREFIX_RE.exec(trimmed);

    if (!match || !isKnownType(match[1])) {
        return { breaking: false, summary: trimmed };
    }

    const scope = match[2]?.trim();

    return {
        type: match[1].toUpperCase() as CommitType,
        scope: scope && !AGENT_SCOPE_RE.test(scope) ? scope : undefined,
        breaking: match[3] === "!",
        summary: trimmed.slice(match[0].length).trim()
    };
}

/**
 * True when every change is a Stillmark planning file, so a generic "update Stillmark" summary is accurate.
 */
export function onlyStillmarkFiles(changes: FileChange[]): boolean {
    return changes.length > 0 && changes.every((change) => {
        const lower = change.path.toLowerCase();

        return STILLMARK_FILES.has(path.posix.basename(lower)) || lower.startsWith(".stillmark/") || lower === ".gitignore";
    });
}

/**
 * Picks the commit type from what actually changed, never from earlier commits:
 * a `type:` the summary already has, then files that are all one kind (docs, tests, CI, config),
 * then a verb in the summary, then new source files (`feat`). With nothing to go on it returns
 * `feat` for source changes and `chore` otherwise, marked as DEFAULT so the agent confirms it.
 */
export function inferCommitType(summary: string, changes: FileChange[]): InferredCommitType {
    const prefix = splitSummaryPrefix(summary);
    const base = { summary: prefix.summary, scope: prefix.scope, breaking: prefix.breaking };

    if (prefix.type) {
        return { ...base, type: prefix.type, source: CommitTypeSource.SUMMARY_PREFIX };
    }

    const kinds = new Set(changes.map((change) => fileKind(change.path)));
    const [onlyKind] = kinds.size === 1 ? [...kinds] : [];

    if (onlyKind !== undefined && onlyKind !== FileKind.SOURCE) {
        return { ...base, type: KIND_TYPES[onlyKind], source: CommitTypeSource.FILES };
    }

    const worded = SUMMARY_WORDS.find(([, re]) => re.test(prefix.summary));

    if (worded) {
        return { ...base, type: worded[0], source: CommitTypeSource.SUMMARY_WORDS };
    }

    const source = changes.filter((change) => fileKind(change.path) === FileKind.SOURCE);

    if (source.some((change) => change.added)) {
        return { ...base, type: CommitType.FEAT, source: CommitTypeSource.NEW_FILES };
    }

    return {
        ...base,
        type: source.length > 0 ? CommitType.FEAT : CommitType.CHORE,
        source: CommitTypeSource.DEFAULT
    };
}

/**
 * Pending changes in the work tree (`git status --porcelain`), staged or not, untracked included.
 */
export async function readPendingChanges(root: string, runner: GitRunner): Promise<FileChange[]> {
    const status = await runner.capture(root, ["status", "--porcelain", "--untracked-files=all"]);

    if (!status.ok) {
        return [];
    }

    return status.stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
            const code = line.slice(0, 2);
            const file = line.slice(3).split(" -> ").pop() ?? "";

            return {
                path: file.replace(/^"|"$/g, "").replace(/\\/g, "/"),
                added: code === "??" || code.includes("A")
            };
        });
}
