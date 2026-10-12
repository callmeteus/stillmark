import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesWorkflow = path.join(repoRoot, ".github", "workflows", "pages.yml");

test("GitHub Pages workflow deploys Astro dist, not Jekyll on the monorepo", () => {
    assert.ok(fs.existsSync(pagesWorkflow), "missing .github/workflows/pages.yml");

    const yaml = fs.readFileSync(pagesWorkflow, "utf8");

    assert.match(yaml, /upload-pages-artifact/);
    assert.match(yaml, /deploy-pages/);
    assert.match(yaml, /packages\/landing-page\/dist/);
    assert.doesNotMatch(
        yaml,
        /jekyll-build-pages/,
        "do not use Jekyll; Pages must upload the Astro dist artifact"
    );

    const rootConfig = path.join(repoRoot, "_config.yml");

    assert.ok(
        !fs.existsSync(rootConfig),
        "root _config.yml would invite Jekyll builds on branch deploy"
    );
});
