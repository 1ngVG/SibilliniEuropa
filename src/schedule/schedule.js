import "./schedule.css";
import scheduleManifest from "../generated/schedule-manifest.js";

const DAY_START = 8 * 60;
const DAY_END = 24 * 60;
const HOUR_HEIGHT = 66;
const SLOT_MINUTES = 60;

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
    return Number.POSITIVE_INFINITY;
  }

  return (hours * 60) + minutes;
}

function formatDayName(dayValue) {
  const parsed = new Date(`${dayValue}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return dayValue;
  }

  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long"
  }).format(parsed);
}

function formatDayNumber(dayValue) {
  const parsed = new Date(`${dayValue}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return dayValue;
  }

  return String(parsed.getDate());
}

function buildWeekDays(scheduleData) {
  const sourceDays = [
    ...(Array.isArray(scheduleData.week) ? scheduleData.week : []),
    ...(Array.isArray(scheduleData.days) ? scheduleData.days : []),
    ...Object.keys(scheduleData.eventsByDay ?? {})
  ].filter(Boolean);

  const uniqueDays = [...new Set(sourceDays)].sort();
  return uniqueDays;
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

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    return null;
  }

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  if (endMinutes <= DAY_START || startMinutes >= DAY_END) {
    return null;
  }

  const clippedStart = Math.max(startMinutes, DAY_START);
  const clippedEnd = Math.min(endMinutes, DAY_END);
  const top = ((clippedStart - DAY_START) / SLOT_MINUTES) * HOUR_HEIGHT;
  const height = Math.max(30, ((clippedEnd - clippedStart) / SLOT_MINUTES) * HOUR_HEIGHT - 4);
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

  if (!style) {
    return "";
  }

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

function renderHourLabels() {
  const ticks = [];

  for (let minutes = DAY_START; minutes <= DAY_END; minutes += SLOT_MINUTES) {
    const top = ((minutes - DAY_START) / SLOT_MINUTES) * HOUR_HEIGHT;
    ticks.push(`<span class="sw-hour-label" style="inset-block-start:${top}px;">${formatHourLabel(minutes)}</span>`);
  }

  return ticks.join("");
}

function renderDayColumn(events, trackHeight) {
  const cardsHtml = events.map((event) => renderEventCard(event)).join("");

  return `
    <section class="sw-day-track" style="--sw-track-height:${trackHeight}px;">
      ${cardsHtml}
    </section>
  `;
}

function renderSchedule(element, scheduleKey, scheduleData) {
  const days = buildWeekDays(scheduleData);

  if (days.length === 0) {
    renderState(element, `Schedule "${scheduleKey}" has no days.`, "empty");
    return;
  }

  const trackHeight = ((DAY_END - DAY_START) / SLOT_MINUTES) * HOUR_HEIGHT;
  const dayLabelsHtml = days.map((day) => {
    return `
      <header class="sw-day-header" aria-label="${escapeHtml(formatDayName(day))}">
        <span class="sw-day-number">${escapeHtml(formatDayNumber(day))}</span>
        <span class="sw-day-name">${escapeHtml(formatDayName(day))}</span>
      </header>
    `;
  }).join("");

  const columnsHtml = days.map((day) => {
    const events = [...(scheduleData.eventsByDay?.[day] ?? [])].sort((left, right) => {
      return parseTimeToMinutes(left.startTime) - parseTimeToMinutes(right.startTime);
    });

    return renderDayColumn(events, trackHeight);
  }).join("");

  element.dataset.state = "ready";
  element.innerHTML = `
    <section class="sw-shell" aria-label="${escapeHtml(scheduleData.label || scheduleKey)}">
      <div class="sw-calendar" style="--sw-day-count:${days.length};--sw-track-height:${trackHeight}px;--sw-hour-height:${HOUR_HEIGHT}px;">
        <div class="sw-time-header" aria-hidden="true"></div>
        ${dayLabelsHtml}
        <aside class="sw-time-rail" aria-hidden="true">
          ${renderHourLabels()}
        </aside>
        ${columnsHtml}
      </div>
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
