import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const TARGET_ROOT = path.resolve("content");

const SOURCES = [
  {
    envName: "CONTENT_GALLERIES_URL",
    label: "galleries",
    outputDir: path.join(TARGET_ROOT, "galleries")
  },
  {
    envName: "CONTENT_PARTNERS_URL",
    label: "partners",
    outputDir: path.join(TARGET_ROOT, "partners")
  },
  {
    envName: "CONTENT_SCHEDULE_URL",
    label: "schedule",
    outputDir: path.join(TARGET_ROOT, "schedule")
  }
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function runCommand(command, args, errorMessage) {
  try {
    execFileSync(command, args, { stdio: "inherit" });
  } catch (error) {
    throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function extractArchive(archivePath, targetDir) {
  runCommand("tar", ["-xf", archivePath, "-C", targetDir], "Unable to extract archive");
}

function looksLikeSingleWrapperDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());
  const dirs = entries.filter((entry) => entry.isDirectory());
  return files.length === 0 && dirs.length === 1;
}

function flattenSingleWrapperDirectory(dirPath) {
  if (!looksLikeSingleWrapperDirectory(dirPath)) {
    return;
  }

  const [wrapper] = fs.readdirSync(dirPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const wrapperPath = path.join(dirPath, wrapper.name);
  const tempPath = `${dirPath}.__tmp`;

  fs.renameSync(wrapperPath, tempPath);
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.renameSync(tempPath, dirPath);
}

function downloadArchive(url, outputPath) {
  runCommand("curl", ["-L", "--fail", "-o", outputPath, url], `Unable to download archive from ${url}`);
}

function syncSource(source) {
  const url = process.env[source.envName];

  if (!url || url.trim().length === 0) {
    console.log(`Skipping ${source.label}: env ${source.envName} not set.`);
    return false;
  }

  const tempArchivePath = path.resolve(`${source.label}.tar.gz`);

  console.log(`Syncing ${source.label} from ${source.envName}...`);
  cleanDir(source.outputDir);
  downloadArchive(url.trim(), tempArchivePath);
  extractArchive(tempArchivePath, source.outputDir);
  flattenSingleWrapperDirectory(source.outputDir);

  fs.rmSync(tempArchivePath, { force: true });

  return true;
}

function main() {
  ensureDir(TARGET_ROOT);

  let synced = 0;

  for (const source of SOURCES) {
    const didSync = syncSource(source);

    if (didSync) {
      synced += 1;
    }
  }

  if (synced === 0) {
    console.log("No remote content source provided. Using repository content/ as-is.");
  } else {
    console.log(`Remote content synced for ${synced} source(s).`);
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
