/**
 * Clipboard copy with fallback for non-secure contexts and older browsers.
 * 
 * @param text - The text to copy to the clipboard.
 * @returns void
 */
function fallbackCopy(text: string): void {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const ok = document.execCommand("copy");

    document.body.removeChild(textarea);

    if (!ok) {
        throw new Error("execCommand copy failed");
    }
}

/**
 * Copy text to the clipboard.
 * 
 * @param text - The text to copy to the clipboard.
 * @returns void
 */
async function copyText(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);

            return;
        } catch {
            fallbackCopy(text);

            return;
        }
    }

    fallbackCopy(text);
}

/**
 * Clear the copied state of a button.
 * 
 * @param button - The button to clear the copied state of.
 * @param codeEl - The code element to clear the copied state of.
 * @param status - The status element to clear the copied state of.
 * @param copyLabel - The label to display when the button is not copied.
 */
function clearCopiedState(
    button: HTMLButtonElement,
    codeEl: HTMLElement | null,
    status: Element | null,
    copyLabel: string
): void {
    button.textContent = copyLabel;
    button.disabled = false;
    button.classList.remove("is-copied");
    button.removeAttribute("data-copied");

    if (codeEl) {
        codeEl.classList.remove("is-copied");
    }

    if (status) {
        status.textContent = "";
    }
}

/**
 * Bind copy buttons to the clipboard.
 * 
 * @returns void
 */
function bindCopyButtons(): void {
    document.querySelectorAll<HTMLButtonElement>("[data-copy-target]").forEach((button) => {
        if (button.dataset.copyBound === "true") {
            return;
        }

        button.dataset.copyBound = "true";

        button.addEventListener("click", async () => {
            if (button.disabled) {
                return;
            }

            const id = button.getAttribute("data-copy-target");
            const el = id ? document.getElementById(id) : null;
            const text = el?.textContent?.trim() ?? "";
            const copyLabel = button.getAttribute("data-copy-label") ?? "Copy";
            const copiedLabel = button.getAttribute("data-copied-label") ?? "Copied";
            const failedLabel = button.getAttribute("data-failed-label") ?? "Copy failed";
            const readyLabel =
                button.getAttribute("data-ready-label") ?? "Ready to paste in your terminal.";
            const status = button.closest("[data-copy-root]")?.querySelector(".copy-status");

            if (!text) {
                if (status) {
                    status.textContent = failedLabel;
                }

                return;
            }

            button.disabled = true;

            try {
                await copyText(text);
                button.textContent = copiedLabel;
                button.classList.add("is-copied");
                button.setAttribute("data-copied", "true");

                if (el) {
                    el.classList.add("is-copied");
                }

                if (status) {
                    status.textContent = readyLabel;
                }

                window.setTimeout(() => {
                    clearCopiedState(button, el, status, copyLabel);
                }, 2200);
            } catch {
                button.disabled = false;

                if (status) {
                    status.textContent = failedLabel;
                }
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCopyButtons);
} else {
    bindCopyButtons();
}
