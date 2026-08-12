import fs from "node:fs";
import path from "node:path";
import { renderStaticDemoPage } from "../demo/showcase.js";

const OUTPUT_FILE = path.resolve("public/index.html");

function buildDemoPage() {
  fs.writeFileSync(OUTPUT_FILE, renderStaticDemoPage());
  console.log(`Built demo page into ${OUTPUT_FILE}`);
}

buildDemoPage();
