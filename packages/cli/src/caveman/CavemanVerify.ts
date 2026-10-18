import {
    FENCE_RE,
    FRONTMATTER_RE,
    HEADING_RE,
    INLINE_CODE_RE,
    LINK_TARGET_RE,
    normalizeNewlines as normalize,
    PATH_RE,
    uniqueMatches as matches,
    URL_RE
} from "../markdown";
import { estimateTokens } from "./CavemanRules";

/**
 * What a compressed file broke compared with its readable original.
 */
export interface CavemanIssue {
    
    kind: "frontmatter" | "code-block" | "heading" | "inline-code" | "url" | "path" | "size";
    detail: string;
}

function missing(kind: CavemanIssue["kind"], expected: string[], compressed: string): CavemanIssue[] {
    return expected
        .filter((value) => !compressed.includes(value))
        .map((value) => ({ kind, detail: `Missing: ${value}` }));
}

/**
 * Checks that a compressed file keeps everything an agent needs byte-exact:
 * frontmatter, fenced code blocks, headings, inline code, URLs, link targets, and file paths.
 * Also flags a result that is not smaller than the original.
 */
export function compareCompressed(originalRaw: string, compressedRaw: string): CavemanIssue[] {
    const original = normalize(originalRaw);
    const compressed = normalize(compressedRaw);
    const issues: CavemanIssue[] = [];

    const originalFrontmatter = FRONTMATTER_RE.exec(original)?.[0] ?? "";
    const compressedFrontmatter = FRONTMATTER_RE.exec(compressed)?.[0] ?? "";

    if (originalFrontmatter !== compressedFrontmatter) {
        issues.push({ kind: "frontmatter", detail: "Frontmatter changed; keep it exactly as in the original" });
    }

    const originalFences = [...original.matchAll(FENCE_RE)].map((match) => match[0]);
    const compressedFences = [...compressed.matchAll(FENCE_RE)].map((match) => match[0]);

    originalFences.forEach((block, index) => {
        if (compressedFences[index] !== block) {
            issues.push({ kind: "code-block", detail: `Code block ${index + 1} changed or is missing` });
        }
    });

    if (compressedFences.length > originalFences.length) {
        issues.push({ kind: "code-block", detail: "Compressed file has extra code blocks" });
    }

    const originalProse = original.replace(FENCE_RE, "");
    const compressedProse = compressed.replace(FENCE_RE, "");
    const originalHeadings = matches(originalProse, HEADING_RE);
    const compressedHeadings = matches(compressedProse, HEADING_RE);

    if (originalHeadings.join("\n") !== compressedHeadings.join("\n")) {
        issues.push(...missing("heading", originalHeadings, compressedProse));

        if (!issues.some((issue) => issue.kind === "heading")) {
            issues.push({ kind: "heading", detail: "Headings were reordered or added" });
        }
    }

    issues.push(...missing("inline-code", matches(originalProse, INLINE_CODE_RE), compressed));

    const urls = matches(originalProse, URL_RE);

    issues.push(...missing("url", [...new Set([...urls, ...matches(originalProse, LINK_TARGET_RE, 1)])], compressed));

    const plainProse = originalProse.replace(INLINE_CODE_RE, " ").replace(URL_RE, " ");

    issues.push(...missing("path", matches(plainProse, PATH_RE), compressed));

    if (estimateTokens(compressed) >= estimateTokens(original)) {
        issues.push({ kind: "size", detail: "Compressed file is not smaller than the original" });
    }

    return issues;
}
