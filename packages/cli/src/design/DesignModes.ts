/**
 * How Stillmark routes UI work between create, review, and mixed playbooks.
 */
export type DesignMode = "create" | "review" | "mixed";

/**
 * Skill-relative playbook paths the agent should load for a design run.
 */
export const DESIGN_PLAYBOOKS: Record<DesignMode, readonly string[]> = {
    create: [
        "reference/design-create.md",
        "reference/craft-floor.md"
    ],
    review: [
        "reference/design-review.md",
        "reference/craft-floor.md"
    ],
    mixed: [
        "reference/design-mixed.md",
        "reference/design-create.md",
        "reference/design-review.md",
        "reference/craft-floor.md"
    ]
};
