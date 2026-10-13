/**
 * Before/after sliders: the range input sets `--pos`, which places the handle and clips the "after" layer.
 */
for (const root of document.querySelectorAll<HTMLElement>("[data-compare]")) {
    const range = root.querySelector<HTMLInputElement>(".compare-range");

    range?.addEventListener("input", () => {
        root.style.setProperty("--pos", `${range.value}%`);
    });
}
