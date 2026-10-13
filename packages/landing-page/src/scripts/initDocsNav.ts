/**
 * Opens and closes the docs sidebar on narrow screens, where it collapses behind a toggle.
 */
for (const nav of document.querySelectorAll<HTMLElement>("[data-docs-nav]")) {
    const toggle = nav.querySelector<HTMLButtonElement>("[data-docs-nav-toggle]");

    toggle?.addEventListener("click", () => {
        const open = !nav.classList.contains("is-open");

        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
    });
}
