import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve("dist");

fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });

console.log(`Cleaned ${DIST_DIR}`);
