import "./widget.css";
import partnersManifest from "../generated/partners-manifest.js";
import { escapeHtml } from "../shared/html.js";
import { createInstanceId, findPendingWidgets, markWidgetInitialized, renderWidgetState } from "../shared/widgets.js";
import { resolveElementBaseUrl, resolveSourceUrl } from "../shared/urls.js";

function getElementBaseUrl(element) {
  return resolveElementBaseUrl(element, {
    dataAttribute: "partnersBase",
    scriptFileName: "partners-widget.js"
  });
}

function readJsonPayload(element) {
  const script = element.querySelector('script[type="application/json"][data-partners-data]');

  if (script instanceof HTMLScriptElement && script.textContent?.trim()) {
    return JSON.parse(script.textContent);
  }

  const inlineValue = element.dataset.partners;

  if (inlineValue) {
    return JSON.parse(inlineValue);
  }

  if (Array.isArray(window.PARTNERS_WIDGET_DATA)) {
    return window.PARTNERS_WIDGET_DATA;
  }

  if (window.PARTNERS_WIDGET_DATA && typeof window.PARTNERS_WIDGET_DATA === "object") {
    return window.PARTNERS_WIDGET_DATA;
  }

  return null;
}

function readManifestPayload(element) {
  const setKey = element.dataset.partnersSet;

  if (!setKey) {
    return null;
  }

  return partnersManifest[setKey] ?? null;
}

function normalizePartners(payload) {
  if (Array.isArray(payload)) {
    return {
      title: "All Our Partners",
      subtitle: "",
      cta: "Scopri di più",
      partners: payload
    };
  }

  if (payload && typeof payload === "object") {
    return {
      title: typeof payload.title === "string" && payload.title.trim().length > 0 ? payload.title.trim() : "All Our Partners",
      subtitle: typeof payload.subtitle === "string" && payload.subtitle.trim().length > 0 ? payload.subtitle.trim() : "",
      cta: typeof payload.cta === "string" && payload.cta.trim().length > 0 ? payload.cta.trim() : "Scopri di più",
      partners: Array.isArray(payload.partners) ? payload.partners : []
    };
  }

  return null;
}

function normalizePartner(partner, index, fallbackCta) {
  if (!partner || typeof partner !== "object") {
    return null;
  }

  const name = typeof partner.name === "string" ? partner.name.trim() : "";
  const url = typeof partner.url === "string" ? partner.url.trim() : "";
  const logo = typeof partner.logo === "string" ? partner.logo.trim() : "";

  if (!url || !logo) {
    return null;
  }

  return {
    name: name || `Partner ${index + 1}`,
    url,
    logo,
    alt: typeof partner.alt === "string" && partner.alt.trim().length > 0 ? partner.alt.trim() : (name || `Logo partner ${index + 1}`),
    cta: typeof partner.cta === "string" && partner.cta.trim().length > 0 ? partner.cta.trim() : fallbackCta,
    newTab: partner.newTab !== false
  };
}

function renderPartners(element, config, baseUrl) {
  const partners = config.partners
    .map((partner, index) => normalizePartner(partner, index, config.cta))
    .filter(Boolean);

  if (partners.length === 0) {
    renderWidgetState(element, "No partner data available.", "empty");
    return;
  }

  if (partners.length < 3) {
    renderWidgetState(element, "Partners widget requires at least 3 partners.", "error");
    return;
  }

  const widgetId = createInstanceId("pw");

  element.dataset.state = "ready";
  element.innerHTML = `
    <section class="pw-shell" aria-label="${escapeHtml(config.title)}">
      <header class="pw-header">
        <p class="pw-kicker">Partners</p>
        <h4 class="pw-title">${escapeHtml(config.title)}</h4>
        ${config.subtitle ? `<p class="pw-subtitle">${escapeHtml(config.subtitle)}</p>` : ""}
      </header>

      <div class="pw-grid" data-count="${partners.length}" data-widget-id="${widgetId}">
        ${partners.map((partner) => {
          const logoUrl = new URL(partner.logo, baseUrl).toString();
          const href = new URL(partner.url, baseUrl).toString();
          const target = partner.newTab ? ' target="_blank" rel="noopener noreferrer"' : "";

          return `
            <article class="pw-card">
              <a class="pw-card-link" href="${href}" aria-label="Apri il sito di ${escapeHtml(partner.name)}"${target}>
                <span class="pw-card-inner">
                  <span class="pw-face pw-front">
                    <img loading="lazy" decoding="async" src="${logoUrl}" alt="${escapeHtml(partner.alt)}">
                  </span>
                  <span class="pw-face pw-back">
                    <span class="pw-back-copy">
                      <span class="pw-back-label">${escapeHtml(partner.cta)}</span>
                      <span class="pw-back-name">${escapeHtml(partner.name)}</span>
                    </span>
                  </span>
                </span>
              </a>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

async function resolvePartnersPayload(element) {
  const manifestPayload = readManifestPayload(element);

  if (manifestPayload) {
    return manifestPayload;
  }

  const payload = readJsonPayload(element);

  if (payload) {
    return payload;
  }

  const source = element.dataset.partnersSrc;

  if (source) {
    const sourceUrl = resolveSourceUrl(element, source, {
      dataAttribute: "partnersBase",
      scriptFileName: "partners-widget.js"
    });
    let response;

    try {
      response = await fetch(sourceUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to fetch partners data from ${sourceUrl.toString()} (${message})`);
    }

    if (!response.ok) {
      throw new Error(`Unable to load partners data from ${sourceUrl.toString()} (${response.status})`);
    }

    return response.json();
  }

  return null;
}

export async function initPartnersWidgets(root = document) {
  const elements = findPendingWidgets(root, ".partners-widget", "pwInitialized");

  if (elements.length === 0) {
    return;
  }

  for (const element of elements) {
    try {
      markWidgetInitialized(element, "pwInitialized");

      const payload = await resolvePartnersPayload(element);
      const config = normalizePartners(payload);

      if (!config) {
        renderWidgetState(element, "Partners widget data missing or invalid.", "empty");
        continue;
      }

      renderPartners(element, config, getElementBaseUrl(element));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected partners widget error";
      renderWidgetState(element, `Partners widget error: ${message}`, "error");
    }
  }
}

if (typeof window !== "undefined") {
  window.PartnersWidget = {
    init: initPartnersWidgets
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initPartnersWidgets();
    }, { once: true });
  } else {
    initPartnersWidgets();
  }
}
