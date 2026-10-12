import type { LocaleBundle } from "../../i18n/LocaleBundle";
import type { LocaleId } from "../../i18n/LocaleIds";
import type { Messages } from "../../i18n/en-US";
import { buildInstallPrompt } from "../../utils/BuildInstallPrompt";
import { inlineCodeHtml } from "../../utils/InlineCode";
import { messageAtPath } from "./MessagePath";

/**
 * Maps a terminal command to the agent slash form.
 */
function toAgentCommand(cmd: string): string {
    if (cmd.startsWith("stillmark ")) {
        return `/${cmd}`;
    }

    return cmd;
}

/**
 * Runs `apply` for every element carrying `attribute`, passing the resolved message.
 */
function forEachMessage(
    messages: Messages,
    attribute: string,
    apply: (element: HTMLElement, message: string) => void
): void {
    for (const element of document.querySelectorAll<HTMLElement>(`[${attribute}]`)) {
        const path = element.getAttribute(attribute);

        if (path) {
            apply(element, messageAtPath(messages, path));
        }
    }
}

function updateInstallPrompts(bundle: LocaleBundle, locale: LocaleId, messages: Messages): void {
    const url = bundle.installUrls[locale];
    const prompt = buildInstallPrompt(messages.hero.installPromptTemplate, url);
    const globalPrompt = buildInstallPrompt(messages.hero.installPromptGlobalTemplate, url);

    for (const element of document.querySelectorAll<HTMLElement>("[data-hero-agent-prompt], [data-mobile-install-command]")) {
        element.textContent = element.dataset.heroAgentPrompt === "global" ? globalPrompt : prompt;
    }

    for (const element of document.querySelectorAll<HTMLElement>("[data-hero-cli-command]")) {
        element.textContent = element.dataset.heroCliCommand === "global"
            ? messages.hero.cliInstallGlobalCommand
            : messages.hero.cliInstallCommand;
    }
}

function updateLangToggle(locale: LocaleId): void {
    const toggle = document.querySelector<HTMLButtonElement>("[data-locale-toggle]");

    if (!toggle) {
        return;
    }

    const next: LocaleId = locale === "en-US" ? "pt-BR" : "en-US";
    const nextLabel = next === "pt-BR" ? "PT" : "EN";

    toggle.textContent = nextLabel;
    toggle.setAttribute("lang", next);
    toggle.setAttribute(
        "aria-label",
        locale === "en-US" ? "Mudar idioma para português" : "Switch language to English"
    );
}

function updateCopyButtonLabels(messages: Messages): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy-label]")) {
        button.setAttribute("data-copy-label", messages.copy.copyShort);
        button.setAttribute("data-copied-label", messages.copy.copied);
        button.setAttribute("data-failed-label", messages.copy.failed);
        button.setAttribute("data-ready-label", messages.copy.readyInTerminal);

        const targetId = button.getAttribute("data-copy-target");
        const target = targetId ? document.getElementById(targetId) : null;

        if (target?.textContent) {
            button.setAttribute("aria-label", `${messages.copy.copyShort}: ${target.textContent.trim()}`);
        }

        if (!button.classList.contains("is-copied")) {
            button.textContent = messages.copy.copyShort;
        }
    }
}

/**
 * Applies all landing copy for the given locale.
 */
export function applyLocale(bundle: LocaleBundle, locale: LocaleId): void {
    const messages = bundle.messages[locale];

    document.documentElement.lang = locale;
    document.title = messages.meta.title;

    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (metaDescription) {
        metaDescription.content = messages.meta.description;
    }

    forEachMessage(messages, "data-i18n", (element, message) => {
        element.textContent = message;
    });

    forEachMessage(messages, "data-i18n-rich", (element, message) => {
        element.innerHTML = inlineCodeHtml(message);
    });

    forEachMessage(messages, "data-i18n-agent", (element, message) => {
        element.textContent = toAgentCommand(message);
    });

    forEachMessage(messages, "data-i18n-aria-label", (element, message) => {
        element.setAttribute("aria-label", message);
    });

    updateInstallPrompts(bundle, locale, messages);
    updateLangToggle(locale);
    updateCopyButtonLabels(messages);
}
