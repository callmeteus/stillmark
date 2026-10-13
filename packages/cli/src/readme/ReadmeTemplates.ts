/**
 * A README section shared by several templates.
 */
export interface ReadmeSection {
    id: string;
    /**
     * English heading; agents translate it to the docs language.
     */
    heading: string;
    /**
     * What the section must say, from the reader's point of view.
     */
    hint: string;
    /**
     * Lowercase, accent-free words that identify the section in any heading (en, pt, es).
     */
    aliases: string[];
}

/**
 * One section slot inside a template.
 */
export interface ReadmeTemplateSection {
    id: string;
    required: boolean;
}

/**
 * A README layout the user can pick.
 */
export interface ReadmeTemplate {
    id: string;
    name: string;
    bestFor: string;
    /**
     * Where the layout comes from.
     */
    source: string;
    /**
     * Header block above the first section (title, one-liner, badges).
     */
    header: string;
    sections: ReadmeTemplateSection[];
}

export const ReadmeSections: readonly ReadmeSection[] = [
    { id: "overview", heading: "Overview", hint: "What it is, the problem it solves, and what it does not do", aliases: ["overview", "about", "what is", "description", "introduction", "visao geral", "sobre", "o que e", "descricao", "introducao", "descripcion", "acerca", "que es"] },
    { id: "background", heading: "Background", hint: "Why it exists and links for unfamiliar terms", aliases: ["background", "motivation", "why", "contexto", "motivacao", "por que", "antecedentes", "motivacion"] },
    { id: "features", heading: "Features", hint: "What works today, as bold label plus one line; mark partial work as such", aliases: ["features", "highlights", "recursos", "funcionalidades", "caracteristicas", "destaques"] },
    { id: "visuals", heading: "Visuals", hint: "Screenshots or a short demo, only when they already exist in the repo", aliases: ["visuals", "screenshots", "demo", "preview", "capturas", "imagens", "demonstracao", "demostracion"] },
    { id: "builtWith", heading: "Built With", hint: "Main frameworks and runtimes with versions from the manifests", aliases: ["built with", "tech stack", "stack", "technologies", "tecnologias", "construido com", "construido con"] },
    { id: "install", heading: "Install", hint: "Copy-paste install command and prerequisites (runtime versions from engines)", aliases: ["install", "installation", "setup", "prerequisites", "requirements", "instalacao", "instalar", "requisitos", "pre-requisitos", "instalacion"] },
    { id: "getStarted", heading: "Get Started", hint: "Shortest path from clone to running, with real commands and URLs", aliases: ["get started", "getting started", "quick start", "quickstart", "comecando", "primeiros passos", "inicio rapido", "comenzar", "como empezar"] },
    { id: "usage", heading: "Usage", hint: "A minimal runnable example first, then common cases", aliases: ["usage", "example", "examples", "how to use", "uso", "como usar", "exemplo", "exemplos", "utilizacao", "ejemplo", "ejemplos"] },
    { id: "commands", heading: "Commands", hint: "Table of commands and what each does, from the real CLI or scripts", aliases: ["commands", "cli", "scripts", "run", "running", "comandos", "executar", "rodar", "ejecutar"] },
    { id: "api", heading: "API", hint: "Exports, options with defaults, and errors as tables", aliases: ["api", "reference", "referencia", "routes", "rotas", "rutas", "endpoints"] },
    { id: "configuration", heading: "Configuration", hint: "Config files and environment variables as a table (name, default, purpose); never real secrets", aliases: ["configuration", "config", "environment", "settings", "configuracao", "ambiente", "variaveis", "configuracion", "entorno", "variables"] },
    { id: "architecture", heading: "Architecture", hint: "Packages or modules and their responsibilities as a table; ASCII diagram when useful", aliases: ["architecture", "structure", "project structure", "layout", "repository layout", "packages", "modules", "arquitetura", "estrutura", "pacotes", "modulos", "arquitectura", "estructura", "paquetes"] },
    { id: "development", heading: "Development", hint: "Install, test, lint, and build commands from the scripts", aliases: ["development", "developing", "local development", "contributing locally", "desenvolvimento", "desarrollo", "testes", "tests"] },
    { id: "deploy", heading: "Deploy", hint: "How it ships, only from deploy files that exist (CI, Dockerfile, manifests)", aliases: ["deploy", "deployment", "release", "publishing", "implantacao", "publicacao", "despliegue", "publicacion"] },
    { id: "observability", heading: "Observability", hint: "Where logs and metrics live and how to read them", aliases: ["observability", "logs", "metrics", "monitoring", "observabilidade", "metricas", "monitoramento", "observabilidad", "monitoreo"] },
    { id: "troubleshooting", heading: "Troubleshooting", hint: "Symptom, cause, and fix table; runbooks for common tasks", aliases: ["troubleshooting", "runbook", "runbooks", "common issues", "problemas", "solucao de problemas", "solucion de problemas"] },
    { id: "faq", heading: "FAQ", hint: "Sharp edges that generate issues (platforms, CI, permissions)", aliases: ["faq", "questions", "perguntas", "preguntas"] },
    { id: "roadmap", heading: "Roadmap", hint: "Link to ROADMAP.md or a short list of what is next; nothing invented", aliases: ["roadmap", "proximos passos", "planos", "hoja de ruta"] },
    { id: "status", heading: "Project Status", hint: "Active, maintenance only, or experimental", aliases: ["status", "project status", "estado", "situacao"] },
    { id: "support", heading: "Support", hint: "Where to ask for help (issues, discussions, chat)", aliases: ["support", "help", "suporte", "ajuda", "soporte", "ayuda"] },
    { id: "contributing", heading: "Contributing", hint: "How to contribute, or a link to CONTRIBUTING.md", aliases: ["contributing", "contribute", "contribuindo", "contribuir", "contribucion", "contribuciones"] },
    { id: "maintainers", heading: "Maintainers", hint: "Who maintains it and how to reach them", aliases: ["maintainers", "authors", "author", "contact", "team", "mantenedores", "autores", "autor", "contato", "equipe", "contacto", "equipo"] },
    { id: "acknowledgments", heading: "Acknowledgments", hint: "Credits and inspirations", aliases: ["acknowledgments", "acknowledgements", "thanks", "credits", "agradecimentos", "creditos", "agradecimientos"] },
    { id: "documentation", heading: "Documentation", hint: "Links to the other docs in the repo (CHANGELOG, ARCHITECTURE, docs/)", aliases: ["documentation", "docs", "further reading", "documentacao", "documentacion", "leia mais"] },
    { id: "license", heading: "License", hint: "License name and a link to the LICENSE file; say so when there is none", aliases: ["license", "licence", "licenca", "licencia"] }
];

function slots(required: string[], optional: string[] = [], order?: string[]): ReadmeTemplateSection[] {
    const all = order ?? [...required, ...optional];

    return all.map((id) => ({ id, required: required.includes(id) }));
}

export const ReadmeTemplates: readonly ReadmeTemplate[] = [
    {
        id: "app-root",
        name: "App or monorepo root",
        bestFor: "Applications and monorepos with several packages",
        source: "Stillmark workspace convention (centered header, features, architecture table)",
        header: "Centered block: name, tagline, one-sentence summary, badges, and links to the main sections",
        sections: slots(
            ["overview", "features", "getStarted", "architecture", "development", "license"],
            ["deploy", "documentation"],
            ["overview", "features", "getStarted", "architecture", "development", "deploy", "documentation", "license"]
        )
    },
    {
        id: "package",
        name: "Workspace package",
        bestFor: "A package inside a monorepo (packages/*)",
        source: "Stillmark workspace convention (package README)",
        header: "# @scope/name, one-line description, default port or entry URL when relevant",
        sections: slots(["overview", "commands"], ["api", "configuration"], ["overview", "commands", "api", "configuration"])
    },
    {
        id: "cli",
        name: "Command-line tool",
        bestFor: "Published CLIs and developer tools",
        source: "Open source README style: problem first, copy-paste first screen, tables for options",
        header: "# name, one sentence on what it does",
        sections: slots(
            ["install", "usage", "commands", "license"],
            ["overview", "configuration", "faq", "documentation"],
            ["overview", "install", "usage", "commands", "configuration", "faq", "documentation", "license"]
        )
    },
    {
        id: "standard",
        name: "Standard Readme",
        bestFor: "Open source libraries that want a strict, predictable order",
        source: "https://github.com/RichardLitt/standard-readme/blob/HEAD/spec.md",
        header: "# Title matching the package name, badges, short description (under 120 characters)",
        sections: slots(
            ["install", "usage", "contributing", "license"],
            ["background", "api", "maintainers", "acknowledgments"],
            ["background", "install", "usage", "api", "maintainers", "acknowledgments", "contributing", "license"]
        )
    },
    {
        id: "showcase",
        name: "Project showcase (Best-README-Template)",
        bestFor: "Public projects that want a polished landing page on GitHub",
        source: "https://github.com/othneildrew/best-readme-template",
        header: "Centered logo or title, tagline, links to docs, demo, and issue reporting, table of contents",
        sections: slots(
            ["overview", "getStarted", "usage", "license"],
            ["builtWith", "roadmap", "contributing", "maintainers", "acknowledgments"],
            ["overview", "builtWith", "getStarted", "usage", "roadmap", "contributing", "license", "maintainers", "acknowledgments"]
        )
    },
    {
        id: "makeareadme",
        name: "Make a README",
        bestFor: "General open source projects",
        source: "https://www.makeareadme.com/",
        header: "# Name, badges, a description of what it does specifically",
        sections: slots(
            ["overview", "install", "usage", "license"],
            ["visuals", "support", "roadmap", "contributing", "maintainers", "status"],
            ["overview", "visuals", "install", "usage", "support", "roadmap", "contributing", "maintainers", "license", "status"]
        )
    },
    {
        id: "funnel",
        name: "Art of README (cognitive funnel)",
        bestFor: "Small modules and npm packages: broad first, details below",
        source: "https://github.com/hackergrrl/art-of-readme",
        header: "# name, one-liner on purpose; caveats and limitations up front",
        sections: slots(["usage", "api", "install", "license"], ["background", "acknowledgments"], ["usage", "api", "install", "license", "background", "acknowledgments"])
    },
    {
        id: "service",
        name: "Internal service",
        bestFor: "Backend services and internal tools: onboarding and operations",
        source: "Internal service and runbook README practice (environment table, deploy, troubleshooting)",
        header: "# Service name, what it serves and who calls it",
        sections: slots(
            ["overview", "getStarted", "configuration", "deploy"],
            ["api", "observability", "troubleshooting"],
            ["overview", "getStarted", "configuration", "api", "deploy", "observability", "troubleshooting"]
        )
    },
    {
        id: "minimal",
        name: "Minimal",
        bestFor: "Scripts, experiments, and small private repos",
        source: "Smallest useful README: what, install, use, license",
        header: "# Name and one sentence",
        sections: slots(["install", "usage"], ["license"])
    }
];

/**
 * Looks up a template by id.
 */
export function findReadmeTemplate(id: string | undefined): ReadmeTemplate | undefined {
    return ReadmeTemplates.find((template) => template.id === id);
}

/**
 * Looks up a section by id.
 */
export function findReadmeSection(id: string): ReadmeSection | undefined {
    return ReadmeSections.find((section) => section.id === id);
}

/**
 * Lowercase, accent-free, punctuation-free text for heading comparison.
 */
export function normalizeHeading(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[`*_[\]()!?:.#]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Section id that a heading most likely represents, in any of the supported languages.
 * The longest matching alias wins, so "Local Development Setup" is development, not install.
 */
export function matchReadmeSection(heading: string): string | undefined {
    const normalized = ` ${normalizeHeading(heading)} `;
    let best: { id: string; length: number } | undefined;

    for (const section of ReadmeSections) {
        for (const alias of section.aliases) {
            if (normalized.includes(` ${alias} `) && alias.length > (best?.length ?? 0)) {
                best = { id: section.id, length: alias.length };
            }
        }
    }

    return best?.id;
}
