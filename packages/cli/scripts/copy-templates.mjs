import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cliDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.resolve(cliDir, "../..");
const src = path.join(repoRoot, "templates");
const dest = path.join(cliDir, "dist", "templates");

function copyRecursive(from, to) {
    fs.mkdirSync(to, { recursive: true });

    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
        const srcPath = path.join(from, entry.name);
        const destPath = path.join(to, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

if (!fs.existsSync(src)) {
    console.error("templates/ not found at", src);
    process.exit(1);
}

copyRecursive(src, dest);

const designSkillSrc = path.join(repoRoot, "skills", "stillmark-design");

if (fs.existsSync(designSkillSrc)) {
    const designTargets = [
        path.join(dest, "cursor", ".cursor", "skills", "stillmark-design"),
        path.join(dest, "claude", ".claude", "skills", "stillmark-design")
    ];

    for (const target of designTargets) {
        copyRecursive(designSkillSrc, target);
    }

    console.log("Synced stillmark-design skill into template trees");
}

console.log("Copied templates to", dest);
