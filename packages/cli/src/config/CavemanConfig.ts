/**
 * How terse agent replies get: `off` keeps the normal style, `ultra` is the shortest.
 */
export type CavemanLevel = "off" | "lite" | "full" | "ultra";

export const CavemanLevels: readonly CavemanLevel[] = ["off", "lite", "full", "ultra"];

/**
 * `caveman` block of stillmark.config.json.
 */
export interface CavemanConfig {
    
    /**
     * Reply style level. Off by default because the rules themselves cost input tokens on every turn.
     */
    level: CavemanLevel;
}

export const DefaultCavemanConfig: Readonly<CavemanConfig> = { level: "off" };

/**
 * Narrows unknown input to a caveman level.
 */
export function isCavemanLevel(value: unknown): value is CavemanLevel {
    return (CavemanLevels as readonly unknown[]).includes(value);
}

/**
 * Maps plain on/off words to a level (`on`/`true` turn on `full`); `undefined` when not recognized.
 */
export function parseCavemanLevel(value: unknown): CavemanLevel | undefined {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : value;

    if (normalized === "on" || normalized === "true" || normalized === "yes") {
        return "full";
    }

    if (normalized === "false" || normalized === "no") {
        return "off";
    }

    return isCavemanLevel(normalized) ? normalized : undefined;
}

/**
 * Keeps only a valid level from a parsed config block.
 */
export function sanitizeCavemanConfig(raw: unknown): CavemanConfig {
    const level = raw && typeof raw === "object" ? (raw as Record<string, unknown>).level : undefined;

    return { level: isCavemanLevel(level) ? level : DefaultCavemanConfig.level };
}
