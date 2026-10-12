import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { assertLandingDist } from "../scripts/verify-dist.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(packageRoot, "dist");

/**
 * @param {string} dir
 */
function listFilesRecursive(dir) {
    const out = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            out.push(...listFilesRecursive(full));
        } else {
            out.push(full);
        }
    }

    return out;
}

test("astro build produces a static GitHub Pages artifact", () => {
    execSync("npm run build", {
        cwd: packageRoot,
        stdio: "inherit",
        env: {
            ...process.env,
            PUBLIC_STILLMARK_GITHUB: "https://github.com/callmeteus/stillmark"
        }
    });

    assertLandingDist(distDir);

    const astroInDist = listFilesRecursive(distDir).filter((file) =>
        file.endsWith(".astro")
    );

    assert.equal(
        astroInDist.length,
        0,
        "dist must not contain .astro sources (Jekyll would try to parse the repo root instead)"
    );
});
