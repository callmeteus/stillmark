/**
 * What a language setting applies to. `docs` covers DESIGN.md, PRODUCT.md, README, and learnings.
 */
export type LanguageTarget = "roadmap" | "plan" | "coverage" | "changelog" | "docs" | "commits";

export const LanguageTargets: readonly LanguageTarget[] = ["roadmap", "plan", "coverage", "changelog", "docs", "commits"];

/**
 * Language used when neither a target override nor `global` is set.
 */
export const DefaultLanguage = "en";

/**
 * `language` block of stillmark.config.json: BCP-47 tags such as `en` or `pt-BR`.
 * A target override wins over `global`, and `global` wins over {@link DefaultLanguage}.
 */
export type LanguageConfig = Partial<Record<"global" | LanguageTarget, string>>;

const LANGUAGE_TAG_RE = /^([a-z]{2,3})(?:[-_]([a-z]{2}|\d{3}))?$/i;

/**
 * Normalizes a language tag (`pt_br` -> `pt-BR`); `undefined` when it is not a valid tag.
 */
export function normalizeLanguageTag(value: unknown): string | undefined {
    const match = typeof value === "string" ? LANGUAGE_TAG_RE.exec(value.trim()) : null;

    if (!match) {
        return undefined;
    }

    return match[2] ? `${match[1].toLowerCase()}-${match[2].toUpperCase()}` : match[1].toLowerCase();
}

/**
 * Narrows unknown input to a language target.
 */
export function isLanguageTarget(value: unknown): value is LanguageTarget {
    return (LanguageTargets as readonly unknown[]).includes(value);
}

/**
 * Keeps only valid tags from a parsed config block.
 */
export function sanitizeLanguageConfig(raw: unknown): LanguageConfig {
    if (!raw || typeof raw !== "object") {
        return {};
    }

    const source = raw as Record<string, unknown>;
    const language: LanguageConfig = {};

    for (const key of ["global", ...LanguageTargets] as const) {
        const tag = normalizeLanguageTag(source[key]);

        if (tag) {
            language[key] = tag;
        }
    }

    return language;
}

/**
 * Effective language for a target: target override, then `global`, then English.
 */
export function resolveLanguage(language: LanguageConfig, target: LanguageTarget): string {
    return language[target] ?? language.global ?? DefaultLanguage;
}

/**
 * Effective language for every target.
 */
export function resolveAllLanguages(language: LanguageConfig): Record<LanguageTarget, string> {
    return Object.fromEntries(
        LanguageTargets.map((target) => [target, resolveLanguage(language, target)])
    ) as Record<LanguageTarget, string>;
}
