const assert = require('node:assert/strict');
const path = require('node:path');
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');
(async () => {
  const server = createStoreServer(':memory:'); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port; let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    for (const id of ['lap-hp-victus-15', 'pc-bb-foundation', 'pc-bb-core', 'pc-bb-apex']) {
      await page.goto(origin + '/pages/product.html?id=' + id);
      await page.locator('.product-gallery-stage > img').evaluate(image => image.decode());
      assert.ok((await page.locator('#detailProductDescription').textContent()).length > 100);
      if (id.startsWith('pc-bb-')) {
        const original = await page.locator('.product-gallery-stage > img').getAttribute('src');
        await page.locator('#detailVariant').evaluate(select => { select.value = 'white'; select.dispatchEvent(new Event('change', { bubbles: true })); });
        await page.locator('.product-gallery-stage > img').evaluate(image => image.decode());
        assert.notEqual(await page.locator('.product-gallery-stage > img').getAttribute('src'), original);
        assert.match(await page.locator('.product-gallery-stage > img').getAttribute('src'), /white/);
      }
    }
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + '/pages/products.html');
      if (width < 760) await page.locator('#toggleFilters').click();
      await page.locator('#typeFilterTrigger').click();
      assert.equal(await page.locator('#typeFilterOptions .picker-group-heading').count(), 3);
      await page.screenshot({ path: path.join(__dirname, '../images/previews/catalog-dropdown-open-' + width + '.png') });
      await page.locator('#typeFilterOptions button').filter({ hasText: 'Memory (RAM)' }).click();
      assert.equal(await page.locator('#typeFilter').inputValue(), 'part:ram');
      await page.locator('#typeFilterTrigger').click();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#typeFilterTrigger').getAttribute('aria-expanded'), 'false');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(__dirname, '../images/previews/catalog-dropdown-' + width + '.png') });
    }
    assert.deepEqual(errors, []);
    console.log('Passed HP Victus photo/details, three desktop tiers, exact black/white case photos, grouped dark dropdown, keyboard controls and responsive layouts.');
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
