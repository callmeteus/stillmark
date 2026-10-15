import type { PlanningDestination } from "../documents";
import type { OperationResult } from "../results/OperationResult";

export interface ClassifyInput {
    
    text: string;
    explicitDestination?: PlanningDestination;
    hasActivePlan: boolean;
    objectiveSnippet?: string;
}

/**
 * Classify natural-language planning intent into roadmap or plan.
 */
export function classifyIntent(input: ClassifyInput): OperationResult {
    if (input.explicitDestination) {
        return {
            ok: true,
            changed: false,
            action: "classify",
            summary: input.explicitDestination
        };
    }

    const lower = input.text.toLowerCase();

    if (
        /\b(roadmap|milestone|future|later|next quarter|initiative)\b/.test(
            lower
        )
    ) {
        return {
            ok: true,
            changed: false,
            action: "classify",
            summary: "roadmap"
        };
    }

    const designWork =
        /\b(design|ui|ux|layout|typography|hero|landing|visual|spacing|polish|wireframe|mockup|interface|screens?|modal|dashboard|settings page|design system|component library)\b/.test(
            lower
        ) ||
        /\b(tela|página|botão|tipografia|espaçamento|contraste|responsivo|interface)\b/.test(
            lower
        );

    if (designWork && /\b(roadmap|milestone|future|later|initiative|quarter|q[1-4])\b/.test(lower)) {
        return {
            ok: true,
            changed: false,
            action: "classify",
            summary: "roadmap"
        };
    }

    if (
        designWork &&
        (/\b(now|this sprint|fix|arruma|melhora|polish|tweak|ship|implement)\b/.test(
            lower
        ) ||
            input.hasActivePlan)
    ) {
        return {
            ok: true,
            changed: false,
            action: "classify",
            summary: "plan"
        };
    }

    if (
        /\b(current plan|active plan|task plan|now|this sprint|implement|integration tests?)\b/.test(
            lower
        )
    ) {
        return {
            ok: true,
            changed: false,
            action: "classify",
            summary: "plan"
        };
    }

    if (/\badd\b/.test(lower) && /\broadmap\b/.test(lower)) {
        return {
            ok: true,
            changed: false,
            action: "classify",
            summary: "roadmap"
        };
    }

    if (/\bput\b/.test(lower) && /\bplan\b/.test(lower)) {
        return {
            ok: true,
            changed: false,
            action: "classify",
            summary: "plan"
        };
    }

    if (input.hasActivePlan && input.objectiveSnippet) {
        const obj = input.objectiveSnippet.toLowerCase();
        const words = lower.split(/\s+/).filter((w) => w.length > 3);

        for (const word of words) {
            if (obj.includes(word)) {
                return {
                    ok: true,
                    changed: false,
                    action: "classify",
                    summary: "plan"
                };
            }
        }
    }

    if (/\b(feature|capability|support)\b/.test(lower) && !/\bplan\b/.test(lower)) {
        return {
            ok: true,
            changed: false,
            action: "classify",
            summary: "roadmap"
        };
    }

    return {
        ok: false,
        changed: false,
        needsClarification: true,
        clarificationQuestion:
            "Should this go on the long-term ROADMAP.md or the active TASK_PLAN.md?",
        action: "classify"
    };
}
