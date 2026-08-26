import fs from "node:fs";
import path from "node:path";

const INPUT_DIR = path.resolve("content/scientific_committee");
const MANIFEST_MODULE_PATH = path.resolve("src/generated/committee-manifest.js");

const REQUIRED_HEADERS = ["Academic Title & Name", "Site"];

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

function normalizeDelimiter(text) {
  const firstRow = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const semicolons = (firstRow.match(/;/g) ?? []).length;
  const commas = (firstRow.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

function parseCommitteeCsv(fileContent) {
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

  const nameIndex = headers.indexOf("Academic Title & Name");
  const siteIndex = headers.indexOf("Site");
  const dataRows = rows.slice(1);

  return dataRows
    .map((row) => {
      const cells = parseCsvLine(row, delimiter);
      const name = (cells[nameIndex] ?? "").trim();
      const institution = (cells[siteIndex] ?? "").trim();

      if (!name) {
        return null;
      }

      return { name, institution };
    })
    .filter(Boolean);
}

function writeManifestModule(manifest) {
  const content = `const committeeManifest = ${JSON.stringify(manifest, null, 2)};\n\nexport default committeeManifest;\n`;
  ensureDir(path.dirname(MANIFEST_MODULE_PATH));
  fs.writeFileSync(MANIFEST_MODULE_PATH, content);
}

function buildCommittee() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`No scientific committee source directory found at ${INPUT_DIR}`);
    return;
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter((fileName) => fileName.toLowerCase().endsWith(".csv"));

  if (files.length === 0) {
    console.log(`No CSV files found in ${INPUT_DIR}`);
    return;
  }

  const manifest = {};
  let publishedCount = 0;

  for (const fileName of files) {
    const filePath = path.join(INPUT_DIR, fileName);
    const key = path.basename(fileName, path.extname(fileName));

    try {
      const csvContent = fs.readFileSync(filePath, "utf8");
      const members = parseCommitteeCsv(csvContent);

      if (members.length === 0) {
        console.warn(`Skipped ${fileName}: no valid rows`);
        continue;
      }

      manifest[key] = {
        title: "Comitato Scientifico",
        members
      };
      publishedCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipped ${fileName}: ${message}`);
    }
  }

  writeManifestModule(manifest);
  console.log(`Published ${publishedCount} scientific committee dataset(s) into ${MANIFEST_MODULE_PATH}`);
}

try {
  buildCommittee();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
