// Check local page links and assets without needing a browser or network.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const failures = [];
let checked = 0;

function checkReference(reference, directory, source) {
  if (!reference || /^(https?:|data:|blob:|mailto:|tel:|javascript:|#)/i.test(reference)) return;
  const name = decodeURIComponent(reference.split(/[?#]/)[0]);
  if (!name || name.includes('${')) return;
  const target = path.resolve(directory, name);
  checked++;
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) failures.push(source + ': ' + reference);
}

const pages = ['index.html', ...fs.readdirSync(path.join(root, 'pages')).filter(file => file.endsWith('.html')).map(file => 'pages/' + file)];
for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const base = html.match(/<base\s+href="([^"]+)"/i);
  const directory = base ? path.resolve(path.dirname(path.join(root, file)), base[1]) : root;
  for (const match of html.replace(/<base\b[^>]*>/gi, '').matchAll(/\b(?:href|src|data|poster)="([^"]+)"/g)) checkReference(match[1], directory, file);
}
for (const file of fs.readdirSync(path.join(root, 'css'))) {
  const css = fs.readFileSync(path.join(root, 'css', file), 'utf8');
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) checkReference(match[1], path.join(root, 'css'), 'css/' + file);
}
for (const file of fs.readdirSync(path.join(root, 'js')).filter(file => file.endsWith('.js'))) {
  const js = fs.readFileSync(path.join(root, 'js', file), 'utf8');
  for (const match of js.matchAll(/["'`]((?:images|pages|downloads|audio)\/[^"'`<>]+)["'`]/g)) {
    if (match[1] !== 'images/...') checkReference(match[1], root, 'js/' + file);
  }
}
assert.deepEqual(failures, [], 'All local page links, scripts, styles, downloads, and image paths must exist');
assert.ok(!fs.existsSync(path.join(root, 'AgrikAIzen')), 'Only the Bits and Bytes app belongs in this repository');
console.log('Passed ' + checked + ' local reference checks across ' + pages.length + ' store pages, CSS, and JavaScript.');
