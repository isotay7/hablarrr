// Renders the app icon SVG to the PNG sizes iOS and the web manifest need.
// Run with: node scripts/make-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const flag =
  "M0 0H64V58L56 66L48 58L40 66L32 58L24 66L16 58L8 66L0 58Z M32 14L42 26L32 38L22 26Z M10 44a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M46 44a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M29 47a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z M6 6h10l-5 8Z M48 6h10l-5 8Z";

// Full-bleed square: iOS and maskable icons apply their own corner mask.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#3A2418"/>
      <stop offset="1" stop-color="#1A1310"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <path d="M40 120 Q256 190 472 120" stroke="#BFA993" stroke-opacity="0.6" stroke-width="5" fill="none"/>
  <g transform="translate(70 128) rotate(-6) scale(1.35)"><path fill-rule="evenodd" fill="#D2694A" d="${flag}"/></g>
  <g transform="translate(184 150) scale(2.25)"><path fill-rule="evenodd" fill="#F2A93B" d="${flag}"/></g>
  <g transform="translate(356 120) rotate(6) scale(1.35)"><path fill-rule="evenodd" fill="#4F7BC9" d="${flag}"/></g>
  <circle cx="256" cy="420" r="16" fill="#F2A93B" opacity="0.9"/>
  <ellipse cx="256" cy="420" rx="70" ry="22" fill="#F2A93B" opacity="0.12"/>
</svg>`;

mkdirSync("public/icons", { recursive: true });
const sizes = [
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  ["public/icons/maskable-512.png", 512],
  ["src/app/apple-icon.png", 180],
  ["src/app/icon.png", 64],
];
for (const [out, size] of sizes) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log("wrote", out);
}
