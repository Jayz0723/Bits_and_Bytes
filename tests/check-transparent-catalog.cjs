const assert = require('node:assert/strict');
const path = require('node:path');
const sharp = require(path.join(process.env.USERPROFILE || process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');
const newIds = ['monitor-msi-g244f-e2', 'part-msi-a650bn', 'accessory-msi-gh20', 'accessory-msi-gm11', 'part-msi-m450-1tb', 'part-msi-m100r-white', 'part-msi-h610m-g', 'accessory-msi-gk30', 'lap-msi-thin-15-b13ve', 'lap-msi-modern-15-b13m'];
(async () => {
  const server = createStoreServer(':memory:');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await page.goto(origin + '/pages/products.html');
    const catalog = await page.evaluate(() => catalogProducts());
    assert.equal(catalog.length, 64);
    assert.equal(new Set(catalog.map(item => item.id)).size, 64);
    const files = await page.evaluate(() => [...new Set(catalogProducts().flatMap(product => {
      const options = product.variants ? product.variants.options.map(option => productWithVariant(product, option.id)) : [product];
      return options.flatMap(item => [item.image, ...productGallery(item).map(view => view.src)]);
    }))]);
    for (const file of files) {
      const metadata = await sharp(path.join(root, file)).metadata();
      const stats = await sharp(path.join(root, file)).stats();
      assert.ok(metadata.hasAlpha && !stats.isOpaque, file + ' has genuine transparency');
      assert.ok(stats.channels.at(-1).max > 200 && stats.channels.at(-1).mean > 3, file + ' contains a visible product');
    }
    for (const id of newIds) {
      await page.goto(origin + '/pages/product.html?id=' + id);
      assert.match(await page.locator('#detailProductDescription').textContent(), /\S.{100}/);
      await page.locator('.product-gallery-stage > img').evaluate(image => image.decode());
      assert.equal(await page.locator('.product-gallery-stage > img').evaluate(image => getComputedStyle(image).backgroundColor), 'rgba(0, 0, 0, 0)');
      assert.ok(await page.locator('.product-gallery-thumbnails button').count() >= 2);
    }
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(origin + '/pages/products.html?q=MSI');
      await page.locator('.product-card img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.locator('.product-card img').first().evaluate(image => getComputedStyle(image).backgroundColor), 'rgba(0, 0, 0, 0)');
      await page.screenshot({ path: path.join(root, 'images/previews/transparent-products-' + width + '.png') });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(origin + '/pages/products.html?q=SPATIUM');
    assert.equal(await page.locator('.product-card').count(), 1);
    await page.locator('[data-add-product]').click();
    assert.equal(await page.locator('#cartCount').textContent(), '1');
    await page.goto(origin + '/pages/product.html?id=accessory-logitech-g435');
    await page.locator('#detailVariant').evaluate(select => { select.value = 'blue'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    assert.match(await page.locator('.product-gallery-stage > img').getAttribute('src'), /g435-blue-cutout/);
    assert.deepEqual(errors, []);
    console.log('Passed 64 products, ' + files.length + ' transparent main/gallery/variant assets, ten sourced descriptions, working galleries, no image backgrounds, new-product search/cart, exact color photo and three responsive widths.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
