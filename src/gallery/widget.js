import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";
import "./widget.css";
import galleriesManifest from "../generated/galleries-manifest.js";
import { escapeHtml } from "../shared/html.js";
import { createInstanceId, findPendingWidgets, markWidgetInitialized, renderWidgetState } from "../shared/widgets.js";
import { resolveElementBaseUrl } from "../shared/urls.js";

function getElementBaseUrl(element) {
  return resolveElementBaseUrl(element, {
    dataAttribute: "galleryBase",
    globalProperty: "GALLERY_WIDGET_BASE_URL",
    scriptFileName: "gallery-widget.js"
  });
}

function setupCarousel(root) {
  const viewport = root.querySelector(".gw-carousel-viewport");
  const previousButton = root.querySelector('[data-gw-action="previous"]');
  const nextButton = root.querySelector('[data-gw-action="next"]');

  if (!(viewport instanceof HTMLElement)) {
    return;
  }

  const getStep = () => {
    const firstCard = viewport.querySelector(".gw-slide");

    if (!(firstCard instanceof HTMLElement)) {
      return viewport.clientWidth * 0.8;
    }

    const gap = Number.parseFloat(window.getComputedStyle(viewport).columnGap || window.getComputedStyle(viewport).gap || "0");
    return firstCard.getBoundingClientRect().width + gap;
  };

  const scrollByStep = (direction) => {
    viewport.scrollBy(getStep() * direction, 0);
  };

  previousButton?.addEventListener("click", () => {
    scrollByStep(-1);
  });

  nextButton?.addEventListener("click", () => {
    scrollByStep(1);
  });
}

const GW_INHERITED_VARS = [
  "--gw-gap",
  "--gw-radius",
  "--gw-shadow",
  "--gw-border",
  "--gw-surface",
  "--gw-surface-strong",
  "--gw-ink",
  "--gw-muted",
  "--gw-accent",
  "--gw-accent-strong"
];

function detachModalFromHost(root, modal) {
  // Host pages can wrap the widget in an ancestor with `transform`,
  // `filter`, `contain`, etc. That ancestor becomes the containing block
  // for our `position: fixed` modal, so it renders clipped/behind other
  // page content instead of covering the viewport. Moving the modal to
  // `document.body` escapes that ancestor's stacking/containing context.
  const hostStyles = window.getComputedStyle(root);

  GW_INHERITED_VARS.forEach((name) => {
    modal.style.setProperty(name, hostStyles.getPropertyValue(name));
  });

  document.body.appendChild(modal);
}

function setupModal(root) {
  const modal = root.querySelector(".gw-modal");
  const openButtons = root.querySelectorAll('[data-gw-action="open-modal"]');
  const closeButtons = root.querySelectorAll('[data-gw-action="close-modal"]');

  if (!(modal instanceof HTMLElement)) {
    return;
  }

  detachModalFromHost(root, modal);

  const openModal = () => {
    modal.hidden = false;
    document.body.classList.add("gw-modal-open");
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("gw-modal-open");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", openModal);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

function renderGallery(element, galleryName, items, baseUrl) {
  const instanceId = createInstanceId("gw");
  const slidesHtml = items.map((item, index) => {
    const fullUrl = new URL(item.src, baseUrl).toString();
    const thumbUrl = new URL(item.thumbnail, baseUrl).toString();
    const alt = escapeHtml(item.alt || `${galleryName} ${index + 1}`);

    return `
      <button class="gw-slide" type="button" data-gw-action="open-modal" aria-label="Apri galleria ${escapeHtml(galleryName)}, immagine ${index + 1} di ${items.length}">
        <img loading="lazy" decoding="async" src="${thumbUrl}" alt="${alt}">
      </button>
    `;
  }).join("");

  const gridHtml = items.map((item, index) => {
    const fullUrl = new URL(item.src, baseUrl).toString();
    const thumbUrl = new URL(item.thumbnail, baseUrl).toString();
    const alt = escapeHtml(item.alt || `${galleryName} ${index + 1}`);

    return `
      <a class="gw-grid-card ${instanceId}" href="${fullUrl}" aria-label="Apri immagine ${index + 1} di ${items.length}" data-gallery="${instanceId}">
        <img loading="lazy" decoding="async" src="${thumbUrl}" alt="${alt}">
      </a>
    `;
  }).join("");

  element.dataset.state = "ready";
  element.innerHTML = `
    <section class="gw-shell" aria-label="Galleria ${escapeHtml(galleryName)}">
      <div class="gw-carousel-header">
        <button class="gw-open-grid" type="button" data-gw-action="open-modal">GRID VIEW</button>
      </div>

      <div class="gw-carousel">
        <button class="gw-nav" type="button" data-gw-action="previous" aria-label="Scorri indietro">&#8249;</button>
        <div class="gw-carousel-viewport" tabindex="0" aria-label="Carosello immagini ${escapeHtml(galleryName)}">
          ${slidesHtml}
        </div>
        <button class="gw-nav" type="button" data-gw-action="next" aria-label="Scorri avanti">&#8250;</button>
      </div>

      <div class="gw-modal" hidden>
        <div class="gw-modal-dialog" role="dialog" aria-modal="true" aria-label="Griglia completa ${escapeHtml(galleryName)}">
          <div class="gw-modal-header">
            <button class="gw-close" type="button" data-gw-action="close-modal" aria-label="Chiudi popup">&times;</button>
          </div>
          <div class="gw-popup-grid">
            ${gridHtml}
          </div>
        </div>
      </div>
    </section>
  `;

  setupCarousel(element);
  setupModal(element);

  GLightbox({
    selector: `.${instanceId}`,
    loop: true,
    touchNavigation: true
  });
}

export async function initGalleryWidgets(root = document) {
  const elements = findPendingWidgets(root, ".gallery-widget", "gwInitialized");

  if (elements.length === 0) {
    return;
  }

  try {
    const manifest = galleriesManifest;

    for (const element of elements) {
      const galleryName = element.dataset.gallery;
      const items = manifest[galleryName];

      markWidgetInitialized(element, "gwInitialized");

      if (!galleryName || !Array.isArray(items) || items.length === 0) {
        renderWidgetState(element, `Gallery \"${galleryName || "unknown"}\" is empty or missing.`, "empty");
        continue;
      }

      renderGallery(element, galleryName, items, getElementBaseUrl(element));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected gallery error";

    for (const element of elements) {
      markWidgetInitialized(element, "gwInitialized");
      renderWidgetState(element, `Gallery widget error: ${message}`, "error");
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
