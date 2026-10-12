/**
 * How much text Stillmark writes under each item: the item line only, or the item line plus indented details.
 */
export type DetailLevel = "compact" | "extended";

/**
 * Stillmark parts that can override the global detail level.
 */
export type DetailModule = "coverage" | "roadmap" | "plan";

export const DetailModules: readonly DetailModule[] = ["coverage", "roadmap", "plan"];

/**
 * `detail` block of stillmark.config.json. Every key is optional; a module override wins over `global`,
 * and `global` wins over the built-in default of each module.
 */
export interface DetailConfig {
    global?: DetailLevel;
    coverage?: DetailLevel;
    roadmap?: DetailLevel;
    plan?: DetailLevel;
}

/**
 * Built-in level per module when neither a module override nor `global` is set.
 */
export const DefaultDetailLevels: Readonly<Record<DetailModule, DetailLevel>> = {
    coverage: "compact",
    roadmap: "compact",
    plan: "extended"
};

/**
 * Narrows unknown input to a detail level.
 */
export function isDetailLevel(value: unknown): value is DetailLevel {
    return value === "compact" || value === "extended";
}

/**
 * Narrows unknown input to a detail module.
 */
export function isDetailModule(value: unknown): value is DetailModule {
    return value === "coverage" || value === "roadmap" || value === "plan";
}

/**
 * Keeps only valid levels from a parsed config block.
 */
export function sanitizeDetailConfig(raw: unknown): DetailConfig {
    if (!raw || typeof raw !== "object") {
        return {};
    }

    const source = raw as Record<string, unknown>;
    const detail: DetailConfig = {};

    for (const key of ["global", ...DetailModules] as const) {
        if (isDetailLevel(source[key])) {
            detail[key] = source[key];
        }
    }

    return detail;
}

/**
 * Effective level for a module: module override, then `global`, then the module default.
 */
export function resolveDetailLevel(detail: DetailConfig, module: DetailModule): DetailLevel {
    return detail[module] ?? detail.global ?? DefaultDetailLevels[module];
}

/**
 * Effective level for every module.
 */
export function resolveAllDetailLevels(detail: DetailConfig): Record<DetailModule, DetailLevel> {
    return {
        coverage: resolveDetailLevel(detail, "coverage"),
        roadmap: resolveDetailLevel(detail, "roadmap"),
        plan: resolveDetailLevel(detail, "plan")
    };
}

/**
 * Splits `--details` text into trimmed, non-empty lines.
 */
export function splitDetailLines(text: string | undefined): string[] {
    if (!text) {
        return [];
    }

    return text
        .split(/\r?\n|\\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

/**
 * Message returned when details are passed for a module set to compact.
 */
export function compactDetailsMessage(module: DetailModule): string {
    return `Details are off for ${module} (detail: compact). Drop --details or run stillmark config set --detail=extended --module=${module}`;
}
