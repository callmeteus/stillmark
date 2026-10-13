/**
 * External URLs for the marketing site.
 * Set `PUBLIC_STILLMARK_GITHUB` at build time to override the default repo.
 * Override install guide with `PUBLIC_STILLMARK_INSTALL_URL` if needed.
 */
const DEFAULT_GITHUB_REPO = "https://github.com/callmeteus/stillmark";

const envGithub = import.meta.env.PUBLIC_STILLMARK_GITHUB;
const envInstallUrl = import.meta.env.PUBLIC_STILLMARK_INSTALL_URL;
const siteOrigin =
    (import.meta.env.SITE as string | undefined) ?? "https://stillmark.dev";

function resolveGithubUrl(): string {
    if (typeof envGithub === "string" && envGithub.trim().length > 0) {
        return envGithub.trim();
    }

    return DEFAULT_GITHUB_REPO;
}

/** Stable asset name on every GitHub Release (`releases/latest/download/stillmark.tgz`). */
export function resolveCliTarballInstallUrl(): string {
    return `${resolveGithubUrl()}/releases/latest/download/stillmark.tgz`;
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
    cliTarballInstallUrl: resolveCliTarballInstallUrl(),
    resolveInstallGuideUrl
};
