import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR_URL = new URL('../../dist/', import.meta.url);
const DIST_DIR = fileURLToPath(DIST_DIR_URL);
const INITIAL_JS_LIMIT = 450 * 1024;
const INITIAL_JS_GRAPH_LIMIT = 600 * 1024;
const CHUNK_JS_LIMIT = 500 * 1024;
const INITIAL_CSS_LIMIT = 120 * 1024;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}

const indexHtml = await readFile(join(DIST_DIR, 'index.html'), 'utf8');
const entryMatch = indexHtml.match(/<script[^>]+src=['"]([^'"]+\.js)['"]/);
assert(entryMatch, 'Production index must reference an entry JavaScript bundle.');
const preloadNames = [...indexHtml.matchAll(/<link[^>]+rel=['"]modulepreload['"][^>]+href=['"]([^'"]+\.js)['"]/g)]
  .map(match => match[1].split('/').at(-1));

const assetFiles = await listFiles(join(DIST_DIR, 'assets'));
const javascript = await Promise.all(
  assetFiles.filter(path => path.endsWith('.js')).map(async path => {
    const content = await readFile(path);
    return { path, bytes: content.byteLength, gzipBytes: gzipSync(content).byteLength };
  }),
);
const stylesheets = await Promise.all(
  assetFiles.filter(path => path.endsWith('.css')).map(async path => {
    const content = await readFile(path);
    return { path, bytes: content.byteLength, gzipBytes: gzipSync(content).byteLength };
  }),
);

const entryName = entryMatch[1].split('/').at(-1);
const entry = javascript.find(asset => asset.path.endsWith(entryName));
assert(entry, `Entry bundle ${entryName} was not found in dist/assets.`);

const largestChunk = javascript.reduce((largest, asset) => asset.bytes > largest.bytes ? asset : largest);
const initialNames = new Set([entryName, ...preloadNames]);
const initialGraph = javascript.filter(asset => initialNames.has(asset.path.split(/[\\/]/).at(-1)));
const initialGraphBytes = initialGraph.reduce((total, asset) => total + asset.bytes, 0);
const initialGraphGzipBytes = initialGraph.reduce((total, asset) => total + asset.gzipBytes, 0);
const initialCssBytes = stylesheets.reduce((total, asset) => total + asset.bytes, 0);

console.log(JSON.stringify({
  entry: { file: entryName, bytes: entry.bytes, gzipBytes: entry.gzipBytes },
  initialGraph: { files: initialGraph.length, bytes: initialGraphBytes, gzipBytes: initialGraphGzipBytes },
  largestChunk: {
    file: largestChunk.path.split(/[\\/]/).at(-1),
    bytes: largestChunk.bytes,
    gzipBytes: largestChunk.gzipBytes,
  },
  javascriptChunks: javascript.length,
  initialCssBytes,
  limits: { INITIAL_JS_LIMIT, INITIAL_JS_GRAPH_LIMIT, CHUNK_JS_LIMIT, INITIAL_CSS_LIMIT },
}, null, 2));

assert(entry.bytes <= INITIAL_JS_LIMIT, `Initial JavaScript exceeds ${INITIAL_JS_LIMIT} bytes.`);
assert(initialGraphBytes <= INITIAL_JS_GRAPH_LIMIT, `Initial JavaScript graph exceeds ${INITIAL_JS_GRAPH_LIMIT} bytes.`);
assert(largestChunk.bytes <= CHUNK_JS_LIMIT, `JavaScript chunk exceeds ${CHUNK_JS_LIMIT} bytes.`);
assert(initialCssBytes <= INITIAL_CSS_LIMIT, `CSS exceeds ${INITIAL_CSS_LIMIT} bytes.`);

console.log('PASS production frontend bundle budgets');
