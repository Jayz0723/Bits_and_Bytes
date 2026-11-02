const assert = require('node:assert/strict');
const { createStoreServer } = require('../server.cjs');
const { createSearchService } = require('../search-service.cjs');
const { chromium } = require('./browser.cjs');

(async () => {
  const search = createSearchService();
  const monitors = await search('Sámsung monitor', 'Products');
  assert.equal(monitors.engine, 'python');
  assert.equal(monitors.results.length, 2);
  assert.ok(monitors.results.every(item => item.title.startsWith('Samsung Odyssey')));
  assert.ok((await search('delivery', 'Articles')).results.every(item => item.kind === 'Articles'));
  assert.deepEqual((await search('no-such-product-xyz')).results, []);
  assert.deepEqual((await search('   ')).results, []);
  await assert.rejects(search('x'.repeat(151)), error => error.status === 400);
  await assert.rejects(search('Samsung', '__proto__'), error => error.status === 400);
  await assert.rejects(createSearchService({ python: 'missing-python-test-executable' })('Samsung'), error => error.status === 503);

  const server = createStoreServer(':memory:');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    const response = await fetch(origin + '/api/search?q=RTX%205080&kind=Products');
    assert.equal(response.status, 200);
    assert.equal((await response.json()).results[0].title, 'MSI GeForce RTX 5080 16G VENTUS 3X OC');
    assert.equal((await fetch(origin + '/backend/search.py')).status, 404);
    assert.equal((await fetch(origin + '/api/search?q=x&kind=Invalid')).status, 400);
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await page.goto(origin);
    await page.locator('#siteSearchToggle').click();
    const api = page.waitForResponse(response => response.url().includes('/api/search?'));
    await page.locator('#siteSearchInput').fill('Samsung monitor');
    assert.equal((await (await api).json()).engine, 'python');
    await page.waitForFunction(() => document.querySelectorAll('#siteSearchResults .site-search-result').length === 2);
    await page.goto(origin + '/pages/search.html?q=delivery');
    await page.locator('[data-search-kind="Articles"]').click();
    await page.waitForFunction(() => {
      const results = [...document.querySelectorAll('#searchPageResults .site-search-result small')];
      return results.length > 0 && results.every(result => result.textContent === 'Articles');
    });
    // A static host or unavailable Python must still leave search usable.
    await page.route('**/api/search?**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Unavailable"}' }));
    await page.goto(origin + '/pages/search.html?q=Samsung%20monitor');
    await page.waitForFunction(() => document.querySelectorAll('#searchPageResults .site-search-result').length === 2);
    assert.deepEqual(errors, []);
    console.log('Passed real Python matching/ranking, accents, categories, validation, missing executable, API, source-file protection, browser integration and offline fallback.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
