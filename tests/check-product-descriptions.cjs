const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    const detail = pathToFileURL(path.resolve(__dirname, '../pages/product.html')).href;
    await page.goto(detail + '?id=part-ssd-1tb-nvme');
    const products = await page.evaluate(() => catalogProducts());
    assert.equal(products.length, 64);
    assert.equal(await page.evaluate(() => Object.keys(productDescriptions).length), products.length);
    const allowed = ['msi.com', 'dell.com', 'delltechnologies.com', 'hp.com', 'corsair.com', 'samsung.com', 'logitechg.com', 'microsoft.com', 'apple.com', 'acer.com', 'asus.com', 'lenovo.com', 'keychron.com', 'logitech.com', 'elgato.com', 'kingston.com', 'intel.com', 'amd.com', 'gigabyte.com', 'coolermaster.com'];
    let variants = 0;
    for (const product of products) {
      assert.ok(product.description.length > 100, product.id + ' has a meaningful description');
      assert.notEqual(product.description, product.specs);
      if (!product.id.startsWith('pc-bb-')) {
      const url = new URL(product.descriptionSource);
      assert.equal(url.protocol, 'https:');
      assert.ok(allowed.some(host => url.hostname === host || url.hostname.endsWith('.' + host)), product.id + ' links to the manufacturer');
      } else assert.equal(product.descriptionSource, 'pages/build.html');
      await page.goto(detail + '?id=' + product.id);
      assert.equal(await page.locator('#detailProductDescription').textContent(), product.description);
      assert.equal(await page.locator('#detailProductSelectedSpecs').textContent(), product.specs);
      assert.equal(await page.locator('#detailProductDescriptionSource').getAttribute('href'), product.descriptionSource);
      assert.equal(await page.locator('#detailProductDescriptionNote').isVisible(), Boolean(product.descriptionNote));
      for (const option of product.variants?.options || []) {
        variants++;
        // Also exercises the hidden select used by the color swatches.
        await page.locator('#detailVariant').evaluate((select, id) => {
          select.value = id;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }, option.id);
        const selected = await page.evaluate(({ id, option }) => productWithVariant(catalogProducts().find(p => p.id === id), option), { id: product.id, option: option.id });
        assert.equal(await page.locator('#detailProductDescription').textContent(), selected.description);
        assert.equal(await page.locator('#detailProductSelectedSpecs').textContent(), selected.specs);
        assert.equal(await page.locator('#detailProductDescriptionSource').getAttribute('href'), selected.descriptionSource);
        await page.evaluate(product => openProductDetails(product), selected);
        assert.equal(await page.locator('#productDetailsDialog .product-description-copy').textContent(), selected.description);
        assert.equal(await page.locator('#productDetailsDialog .product-selected-specs').textContent(), selected.specs);
        await page.keyboard.press('Escape');
      }
      await page.evaluate(product => openProductDetails(product), product);
      assert.equal(await page.locator('#productDetailsDialog .product-description-copy').textContent(), product.description);
      await page.keyboard.press('Escape');
    }
    // The monitor selector changes actual models, not just screen dimensions.
    await page.goto(detail + '?id=monitor-27&variant=32inch');
    assert.match(await page.locator('#detailProductDescription').textContent(), /PA329CV.*4K/);
    assert.match(await page.locator('#detailProductDescription').textContent(), /60Hz/);
    assert.match(await page.locator('#detailProductCategory').textContent(), /Creator/);
    await page.selectOption('#detailVariant', '24inch');
    assert.match(await page.locator('#detailProductDescription').textContent(), /VG249Q1A.*Full HD/);
    await page.selectOption('#detailVariant', '27inch');
    assert.match(await page.locator('#detailProductDescription').textContent(), /VG27AQ.*QHD/);
    assert.doesNotMatch(await page.locator('#detailProductDescription').textContent(), /PA329CV|VG249Q1A/);
    assert.match(await page.locator('#detailProductCategory').textContent(), /Gaming/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(detail + '?id=lap-lenovo-office');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No overflow at ' + width);
      await page.screenshot({ path: path.resolve(__dirname, '../images/previews/descriptions-' + width + '.png'), fullPage: false });
    }
    assert.deepEqual(errors, []);
    console.log(`Passed descriptions and manufacturer references for all 64 products, ${variants} options, full pages, Quick View, model-switching, configuration notes, and responsive layouts.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
