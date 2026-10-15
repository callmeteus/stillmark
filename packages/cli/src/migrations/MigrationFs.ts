import fs from "node:fs";
import path from "node:path";

/**
 * Shared filesystem helpers for agent migrations.
 */
export namespace MigrationFs {
    /**
     * Deletes each relative path under `root` when it exists.
     *
     * @param root Project root or home directory.
     * @param relativePaths Paths relative to `root`.
     * @returns Absolute paths that were removed.
     */
    export function removeRelativePaths(root: string, relativePaths: readonly string[]): string[] {
        const removed: string[] = [];

        for (const rel of relativePaths) {
            const abs = path.join(root, rel);

            // Ignore if the path was already removed
            if (!fs.existsSync(abs)) {
                continue;
            }

            fs.rmSync(abs, {
                recursive: true,
                force: true
            });
            removed.push(abs);
        }

        return removed;
    }
}
