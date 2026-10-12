import { escapeHtml } from "./EscapeHtml";

/**
 * Escapes copy and turns `backtick` spans into `<code>` elements.
 */
export function inlineCodeHtml(text: string): string {
    return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}
