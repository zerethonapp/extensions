// Sync the local tool catalog snapshot from the live BE.
//   GET https://tools.zerethon.com/api/internal/tools.json
// Writes src/lib/tools-registry.js, preserving the manually-curated
// `bundled` flags (Option A keeps the set empty; v0.2 will flip some on).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/lib/tools-registry.js');
const URL = 'https://tools.zerethon.com/api/internal/tools.json';

const KEEP_BUNDLED = new Set([
  // Empty under Option A. Populate when porting offline tools in v0.2.
]);

const res = await fetch(URL);
if (!res.ok) throw new Error(`Fetch ${URL} → ${res.status}`);
const tools = await res.json();

const sorted = [...tools].sort((a, b) => {
  const ab = KEEP_BUNDLED.has(a.slug) ? 0 : 1;
  const bb = KEEP_BUNDLED.has(b.slug) ? 0 : 1;
  if (ab !== bb) return ab - bb;
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.name.localeCompare(b.name);
});

const today = new Date().toISOString().slice(0, 10);
const rows = sorted.map((t) => {
  const bundled = KEEP_BUNDLED.has(t.slug) ? 'true' : 'false';
  const kw = JSON.stringify((t.keywords || []).slice(0, 4));
  return `  { slug: ${JSON.stringify(t.slug)}, name: ${JSON.stringify(t.name)}, category: ${JSON.stringify(t.category)}, bundled: ${bundled}, keywords: ${kw} }`;
}).join(',\n');

const body = `// Static snapshot of the live tool catalog at tools.zerethon.com.
// Regenerate with: npm run sync  (fetches /api/internal/tools.json and rewrites this file)
// Last sync: ${today}

export const REGISTRY = [
${rows}
];

// Option A (Companion Launcher): no tools bundled offline; every tool opens on
// the website. The \`bundled: true\` flags above are kept so we can flip the set
// on in v0.2 once usage data tells us which tools deserve offline ports.
export const BUNDLED_SLUGS = new Set();

export const CATEGORY_LABEL = {
  developer: 'Developer',
  creator: 'Creator',
  web3: 'Web3',
};

export function findTool(slug) {
  return REGISTRY.find((t) => t.slug === slug) || null;
}

export function filterTools(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return REGISTRY;
  return REGISTRY.filter((t) => {
    const hay = \`\${t.name} \${t.slug} \${t.category} \${(t.keywords || []).join(' ')}\`.toLowerCase();
    return hay.includes(q);
  });
}
`;

await fs.writeFile(OUT, body, 'utf8');
console.log(`✓ Synced ${sorted.length} tools → ${path.relative(ROOT, OUT)}`);
