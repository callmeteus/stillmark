import type { RoadmapDocument, RoadmapItem, RoadmapSection } from "./types";

const ITEM_RE = /^- \[([ xX])\] \*\*(R-\d+)\*\* (.+)$/;
const META_RE = /^\s+priority:/;
const INDENTED_RE = /^ {2}\S/;

/**
 * Parse ROADMAP.md without mutating content.
 */
export function parseRoadmap(raw: string): RoadmapDocument {
    const lines = raw.split(/\r?\n/);
    const sections: RoadmapSection[] = [];
    let current: RoadmapSection | null = null;
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith("## ")) {
            if (current) {
                current.contentEndLine = i;
                sections.push(current);
            }

            current = {
                title: line.slice(3).trim(),
                headerSpan: { startLine: i, endLine: i + 1 },
                items: [],
                contentEndLine: lines.length
            };
            i += 1;
            continue;
        }

        if (current) {
            const match = ITEM_RE.exec(line);

            if (match) {
                const itemStart = i;
                const checked = match[1].toLowerCase() === "x";
                const id = match[2];
                const title = match[3].trim();
                let metaLine = "";
                const metaStart = i + 1;
                const acceptance: string[] = [];
                const details: string[] = [];
                i += 1;

                if (i < lines.length && META_RE.test(lines[i])) {
                    metaLine = lines[i];
                    i += 1;
                }

                while (i < lines.length && INDENTED_RE.test(lines[i])) {
                    if (lines[i].startsWith("  - ")) {
                        acceptance.push(lines[i]);
                    } else {
                        details.push(lines[i].trim());
                    }

                    i += 1;
                }

                const item: RoadmapItem = {
                    id,
                    title,
                    checked,
                    metadataLine: metaLine,
                    metadataSpan: {
                        startLine: metaStart,
                        endLine: metaLine ? metaStart + 1 : metaStart
                    },
                    itemSpan: { startLine: itemStart, endLine: i },
                    sectionTitle: current.title,
                    acceptanceLines: acceptance,
                    detailLines: details
                };

                current.items.push(item);
                continue;
            }
        }

        i += 1;
    }

    if (current) {
        current.contentEndLine = lines.length;
        sections.push(current);
    }

    return { raw, sections };
}

/**
 * Find a roadmap item by id or fuzzy title match.
 */
export function findRoadmapItem(
    doc: RoadmapDocument,
    query: string
): RoadmapItem | undefined {
    const q = query.trim().toLowerCase();

    for (const section of doc.sections) {
        for (const item of section.items) {
            if (item.id.toLowerCase() === q) {
                return item;
            }

            if (item.title.toLowerCase().includes(q) || q.includes(item.title.toLowerCase())) {
                return item;
            }
        }
    }

    return undefined;
}

export function allRoadmapIds(doc: RoadmapDocument): string[] {
    return doc.sections.flatMap((s) => s.items.map((i) => i.id));
}
