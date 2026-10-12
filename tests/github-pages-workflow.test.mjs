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

    assert.match(yaml, /peaceiris\/actions-gh-pages/);
    assert.match(yaml, /publish_branch:\s*master/);
    assert.match(yaml, /keep_files:\s*true/);
    assert.match(yaml, /packages\/landing-page\/dist/);
    assert.match(yaml, /enable_jekyll:\s*false/);
    assert.doesNotMatch(
        yaml,
        /destination_dir:/,
        "dist must merge to branch root for /stillmark/ project Pages URL"
    );
    assert.doesNotMatch(yaml, /jekyll-build-pages/);

    const rootConfig = path.join(repoRoot, "_config.yml");
    assert.ok(!fs.existsSync(rootConfig));
});
