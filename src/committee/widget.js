import "./widget.css";
import committeeManifest from "../generated/committee-manifest.js";
import { escapeHtml } from "../shared/html.js";
import { findPendingWidgets, markWidgetInitialized, renderWidgetState } from "../shared/widgets.js";

function renderCommittee(element, key, data) {
  const members = Array.isArray(data.members) ? data.members : [];

  if (members.length === 0) {
    renderWidgetState(element, `Committee "${key}" is empty or missing.`, "empty");
    return;
  }

  const title = data.title || key;

  element.dataset.state = "ready";
  element.innerHTML = `
    <section class="cmt-shell" aria-label="${escapeHtml(title)}">
      <header class="cmt-header">
        <p class="cmt-kicker">Summer School</p>
        <h4 class="cmt-title">${escapeHtml(title)}</h4>
      </header>

      <div class="cmt-table-wrap">
        <table class="cmt-table">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Ente / Universit&agrave;</th>
            </tr>
          </thead>
          <tbody>
            ${members.map((member) => `
              <tr>
                <td data-label="Nome">${escapeHtml(member.name)}</td>
                <td data-label="Ente / Universit&agrave;">${escapeHtml(member.institution)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function initCommitteeWidgets(root = document) {
  const widgets = findPendingWidgets(root, ".committee-widget", "cmtInitialized");

  if (widgets.length === 0) {
    return;
  }

  for (const element of widgets) {
    const key = element.dataset.committeeSet || "scientific-committee";
    const data = committeeManifest[key];
    markWidgetInitialized(element, "cmtInitialized");

    if (!data || !Array.isArray(data.members) || data.members.length === 0) {
      renderWidgetState(element, `Committee "${key}" is empty or missing.`, "empty");
      continue;
    }

    renderCommittee(element, key, data);
  }
}

if (typeof window !== "undefined") {
  window.CommitteeWidget = {
    init: initCommitteeWidgets
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initCommitteeWidgets();
    }, { once: true });
  } else {
    initCommitteeWidgets();
  }
}
