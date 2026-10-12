import type { TaskPlanDocument } from "../documents";
import { normalizeTitle, tokenSimilarity } from "./Duplicates";

export interface ScopeGuardResult {
    allowed: boolean;
    reason?: "outOfScope" | "uncertain";
    message?: string;
    alternatives?: string[];
}

/**
 * Check whether adding work to the plan fits accepted scope.
 */
export function checkPlanScope(
    plan: TaskPlanDocument,
    itemTitle: string
): ScopeGuardResult {
    const titleNorm = normalizeTitle(itemTitle);

    for (const out of plan.outOfScope) {
        const outNorm = normalizeTitle(out);

        if (
            titleNorm.includes(outNorm) ||
            outNorm.includes(titleNorm) ||
            tokenSimilarity(itemTitle, out) >= 0.7
        ) {
            return {
                allowed: false,
                reason: "outOfScope",
                message: `Item matches out-of-scope entry: "${out}"`,
                alternatives: [
                    "Add to ROADMAP.md instead",
                    "Defer until scope is expanded",
                    "Start a separate execution plan"
                ]
            };
        }
    }

    if (plan.objective) {
        const sim = tokenSimilarity(itemTitle, plan.objective);

        if (sim < 0.15 && plan.inScope.length > 0) {
            let matchesInScope = false;

            for (const entry of plan.inScope) {
                if (tokenSimilarity(itemTitle, entry) >= 0.4) {
                    matchesInScope = true;
                    break;
                }
            }

            if (!matchesInScope) {
                return {
                    allowed: false,
                    reason: "uncertain",
                    message:
                        "Item may be outside the active objective and in-scope list.",
                    alternatives: [
                        "Confirm scope expansion with --accept-scope-change",
                        "Add to roadmap as future work"
                    ]
                };
            }
        }
    }

    return { allowed: true };
}
