/**
 * Accessible tabs for every `[data-tabs]` group: `[role="tab"]` buttons with `aria-controls`
 * pointing at `[role="tabpanel"]` elements. Arrow keys, Home, and End move between tabs.
 */
function selectTab(tabs: HTMLButtonElement[], next: HTMLButtonElement, focus: boolean): void {
    for (const tab of tabs) {
        const selected = tab === next;
        const panelId = tab.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;

        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;

        if (panel) {
            panel.hidden = !selected;
        }
    }

    if (focus) {
        next.focus();
    }
}

function nextIndex(key: string, current: number, count: number): number | undefined {
    switch (key) {
        case "ArrowRight":
        case "ArrowDown":
            return (current + 1) % count;
        case "ArrowLeft":
        case "ArrowUp":
            return (current - 1 + count) % count;
        case "Home":
            return 0;
        case "End":
            return count - 1;
        default:
            return undefined;
    }
}

function bindTabs(group: HTMLElement): void {
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>("[role=\"tab\"]"));

    for (const [index, tab] of tabs.entries()) {
        tab.addEventListener("click", () => selectTab(tabs, tab, false));

        tab.addEventListener("keydown", (event) => {
            const target = nextIndex(event.key, index, tabs.length);

            if (target !== undefined) {
                event.preventDefault();
                selectTab(tabs, tabs[target], true);
            }
        });
    }
}

for (const group of document.querySelectorAll<HTMLElement>("[data-tabs]")) {
    bindTabs(group);
}
