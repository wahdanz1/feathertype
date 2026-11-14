// Fails when the web build makes the marketing pages download editor-only code. Run after `vite build`.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const BANNED = [
  ['mammoth', /\/node_modules\/mammoth\//],
  ['docx', /\/node_modules\/docx\//],
  ['@codemirror', /\/node_modules\/@codemirror\//],
  ['editor store', /^\/src\/store\//],
];

const html = readFileSync(join(dist, 'index.html'), 'utf8');
let graph;
try {
  graph = JSON.parse(readFileSync(join(dist, '.vite', 'chunk-graph.json'), 'utf8'));
} catch {
  console.error(`check-bundle: ${dist}/.vite/chunk-graph.json is missing; build with the chunk-graph plugin first.`);
  process.exit(1);
}

const assetPath = (url) => url.replace(/^\//, '');
const roots = [
  ...[...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map((m) => assetPath(m[1])),
  ...[...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => assetPath(m[1])),
];
if (roots.length === 0) {
  console.error('check-bundle: no module script found in index.html.');
  process.exit(1);
}

const seen = new Set();
const queue = [...roots];
while (queue.length) {
  const file = queue.shift();
  if (seen.has(file)) continue;
  const chunk = graph[file];
  if (!chunk) {
    console.error(`check-bundle: ${file} is referenced by index.html but missing from the chunk graph.`);
    process.exit(1);
  }
  seen.add(file);
  queue.push(...chunk.imports);
}

const failures = [];
for (const file of seen) {
  for (const [label, pattern] of BANNED) {
    const hits = graph[file].modules.filter((id) => pattern.test(id));
    if (hits.length) failures.push(`  ${file}: ${label} (${hits.length} modules, e.g. ${hits[0]})`);
  }
}

if (failures.length) {
  console.error('check-bundle: the initial load of / pulls in editor-only code:');
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`check-bundle: ${seen.size} chunks load on /, none contain editor-only code.`);
