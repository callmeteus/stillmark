/**
 * Reads a dotted path from the messages object (e.g. `ui.copy.copy`, `page.examples.0.say`).
 */
export function messageAtPath(messages: object, path: string): string {
    const parts = path.split(".");
    let current: unknown = messages;

    for (const part of parts) {
        if (current === null || typeof current !== "object" || !(part in current)) {
            throw new Error(`Missing i18n path: ${path}`);
        }

        current = (current as Record<string, unknown>)[part];
    }

    if (typeof current !== "string") {
        throw new Error(`i18n path is not a string: ${path}`);
    }

    return current;
}
