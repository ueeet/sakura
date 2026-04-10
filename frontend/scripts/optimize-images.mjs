// One-shot image optimizer for frontend/public/images/saunas
// Converts PNG/JPEG to WebP, resizes to max 1920px on long side, quality 82
// Run: node scripts/optimize-images.mjs

import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "public", "images", "saunas");
const MAX_SIDE = 1920;
const QUALITY = 82;

async function walk(dir) {
  const files = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const st = await stat(full);
    if (st.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function fmtBytes(b) {
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(2)} MB`;
  return `${(b / 1024).toFixed(0)} KB`;
}

const files = await walk(ROOT);
let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;

  const before = (await stat(file)).size;
  totalBefore += before;

  const tmpOut = file.replace(ext, ".webp.tmp");
  const finalOut = file.replace(ext, ".webp");

  await sharp(file)
    .rotate()
    .resize({
      width: MAX_SIDE,
      height: MAX_SIDE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .toFile(tmpOut);

  await rename(tmpOut, finalOut);
  await unlink(file);

  const after = (await stat(finalOut)).size;
  totalAfter += after;

  const rel = file.substring(ROOT.length + 1);
  const pct = ((1 - after / before) * 100).toFixed(0);
  console.log(`${rel.padEnd(40)} ${fmtBytes(before).padStart(10)} → ${fmtBytes(after).padStart(10)}  (-${pct}%)`);
}

console.log("─".repeat(80));
console.log(`TOTAL: ${fmtBytes(totalBefore)} → ${fmtBytes(totalAfter)}  (-${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
