import fs from "node:fs";
import path from "node:path";

const INPUT_FILE = path.resolve("schedule/program.csv");
const OUTPUT_FILE = path.resolve("src/generated/schedule-manifest.js");

const REQUIRED_HEADERS = [
  "Day",
  "StartTime",
  "EndTime",
  "Title",
  "Description",
  "Location",
  "Color"
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function parseCsvLine(line, delimiter) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (!inQuotes && character === delimiter) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
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

function normalizeDelimiter(text) {
  const firstRow = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const semicolons = (firstRow.match(/;/g) ?? []).length;
  const commas = (firstRow.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

function parseScheduleCsv(fileContent) {
  const delimiter = normalizeDelimiter(fileContent);
  const rows = fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rows.length === 0) {
    return [];
  }

  const headers = parseCsvLine(rows[0], delimiter);
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

  if (missing.length > 0) {
    throw new Error(`CSV headers missing: ${missing.join(", ")}`);
  }

  const dataRows = rows.slice(1);

  return dataRows
    .map((row, rowIndex) => {
      const cells = parseCsvLine(row, delimiter);
      const data = {};

      headers.forEach((header, columnIndex) => {
        data[header] = cells[columnIndex] ?? "";
      });

      if (!data.Day || !data.StartTime || !data.EndTime || !data.Title) {
        return null;
      }

      return {
        id: `${data.Day}-${data.StartTime}-${rowIndex + 1}`,
        day: data.Day,
        startTime: data.StartTime,
        endTime: data.EndTime,
        title: data.Title,
        description: data.Description,
        location: data.Location,
        color: data.Color
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const dayCompare = left.day.localeCompare(right.day);

      if (dayCompare !== 0) {
        return dayCompare;
      }

      return parseTimeToMinutes(left.startTime) - parseTimeToMinutes(right.startTime);
    });
}

function buildScheduleManifest(events) {
  const days = [...new Set(events.map((event) => event.day))].sort();
  const grouped = {};

  for (const day of days) {
    grouped[day] = events.filter((event) => event.day === day);
  }

  return {
    program: {
      label: "Programma settimanale",
      days,
      eventsByDay: grouped
    }
  };
}

function writeManifestModule(manifest) {
  const output = `const scheduleManifest = ${JSON.stringify(manifest, null, 2)};\n\nexport default scheduleManifest;\n`;
  ensureDir(path.dirname(OUTPUT_FILE));
  fs.writeFileSync(OUTPUT_FILE, output);
}

function build() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Missing schedule CSV file: ${INPUT_FILE}`);
  }

  const csvContent = fs.readFileSync(INPUT_FILE, "utf8");
  const events = parseScheduleCsv(csvContent);
  const manifest = buildScheduleManifest(events);
  writeManifestModule(manifest);

  console.log(`Built schedule with ${events.length} events into ${OUTPUT_FILE}`);
}

try {
  build();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
