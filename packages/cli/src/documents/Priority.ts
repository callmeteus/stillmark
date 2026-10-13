/**
 * Accepted priorities for roadmap items and plan tasks, highest first.
 */
export const Priorities = ["critical", "high", "medium", "low"] as const;

export type Priority = (typeof Priorities)[number];

/**
 * Sort rank per priority (lower runs first).
 */
export const PriorityOrder: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
};

/**
 * True for one of the accepted priorities (case-insensitive).
 */
export function isPriority(value: string): boolean {
    return (Priorities as readonly string[]).includes(value.toLowerCase());
}
