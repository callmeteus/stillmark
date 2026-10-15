import { normalizeTitle } from "../guards";

/**
 * Keep a Changelog groups. Headings stay in English in every document language so the CLI can parse them.
 */
export enum ChangeGroup {
    ADDED = "ADDED",
    CHANGED = "CHANGED",
    DEPRECATED = "DEPRECATED",
    REMOVED = "REMOVED",
    FIXED = "FIXED",
    SECURITY = "SECURITY"
}

/**
 * `### <heading>` text per group, in the order groups are written inside a release.
 */
export const ChangeGroupHeadings: Record<ChangeGroup, string> = {
    [ChangeGroup.ADDED]: "Added",
    [ChangeGroup.CHANGED]: "Changed",
    [ChangeGroup.DEPRECATED]: "Deprecated",
    [ChangeGroup.REMOVED]: "Removed",
    [ChangeGroup.FIXED]: "Fixed",
    [ChangeGroup.SECURITY]: "Security"
};

/**
 * Version label of the section that collects changes not released yet.
 */
export const UNRELEASED = "Unreleased";

const RELEASE_RE = /^## \[([^\]]+)\](?:\s+-\s+(\S+))?\s*$/;
const GROUP_RE = /^### (.+?)\s*$/;
const BULLET_RE = /^[-*] (.+)$/;

const INTRO: Record<string, string> = {
    en: "All notable changes to this project are listed here, newest first.",
    pt: "Todas as mudanças relevantes deste projeto, das mais recentes para as mais antigas.",
    es: "Todos los cambios relevantes de este proyecto, de los más recientes a los más antiguos."
};

/**
 * One line of a release section that the CLI understands.
 */
export interface ChangelogEntry {
    
    /** Group heading the bullet sits under, as written. */
    heading?: string;
    text: string;
    /** Line index inside the section. */
    line: number;
}

/**
 * One `## [version] - date` section, kept as raw lines so untouched releases are written back verbatim.
 */
export interface ChangelogSection {
    
    version: string;
    date?: string;
    lines: string[];
}

/**
 * CHANGELOG.md split into the text before the first release and one block per release.
 */
export interface ChangelogDocument {
    
    preamble: string[];
    sections: ChangelogSection[];
}

/**
 * An entry to write: plain-language text and its group.
 */
export interface NewChangelogEntry {
    
    group: ChangeGroup;
    text: string;
}

/**
 * Narrows `--group=<value>` (any case, heading or enum spelling) to a group.
 */
export function parseChangeGroup(value: unknown): ChangeGroup | undefined {
    const key = typeof value === "string" ? value.trim().toUpperCase() : "";

    return (Object.values(ChangeGroup) as string[]).includes(key) ? key as ChangeGroup : undefined;
}

/**
 * Splits CHANGELOG.md into preamble and release sections without changing any line.
 */
export function parseChangelog(raw: string): ChangelogDocument {
    const lines = raw.replace(/\r\n/g, "\n").split("\n");
    const preamble: string[] = [];
    const sections: ChangelogSection[] = [];

    for (const line of lines) {
        const match = RELEASE_RE.exec(line);

        if (match) {
            sections.push({ version: match[1].trim(), date: match[2], lines: [line] });
        } else
        if (sections.length > 0) {
            sections[sections.length - 1].lines.push(line);
        } else {
            preamble.push(line);
        }
    }

    return { preamble, sections };
}

/**
 * Bullets of a section with the group heading they belong to.
 */
export function sectionEntries(section: ChangelogSection): ChangelogEntry[] {
    const entries: ChangelogEntry[] = [];
    let heading: string | undefined;

    section.lines.forEach((line, index) => {
        const group = GROUP_RE.exec(line);

        if (group) {
            heading = group[1];

            return;
        }

        const bullet = BULLET_RE.exec(line);

        if (bullet) {
            entries.push({ heading, text: bullet[1].trim(), line: index });
        }
    });

    return entries;
}

/**
 * Normalized text of every bullet in the document, used to skip entries that are already listed.
 */
export function listedTexts(doc: ChangelogDocument): Set<string> {
    return new Set(doc.sections.flatMap((section) => sectionEntries(section).map((entry) => normalizeTitle(entry.text))));
}

/**
 * Empty CHANGELOG.md: title and one intro line in the document language.
 */
export function emptyChangelog(language: string): ChangelogDocument {
    const intro = INTRO[language.split("-")[0]] ?? INTRO.en;

    return { preamble: ["# Changelog", "", intro, ""], sections: [] };
}

function trimTrailingBlanks(lines: string[]): string[] {
    let end = lines.length;

    while (end > 0 && lines[end - 1].trim() === "") {
        end -= 1;
    }

    return lines.slice(0, end);
}

function groupBlock(group: ChangeGroup, texts: string[]): string[] {
    return [`### ${ChangeGroupHeadings[group]}`, "", ...texts.map((text) => `- ${text}`)];
}

/**
 * New release section with entries grouped in Keep a Changelog order.
 */
export function buildSection(version: string, date: string | undefined, entries: NewChangelogEntry[]): ChangelogSection {
    const lines = [date ? `## [${version}] - ${date}` : `## [${version}]`];

    for (const group of Object.values(ChangeGroup)) {
        const texts = entries.filter((entry) => entry.group === group).map((entry) => entry.text);

        if (texts.length > 0) {
            lines.push("", ...groupBlock(group, texts));
        }
    }

    return { version, date, lines };
}

/**
 * Appends a bullet under its group heading in a section, creating the heading when missing.
 */
export function appendEntry(section: ChangelogSection, entry: NewChangelogEntry): void {
    const heading = ChangeGroupHeadings[entry.group];
    const lines = trimTrailingBlanks(section.lines);
    const start = lines.findIndex((line) => GROUP_RE.exec(line)?.[1] === heading);

    if (start < 0) {
        section.lines = [...lines, "", ...groupBlock(entry.group, [entry.text])];

        return;
    }

    let end = start + 1;

    while (end < lines.length && !GROUP_RE.test(lines[end])) {
        end += 1;
    }

    const body = trimTrailingBlanks(lines.slice(0, end));
    const bullet = `- ${entry.text}`;

    section.lines = body.length === start + 1
        ? [...body, "", bullet, ...(end < lines.length ? [""] : []), ...lines.slice(end)]
        : [...body, bullet, ...(end < lines.length ? [""] : []), ...lines.slice(end)];
}

/**
 * Removes bullets whose normalized text is in `texts`, then drops group headings left empty.
 * Returns how many bullets were removed.
 */
export function removeEntries(section: ChangelogSection, texts: Set<string>): number {
    const before = section.lines.length;
    const kept = section.lines.filter((line) => {
        const bullet = BULLET_RE.exec(line);

        return !bullet || !texts.has(normalizeTitle(bullet[1]));
    });
    const removed = before - kept.length;

    if (removed === 0) {
        return 0;
    }

    const result: string[] = [];

    for (let index = 0; index < kept.length; index++) {
        if (GROUP_RE.test(kept[index])) {
            let next = index + 1;

            while (next < kept.length && kept[next].trim() === "") {
                next += 1;
            }

            if (next >= kept.length || GROUP_RE.test(kept[next]) || RELEASE_RE.test(kept[next])) {
                index = next - 1;
                continue;
            }
        }

        result.push(kept[index]);
    }

    section.lines = result;

    return removed;
}

/**
 * Inserts a release so sections stay newest first: Unreleased on top, then by date descending.
 */
export function insertSection(doc: ChangelogDocument, section: ChangelogSection): void {
    if (section.version === UNRELEASED) {
        doc.sections.unshift(section);

        return;
    }

    const index = doc.sections.findIndex((existing) =>
        existing.version !== UNRELEASED && (existing.date === undefined || (section.date !== undefined && existing.date < section.date)));

    doc.sections.splice(index < 0 ? doc.sections.length : index, 0, section);
}

/**
 * Writes the document back: preamble and sections separated by one blank line, file ending with a newline.
 */
export function renderChangelog(doc: ChangelogDocument): string {
    const blocks = [trimTrailingBlanks(doc.preamble), ...doc.sections.map((section) => trimTrailingBlanks(section.lines))]
        .filter((block) => block.length > 0)
        .map((block) => block.join("\n"));

    return `${blocks.join("\n\n")}\n`;
}
