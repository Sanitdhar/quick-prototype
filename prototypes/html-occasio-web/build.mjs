/**
 * Inlines the generated tenant tokens into the page, producing a self-contained
 * index.html. Kept as a build step rather than a hand-edited file so the tokens
 * can be regenerated from Occasio's resolver without touching the markup.
 *
 *   node build.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

let out = readFileSync(join(here, 'page.html'), 'utf8');

/**
 * Each placeholder is replaced by the generated part of the same name.
 *
 * `photos.js` is optional because it holds the couple's own photographs and is not
 * committed to this public repo. Without it the page still builds — every event falls
 * back to its drawn scenes — so a fresh clone is never broken, only less personal.
 */
const PARTS = [
  ['/*__TOKENS__*/', 'tokens.css', 'const _t = 0;'],
  ['/*__RIYANKA__*/', 'tenant-riyanka.css', '/* no tenant override */'],
  ['/*__SKINS__*/', 'skins.css', '/* no alternate skins */'],
  ['/*__PHOTOS__*/', 'photos.js', 'const PHOTOS = {};'],
];

for (const [marker, file, fallback] of PARTS) {
  if (!out.includes(marker)) {
    throw new Error(`page.html is missing the ${marker} placeholder`);
  }
  const path = join(here, file);
  if (!existsSync(path)) {
    console.warn(`! ${file} is missing — using the fallback`);
    out = out.replace(marker, fallback);
    continue;
  }
  out = out.replace(marker, readFileSync(path, 'utf8').trim());
}

writeFileSync(join(here, 'index.html'), out);

const tenants = [...out.matchAll(/\[data-tenant='([^']+)'\]/g)].map((m) => m[1]);
const skins = [...out.matchAll(/\.app\[data-skin='([^']+)'\]/g)].map((m) => m[1]);
console.log(`index.html written — tenants: ${tenants.join(', ')}`);
console.log(`skins: ${[...new Set(skins)].join(', ')}`);
console.log(`${(out.length / 1024).toFixed(1)} KB`);
