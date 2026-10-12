/**
 * Fills the hero install prompt template with the resolved guide URL.
 */
export function buildInstallPrompt(template: string, installGuideUrl: string): string {
    return template.replaceAll("{url}", installGuideUrl);
}
