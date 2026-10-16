// Next 16's static export writes prefetch payloads as nested folders
// (out/leer/d01/__next.leer/$d$id/__PAGE__.txt), but the client asks for the
// flat name (out/leer/d01/__next.leer.$d$id.__PAGE__.txt). On a static host
// like GitHub Pages those requests 404, so write a flat copy next to each one.
// Runs automatically after `npm run build`.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(dir, full);
    else walk(full);
  }
}

function flatten(parent, nested) {
  const stack = [nested];
  while (stack.length) {
    const d = stack.pop();
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) stack.push(full);
      else {
        const flat = relative(parent, full).split(sep).join(".");
        copyFileSync(full, join(parent, flat));
        copied++;
      }
    }
  }
}

walk(OUT);
console.log(`flatten-prefetch: wrote ${copied} flat prefetch files`);
