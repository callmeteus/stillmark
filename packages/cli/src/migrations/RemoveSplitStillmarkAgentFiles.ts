import type { AgentId } from "../adapters/Install";
import type { AgentMigration } from "./AgentMigrationTypes";
import { MigrationFs } from "./MigrationFs";

const RELATIVE_PATHS: Record<AgentId, string[]> = {
    cursor: [
        ".cursor/commands/coverage.md",
        ".cursor/commands/design.md",
        ".cursor/commands/stillmark-design.md",
        ".cursor/skills/coverage",
        ".cursor/skills/stillmark-design",
        ".cursor/skills/design"
    ],
    claude: [
        ".claude/commands/coverage.md",
        ".claude/commands/design.md",
        ".claude/commands/stillmark-design.md",
        ".claude/skills/coverage",
        ".claude/skills/stillmark-design",
        ".claude/skills/design"
    ],
    codex: []
};

/**
 * Drops legacy split Stillmark slash commands and skills so only `/stillmark` remains.
 */
export const RemoveSplitStillmarkAgentFiles: AgentMigration = {
    id: "agent-remove-split-stillmark-commands-2026-03",
    description: "Remove legacy /coverage and /design agent commands and split Stillmark skills.",
    agents: ["cursor", "claude"],
    run(root: string, agent: AgentId): string[] {
        return MigrationFs.removeRelativePaths(root, RELATIVE_PATHS[agent]);
    }
};
