import fs from "node:fs";
import path from "node:path";

import { loadConfig, type CavemanLevel } from "../config";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { cavemanRules, estimateTokens } from "./CavemanRules";
import { compareCompressed, type CavemanIssue } from "./CavemanVerify";

/**
 * One compressed file tracked in the caveman manifest.
 */
export interface CavemanManifestEntry {
    
    /**
     * Project-relative path of the compressed file (forward slashes).
     */
    file: string;
    /**
     * Project-relative path of the readable original kept by Stillmark.
     */
    original: string;
    tokensBefore: number;
    tokensAfter?: number;
    /**
     * True after `caveman verify` passed for the current content.
     */
    verified: boolean;
}

interface CavemanManifest {
    
    files: Record<string, CavemanManifestEntry>;
}

const COMPRESSIBLE_EXTENSIONS = [".md", ".mdc", ".txt"];

function toPosix(value: string): string {
    return value.split(path.sep).join("/");
}

function manifestPath(paths: ProjectPaths): string {
    return path.join(paths.cavemanDir, "manifest.json");
}

function readManifest(paths: ProjectPaths): CavemanManifest {
    const file = manifestPath(paths);

    if (!fs.existsSync(file)) {
        return { files: {} };
    }

    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<CavemanManifest>;

    return { files: parsed.files ?? {} };
}

function writeManifest(paths: ProjectPaths, manifest: CavemanManifest): void {
    fs.mkdirSync(paths.cavemanDir, { recursive: true });
    fs.writeFileSync(manifestPath(paths), `${JSON.stringify(manifest, null, 4)}\n`, "utf8");
}

function managedFiles(paths: ProjectPaths): string[] {
    return [paths.roadmap, paths.coverage, paths.config, path.join(paths.root, "CHANGELOG.md")]
        .map((file) => file.toLowerCase());
}

type Target = { abs: string; rel: string; backup: string } | { error: string };

/**
 * Resolves a user-given file and refuses anything Stillmark parses or that lives outside the project.
 */
function resolveTarget(paths: ProjectPaths, file: string | undefined): Target {
    if (!file) {
        return { error: "Usage: stillmark caveman compress|verify|restore <file>" };
    }

    const abs = path.resolve(paths.root, file);
    const rel = path.relative(paths.root, abs);

    if (rel.startsWith("..") || path.isAbsolute(rel)) {
        return { error: `${file} is outside the project` };
    }

    if (
        managedFiles(paths).includes(abs.toLowerCase()) ||
        abs.toLowerCase().startsWith(paths.planningDir.toLowerCase() + path.sep)
    ) {
        return { error: `${toPosix(rel)} is read by Stillmark itself; compress agent context files such as skills, rules, or AGENTS.md instead` };
    }

    if (!COMPRESSIBLE_EXTENSIONS.includes(path.extname(abs).toLowerCase())) {
        return { error: `Only ${COMPRESSIBLE_EXTENSIONS.join(", ")} files can be compressed` };
    }

    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
        return { error: `File not found: ${toPosix(rel)}` };
    }

    return { abs, rel: toPosix(rel), backup: path.join(paths.cavemanDir, "originals", rel) };
}

function failure(summary: string): OperationResult {
    return { ok: false, changed: false, summary };
}

/**
 * `stillmark caveman compress <file>`: keeps the readable original and tells the agent how to rewrite the file.
 * Running it again on a compressed file reuses the kept original, so it never compresses twice.
 */
export function cavemanCompress(
    paths: ProjectPaths,
    file: string | undefined
): OperationResult & { file?: string; original?: string; tokensBefore?: number; instructions?: string[] } {
    const target = resolveTarget(paths, file);

    if ("error" in target) {
        return failure(target.error);
    }

    if (!fs.existsSync(target.backup)) {
        fs.mkdirSync(path.dirname(target.backup), { recursive: true });
        fs.copyFileSync(target.abs, target.backup);
    }

    const tokensBefore = estimateTokens(fs.readFileSync(target.backup, "utf8"));
    const original = toPosix(path.relative(paths.root, target.backup));
    const manifest = readManifest(paths);

    manifest.files[target.rel] = { file: target.rel, original, tokensBefore, verified: false };
    writeManifest(paths, manifest);

    return {
        ok: true,
        changed: true,
        action: "caveman-compress",
        summary: `Original kept at ${original}. Rewrite ${target.rel} in caveman style, then run stillmark caveman verify ${target.rel}`,
        location: target.abs,
        file: target.rel,
        original,
        tokensBefore,
        instructions: [
            `Rewrite ${target.rel} starting from the readable original at ${original}, in the same language.`,
            "Drop filler, articles, hedging, and repeated explanations; keep every rule, fact, and number.",
            "Keep frontmatter, headings, fenced code blocks, inline code, URLs, link targets, and file paths byte-exact.",
            "Keep the list structure; one line per point.",
            `Then run stillmark caveman verify ${target.rel} --json and fix every reported problem.`
        ]
    };
}

/**
 * `stillmark caveman verify <file>`: checks the compressed file against its original and records the savings.
 */
export function cavemanVerify(
    paths: ProjectPaths,
    file: string | undefined
): OperationResult & { issues?: CavemanIssue[]; tokensBefore?: number; tokensAfter?: number; savedTokens?: number; savedPercent?: number } {
    const target = resolveTarget(paths, file);

    if ("error" in target) {
        return failure(target.error);
    }

    if (!fs.existsSync(target.backup)) {
        return failure(`No kept original for ${target.rel}. Run stillmark caveman compress ${target.rel} first`);
    }

    const originalRaw = fs.readFileSync(target.backup, "utf8");
    const compressedRaw = fs.readFileSync(target.abs, "utf8");
    const issues = compareCompressed(originalRaw, compressedRaw);
    const tokensBefore = estimateTokens(originalRaw);
    const tokensAfter = estimateTokens(compressedRaw);
    const savedTokens = tokensBefore - tokensAfter;
    const savedPercent = tokensBefore === 0 ? 0 : Math.round((savedTokens / tokensBefore) * 100);
    const manifest = readManifest(paths);

    manifest.files[target.rel] = {
        file: target.rel,
        original: toPosix(path.relative(paths.root, target.backup)),
        tokensBefore,
        tokensAfter,
        verified: issues.length === 0
    };
    writeManifest(paths, manifest);

    return {
        ok: issues.length === 0,
        changed: true,
        action: "caveman-verify",
        summary: issues.length === 0
            ? `${target.rel} saves ~${savedTokens} tokens (${savedPercent}%) each time it is loaded`
            : `${issues.length} problem(s) in ${target.rel}: fix them or run stillmark caveman restore ${target.rel}`,
        location: target.abs,
        issues,
        tokensBefore,
        tokensAfter,
        savedTokens,
        savedPercent
    };
}

/**
 * `stillmark caveman restore <file>`: puts the readable original back and stops tracking the file.
 */
export function cavemanRestore(paths: ProjectPaths, file: string | undefined): OperationResult {
    const target = resolveTarget(paths, file);

    if ("error" in target) {
        return failure(target.error);
    }

    if (!fs.existsSync(target.backup)) {
        return failure(`No kept original for ${target.rel}; nothing to restore`);
    }

    fs.copyFileSync(target.backup, target.abs);
    fs.rmSync(target.backup);

    const manifest = readManifest(paths);

    delete manifest.files[target.rel];
    writeManifest(paths, manifest);

    return {
        ok: true,
        changed: true,
        action: "caveman-restore",
        summary: `Restored ${target.rel} from its readable original`,
        location: target.abs
    };
}

/**
 * Reply rules for a level and their estimated input cost per turn.
 */
export function cavemanRulesPayload(level: CavemanLevel): { level: CavemanLevel; rules: string[]; ruleTokens: number } {
    const rules = cavemanRules(level);

    return { level, rules, ruleTokens: rules.length === 0 ? 0 : estimateTokens(rules.join("\n")) };
}

/**
 * `stillmark caveman on|off|<level>`: rules for the current conversation only; the saved setting is untouched.
 */
export function cavemanSession(paths: ProjectPaths, level: CavemanLevel): OperationResult & {
    temporary: true;
    level: CavemanLevel;
    savedLevel: CavemanLevel;
    rules: string[];
    ruleTokens: number;
} {
    const savedLevel = loadConfig(paths).caveman.level;
    const payload = cavemanRulesPayload(level);

    return {
        ok: true,
        changed: false,
        action: "caveman-session",
        summary: level === "off"
            ? `Caveman off for this conversation only (saved setting: ${savedLevel})`
            : `Caveman ${level} for this conversation only, ~${payload.ruleTokens} input tokens per turn (saved setting: ${savedLevel})`,
        temporary: true,
        ...payload,
        savedLevel
    };
}

/**
 * `stillmark caveman` / `caveman stats`: level, rule overhead per turn, and savings from compressed files.
 */
export function cavemanStats(paths: ProjectPaths): OperationResult & {
    level: CavemanLevel;
    rules: string[];
    ruleTokens: number;
    files: CavemanManifestEntry[];
    savedTokens: number;
} {
    const payload = cavemanRulesPayload(loadConfig(paths).caveman.level);
    const files = Object.values(readManifest(paths).files);
    const savedTokens = files
        .filter((entry) => entry.verified && entry.tokensAfter !== undefined)
        .reduce((sum, entry) => sum + entry.tokensBefore - (entry.tokensAfter ?? entry.tokensBefore), 0);
    const pending = files.filter((entry) => !entry.verified).length;

    return {
        ok: true,
        changed: false,
        action: "caveman-stats",
        summary: [
            payload.level === "off" ? "Caveman replies are off" : `Caveman ${payload.level}: reply rules cost ~${payload.ruleTokens} input tokens per turn`,
            `${files.length - pending} verified compressed file(s) save ~${savedTokens} tokens per load`,
            pending > 0 ? `${pending} file(s) still need stillmark caveman verify` : ""
        ].filter(Boolean).join("; "),
        ...payload,
        files,
        savedTokens
    };
}
