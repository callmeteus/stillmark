/**
 * Shows a sticky install bar on narrow viewports when the hero copy card scrolls away.
 */
const MOBILE_MAX_WIDTH = 1023;

function isMobileLayout(): boolean {
    return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
}

function initMobileInstallBar(): void {
    const bar = document.querySelector<HTMLElement>("[data-mobile-install-bar]");
    const heroAnchor = document.getElementById("hero-install");

    if (!bar || !heroAnchor) {
        return;
    }

    const setBarVisible = (visible: boolean): void => {
        if (visible) {
            bar.removeAttribute("hidden");
            document.body.classList.add("has-mobile-install-bar");
        } else {
            bar.setAttribute("hidden", "");
            document.body.classList.remove("has-mobile-install-bar");
        }
    };

    const update = (heroVisible: boolean): void => {
        if (!isMobileLayout()) {
            setBarVisible(false);

            return;
        }

        setBarVisible(!heroVisible);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];

            if (!entry) {
                return;
            }

            update(entry.isIntersecting);
        },
        { root: null, threshold: 0.15 }
    );

    observer.observe(heroAnchor);

    window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).addEventListener("change", () => {
        const rect = heroAnchor.getBoundingClientRect();
        const heroVisible = rect.top < window.innerHeight && rect.bottom > 0;

        update(heroVisible);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileInstallBar);
} else {
    initMobileInstallBar();
}
