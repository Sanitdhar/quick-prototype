/**
 * Generates `tokens.css` (and a content dump) from Occasio's own theme resolver, so this
 * prototype's skin is the product's real output rather than hand-picked colours.
 *
 * Must run INSIDE the occasio repo — it imports workspace packages. See README.md.
 *
 *   cp generate-tokens.ts ../../../occasio/.artifacts/
 *   cd ../../../occasio && npx tsx .artifacts/generate-tokens.ts
 */
import { resolveTheme } from '@occasio/theme';
import type { Scheme } from '@occasio/theme';
import { toCssVars } from '../packages/ui/src/theme/cssVars';
import { FIXTURE_SEED, FIXTURE_NOW } from '@occasio/data';
import { writeFileSync } from 'node:fs';

/** The resolver emits `@expo-google-fonts` face names, which mean nothing to a browser. */
const WEB_FAMILY: Record<string, string> = {
  PlayfairDisplay: "'Playfair Display'",
  CormorantGaramond: "'Cormorant Garamond'",
  Anton: "'Anton'",
  Sora: "'Sora'",
  Fraunces: "'Fraunces'",
  Inter: "'Inter'",
  Nunito: "'Nunito'",
  WorkSans: "'Work Sans'",
  DMSans: "'DM Sans'",
  System: 'system-ui',
};
const toWebFont = (value: string): string =>
  value.replace(
    /([A-Za-z]+)(?:_\d{3}(?:Regular|SemiBold))?/,
    (m, family: string) => WEB_FAMILY[family] ?? m,
  );

const seed = FIXTURE_SEED as unknown as Record<string, Record<string, unknown>[]>;
const byTenant = (table: string, tenantId: unknown): Record<string, unknown>[] =>
  (seed[table] ?? []).filter((r) => r['tenant_id'] === tenantId);

const cssBlocks: string[] = [];
const out: Record<string, unknown> = { now: FIXTURE_NOW, tenants: {} };
const tenants = out['tenants'] as Record<string, unknown>;

for (const tenant of seed['tenants'] ?? []) {
  const id = tenant['id'];
  const slug = String(tenant['slug']);
  const configRow = (seed['tenantConfigs'] ?? []).find((c) => c['tenant_id'] === id);
  const published = configRow?.['published_config'] as Record<string, unknown> | undefined;
  const themeInput = published?.['theme'];

  /* Each tenant pins its own scheme — a wedding is light, a festival is dark. */
  let scheme: Scheme = 'light';
  const mode = (themeInput as Record<string, Record<string, string>> | undefined)?.['mode'];
  if (mode?.['default'] === 'dark') scheme = 'dark';

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const theme = resolveTheme(themeInput as any, { forceScheme: scheme });
  const vars = { ...toCssVars(theme) };
  for (const key of ['--occasio-font-display', '--occasio-font-body', '--occasio-font-mono']) {
    const v = vars[key];
    if (v !== undefined) vars[key] = toWebFont(v);
  }
  cssBlocks.push(
    `[data-tenant='${slug}'] {\n${Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')}\n}`,
  );

  tenants[slug] = {
    tenant,
    config: published,
    scheme: theme.scheme,
    preset: theme.presetId,
    venues: byTenant('venues', id),
    sessions: byTenant('sessions', id),
    people: byTenant('people', id),
    announcements: byTenant('announcements', id),
    gossipPosts: byTenant('gossipPosts', id),
    personas: byTenant('personas', id),
    tasks: byTenant('tasks', id),
    units: byTenant('units', id),
    rsvps: byTenant('rsvps', id),
    mediaAssets: byTenant('mediaAssets', id),
  };
}

writeFileSync('.artifacts/proto-tenants.css', cssBlocks.join('\n\n'));
writeFileSync('.artifacts/proto-data.json', JSON.stringify(out, null, 2));
console.log(`${String(Object.keys(tenants).length)} tenants written to .artifacts/proto-tenants.css`);
