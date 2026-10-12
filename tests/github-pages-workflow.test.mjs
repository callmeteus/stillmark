import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesWorkflow = path.join(repoRoot, ".github", "workflows", "pages.yml");

test("GitHub Pages workflow publishes Astro dist into docs/ on master", () => {
    assert.ok(fs.existsSync(pagesWorkflow), "missing .github/workflows/pages.yml");

    const yaml = fs.readFileSync(pagesWorkflow, "utf8");

    assert.match(yaml, /peaceiris\/actions-gh-pages/);
    assert.match(yaml, /publish_branch:\s*master/);
    assert.match(yaml, /destination_dir:\s*docs/);
    assert.match(yaml, /keep_files:\s*true/);
    assert.match(yaml, /packages\/landing-page\/dist/);
    assert.match(yaml, /paths-ignore/);
    assert.match(yaml, /docs\/\*\*/);
    assert.doesNotMatch(
        yaml,
        /jekyll-build-pages/,
        "do not build the monorepo with Jekyll"
    );

    const rootConfig = path.join(repoRoot, "_config.yml");

    assert.ok(
        !fs.existsSync(rootConfig),
        "root _config.yml would invite Jekyll builds on branch deploy"
    );
});
