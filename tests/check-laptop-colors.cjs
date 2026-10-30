const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route(/^https?:/, route => route.abort());
    const base = pathToFileURL(path.resolve(__dirname, '../pages/product.html')).href;
    for (const id of ['lap-hp-victus-15', 'lap-msi-modern-14-c13m']) {
      await page.goto(base + '?id=' + id);
      const options = await page.evaluate(id => catalogProducts().find(p => p.id === id).variants.options.map(o => o.id), id);
      const photos = new Set();
      for (const option of options) {
        await page.locator('#detailVariant').evaluate((select, value) => { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); }, option);
        await page.locator('.product-gallery-stage > img').evaluate(image => image.decode());
        photos.add(await page.locator('.product-gallery-stage > img').getAttribute('src'));
        if (option === 'performance-blue') {
          assert.match(await page.locator('#detailProductSelectedSpecs').textContent(), /7445HS.*12GB.*512GB.*4050/);
          await page.evaluate(() => openProductDetails(productWithVariant(catalogProducts().find(p => p.id === 'lap-hp-victus-15'), 'performance-blue')));
          await page.locator('#productDetailsDialog [data-detail-add]').click();
          const item = await page.evaluate(() => getCart().find(p => p.name.includes('fb3105na')));
          assert.match(item.image, /victus-blue/); assert.equal(item.price, 69995); assert.match(item.specs, /12GB.*512GB.*4050/);
          await page.keyboard.press('Escape');
        }
      }
      assert.equal(photos.size, options.length);
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.locator('#detailVariants').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.resolve(__dirname, '../images/previews/laptop-colors-' + id + '-' + width + '.png') });
      }
    }
    assert.deepEqual(errors, []);
    console.log('Passed all new laptop color photos, Victus hardware switching, correct blue model/photo/price in cart, and desktop/mobile layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
