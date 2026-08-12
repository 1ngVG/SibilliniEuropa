import "./widget.css";

let instanceCounter = 0;
const scriptBaseUrl = detectScriptBaseUrl();

function detectScriptBaseUrl() {
  if (typeof document === "undefined") {
    return undefined;
  }

  const currentScript = document.currentScript;

  if (currentScript instanceof HTMLScriptElement && currentScript.src) {
    return new URL(".", currentScript.src);
  }

  const widgetScript = [...document.querySelectorAll("script[src]")].find((script) => {
    return script.src.includes("partners-widget.js");
  });

  if (widgetScript instanceof HTMLScriptElement && widgetScript.src) {
    return new URL(".", widgetScript.src);
  }

  return undefined;
}

function getGlobalBaseUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (!window.PARTNERS_WIDGET_BASE_URL) {
    return undefined;
  }

  return new URL(window.PARTNERS_WIDGET_BASE_URL, window.location.href);
}

function getElementBaseUrl(element) {
  const localBase = element.dataset.partnersBase;

  if (localBase) {
    return new URL(localBase, window.location.href);
  }

  return getGlobalBaseUrl() ?? scriptBaseUrl ?? new URL(window.location.href);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmptyState(element, message, state) {
  element.dataset.state = state;
  element.textContent = message;
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
    renderEmptyState(element, "No partner data available.", "empty");
    return;
  }

  if (partners.length < 3) {
    renderEmptyState(element, "Partners widget requires at least 3 partners.", "error");
    return;
  }

  const widgetId = `pw-${instanceCounter += 1}`;

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
  const payload = readJsonPayload(element);

  if (payload) {
    return payload;
  }

  const source = element.dataset.partnersSrc;

  if (source) {
    const response = await fetch(new URL(source, getElementBaseUrl(element)));

    if (!response.ok) {
      throw new Error(`Unable to load partners data (${response.status})`);
    }

    return response.json();
  }

  return null;
}

export async function initPartnersWidgets(root = document) {
  const elements = [...root.querySelectorAll(".partners-widget")].filter((element) => element.dataset.pwInitialized !== "true");

  if (elements.length === 0) {
    return;
  }

  try {
    for (const element of elements) {
      element.dataset.pwInitialized = "true";

      const payload = await resolvePartnersPayload(element);
      const config = normalizePartners(payload);

      if (!config) {
        renderEmptyState(element, "Partners widget data missing or invalid.", "empty");
        continue;
      }

      renderPartners(element, config, getElementBaseUrl(element));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected partners widget error";

    for (const element of elements) {
      element.dataset.pwInitialized = "true";
      renderEmptyState(element, `Partners widget error: ${message}`, "error");
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
