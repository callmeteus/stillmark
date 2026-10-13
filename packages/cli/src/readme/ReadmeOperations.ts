import fs from "node:fs";
import path from "node:path";

import { loadConfig, resolveLanguage } from "../config";
import type { ProjectPaths } from "../paths/ProjectPaths";
import type { OperationResult } from "../results/OperationResult";
import { checkReadme, extractReadmeFacts, parseReadme, type ReadmeHeading, type ReadmeIssue } from "./ReadmeCheck";
import { readProjectFacts, suggestReadmeTemplate, type ProjectFacts } from "./ProjectFacts";
import { findReadmeSection, findReadmeTemplate, ReadmeTemplates, type ReadmeTemplate } from "./ReadmeTemplates";

/**
 * One section of the outline an agent fills in.
 */
export interface ReadmeOutlineSection {
    id: string;
    heading: string;
    required: boolean;
    hint: string;
    /**
     * Heading of the current README that already covers this section.
     */
    existing?: string;
}

interface ReadmeState {
    /**
     * `pending` is true from `readme plan` until a passing `readme check`; a new plan refreshes the backup only after that.
     */
    files: Record<string, { template?: string; pending: boolean }>;
}

type Target = { abs: string; rel: string; backup: string } | { error: string };

function toPosix(value: string): string {
    return value.split(path.sep).join("/");
}

function failure(summary: string): OperationResult {
    return { ok: false, changed: false, summary };
}

function statePath(paths: ProjectPaths): string {
    return path.join(paths.readmeDir, "state.json");
}

function readState(paths: ProjectPaths): ReadmeState {
    const file = statePath(paths);

    if (!fs.existsSync(file)) {
        return { files: {} };
    }

    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<ReadmeState>;

    return { files: parsed.files ?? {} };
}

function writeState(paths: ProjectPaths, state: ReadmeState): void {
    fs.mkdirSync(paths.readmeDir, { recursive: true });
    fs.writeFileSync(statePath(paths), `${JSON.stringify(state, null, 4)}\n`, "utf8");
}

function resolveTarget(paths: ProjectPaths, file: string | undefined): Target {
    const abs = path.resolve(paths.root, file ?? "README.md");
    const rel = path.relative(paths.root, abs);

    if (rel.startsWith("..") || path.isAbsolute(rel)) {
        return { error: `${file} is outside the project` };
    }

    if (path.extname(abs).toLowerCase() !== ".md") {
        return { error: "The README must be a .md file" };
    }

    return { abs, rel: toPosix(rel), backup: path.join(paths.readmeDir, "backups", rel) };
}

function templateIds(): string {
    return ReadmeTemplates.map((template) => template.id).join(", ");
}

/**
 * Template from the flag, else the one saved for the file, else the suggestion.
 */
function chooseTemplate(
    paths: ProjectPaths,
    rel: string,
    flag: string | undefined,
    facts: ProjectFacts
): { template?: ReadmeTemplate; chosenBy: "flag" | "saved" | "suggested"; reason: string } | { error: string } {
    const suggestion = suggestReadmeTemplate(facts);

    if (flag !== undefined) {
        const template = findReadmeTemplate(flag);

        return template
            ? { template, chosenBy: "flag", reason: "Chosen by the user" }
            : { error: `Unknown template "${flag}". Available: ${templateIds()}` };
    }

    const saved = findReadmeTemplate(readState(paths).files[rel]?.template);

    return saved
        ? { template: saved, chosenBy: "saved", reason: "Chosen earlier for this file" }
        : { template: findReadmeTemplate(suggestion.template), chosenBy: "suggested", reason: suggestion.reason };
}

function buildOutline(template: ReadmeTemplate, headings: ReadmeHeading[]): ReadmeOutlineSection[] {
    return template.sections.map((slot) => {
        const section = findReadmeSection(slot.id);

        return {
            id: slot.id,
            heading: section?.heading ?? slot.id,
            required: slot.required,
            hint: section?.hint ?? "",
            existing: headings.find((heading) => heading.section === slot.id)?.text
        };
    });
}

/**
 * `stillmark readme templates`: the template catalog.
 */
export function readmeTemplates(): OperationResult & { templates: { id: string; name: string; bestFor: string; source: string; sections: string[] }[] } {
    return {
        ok: true,
        changed: false,
        action: "readme-templates",
        summary: `${ReadmeTemplates.length} README templates: ${templateIds()}`,
        templates: ReadmeTemplates.map((template) => ({
            id: template.id,
            name: template.name,
            bestFor: template.bestFor,
            source: template.source,
            sections: template.sections.map((slot) => `${findReadmeSection(slot.id)?.heading ?? slot.id}${slot.required ? "" : " (optional)"}`)
        }))
    };
}

/**
 * `stillmark readme plan [--template=<id>] [--file=README.md]`: project facts, the chosen template outline,
 * and the facts the current README states. Keeps a backup of the current README before any rewrite.
 */
export function readmePlan(
    paths: ProjectPaths,
    options: { template?: string; file?: string }
): OperationResult & {
    file?: string;
    template?: string;
    chosenBy?: string;
    reason?: string;
    header?: string;
    outline?: ReadmeOutlineSection[];
    facts?: ProjectFacts;
    existingHeadings?: ReadmeHeading[];
    factsToKeep?: string[];
    backup?: string;
    language?: string;
    templates?: { id: string; name: string; bestFor: string }[];
    instructions?: string[];
} {
    const target = resolveTarget(paths, options.file);

    if ("error" in target) {
        return failure(target.error);
    }

    const facts = readProjectFacts(paths.root, path.dirname(target.abs));
    const choice = chooseTemplate(paths, target.rel, options.template, facts);

    if ("error" in choice) {
        return failure(choice.error);
    }

    const template = choice.template ?? ReadmeTemplates[0];
    const exists = fs.existsSync(target.abs);
    const current = exists ? fs.readFileSync(target.abs, "utf8") : "";
    const headings = exists ? parseReadme(current).headings : [];
    const state = readState(paths);
    const pending = state.files[target.rel]?.pending === true;
    let backup: string | undefined;

    if (exists) {
        if (!pending || !fs.existsSync(target.backup)) {
            fs.mkdirSync(path.dirname(target.backup), { recursive: true });
            fs.copyFileSync(target.abs, target.backup);
        }

        backup = toPosix(path.relative(paths.root, target.backup));
    }

    const original = backup ? fs.readFileSync(target.backup, "utf8") : current;
    const language = resolveLanguage(loadConfig(paths).language, "docs");
    const needsChoice = choice.chosenBy === "suggested";

    state.files[target.rel] = { template: needsChoice ? undefined : template.id, pending: true };
    writeState(paths, state);

    return {
        ok: true,
        changed: true,
        action: "readme-plan",
        summary: `${exists ? "Restructure" : "Create"} ${target.rel} with the ${template.id} template (${choice.reason})`,
        location: target.abs,
        needsClarification: needsChoice,
        clarificationQuestion: needsChoice
            ? `Suggested template: ${template.id} (${choice.reason}). Pick a template, then run stillmark readme plan --template=<id>`
            : undefined,
        file: target.rel,
        template: template.id,
        chosenBy: choice.chosenBy,
        reason: choice.reason,
        header: template.header,
        outline: buildOutline(template, headings),
        facts,
        existingHeadings: headings,
        factsToKeep: extractReadmeFacts(original),
        backup,
        language,
        templates: needsChoice ? ReadmeTemplates.map(({ id, name, bestFor }) => ({ id, name, bestFor })) : undefined,
        instructions: [
            `Write ${target.rel} in ${language}; translate the outline headings, keep the order.`,
            `Header: ${template.header}.`,
            "Use only facts from `facts` and the current README: real script commands from facts.runCommands, real file links from facts.files, env var names from facts.envVars. Never invent commands, ports, URLs, or versions.",
            exists
                ? "Move existing content into the matching sections instead of rewriting it; keep every item in factsToKeep (URLs, ports, env vars)."
                : "Skip an optional section when the project has nothing true to say for it.",
            "Hyphen instead of em dash, no emojis, fenced code blocks with a language, tables for options and env vars.",
            `Then run stillmark readme check --file=${target.rel} --json and fix every issue${backup ? `; stillmark readme restore --file=${target.rel} puts the previous version back` : ""}.`
        ]
    };
}

/**
 * `stillmark readme check [--template=<id>] [--file=README.md]`: problems in the README.
 */
export function readmeCheck(
    paths: ProjectPaths,
    options: { template?: string; file?: string }
): OperationResult & { file?: string; template?: string; issues?: ReadmeIssue[]; headings?: ReadmeHeading[] } {
    const target = resolveTarget(paths, options.file);

    if ("error" in target) {
        return failure(target.error);
    }

    if (!fs.existsSync(target.abs)) {
        return failure(`${target.rel} does not exist. Run stillmark readme plan --file=${target.rel} first`);
    }

    const facts = readProjectFacts(paths.root, path.dirname(target.abs));
    const choice = chooseTemplate(paths, target.rel, options.template, facts);

    if ("error" in choice) {
        return failure(choice.error);
    }

    const { issues, headings } = checkReadme({
        content: fs.readFileSync(target.abs, "utf8"),
        file: target.abs,
        facts,
        template: choice.template,
        original: fs.existsSync(target.backup) ? fs.readFileSync(target.backup, "utf8") : undefined
    });

    const state = readState(paths);

    if (issues.length === 0 && state.files[target.rel]?.pending) {
        state.files[target.rel].pending = false;
        writeState(paths, state);
    }

    return {
        ok: issues.length === 0,
        changed: false,
        action: "readme-check",
        summary: issues.length === 0
            ? `${target.rel} passes the ${choice.template?.id} template checks`
            : `${issues.length} problem(s) in ${target.rel}`,
        location: target.abs,
        file: target.rel,
        template: choice.template?.id,
        issues,
        headings
    };
}

/**
 * `stillmark readme restore [--file=README.md]`: puts back the README kept by `readme plan`.
 */
export function readmeRestore(paths: ProjectPaths, options: { file?: string }): OperationResult {
    const target = resolveTarget(paths, options.file);

    if ("error" in target) {
        return failure(target.error);
    }

    if (!fs.existsSync(target.backup)) {
        return failure(`No kept copy of ${target.rel}; nothing to restore`);
    }

    fs.copyFileSync(target.backup, target.abs);
    fs.rmSync(target.backup);

    const state = readState(paths);

    delete state.files[target.rel];
    writeState(paths, state);

    return {
        ok: true,
        changed: true,
        action: "readme-restore",
        summary: `Restored ${target.rel} to the version before the rewrite`,
        location: target.abs
    };
}
