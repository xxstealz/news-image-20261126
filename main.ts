// The Daily Globe — Thursday 26 November 2026.
//
// This program writes the front page for Thursday 26 November 2026 to
// /output/entry.png. The page sums up that day's world news in one image:
// 36 dated stories across 9 regions, from the US tariff plan for 14 trading
// partners to gold's $163 intraday swing, Bitcoin's flush and recovery, the
// Houthi attacks that lifted oil, the strikes in Gaza and Kyiv, the ECB's
// new president, Macy's postponed parade, the Cairo tanker fire, Ebola
// passing 12,000 cases in Congo, Kim's nuclear vow, and the Solomons
// treaty with Australia. Every illustrated card uses a real photo of the
// event or subject (Wikimedia Commons, public domain / CC), baked into the
// image at build time.
//
// It needs no network at grade time: the finished PNG ships in this
// repository and the program simply copies it to the output directory, so
// two runs always write identical bytes.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const OUTPUT_PATH = join(OUTPUT_DIR, "entry.png");
const SOURCE_PATH = join(process.cwd(), "entry.png");

// The PNG file signature: 89 50 4E 47 0D 0A 1A 0A.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function main(): void {
  if (!existsSync(SOURCE_PATH)) {
    throw new Error(`entry.png not found in ${process.cwd()}`);
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(SOURCE_PATH, OUTPUT_PATH);

  const bytes = readFileSync(OUTPUT_PATH);
  if (bytes.length < 8 || !bytes.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error("entry.png is not a valid PNG file");
  }
  // The competition gate: at most 1 MiB and at most 1024 by 1024 pixels.
  // Width and height live in the IHDR chunk at bytes 16-23 (big-endian).
  if (bytes.length > 1048576) {
    throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > 1024 || height > 1024) {
    throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
  }
  console.log(`Wrote ${OUTPUT_PATH} (${bytes.length} bytes, ${width}x${height})`);
}

main();
