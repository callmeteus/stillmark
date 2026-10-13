const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Local calendar date as `YYYY-MM-DD`.
 */
export function todayIsoDate(now: Date = new Date()): string {
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * True for a real calendar date written as `YYYY-MM-DD`.
 */
export function isIsoDate(value: string): boolean {
    const match = ISO_DATE_RE.exec(value);

    if (!match) {
        return false;
    }

    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Sets `key: value` in a roadmap metadata line (`priority: x · status: y · ...`), replacing an
 * existing value or appending a new field. Leading indentation is preserved.
 */
export function setMetaField(meta: string, key: string, value: string): string {
    const pattern = new RegExp(`(^|·\\s*|\\s)${key}:\\s*[^\\s·]+`);

    if (pattern.test(meta)) {
        return meta.replace(pattern, (_match, lead: string) => `${lead}${key}: ${value}`);
    }

    return `${meta.trimEnd()} · ${key}: ${value}`;
}
