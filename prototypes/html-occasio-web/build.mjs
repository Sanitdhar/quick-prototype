/**
 * Inlines the generated tenant tokens into the page, producing a self-contained
 * index.html. Kept as a build step rather than a hand-edited file so the tokens
 * can be regenerated from Occasio's resolver without touching the markup.
 *
 *   node build.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

let out = readFileSync(join(here, 'page.html'), 'utf8');

/** Each placeholder is replaced by the generated stylesheet of the same name. */
const PARTS = [
  ['/*__TOKENS__*/', 'tokens.css'],
  ['/*__SKINS__*/', 'skins.css'],
];

for (const [marker, file] of PARTS) {
  if (!out.includes(marker)) {
    throw new Error(`page.html is missing the ${marker} placeholder`);
  }
  out = out.replace(marker, readFileSync(join(here, file), 'utf8').trim());
}

writeFileSync(join(here, 'index.html'), out);

const tenants = [...out.matchAll(/\[data-tenant='([^']+)'\]/g)].map((m) => m[1]);
const skins = [...out.matchAll(/\.app\[data-skin='([^']+)'\]/g)].map((m) => m[1]);
console.log(`index.html written — tenants: ${tenants.join(', ')}`);
console.log(`skins: ${[...new Set(skins)].join(', ')}`);
console.log(`${(out.length / 1024).toFixed(1)} KB`);
