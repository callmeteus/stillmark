/**
 * External URLs for the marketing site.
 * Set `PUBLIC_STILLMARK_GITHUB` at build time before production deploy.
 * Override install guide with `PUBLIC_STILLMARK_INSTALL_URL` if needed.
 */
const envGithub = import.meta.env.PUBLIC_STILLMARK_GITHUB;
const envInstallUrl = import.meta.env.PUBLIC_STILLMARK_INSTALL_URL;
const siteOrigin = (import.meta.env.SITE as string | undefined) ?? "https://stillmark.dev";

function resolveGithubUrl(): string | null {
    if (typeof envGithub === "string" && envGithub.trim().length > 0) {
        return envGithub.trim();
    }

    return null;
}

/**
 * Markdown install guide served by this site (or overridden at build time).
 */
export function resolveInstallGuideUrl(lang: "en-US" | "pt-BR"): string {
    if (typeof envInstallUrl === "string" && envInstallUrl.trim().length > 0) {
        return envInstallUrl.trim();
    }

    if (lang === "pt-BR") {
        return `${siteOrigin}/pt-br/install.md`;
    }

    return `${siteOrigin}/install.md`;
}

export const SiteLinks = {
    github: resolveGithubUrl(),
    resolveInstallGuideUrl
};
