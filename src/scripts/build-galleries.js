import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import fg from "fast-glob";

const INPUT_DIR = path.resolve("galleries");
const OUTPUT_DIR = path.resolve("public/generated");
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanOutput() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  ensureDir(OUTPUT_DIR);
}

function fileToAlt(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]+/g, " ")
    .trim();
}

async function build() {
  cleanOutput();

  const galleries = {};
  const pattern = IMAGE_EXTENSIONS.map((extension) => `${INPUT_DIR.replace(/\\/g, "/")}/**/*.${extension}`);
  const files = await fg(pattern, { onlyFiles: true, caseSensitiveMatch: false });

  for (const file of files) {
    const relativeFile = path.relative(INPUT_DIR, file);
    const segments = relativeFile.split(path.sep);
    const gallery = segments[0];

    if (!gallery || segments.length < 2) {
      continue;
    }

    const originalName = segments.at(-1);
    const baseName = path.basename(originalName, path.extname(originalName));
    const galleryOutputDir = path.join(OUTPUT_DIR, gallery);
    const imageOutputPath = path.join(galleryOutputDir, `${baseName}.webp`);
    const thumbOutputPath = path.join(galleryOutputDir, `${baseName}-thumb.webp`);

    ensureDir(galleryOutputDir);

    const pipeline = sharp(file).rotate();

    await pipeline.clone().resize({
      width: 1600,
      withoutEnlargement: true
    }).webp({ quality: 82 }).toFile(imageOutputPath);

    await pipeline.clone().resize({
      width: 480,
      withoutEnlargement: true
    }).webp({ quality: 72 }).toFile(thumbOutputPath);

    galleries[gallery] ??= [];
    galleries[gallery].push({
      alt: fileToAlt(originalName),
      src: path.posix.join("generated", gallery, `${baseName}.webp`),
      thumbnail: path.posix.join("generated", gallery, `${baseName}-thumb.webp`)
    });
  }

  for (const gallery of Object.values(galleries)) {
    gallery.sort((left, right) => left.src.localeCompare(right.src));
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "galleries.json"),
    JSON.stringify(galleries, null, 2)
  );

  console.log(`Built ${Object.keys(galleries).length} galleries into ${OUTPUT_DIR}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
