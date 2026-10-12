/**
 * Hero revision demo: plain-language requests land as clouded, numbered revisions
 * on the example sheets while the revision table fills in.
 */
const SVG_NS = "http://www.w3.org/2000/svg";
const FIRST_DELAY_MS = 900;
const REVEAL_DELAY_MS = 700;
const STEP_MS = 3400;
const HOLD_MS = 4600;
const CLOUD_PAD_X = 10;
const CLOUD_PAD_Y = 6;
const SCALLOP_PX = 16;

/**
 * Builds a revision-cloud outline: scalloped arcs bulging outward around a rectangle.
 */
function cloudPath(width: number, height: number): string {
    const margin = 5;
    const corners: [number, number][] = [
        [margin, margin],
        [width - margin, margin],
        [width - margin, height - margin],
        [margin, height - margin]
    ];

    let d = `M${corners[0][0]} ${corners[0][1]}`;

    for (let index = 0; index < corners.length; index++) {
        const [fromX, fromY] = corners[index];
        const [toX, toY] = corners[(index + 1) % corners.length];
        const length = Math.hypot(toX - fromX, toY - fromY);
        const count = Math.max(1, Math.round(length / SCALLOP_PX));
        const radius = (length / count) * 0.62;

        for (let step = 1; step <= count; step++) {
            const x = fromX + ((toX - fromX) * step) / count;
            const y = fromY + ((toY - fromY) * step) / count;

            d += ` A${radius.toFixed(2)} ${radius.toFixed(2)} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
    }

    return `${d} Z`;
}

function drawCloud(line: HTMLElement): void {
    let svg = line.querySelector<SVGSVGElement>(":scope > .rev-cloud");

    if (!svg) {
        svg = document.createElementNS(SVG_NS, "svg");
        svg.classList.add("rev-cloud");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");

        const path = document.createElementNS(SVG_NS, "path");

        path.setAttribute("pathLength", "1");
        svg.appendChild(path);
        line.appendChild(svg);
    }

    const width = line.offsetWidth + CLOUD_PAD_X * 2;
    const height = line.offsetHeight + CLOUD_PAD_Y * 2;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.querySelector("path")?.setAttribute("d", cloudPath(width, height));
}

function initRevisionDemo(root: HTMLElement): void {
    const lines = [...root.querySelectorAll<HTMLElement>("[data-rev-line]")].sort(
        (a, b) => Number(a.dataset.revLine) - Number(b.dataset.revLine)
    );
    const rows = [...root.querySelectorAll<HTMLElement>("[data-rev-row]")];
    const requests = [...root.querySelectorAll<HTMLElement>("[data-demo-step]")];
    const total = lines.length;

    if (total === 0) {
        return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.dataset.demoReady = "true";
    lines.forEach(drawCloud);

    const setRequest = (index: number): void => {
        requests.forEach((request, requestIndex) => {
            request.classList.toggle("is-active", requestIndex === index);
        });
    };

    const setApplied = (applied: number): void => {
        lines.forEach((line, index) => {
            line.classList.toggle("is-revised", index < applied);
            line.classList.toggle("is-current", index === applied - 1);
        });

        rows.forEach((row, index) => {
            row.classList.toggle("is-revised", index < applied);
            row.classList.toggle("is-current", index === applied - 1);
        });
    };

    if (reduceMotion) {
        setRequest(total - 1);
        setApplied(total);

        return;
    }

    let applied = 0;
    let timer: number | undefined;
    let visible = false;

    const schedule = (fn: () => void, delay: number): void => {
        window.clearTimeout(timer);
        timer = window.setTimeout(fn, delay);
    };

    const tick = (): void => {
        if (!visible || document.hidden) {
            return;
        }

        if (applied >= total) {
            applied = 0;
            setApplied(0);
            setRequest(0);
            schedule(tick, FIRST_DELAY_MS + REVEAL_DELAY_MS);

            return;
        }

        setRequest(applied);
        schedule(() => {
            applied += 1;
            setApplied(applied);
            schedule(tick, applied >= total ? HOLD_MS : STEP_MS);
        }, REVEAL_DELAY_MS);
    };

    const resume = (): void => {
        if (visible && !document.hidden) {
            schedule(tick, applied === 0 ? FIRST_DELAY_MS : STEP_MS / 2);
        } else {
            window.clearTimeout(timer);
        }
    };

    new IntersectionObserver(
        (entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            resume();
        },
        { threshold: 0.2 }
    ).observe(root);

    const rect = root.getBoundingClientRect();

    visible = rect.top < window.innerHeight && rect.bottom > 0;
    resume();

    document.addEventListener("visibilitychange", resume);
    const resizeObserver = new ResizeObserver(() => lines.forEach(drawCloud));

    lines.forEach((line) => resizeObserver.observe(line));
}

/**
 * Clouds that stay drawn on the detail sheets, showing revisions after they landed.
 */
function initStaticClouds(): void {
    const lines = [...document.querySelectorAll<HTMLElement>("[data-rev-static]")];

    if (lines.length === 0) {
        return;
    }

    lines.forEach(drawCloud);
    const resizeObserver = new ResizeObserver(() => lines.forEach(drawCloud));

    lines.forEach((line) => resizeObserver.observe(line));
}

function initAll(): void {
    for (const root of document.querySelectorAll<HTMLElement>("[data-revision-demo]")) {
        initRevisionDemo(root);
    }

    initStaticClouds();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
} else {
    initAll();
}
