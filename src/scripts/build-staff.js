import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const INPUT_DIR = path.resolve("content/staff");
const OUTPUT_DIR = path.resolve("public/generated/staff");
const INPUT_PHOTOS_DIR = path.resolve("content/staff/ProfilePic");
const OUTPUT_PHOTOS_DIR = path.resolve("public/generated/staff/profile-pics");
const MANIFEST_MODULE_PATH = path.resolve("src/generated/staff-manifest.js");
const PHOTO_MAX_DIMENSION = 640;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function processPhotos() {
  ensureDir(OUTPUT_PHOTOS_DIR);

  if (!fs.existsSync(INPUT_PHOTOS_DIR)) {
    return 0;
  }

  const photoFiles = fs.readdirSync(INPUT_PHOTOS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  for (const fileName of photoFiles) {
    const inputPath = path.join(INPUT_PHOTOS_DIR, fileName);
    const outputPath = path.join(OUTPUT_PHOTOS_DIR, fileName);

    try {
      await sharp(inputPath)
        .rotate()
        .resize({
          width: PHOTO_MAX_DIMENSION,
          height: PHOTO_MAX_DIMENSION,
          fit: "cover",
          position: "attention"
        })
        .toFile(outputPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Photo processing failed for ${fileName}, copying original instead: ${message}`);
      fs.copyFileSync(inputPath, outputPath);
    }
  }

  return photoFiles.length;
}

function writeManifestModule(staffSets) {
  const content = `const staffManifest = ${JSON.stringify(staffSets, null, 2)};\n\nexport default staffManifest;\n`;
  ensureDir(path.dirname(MANIFEST_MODULE_PATH));
  fs.writeFileSync(MANIFEST_MODULE_PATH, content);
}

function normalizeMember(entry, index) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  const photo = typeof entry.photo === "string" ? entry.photo.trim() : "";

  if (!name || !photo) {
    return null;
  }

  return {
    name,
    role: typeof entry.role === "string" ? entry.role.trim() : "",
    photo,
    alt: typeof entry.alt === "string" && entry.alt.trim().length > 0 ? entry.alt.trim() : name,
    _index: index
  };
}

function normalizePayload(filePath, parsed) {
  const baseName = path.basename(filePath, path.extname(filePath));

  const source = Array.isArray(parsed) ? {
    title: baseName,
    subtitle: "",
    members: parsed
  } : parsed;

  if (!source || typeof source !== "object") {
    throw new Error("Payload must be an object or an array");
  }

  const title = typeof source.title === "string" && source.title.trim().length > 0
    ? source.title.trim()
    : baseName;

  const subtitle = typeof source.subtitle === "string" ? source.subtitle.trim() : "";
  const membersRaw = Array.isArray(source.members) ? source.members : [];

  const members = membersRaw
    .map((entry, index) => normalizeMember(entry, index))
    .filter(Boolean)
    .map(({ _index, ...member }) => member);

  if (members.length === 0) {
    throw new Error("At least 1 valid staff member is required");
  }

  return {
    title,
    subtitle,
    members
  };
}

async function buildStaff() {
  ensureDir(OUTPUT_DIR);

  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`No staff source directory found at ${INPUT_DIR}`);
    return;
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter((fileName) => fileName.toLowerCase().endsWith(".json"));

  if (files.length === 0) {
    console.log(`No JSON files found in ${INPUT_DIR}`);
    return;
  }

  const processedPhotos = await processPhotos();
  let publishedCount = 0;
  const staffSets = {};

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
      staffSets[path.basename(fileName, path.extname(fileName))] = payload;
      publishedCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipped ${fileName}: ${message}`);
    }
  }

  writeManifestModule(staffSets);

  console.log(`Published ${publishedCount} staff dataset(s) to ${OUTPUT_DIR} (processed ${processedPhotos} photos)`);
}

buildStaff().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
