import "./widget.css";
import staffManifest from "../generated/staff-manifest.js";
import { escapeHtml } from "../shared/html.js";
import { createInstanceId, findPendingWidgets, markWidgetInitialized, renderWidgetState } from "../shared/widgets.js";
import { resolveElementBaseUrl, resolveSourceUrl } from "../shared/urls.js";

function getElementBaseUrl(element) {
  return resolveElementBaseUrl(element, {
    dataAttribute: "staffBase",
    scriptFileName: "staff-widget.js"
  });
}

function readJsonPayload(element) {
  const script = element.querySelector('script[type="application/json"][data-staff-data]');

  if (script instanceof HTMLScriptElement && script.textContent?.trim()) {
    return JSON.parse(script.textContent);
  }

  const inlineValue = element.dataset.staff;

  if (inlineValue) {
    return JSON.parse(inlineValue);
  }

  if (Array.isArray(window.STAFF_WIDGET_DATA)) {
    return window.STAFF_WIDGET_DATA;
  }

  if (window.STAFF_WIDGET_DATA && typeof window.STAFF_WIDGET_DATA === "object") {
    return window.STAFF_WIDGET_DATA;
  }

  return null;
}

function readManifestPayload(element) {
  const setKey = element.dataset.staffSet;

  if (!setKey) {
    return null;
  }

  return staffManifest[setKey] ?? null;
}

function normalizeStaff(payload) {
  if (Array.isArray(payload)) {
    return {
      title: "Comitato Organizzatore",
      subtitle: "",
      members: payload
    };
  }

  if (payload && typeof payload === "object") {
    return {
      title: typeof payload.title === "string" && payload.title.trim().length > 0 ? payload.title.trim() : "Comitato Organizzatore",
      subtitle: typeof payload.subtitle === "string" && payload.subtitle.trim().length > 0 ? payload.subtitle.trim() : "",
      members: Array.isArray(payload.members) ? payload.members : []
    };
  }

  return null;
}

function normalizeMember(member) {
  if (!member || typeof member !== "object") {
    return null;
  }

  const name = typeof member.name === "string" ? member.name.trim() : "";
  const photo = typeof member.photo === "string" ? member.photo.trim() : "";

  if (!name || !photo) {
    return null;
  }

  return {
    name,
    role: typeof member.role === "string" ? member.role.trim() : "",
    photo,
    alt: typeof member.alt === "string" && member.alt.trim().length > 0 ? member.alt.trim() : name
  };
}

function renderStaff(element, config, baseUrl) {
  const members = config.members
    .map((member) => normalizeMember(member))
    .filter(Boolean);

  if (members.length === 0) {
    renderWidgetState(element, "No staff data available.", "empty");
    return;
  }

  const widgetId = createInstanceId("stf");

  element.dataset.state = "ready";
  element.innerHTML = `
    <section class="stf-shell" aria-label="${escapeHtml(config.title)}">
      <header class="stf-header">
        <p class="stf-kicker">Staff</p>
        <h4 class="stf-title">${escapeHtml(config.title)}</h4>
        ${config.subtitle ? `<p class="stf-subtitle">${escapeHtml(config.subtitle)}</p>` : ""}
      </header>

      <div class="stf-grid" data-count="${members.length}" data-widget-id="${widgetId}">
        ${members.map((member) => {
          const photoUrl = new URL(member.photo, baseUrl).toString();

          return `
            <article class="stf-card">
              <span class="stf-photo">
                <img loading="lazy" decoding="async" src="${photoUrl}" alt="${escapeHtml(member.alt)}">
              </span>
              <div class="stf-info">
                <p class="stf-name">${escapeHtml(member.name)}</p>
                ${member.role ? `<p class="stf-role">${escapeHtml(member.role)}</p>` : ""}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

async function resolveStaffPayload(element) {
  const manifestPayload = readManifestPayload(element);

  if (manifestPayload) {
    return manifestPayload;
  }

  const payload = readJsonPayload(element);

  if (payload) {
    return payload;
  }

  const source = element.dataset.staffSrc;

  if (source) {
    const sourceUrl = resolveSourceUrl(element, source, {
      dataAttribute: "staffBase",
      scriptFileName: "staff-widget.js"
    });
    let response;

    try {
      response = await fetch(sourceUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to fetch staff data from ${sourceUrl.toString()} (${message})`);
    }

    if (!response.ok) {
      throw new Error(`Unable to load staff data from ${sourceUrl.toString()} (${response.status})`);
    }

    return response.json();
  }

  return null;
}

export async function initStaffWidgets(root = document) {
  const elements = findPendingWidgets(root, ".staff-widget", "stfInitialized");

  if (elements.length === 0) {
    return;
  }

  for (const element of elements) {
    try {
      markWidgetInitialized(element, "stfInitialized");

      const payload = await resolveStaffPayload(element);
      const config = normalizeStaff(payload);

      if (!config) {
        renderWidgetState(element, "Staff widget data missing or invalid.", "empty");
        continue;
      }

      renderStaff(element, config, getElementBaseUrl(element));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected staff widget error";
      renderWidgetState(element, `Staff widget error: ${message}`, "error");
    }
  }
}

if (typeof window !== "undefined") {
  window.StaffWidget = {
    init: initStaffWidgets
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initStaffWidgets();
    }, { once: true });
  } else {
    initStaffWidgets();
  }
}
