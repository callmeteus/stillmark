import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { initProject } from "../../src/operations";
import { resolveProjectPaths } from "../../src/paths/ProjectPaths";

/**
 * Create a temp Stillmark project directory.
 */
export function createTempProject(): {
    root: string;
    paths: ReturnType<typeof resolveProjectPaths>;
    cleanup: () => void;
} {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "stillmark-"));
    const paths = resolveProjectPaths(root);
    initProject(paths);

    return {
        root,
        paths,
        cleanup: (): void => {
            fs.rmSync(root, { recursive: true, force: true });
        }
    };
}

export function copyFixture(
    fixtureName: string,
    destPath: string
): void {
    const fixturePath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "fixtures",
        fixtureName
    );

    fs.copyFileSync(fixturePath, destPath);
}
