/**
 * Automatic update checks run by the agent through `stillmark update`.
 */
export interface UpdateConfig {
    /**
     * When false, `stillmark update` only checks with `--force`.
     */
    auto: boolean;
    /**
     * Minimum hours between two registry checks.
     */
    intervalHours: number;
}

/**
 * Built-in update settings: daily checks, enabled.
 */
export const DefaultUpdateConfig: UpdateConfig = {
    auto: true,
    intervalHours: 24
};

/**
 * Parse an interval in hours; returns undefined for non-positive or non-numeric input.
 */
export function parseIntervalHours(value: unknown): number | undefined {
    const hours = typeof value === "number" ? value : Number(value);

    if (!Number.isFinite(hours) || hours <= 0) {
        return undefined;
    }

    return hours;
}

/**
 * Keep only valid update settings, falling back to defaults.
 */
export function sanitizeUpdateConfig(raw: unknown): UpdateConfig {
    if (raw === null || typeof raw !== "object") {
        return { ...DefaultUpdateConfig };
    }

    const source = raw as Record<string, unknown>;

    return {
        auto: typeof source.auto === "boolean" ? source.auto : DefaultUpdateConfig.auto,
        intervalHours: parseIntervalHours(source.intervalHours) ?? DefaultUpdateConfig.intervalHours
    };
}
