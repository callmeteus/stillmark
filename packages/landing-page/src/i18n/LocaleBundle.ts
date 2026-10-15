import { SiteLinks } from "../config/SiteLinks";
import type { LocaleId } from "./LocaleIds";
import { enUS, type SiteMessages } from "./en-US";
import { ptBR } from "./pt-BR";
import { Topics } from "./topics";

/**
 * Site copy per locale.
 */
export const SiteMessagesByLocale: Record<LocaleId, SiteMessages> = {
    "en-US": enUS,
    "pt-BR": ptBR
};

/**
 * Page title and description.
 */
export interface PageMeta {
    
    title: string;
    description: string;
}

/**
 * Everything one page needs to switch language on the client.
 * `data-i18n` paths resolve against this object (`ui.copy.copy`, `toc.roadmap`, `page.title`).
 * `toc` holds the topic labels shown in the docs sidebar and the home topic picker.
 */
export interface PageMessages {
    
    meta: PageMeta;
    ui: SiteMessages["ui"];
    toc: Record<string, string>;
    page: object;
}

/**
 * Copy for both locales plus the install guide URL of each.
 */
export interface LocaleBundle {
    
    messages: Record<LocaleId, PageMessages>;
    installUrls: Record<LocaleId, string>;
}

/**
 * Labels of the table of contents, keyed by topic slug.
 */
function tocLabels(locale: LocaleId): Record<string, string> {
    return Object.fromEntries(Topics.map((topic) => [topic.slug, topic.copy[locale].label]));
}

/**
 * One topic as listed in an index: label, title, and one-line summary.
 */
export interface TopicSummary {
    
    label: string;
    title: string;
    summary: string;
}

/**
 * Index entries of every topic, in table-of-contents order.
 */
export function topicSummaries(locale: LocaleId): TopicSummary[] {
    return Topics.map((topic) => {
        const { label, title, summary } = topic.copy[locale];

        return { label, title, summary };
    });
}

/**
 * Builds the page messages of one locale.
 */
export function pageMessages(locale: LocaleId, meta: PageMeta, page: object): PageMessages {
    return {
        meta,
        ui: SiteMessagesByLocale[locale].ui,
        toc: tocLabels(locale),
        page
    };
}

/**
 * Builds the bundle a page embeds, holding only that page's copy in both locales.
 */
export function createLocaleBundle(select: (locale: LocaleId) => { meta: PageMeta; page: object }): LocaleBundle {
    const en = select("en-US");
    const pt = select("pt-BR");

    return {
        messages: {
            "en-US": pageMessages("en-US", en.meta, en.page),
            "pt-BR": pageMessages("pt-BR", pt.meta, pt.page)
        },

        installUrls: {
            "en-US": SiteLinks.resolveInstallGuideUrl("en-US"),
            "pt-BR": SiteLinks.resolveInstallGuideUrl("pt-BR")
        }
    };
}
