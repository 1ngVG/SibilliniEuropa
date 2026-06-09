import "./schedule.css";
import scheduleManifest from "../generated/schedule-manifest.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDayLabel(dayValue) {
  const parsed = new Date(`${dayValue}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return dayValue;
  }

  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(parsed);
}

function renderEventCard(event) {
  const color = event.color || "#458657";
  const descriptionHtml = event.description ? `<p class="sw-desc">${escapeHtml(event.description)}</p>` : "";
  const locationHtml = event.location ? `<p class="sw-location">${escapeHtml(event.location)}</p>` : "";

  return `
    <article class="sw-card" style="--sw-accent:${escapeHtml(color)};">
      <p class="sw-time">${escapeHtml(event.startTime)} - ${escapeHtml(event.endTime)}</p>
      <h3 class="sw-title">${escapeHtml(event.title)}</h3>
      ${descriptionHtml}
      ${locationHtml}
    </article>
  `;
}

function renderSchedule(element, scheduleKey, scheduleData) {
  const days = scheduleData.days || [];

  const columnsHtml = days.map((day) => {
    const events = scheduleData.eventsByDay?.[day] ?? [];
    const cardsHtml = events.length > 0
      ? events.map((event) => renderEventCard(event)).join("")
      : '<p class="sw-empty">No activities</p>';

    return `
      <section class="sw-day" aria-label="${escapeHtml(formatDayLabel(day))}">
        <h2 class="sw-day-title">${escapeHtml(formatDayLabel(day))}</h2>
        <div class="sw-events">${cardsHtml}</div>
      </section>
    `;
  }).join("");

  element.dataset.state = "ready";
  element.innerHTML = `
    <section class="sw-shell" aria-label="${escapeHtml(scheduleData.label || scheduleKey)}">
      <div class="sw-columns">${columnsHtml}</div>
    </section>
  `;
}

function renderState(element, message, state) {
  element.dataset.state = state;
  element.textContent = message;
}

export function initScheduleWidgets(root = document) {
  const widgets = [...root.querySelectorAll(".schedule-widget")].filter((element) => element.dataset.swInitialized !== "true");

  if (widgets.length === 0) {
    return;
  }

  for (const element of widgets) {
    const key = element.dataset.schedule || "program";
    const scheduleData = scheduleManifest[key];
    element.dataset.swInitialized = "true";

    if (!scheduleData || !Array.isArray(scheduleData.days) || scheduleData.days.length === 0) {
      renderState(element, `Schedule "${key}" is empty or missing.`, "empty");
      continue;
    }

    renderSchedule(element, key, scheduleData);
  }
}

if (typeof window !== "undefined") {
  window.ScheduleWidget = {
    init: initScheduleWidgets
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initScheduleWidgets();
    }, { once: true });
  } else {
    initScheduleWidgets();
  }
}
