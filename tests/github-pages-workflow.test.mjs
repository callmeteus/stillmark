import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesWorkflow = path.join(repoRoot, ".github", "workflows", "pages.yml");

test("GitHub Pages deploys Astro dist via upload-pages-artifact (no git push to master)", () => {
    assert.ok(fs.existsSync(pagesWorkflow), "missing .github/workflows/pages.yml");

    const yaml = fs.readFileSync(pagesWorkflow, "utf8");

    assert.match(yaml, /packages\/landing-page\/dist/);
    assert.match(yaml, /actions\/upload-pages-artifact@v3/);
    assert.match(yaml, /actions\/deploy-pages@v4/);
    assert.match(yaml, /pages: write/);
    assert.match(yaml, /id-token: write/);
    assert.doesNotMatch(yaml, /git push/, "static site must not be committed to master");
    assert.doesNotMatch(
        yaml,
        /peaceiris\/actions-gh-pages/,
        "peaceiris blocks master-to-master deploy"
    );

    const rootConfig = path.join(repoRoot, "_config.yml");
    assert.ok(!fs.existsSync(rootConfig));
});
