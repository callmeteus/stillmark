import type { AgentId } from "../adapters/Install";

import type { AppliedAgentMigration, AgentMigration } from "./AgentMigrationTypes";
import { RemoveSplitStillmarkAgentFiles } from "./RemoveSplitStillmarkAgentFiles";

/**
 * Ordered agent migrations run on `stillmark install` and template refresh.
 */
const MIGRATION_CHAIN: readonly AgentMigration[] = [
    RemoveSplitStillmarkAgentFiles
];

/**
 * Runs registered agent migrations for one install root.
 */
export const AgentMigrationRunner = {
    /**
     * Lists migrations that apply to an agent (for tests and diagnostics).
     *
     * @param agent Cursor, Claude, Codex, or OpenCode.
     * @returns Migrations in run order.
     */
    migrationsForAgent(agent: AgentId): readonly AgentMigration[] {
        return MIGRATION_CHAIN.filter((migration) => migration.agents.includes(agent));
    },

    /**
     * Runs every applicable migration in order.
     *
     * @param root Project root or home directory for global installs.
     * @param agent Cursor, Claude, Codex, or OpenCode.
     * @returns One entry per migration that ran (including zero removals).
     */
    runForAgent(root: string, agent: AgentId): AppliedAgentMigration[] {
        const applied: AppliedAgentMigration[] = [];

        for (const migration of MIGRATION_CHAIN) {
            // Skip migrations that do not target this agent
            if (!migration.agents.includes(agent)) {
                continue;
            }

            const removed = migration.run(root, agent);

            applied.push({
                id: migration.id,
                removed
            });
        }

        return applied;
    }
};
