const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawn } = require('node:child_process');

function loadSearchIndex() {
  const read = file => fs.readFileSync(path.join(__dirname, 'js', file), 'utf8');
  const app = read('app.js');
  const parts = app.match(/const computerPartProducts = \[[\s\S]*?\n\];/)?.[0];
  const categories = app.match(/const computerPartCategories = \[[\s\S]*?\n\];/)?.[0] || '';
  if (!parts) throw new Error('Cannot load the search catalog.');
  // Only checked-in source is evaluated. No request content is executable code.
  const source = ['data.js', 'product-descriptions.js', 'catalog-updates.js', 'site-experience.js'].map(read).join('\n');
  return JSON.parse(vm.runInNewContext(source + '\n' + parts + '\n' + categories + `
    function catalogProducts() {
      return [...products, ...computerPartProducts].map(product => {
        const variants = productVariants[product.id];
        const selected = variants?.options.find(option => option.id === variants.defaultId);
        return { ...product, ...productMedia[product.id], ...selected, id: product.id };
      });
    }
    JSON.stringify(siteSearchEntries());
  `, {}, { timeout: 1000 }));
}

function createSearchService({ python = process.env.PYTHON_EXECUTABLE || 'python' } = {}) {
  const entries = loadSearchIndex();
  let active = 0;
  return async function search(query, kind = 'All') {
    const fail = (message, status) => Object.assign(new Error(message), { status });
    if (typeof query !== 'string' || query.length > 150 || !['All', 'Products', 'Articles', 'Pages'].includes(kind)) {
      throw fail('Enter a search of at most 150 characters and a valid category.', 400);
    }
    if (!query.trim()) return { results: [], engine: 'python' };
    if (active >= 3) throw fail('Search is busy. Please try again.', 429);
    active++;
    try {
      return await new Promise((resolve, reject) => {
        // No shell interpolation: the query travels exclusively through stdin.
        const child = spawn(python, [path.join(__dirname, 'backend/search.py')], {
          windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
          env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot,
            TEMP: process.env.TEMP, TMP: process.env.TMP, PYTHONUTF8: '1' }
        });
        let output = '', settled = false;
        const finish = (error, result) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (error) { child.kill(); reject(error); } else resolve(result);
        };
        const timer = setTimeout(() => finish(fail('Search took too long. Please try again.', 503)), 5000);
        child.on('error', () => finish(fail('Python search is unavailable. Check the server Python installation.', 503)));
        child.stdin.on('error', () => finish(fail('Search is temporarily unavailable.', 503)));
        child.stderr.resume();
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', chunk => {
          output += chunk;
          if (output.length > 500000) finish(fail('Search response is too large.', 503));
        });
        child.on('close', code => {
          if (code !== 0) return finish(fail('Search is temporarily unavailable.', 503));
          try { finish(null, JSON.parse(output)); }
          catch { finish(fail('Search returned an invalid response.', 503)); }
        });
        child.stdin.end(JSON.stringify({ entries, query, kind }));
      });
    } finally { active--; }
  };
}

module.exports = { createSearchService, loadSearchIndex };
