import type { LocaleId } from "./LocaleIds";
import { enUS, type Messages } from "./en-US";
import { ptBR } from "./pt-BR";

export interface LocaleBundle {
    messages: Record<LocaleId, Messages>;
    installUrls: Record<LocaleId, string>;
}

/**
 * Full catalog for client-side locale switching (embedded once in index.html).
 */
export function createLocaleBundle(installUrls: Record<LocaleId, string>): LocaleBundle {
    return {
        messages: {
            "en-US": enUS,
            "pt-BR": ptBR
        },
        installUrls
    };
}
