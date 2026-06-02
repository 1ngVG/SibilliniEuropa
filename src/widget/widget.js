import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";
import "./widget.css";
import galleriesManifest from "../generated/galleries-manifest.js";

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
    return script.src.includes("gallery-widget.js");
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

  if (!window.GALLERY_WIDGET_BASE_URL) {
    return undefined;
  }

  return new URL(window.GALLERY_WIDGET_BASE_URL, window.location.href);
}

function getElementBaseUrl(element) {
  const localBase = element.dataset.galleryBase;

  if (localBase) {
    return new URL(localBase, window.location.href);
  }

  return getGlobalBaseUrl() ?? scriptBaseUrl ?? new URL(window.location.href);
}

function renderEmptyState(element, message, state) {
  element.dataset.state = state;
  element.textContent = message;
}

function renderGallery(element, galleryName, items, baseUrl) {
  const instanceId = `gw-${instanceCounter += 1}`;
  const html = items.map((item, index) => {
    const fullUrl = new URL(item.src, baseUrl).toString();
    const thumbUrl = new URL(item.thumbnail, baseUrl).toString();
    const alt = item.alt || `${galleryName} ${index + 1}`;

    return `
      <a class="gw-card ${instanceId}" href="${fullUrl}" aria-label="Apri immagine ${index + 1} di ${items.length}" data-gallery="${instanceId}">
        <img loading="lazy" decoding="async" src="${thumbUrl}" alt="${alt}">
      </a>
    `;
  }).join("");

  element.dataset.state = "ready";
  element.innerHTML = `<div class="gw-grid">${html}</div>`;

  GLightbox({
    selector: `.${instanceId}`,
    loop: true,
    touchNavigation: true
  });
}

export async function initGalleryWidgets(root = document) {
  const elements = [...root.querySelectorAll(".gallery-widget")].filter((element) => element.dataset.gwInitialized !== "true");

  if (elements.length === 0) {
    return;
  }

  try {
    const manifest = galleriesManifest;

    for (const element of elements) {
      const galleryName = element.dataset.gallery;
      const items = manifest[galleryName];

      element.dataset.gwInitialized = "true";

      if (!galleryName || !Array.isArray(items) || items.length === 0) {
        renderEmptyState(element, `Gallery \"${galleryName || "unknown"}\" is empty or missing.`, "empty");
        continue;
      }

      renderGallery(element, galleryName, items, getElementBaseUrl(element));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected gallery error";

    for (const element of elements) {
      element.dataset.gwInitialized = "true";
      renderEmptyState(element, `Gallery widget error: ${message}`, "error");
    }
  }
}

if (typeof window !== "undefined") {
  window.GalleryWidget = {
    init: initGalleryWidgets
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initGalleryWidgets();
    }, { once: true });
  } else {
    initGalleryWidgets();
  }
}
