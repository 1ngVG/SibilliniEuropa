import "./schedule.css";
import scheduleManifest from "../generated/schedule-manifest.js";

const WEEK_DAYS = [
  "2026-08-26",
  "2026-08-27",
  "2026-08-28",
  "2026-08-29",
  "2026-08-30"
];

const DAY_START = 8 * 60;
const DAY_END = 23 * 60;
const HOUR_HEIGHT = 72;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseTimeToMinutes(value) {
  const [hoursText, minutesText] = String(value).split(":");
  const hours = Number.parseInt(hoursText, 10);
  const minutes = Number.parseInt(minutesText, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return (hours * 60) + minutes;
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

function formatHourLabel(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:00`;
}

function normalizeColor(value) {
  const color = String(value || "").trim();
  return color || "#458657";
}

function readableTextColor(colorValue) {
  const color = normalizeColor(colorValue).replace("#", "");

  if (color.length !== 6) {
    return "#ffffff";
  }

  const red = Number.parseInt(color.slice(0, 2), 16);
  const green = Number.parseInt(color.slice(2, 4), 16);
  const blue = Number.parseInt(color.slice(4, 6), 16);
  const luminance = ((red * 299) + (green * 587) + (blue * 114)) / 1000;

  return luminance > 160 ? "#122033" : "#ffffff";
}

function getCardStyle(event) {
  const startMinutes = parseTimeToMinutes(event.startTime);
  let endMinutes = parseTimeToMinutes(event.endTime);

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const clippedStart = Math.max(startMinutes, DAY_START);
  const clippedEnd = Math.min(endMinutes, DAY_END);
  const top = ((clippedStart - DAY_START) / 60) * HOUR_HEIGHT;
  const height = Math.max(52, ((clippedEnd - clippedStart) / 60) * HOUR_HEIGHT - 6);
  const color = normalizeColor(event.color);

  return {
    top,
    height,
    color,
    textColor: readableTextColor(color)
  };
}

function renderEventCard(event) {
  const style = getCardStyle(event);
  const descriptionHtml = event.description ? `<p class="sw-desc">${escapeHtml(event.description)}</p>` : "";
  const locationHtml = event.location ? `<p class="sw-location">${escapeHtml(event.location)}</p>` : "";

  return `
    <article class="sw-card" style="--sw-card-color:${escapeHtml(style.color)};--sw-card-text:${style.textColor};inset-block-start:${style.top}px;block-size:${style.height}px;">
      <p class="sw-time">${escapeHtml(event.startTime)} - ${escapeHtml(event.endTime)}</p>
      <h3 class="sw-title">${escapeHtml(event.title)}</h3>
      ${descriptionHtml}
      ${locationHtml}
    </article>
  `;
}

function renderDayColumn(day, events) {
  const cardsHtml = events.map((event) => renderEventCard(event)).join("");
  const labelsHtml = Array.from({ length: ((DAY_END - DAY_START) / 60) + 1 }, (_, index) => {
    const minutes = DAY_START + (index * 60);
    return `<span class="sw-hour-label" style="inset-block-start:${index * HOUR_HEIGHT}px;">${formatHourLabel(minutes)}</span>`;
  }).join("");

  return `
    <section class="sw-day" aria-label="${escapeHtml(formatDayLabel(day))}">
      <h2 class="sw-day-title">${escapeHtml(formatDayLabel(day))}</h2>
      <div class="sw-track" style="--sw-track-height:${(DAY_END - DAY_START) / 60 * HOUR_HEIGHT}px;">
        <div class="sw-rail" aria-hidden="true">${labelsHtml}</div>
        ${cardsHtml}
      </div>
    </section>
  `;
}

function renderSchedule(element, scheduleKey, scheduleData) {
  const days = WEEK_DAYS;
  const dayLabelsHtml = days.map((day) => `<div class="sw-day-label">${escapeHtml(formatDayLabel(day))}</div>`).join("");
  const columnsHtml = days.map((day) => {
    const events = [...(scheduleData.eventsByDay?.[day] ?? [])].sort((left, right) => {
      return parseTimeToMinutes(left.startTime) - parseTimeToMinutes(right.startTime);
    });

    return renderDayColumn(day, events);
  }).join("");

  element.dataset.state = "ready";
  element.innerHTML = `
    <section class="sw-shell" aria-label="${escapeHtml(scheduleData.label || scheduleKey)}">
      <div class="sw-day-labels">${dayLabelsHtml}</div>
      <div class="sw-grid">${columnsHtml}</div>
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
