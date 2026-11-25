// news-image-20261125 entry: the program's whole job is to place the finished
// front-page image at the output path the grader reads. The image (entry.png,
// 1024x1024, one day of world news: Wednesday 25 November 2026) sits beside this
// file in the repository; no network, no drawing at run time, just a copy.
// The copy is byte-for-byte, so both grader runs produce identical output.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const src = new URL("./entry.png", import.meta.url);

// Guard: refuse to ship anything that is not the finished front page.
// The gate takes at most 1 MiB and exactly 1024x1024; a wrong or oversized
// file must fail loudly here instead of silently reaching the grader.
const buf = readFileSync(src);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is not a valid PNG file");
}
if (buf.length > 1048576) {
  throw new Error(`entry.png is ${buf.length} bytes, over the 1 MiB limit`);
}
if (buf.readUInt32BE(16) !== 1024 || buf.readUInt32BE(20) !== 1024) {
  throw new Error("entry.png is not 1024x1024");
}
// The grader may hand us a fresh output directory that does not exist yet;
// create it first so the copy below never fails on a missing folder, then
// prove the copy landed whole: its byte count must equal the source image.
mkdirSync(outDir, { recursive: true });
copyFileSync(src, join(outDir, "entry.png"));
if (statSync(join(outDir, "entry.png")).size !== buf.length) {
  throw new Error("copied entry.png does not match the source size");
}
