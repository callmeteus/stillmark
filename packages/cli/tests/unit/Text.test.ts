import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../src/cli";
import {
    compareFacts,
    detectLanguage,
    languageFromTag,
    NoInventionRules,
    scanText,
    TextLanguage,
    TextSeverity,
    writingRules
} from "../../src/text";
import { createTempProject } from "../helpers/TempProject";

let logs: string[] = [];

beforeEach(() => {
    logs = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => {
        logs.push(line);
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});

function lastJson(): Record<string, unknown> {
    return JSON.parse(logs[logs.length - 1]) as Record<string, unknown>;
}

function cli(root: string, ...args: string[]): Promise<number> {
    return runCli(["node", "stillmark", ...args, "--json", `--root=${root}`]);
}

function ids(raw: string, force?: TextLanguage): string[] {
    return scanText(raw, { force }).issues.map((issue) => issue.id);
}

const ENGLISH_SLOP = [
    "# Shared Drafts Are Finally Here",
    "",
    "It's not just a feature, it's a whole new way to collaborate. Here's the thing: the team was drowning in files.",
    "",
    "It's important to note that comments stay anchored to the sentence they reference \u2014 even when the text changes.",
    "",
    "I hope this helps! Let that sink in."
].join("\n");

const PORTUGUESE_SLOP = [
    "# Rascunhos compartilhados",
    "",
    "Não é apenas um recurso, é uma nova forma de colaborar. A verdade é que a equipe estava perdida em arquivos.",
    "",
    "É importante destacar que vamos estar enviando os comentários para todos os membros da equipe.",
    "",
    "Simples assim. Fico à disposição para qualquer dúvida."
].join("\n");

describe("text language detection", () => {
    it("tells English from Portuguese", () => {
        expect(detectLanguage("The file is saved when you close the editor and the changes are kept.")).toBe(TextLanguage.EN);
        expect(detectLanguage("O arquivo é salvo quando você fecha o editor e as mudanças não se perdem.")).toBe(TextLanguage.PT);
    });

    it("keeps Spanish away from the Portuguese rules", () => {
        expect(detectLanguage("El archivo se guarda cuando cierras el editor y los cambios no se pierden.")).toBe(TextLanguage.OTHER);
    });

    it("returns nothing for text too short to tell", () => {
        expect(detectLanguage("Dark mode")).toBeUndefined();
    });

    it("maps language tags", () => {
        expect(languageFromTag("pt-BR")).toBe(TextLanguage.PT);
        expect(languageFromTag("en")).toBe(TextLanguage.EN);
        expect(languageFromTag("es")).toBe(TextLanguage.OTHER);
        expect(languageFromTag(undefined)).toBeUndefined();
        expect(languageFromTag("???")).toBeUndefined();
    });
});

describe("scanText", () => {
    it("finds the English marks of generated text", () => {
        const scan = scanText(ENGLISH_SLOP);

        expect(scan.language).toBe(TextLanguage.EN);
        expect(scan.issues.map((issue) => issue.id)).toEqual(expect.arrayContaining([
            "title-case-heading",
            "negative-parallelism",
            "staged-opener",
            "filler-phrase",
            "em-dash",
            "chat-residue",
            "one-line-closer"
        ]));
        expect(scan.issues.find((issue) => issue.id === "em-dash")?.line).toBe(5);
    });

    it("uses the Portuguese catalog for Portuguese text", () => {
        const scan = scanText(PORTUGUESE_SLOP);

        expect(scan.language).toBe(TextLanguage.PT);
        expect(scan.issues.map((issue) => issue.id)).toEqual(expect.arrayContaining([
            "negative-parallelism",
            "staged-opener",
            "filler-phrase",
            "gerundismo",
            "one-line-closer",
            "chat-residue"
        ]));
        expect(scan.issues.every((issue) => issue.language === TextLanguage.PT)).toBe(true);
    });

    it("checks each paragraph with its own language in a mixed document", () => {
        const scan = scanText(`${ENGLISH_SLOP}\n\n${PORTUGUESE_SLOP}`);
        const gerund = scan.issues.find((issue) => issue.id === "gerundismo");
        const opener = scan.issues.find((issue) => issue.id === "staged-opener");

        expect(gerund?.language).toBe(TextLanguage.PT);
        expect(opener?.language).toBe(TextLanguage.EN);
    });

    it("leaves clear text alone", () => {
        const clean = [
            "# Shared drafts",
            "",
            "Two people can now edit the same document at once. Each change appears for both of them as it is typed.",
            "",
            "Comments stay attached to their sentence when the text around it changes."
        ].join("\n");

        expect(scanText(clean).issues).toEqual([]);
    });

    it("ignores code, inline code, URLs, frontmatter, and tables", () => {
        const raw = [
            "---",
            "title: It's not just a feature, it's a shift",
            "---",
            "",
            "Run `npm test` before you push the branch to the remote and open the pull request.",
            "",
            "```text",
            "I hope this helps \u2014 let that sink in",
            "```",
            "",
            "| Column | It's important to note that |",
            "|---|---|",
            "",
            "See https://example.com/i-hope-this-helps for the full list of steps."
        ].join("\n");

        expect(ids(raw)).toEqual([]);
    });

    it("flags long sentences as warnings only", () => {
        const sentence = `${Array.from({ length: 45 }, (_, index) => `word${index}`).join(" ")}.`;
        const issues = scanText(`The file is saved and the changes are kept. ${sentence}`).issues;

        expect(issues).toEqual([expect.objectContaining({ id: "long-sentence", severity: TextSeverity.LOW })]);
    });

    it("does not flag sentence-case or changelog headings", () => {
        expect(ids("# Shared drafts for every plan\n\n## [1.3.0] - 2026-09-02\n\n### Added", TextLanguage.EN)).toEqual([]);
    });

    it("forces a language when asked", () => {
        expect(ids("Vou estar enviando.", TextLanguage.PT)).toEqual(["gerundismo"]);
        expect(ids("Vou estar enviando.", TextLanguage.EN)).toEqual([]);
    });
});

describe("compareFacts", () => {
    const original = [
        "The import takes 30 seconds for 2,000 rows.",
        "",
        "Run `stillmark text check` and read [the guide](docs/GUIDE.md).",
        "",
        "```bash",
        "npm test",
        "```"
    ].join("\n");

    it("accepts a rewrite that keeps every fact", () => {
        const rewrite = original.replace("The import takes", "Importing takes");

        expect(compareFacts(original, rewrite)).toEqual([]);
    });

    it("flags a lost number and an invented one", () => {
        const rewrite = original.replace("30 seconds", "45 seconds");
        const issues = compareFacts(original, rewrite);

        expect(issues).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: "fact-lost", excerpt: "30" }),
            expect.objectContaining({ id: "possible-invention", excerpt: "45", line: 1 })
        ]));
    });

    it("flags invented links and changed code blocks", () => {
        const rewrite = `${original.replace("npm test", "npm run test")}\n\nMore at https://example.com/new.`;
        const issues = compareFacts(original, rewrite);

        expect(issues.map((issue) => issue.id)).toEqual(expect.arrayContaining(["fact-lost", "possible-invention"]));
        expect(issues.some((issue) => issue.excerpt.includes("https://example.com/new"))).toBe(true);
    });

    it("flags lost inline code and link targets", () => {
        const rewrite = "The import takes 30 seconds for 2,000 rows.\n\nRun the check and read the guide.\n\n```bash\nnpm test\n```";
        const lost = compareFacts(original, rewrite).filter((issue) => issue.id === "fact-lost").map((issue) => issue.excerpt);

        expect(lost).toEqual(expect.arrayContaining(["`stillmark text check`", "docs/GUIDE.md"]));
    });
});

describe("writing rules", () => {
    it("always end with the no-invention rules", () => {
        for (const language of [TextLanguage.EN, TextLanguage.PT, TextLanguage.OTHER]) {
            expect(writingRules(language).slice(-NoInventionRules.length)).toEqual(NoInventionRules);
        }
    });

    it("add language-specific rules", () => {
        expect(writingRules(TextLanguage.PT).join("\n")).toContain("gerundismo");
        expect(writingRules(TextLanguage.EN).join("\n")).toContain("delve");
        expect(writingRules(TextLanguage.OTHER).join("\n")).not.toContain("gerundismo");
    });
});

describe("stillmark text", () => {
    it("checks a file and fails on blocking issues", async () => {
        const { root, cleanup } = createTempProject();

        try {
            fs.writeFileSync(path.join(root, "POST.md"), ENGLISH_SLOP);

            expect(await cli(root, "text", "check", "POST.md")).toBe(1);

            const result = lastJson();

            expect(result.ok).toBe(false);
            expect(result.language).toBe(TextLanguage.EN);
            expect((result.counts as { high: number }).high).toBeGreaterThan(0);
        } finally {
            cleanup();
        }
    });

    it("checks raw text", async () => {
        const { root, cleanup } = createTempProject();

        try {
            const text = "Simples assim, a equipe não perde mais os arquivos que salva.";

            expect(await runCli(["node", "stillmark", "text", "check", "--json", `--root=${root}`, "--", text])).toBe(1);
            expect(lastJson().issues).toEqual([expect.objectContaining({ id: "one-line-closer", language: TextLanguage.PT })]);
        } finally {
            cleanup();
        }
    });

    it("refuses a missing file and files outside the project or of another kind", async () => {
        const { root, cleanup } = createTempProject();

        try {
            fs.writeFileSync(path.join(root, "code.ts"), "const a = 1;");

            expect(await cli(root, "text", "check", "MISSING.md")).toBe(1);
            expect(lastJson().summary).toContain("File not found");
            expect(await cli(root, "text", "check", "code.ts")).toBe(1);
            expect(lastJson().summary).toContain("can be checked");
            expect(await cli(root, "text", "rewrite", "some loose text")).toBe(1);
            expect(await cli(root, "text", "rewrite", "ROADMAP.md")).toBe(1);
            expect(lastJson().summary).toContain("kept by Stillmark commands");
            expect(await cli(root, "text", "check", "ROADMAP.md")).toBe(0);
        } finally {
            cleanup();
        }
    });

    it("rewrites with the original kept, accepts a faithful rewrite, and releases the original", async () => {
        const { root, paths, cleanup } = createTempProject();
        const file = path.join(root, "docs", "POST.md");

        try {
            fs.mkdirSync(path.dirname(file));
            fs.writeFileSync(file, PORTUGUESE_SLOP);

            expect(await cli(root, "text", "rewrite", "docs/POST.md")).toBe(0);

            const rewrite = lastJson();
            const backup = path.join(paths.textDir, "originals", "docs", "POST.md");

            expect(rewrite.language).toBe(TextLanguage.PT);
            expect(rewrite.rules).toEqual(expect.arrayContaining(NoInventionRules));
            expect((rewrite.instructions as string[]).join("\n")).toContain("stillmark text check docs/POST.md");
            expect(fs.readFileSync(backup, "utf8")).toBe(PORTUGUESE_SLOP);

            fs.writeFileSync(file, "# Rascunhos compartilhados\n\nDuas pessoas editam o mesmo documento ao mesmo tempo, e cada mudança aparece para as duas.\n");

            expect(await cli(root, "text", "check", "docs/POST.md")).toBe(0);
            expect(lastJson().summary).toContain("rewrite accepted");
            expect(fs.existsSync(backup)).toBe(false);
        } finally {
            cleanup();
        }
    });

    it("flags an invented number during a rewrite and restores the original", async () => {
        const { root, cleanup } = createTempProject();
        const file = path.join(root, "POST.md");

        try {
            fs.writeFileSync(file, "A equipe usa o editor todos os dias para revisar os textos do site.\n");

            await cli(root, "text", "rewrite", "POST.md");
            fs.writeFileSync(file, "A equipe usa o editor 40 vezes por dia para revisar os textos do site.\n");

            expect(await cli(root, "text", "check", "POST.md")).toBe(1);
            expect(lastJson().issues).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: "possible-invention", excerpt: "40" })
            ]));

            expect(await cli(root, "text", "restore", "POST.md")).toBe(0);
            expect(fs.readFileSync(file, "utf8")).toContain("todos os dias");
            expect(await cli(root, "text", "restore", "POST.md")).toBe(1);
        } finally {
            cleanup();
        }
    });

    it("returns the writing rules for the configured or requested language", async () => {
        const { root, cleanup } = createTempProject();

        try {
            await cli(root, "text", "rules");
            expect(lastJson().language).toBe(TextLanguage.EN);

            await cli(root, "config", "set", "--language=pt-BR");
            await cli(root, "text", "rules");
            expect(lastJson().language).toBe(TextLanguage.PT);

            await cli(root, "text", "rules", "--language=en");
            expect(lastJson().language).toBe(TextLanguage.EN);
        } finally {
            cleanup();
        }
    });

    it("prints usage for an unknown subcommand", async () => {
        const { root, cleanup } = createTempProject();

        try {
            expect(await cli(root, "text", "nope")).toBe(1);
            expect(lastJson().summary).toContain("stillmark text check");
        } finally {
            cleanup();
        }
    });
});
