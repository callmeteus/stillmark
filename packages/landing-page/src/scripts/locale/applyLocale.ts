import type { LocaleBundle } from "../../i18n/LocaleBundle";
import type { LocaleId } from "../../i18n/LocaleIds";
import type { Messages } from "../../i18n/en-US";
import { buildInstallPrompt } from "../../utils/BuildInstallPrompt";
import { escapeHtml } from "./EscapeHtml";
import { messageAtPath } from "./MessagePath";

/**
 * Maps a terminal command to the agent slash form.
 */
function toAgentCommand(cmd: string): string {
    if (cmd.startsWith("stillmark ")) {
        return `/${cmd}`;
    }

    return cmd;
}

function renderWorkflowSteps(messages: Messages): string {
    return messages.quickStart.steps
        .map((step, index) => {
            const link =
                step.linkHref && step.linkLabel
                    ? `<a class="workflow-step-link" href="${escapeHtml(step.linkHref)}">${escapeHtml(step.linkLabel)}</a>`
                    : "";

            return `<li class="workflow-step">
                <span class="workflow-step-index" aria-hidden="true">${index + 1}</span>
                <div class="workflow-step-body">
                    <p class="workflow-step-title">${escapeHtml(step.title)}</p>
                    <p class="muted workflow-step-text">${escapeHtml(step.body)}</p>
                    ${link}
                </div>
            </li>`;
        })
        .join("");
}

function renderHowItWorks(messages: Messages): string {
    const cards = messages.howItWorks.items
        .map(
            (item) => `<li>
                <article class="card how-it-works-card">
                    <div class="how-it-works-card-head">
                        <h3>${escapeHtml(item.title)}</h3>
                        <span class="how-it-works-badge">${escapeHtml(item.badge)}</span>
                    </div>
                    <p class="muted feature-body">${escapeHtml(item.body)}</p>
                </article>
            </li>`
        )
        .join("");

    return `<p class="muted section-lead how-it-works-lead">${escapeHtml(messages.howItWorks.lead)}</p>
    <ul class="how-it-works-grid">${cards}</ul>`;
}

function renderCompanion(messages: Messages, sectionKey: "coverage" | "design" | "planning" | "workspace"): string {
    const content = messages[sectionKey];
    const cards = content.points
        .map(
            (point) => `<article class="card companion-point-card">
                <h3>${escapeHtml(point.title)}</h3>
                <p class="muted feature-body">${escapeHtml(point.body)}</p>
            </article>`
        )
        .join("");

    return `<h2>${escapeHtml(content.title)}</h2>
    <p class="muted section-lead">${escapeHtml(content.lead)}</p>
    <div class="companion-points">${cards}</div>`;
}

function renderFeatures(messages: Messages): string {
    return messages.features.items
        .map(
            (item) => `<article class="card">
                <h3>${escapeHtml(item.title)}</h3>
                <p class="muted feature-body">${escapeHtml(item.body)}</p>
            </article>`
        )
        .join("");
}

function renderCommandRows(messages: Messages, mode: "agent" | "console"): string {
    const rows = messages.commands.rows
        .map(([cmd, desc]) => {
            const display = mode === "agent" ? toAgentCommand(cmd) : cmd;
            const consoleClass = mode === "console" ? "cmd-console" : "cmd-console";
            const agentClass = mode === "agent" ? "cmd-agent" : "cmd-agent";

            return `<tr>
                <th scope="row" class="command-cell break-code">
                    <span class="cmd-label ${consoleClass}">${escapeHtml(cmd)}</span>
                    <span class="cmd-label ${agentClass}">${escapeHtml(toAgentCommand(cmd))}</span>
                </th>
                <td class="muted command-desc">${escapeHtml(desc)}</td>
            </tr>`;
        })
        .join("");

    const agentOnly = messages.commands.agentOnlyRows
        .map(
            ([cmd, desc]) => `<tr class="command-reference-agent-only">
                <th scope="row" class="command-cell break-code">
                    <span class="cmd-label cmd-agent">${escapeHtml(cmd)}</span>
                </th>
                <td class="muted command-desc">${escapeHtml(desc)}</td>
            </tr>`
        )
        .join("");

    return rows + agentOnly;
}

function renderCommandCards(messages: Messages, mode: "agent" | "console"): string {
    const cliCards = messages.commands.rows
        .map(([cmd, desc]) => {
            return `<li class="command-reference-card">
                <p class="command-reference-card-cmd break-code">
                    <span class="cmd-label cmd-console">${escapeHtml(cmd)}</span>
                    <span class="cmd-label cmd-agent">${escapeHtml(toAgentCommand(cmd))}</span>
                </p>
                <p class="muted command-reference-card-desc">${escapeHtml(desc)}</p>
            </li>`;
        })
        .join("");

    const agentCards = messages.commands.agentOnlyRows
        .map(
            ([cmd, desc]) => `<li class="command-reference-card command-reference-agent-only">
                <p class="command-reference-card-cmd break-code">
                    <span class="cmd-label cmd-agent">${escapeHtml(cmd)}</span>
                </p>
                <p class="muted command-reference-card-desc">${escapeHtml(desc)}</p>
            </li>`
        )
        .join("");

    return cliCards + agentCards;
}

function updateCommandReference(messages: Messages): void {
    const root = document.querySelector<HTMLElement>("[data-command-reference]");

    if (!root) {
        return;
    }

    const mode = root.dataset.mode === "console" ? "console" : "agent";
    const tbody = root.querySelector("tbody");
    const cardList = root.querySelector(".command-reference-cards");

    if (tbody) {
        tbody.innerHTML = renderCommandRows(messages, mode);
    }

    if (cardList) {
        cardList.innerHTML = renderCommandCards(messages, mode);
    }

    const commandHeader = root.querySelector<HTMLElement>("[data-i18n='commands.tableCommand']");
    const descriptionHeader = root.querySelector<HTMLElement>("[data-i18n='commands.tableDescription']");

    if (commandHeader) {
        commandHeader.textContent = messages.commands.tableCommand;
    }

    if (descriptionHeader) {
        descriptionHeader.textContent = messages.commands.tableDescription;
    }
}

function updateHeroInstall(bundle: LocaleBundle, locale: LocaleId, messages: Messages): void {
    const root = document.querySelector<HTMLElement>("[data-hero-install-tabs]");

    if (!root) {
        return;
    }

    const mode = root.dataset.mode === "cli" ? "cli" : "agent";
    const heading = root.querySelector<HTMLElement>("[data-hero-install-heading]");

    if (heading) {
        heading.textContent = mode === "cli" ? messages.hero.installCliLabel : messages.hero.installLabel;
    }

    const agentCode = root.querySelector<HTMLElement>("[data-hero-agent-prompt]");

    if (agentCode) {
        agentCode.textContent = buildInstallPrompt(
            messages.hero.installPromptTemplate,
            bundle.installUrls[locale]
        );
    }

    const cliCode = root.querySelector<HTMLElement>("[data-hero-cli-command]");

    if (cliCode) {
        cliCode.textContent = messages.hero.cliInstallCommand;
    }
}

function updateMobileBar(bundle: LocaleBundle, locale: LocaleId, messages: Messages): void {
    const bar = document.querySelector<HTMLElement>("[data-mobile-install-bar]");

    if (!bar) {
        return;
    }

    const label = bar.querySelector<HTMLElement>("[data-i18n='hero.installLabel']");

    if (label) {
        label.textContent = messages.hero.installLabel;
    }

    const code = bar.querySelector<HTMLElement>("[data-mobile-install-command]");

    if (code) {
        code.textContent = buildInstallPrompt(
            messages.hero.installPromptTemplate,
            bundle.installUrls[locale]
        );
    }
}

function updateLangToggle(locale: LocaleId): void {
    const toggle = document.querySelector<HTMLButtonElement>("[data-locale-toggle]");

    if (!toggle) {
        return;
    }

    const next: LocaleId = locale === "en-US" ? "pt-BR" : "en-US";
    const nextLabel = next === "pt-BR" ? "PT" : "EN";

    toggle.textContent = nextLabel;
    toggle.setAttribute("lang", next);
    toggle.setAttribute(
        "aria-label",
        locale === "en-US" ? "Mudar idioma para português" : "Switch language to English"
    );
}

/**
 * Applies all landing copy for the given locale.
 */
export function applyLocale(bundle: LocaleBundle, locale: LocaleId): void {
    const messages = bundle.messages[locale];

    document.documentElement.lang = locale;
    document.title = messages.meta.title;

    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (metaDescription) {
        metaDescription.content = messages.meta.description;
    }

    for (const element of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
        const path = element.getAttribute("data-i18n");

        if (!path) {
            continue;
        }

        element.textContent = messageAtPath(messages, path);
    }

    for (const element of document.querySelectorAll<HTMLElement>("[data-i18n-aria-label]")) {
        const path = element.getAttribute("data-i18n-aria-label");

        if (!path) {
            continue;
        }

        element.setAttribute("aria-label", messageAtPath(messages, path));
    }

    const workflowMount = document.querySelector<HTMLElement>('[data-i18n-mount="workflow-steps"]');

    if (workflowMount) {
        workflowMount.innerHTML = renderWorkflowSteps(messages);
    }

    const howMount = document.querySelector<HTMLElement>('[data-i18n-mount="how-it-works"]');

    if (howMount) {
        howMount.innerHTML = renderHowItWorks(messages);
    }

    for (const key of ["coverage", "design", "planning", "workspace"] as const) {
        const section = document.querySelector<HTMLElement>(`[data-i18n-mount="companion-${key}"]`);

        if (section) {
            section.innerHTML = renderCompanion(messages, key);
        }
    }

    const featuresMount = document.querySelector<HTMLElement>('[data-i18n-mount="features"]');

    if (featuresMount) {
        featuresMount.innerHTML = renderFeatures(messages);
    }

    updateCommandReference(messages);
    updateHeroInstall(bundle, locale, messages);
    updateMobileBar(bundle, locale, messages);
    updateLangToggle(locale);
    updateCopyButtonLabels(messages);
}

function updateCopyButtonLabels(messages: Messages): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy-label]")) {
        button.setAttribute("data-copy-label", messages.copy.copyShort);
        button.setAttribute("data-copied-label", messages.copy.copied);
        button.setAttribute("data-failed-label", messages.copy.failed);
        button.setAttribute("data-ready-label", messages.copy.readyInTerminal);

        if (!button.classList.contains("is-copied")) {
            button.textContent = messages.copy.copyShort;
        }
    }
}
