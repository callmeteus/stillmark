const SECRET_PATTERNS = [
    /(?:api[_-]?key|secret|token|password|bearer)\s*[:=]\s*['"]?[A-Za-z0-9_\-./+=]{8,}/i,
    /sk-[A-Za-z0-9]{20,}/,
    /ghp_[A-Za-z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/
];

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PRIVATE_IP_RE =
    /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/;

export interface PrivacyFinding {
    
    kind: "secret" | "email" | "private-ip" | "plan-leak";
    detail: string;
}

/**
 * Scan text intended for public ROADMAP.md.
 */
export function scanForSensitiveContent(
    text: string,
    privatePlanExcerpt?: string
): PrivacyFinding[] {
    const findings: PrivacyFinding[] = [];

    for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(text)) {
            findings.push({
                kind: "secret",
                detail: "Possible secret or credential pattern detected"
            });
            break;
        }
    }

    if (EMAIL_RE.test(text)) {
        findings.push({ kind: "email", detail: "Email address detected" });
    }

    if (PRIVATE_IP_RE.test(text)) {
        findings.push({
            kind: "private-ip",
            detail: "Private IP address detected"
        });
    }

    if (privatePlanExcerpt && privatePlanExcerpt.length > 40) {
        const chunk = privatePlanExcerpt.slice(0, 200).trim();

        if (chunk.length > 40 && text.includes(chunk)) {
            findings.push({
                kind: "plan-leak",
                detail: "Text appears copied from private TASK_PLAN.md"
            });
        }
    }

    return findings;
}
