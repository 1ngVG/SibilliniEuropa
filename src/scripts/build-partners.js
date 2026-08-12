import fs from "node:fs";
import path from "node:path";

const INPUT_DIR = path.resolve("content/partners");
const OUTPUT_DIR = path.resolve("public/generated/partners");
const INPUT_LOGOS_DIR = path.resolve("content/partners/logos");
const OUTPUT_LOGOS_DIR = path.resolve("public/generated/partners/logos");
const MANIFEST_MODULE_PATH = path.resolve("src/generated/partners-manifest.js");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyLogos() {
  ensureDir(OUTPUT_LOGOS_DIR);

  if (!fs.existsSync(INPUT_LOGOS_DIR)) {
    return 0;
  }

  const logoFiles = fs.readdirSync(INPUT_LOGOS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  for (const fileName of logoFiles) {
    fs.copyFileSync(path.join(INPUT_LOGOS_DIR, fileName), path.join(OUTPUT_LOGOS_DIR, fileName));
  }

  return logoFiles.length;
}

function writeManifestModule(partnerSets) {
  const content = `const partnersManifest = ${JSON.stringify(partnerSets, null, 2)};\n\nexport default partnersManifest;\n`;
  ensureDir(path.dirname(MANIFEST_MODULE_PATH));
  fs.writeFileSync(MANIFEST_MODULE_PATH, content);
}

function normalizePartner(entry, index) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  const url = typeof entry.url === "string" ? entry.url.trim() : "";
  const logo = typeof entry.logo === "string" ? entry.logo.trim() : "";

  if (!name || !url || !logo) {
    return null;
  }

  return {
    name,
    url,
    logo,
    alt: typeof entry.alt === "string" && entry.alt.trim().length > 0 ? entry.alt.trim() : name,
    cta: typeof entry.cta === "string" && entry.cta.trim().length > 0 ? entry.cta.trim() : undefined,
    newTab: entry.newTab === false ? false : undefined,
    _index: index
  };
}

function normalizePayload(filePath, parsed) {
  const baseName = path.basename(filePath, path.extname(filePath));

  const source = Array.isArray(parsed) ? {
    title: baseName,
    subtitle: "",
    cta: "Scopri di più",
    partners: parsed
  } : parsed;

  if (!source || typeof source !== "object") {
    throw new Error("Payload must be an object or an array");
  }

  const title = typeof source.title === "string" && source.title.trim().length > 0
    ? source.title.trim()
    : baseName;

  const subtitle = typeof source.subtitle === "string" ? source.subtitle.trim() : "";
  const cta = typeof source.cta === "string" && source.cta.trim().length > 0 ? source.cta.trim() : "Scopri di più";
  const partnersRaw = Array.isArray(source.partners) ? source.partners : [];

  const partners = partnersRaw
    .map((entry, index) => normalizePartner(entry, index))
    .filter(Boolean)
    .map(({ _index, ...partner }) => partner);

  if (partners.length < 3) {
    throw new Error(`At least 3 valid partners are required (found ${partners.length})`);
  }

  return {
    title,
    subtitle,
    cta,
    partners
  };
}

function buildPartners() {
  ensureDir(OUTPUT_DIR);

  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`No partners source directory found at ${INPUT_DIR}`);
    return;
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter((fileName) => fileName.toLowerCase().endsWith(".json"));

  if (files.length === 0) {
    console.log(`No JSON files found in ${INPUT_DIR}`);
    return;
  }

  const copiedLogos = copyLogos();
  let publishedCount = 0;
  const partnerSets = {};

  for (const fileName of files) {
    const sourcePath = path.join(INPUT_DIR, fileName);
    const outputPath = path.join(OUTPUT_DIR, fileName);
    const raw = fs.readFileSync(sourcePath, "utf8").trim();

    if (!raw) {
      console.warn(`Skipped ${fileName}: file is empty`);
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const payload = normalizePayload(sourcePath, parsed);

      fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
      partnerSets[path.basename(fileName, path.extname(fileName))] = payload;
      publishedCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipped ${fileName}: ${message}`);
    }
  }

  writeManifestModule(partnerSets);

  console.log(`Published ${publishedCount} partner dataset(s) to ${OUTPUT_DIR} (copied ${copiedLogos} logos)`);
}

buildPartners();