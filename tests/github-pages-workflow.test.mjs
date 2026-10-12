import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesWorkflow = path.join(repoRoot, ".github", "workflows", "pages.yml");

test("GitHub Pages disables Jekyll and publishes Astro dist to master root", () => {
    assert.ok(fs.existsSync(pagesWorkflow), "missing .github/workflows/pages.yml");

    const nojekyll = path.join(repoRoot, ".nojekyll");
    assert.ok(fs.existsSync(nojekyll), "root .nojekyll is required to skip Jekyll on master");

    const yaml = fs.readFileSync(pagesWorkflow, "utf8");

    assert.match(yaml, /packages\/landing-page\/dist/);
    assert.match(yaml, /Merge dist into master root/);
    assert.match(yaml, /git push/);
    assert.doesNotMatch(
        yaml,
        /peaceiris\/actions-gh-pages/,
        "peaceiris blocks master-to-master deploy"
    );
    assert.doesNotMatch(yaml, /jekyll-build-pages/);

    const rootConfig = path.join(repoRoot, "_config.yml");
    assert.ok(!fs.existsSync(rootConfig));
});
