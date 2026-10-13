import fs from "node:fs";
import path from "node:path";

/**
 * Asserts Astro output is a static site suitable for upload-pages-artifact (not Jekyll source).
 *
 * @param {string} distDir
 */
export function assertLandingDist(distDir) {
    const resolved = path.resolve(distDir);

    if (!fs.existsSync(resolved)) {
        throw new Error(`Missing dist directory: ${resolved}. Run astro build first.`);
    }

    const requiredFiles = [
        "index.html",
        "install.md",
        "pt-br/install.md",
        ".nojekyll"
    ];

    for (const rel of requiredFiles) {
        const full = path.join(resolved, rel);

        if (!fs.existsSync(full)) {
            throw new Error(`Missing Pages artifact file: ${rel}`);
        }
    }

    const indexHtml = fs.readFileSync(path.join(resolved, "index.html"), "utf8");

    // The site is served from the root of https://stillmark.dev, so assets
    // must not carry a repository sub-path like /stillmark/.
    if (!indexHtml.includes("\"/_astro/")) {
        throw new Error(
            "index.html must reference assets under /_astro/ at the site root (check astro base config)"
        );
    }

    if (indexHtml.includes("---")) {
        throw new Error("index.html looks like unparsed front matter; dist must be built HTML only");
    }
}

const distFromCli = process.argv[2];

if (distFromCli) {
    assertLandingDist(distFromCli);
}
