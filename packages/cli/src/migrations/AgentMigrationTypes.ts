import type { AgentId } from "../adapters/Install";

/**
 * One idempotent migration applied to an agent install root (project or global home).
 */
export interface AgentMigration {
    
    /**
     * Stable id (include a date or version suffix when the migration is one-way).
     */
    id: string;
    /**
     * Short description for logs and JSON summaries.
     */
    description: string;
    /**
     * Agents this migration applies to.
     */
    agents: readonly AgentId[];
    /**
     * Performs the migration under `root` for the given agent.
     *
     * @param root Project root or home directory.
     * @param agent Cursor, Claude, or Codex.
     * @returns Absolute paths removed or changed (empty when nothing to do).
     */
    run(root: string, agent: AgentId): string[];
}

/**
 * Result of running a single agent migration.
 */
export interface AppliedAgentMigration {
    
    id: string;
    removed: string[];
}
