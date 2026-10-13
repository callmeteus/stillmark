import type { LocaleBundle, PageMessages } from "../../i18n/LocaleBundle";
import type { LocaleId } from "../../i18n/LocaleIds";
import { buildInstallPrompt } from "../../utils/BuildInstallPrompt";
import { inlineCodeHtml } from "../../utils/InlineCode";
import { messageAtPath } from "./MessagePath";

/**
 * Runs `apply` for every element carrying `attribute`, passing the resolved message.
 */
function forEachMessage(
    messages: PageMessages,
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

function updateInstallPrompts(bundle: LocaleBundle, locale: LocaleId, messages: PageMessages): void {
    const prompt = buildInstallPrompt(messages.ui.install.promptTemplate, bundle.installUrls[locale]);

    for (const element of document.querySelectorAll<HTMLElement>("[data-install-prompt]")) {
        element.textContent = prompt;
    }
}

function updateLanguageSwitch(locale: LocaleId, messages: PageMessages): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-locale-option]")) {
        const active = button.dataset.localeOption === locale;

        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("is-active", active);
    }

    const group = document.querySelector<HTMLElement>("[data-locale-switch]");

    if (group) {
        group.setAttribute("aria-label", messages.ui.switchLanguage);
    }
}

function updateCopyButtonLabels(messages: PageMessages): void {
    const copy = messages.ui.copy;

    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy-target]")) {
        button.setAttribute("data-copy-label", copy.copy);
        button.setAttribute("data-copied-label", copy.copied);
        button.setAttribute("data-failed-label", copy.failed);
        button.setAttribute("data-ready-label", copy.ready);

        const targetId = button.getAttribute("data-copy-target");
        const target = targetId ? document.getElementById(targetId) : null;

        if (target?.textContent) {
            button.setAttribute("aria-label", `${copy.copy}: ${target.textContent.trim()}`);
        }

        const label = button.querySelector<HTMLElement>("[data-copy-text]") ?? button;

        if (!button.classList.contains("is-copied")) {
            label.textContent = copy.copy;
        }
    }
}

/**
 * Applies all page copy for the given locale.
 */
export function applyLocale(bundle: LocaleBundle, locale: LocaleId): void {
    const messages = bundle.messages[locale];

    document.documentElement.lang = locale;
    document.title = messages.meta.title;

    const metaDescription = document.querySelector<HTMLMetaElement>("meta[name=\"description\"]");

    if (metaDescription) {
        metaDescription.content = messages.meta.description;
    }

    forEachMessage(messages, "data-i18n", (element, message) => {
        element.textContent = message;
    });

    forEachMessage(messages, "data-i18n-rich", (element, message) => {
        element.innerHTML = inlineCodeHtml(message);
    });

    forEachMessage(messages, "data-i18n-aria-label", (element, message) => {
        element.setAttribute("aria-label", message);
    });

    updateInstallPrompts(bundle, locale, messages);
    updateLanguageSwitch(locale, messages);
    updateCopyButtonLabels(messages);
}
