import type { LocaleBundle } from "../i18n/LocaleBundle";
import type { LocaleId } from "../i18n/LocaleIds";
import { LOCALE_STORAGE_KEY, LocaleIds } from "../i18n/LocaleIds";
import { applyLocale } from "./locale/applyLocale";

declare global {
    interface Window {
        
        __STILLMARK_LOCALE__?: LocaleBundle;
    }
}

/**
 * Resolves initial locale from URL, storage, or browser language.
 */
function resolveInitialLocale(): LocaleId {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get("lang");

    if (queryLang === "pt-BR" || queryLang === "pt") {
        return LocaleIds.PT;
    }

    if (queryLang === "en-US" || queryLang === "en") {
        return LocaleIds.EN;
    }

    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    if (stored === LocaleIds.PT || stored === LocaleIds.EN) {
        return stored;
    }

    const navLang = navigator.language.toLowerCase();

    if (navLang.startsWith("pt")) {
        return LocaleIds.PT;
    }

    return LocaleIds.EN;
}

/**
 * Redirects legacy /pt-br/ URLs to the same page with the locale query.
 */
function redirectLegacyPtBrPath(): void {
    const path = window.location.pathname;

    if (!path.includes("/pt-br")) {
        return;
    }

    const next = path.replace(/\/pt-br(\/|$)/, "/") || "/";

    window.location.replace(`${next}?lang=pt-BR${window.location.hash}`);
}

function initLocaleSwitch(setLocale: (id: LocaleId) => void): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-locale-option]")) {
        button.addEventListener("click", () => {
            const next = button.dataset.localeOption === LocaleIds.PT ? LocaleIds.PT : LocaleIds.EN;

            setLocale(next);
            window.localStorage.setItem(LOCALE_STORAGE_KEY, next);

            const url = new URL(window.location.href);
            url.searchParams.set("lang", next);
            window.history.replaceState(null, "", url);
        });
    }
}

redirectLegacyPtBrPath();

const bundle = window.__STILLMARK_LOCALE__;

if (!bundle) {
    console.warn("[stillmark] locale bundle missing");
} else {
    const setLocale = (locale: LocaleId) => {
        applyLocale(bundle, locale);
    };

    const initial = resolveInitialLocale();

    setLocale(initial);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, initial);
    initLocaleSwitch(setLocale);
}
