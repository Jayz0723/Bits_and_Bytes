const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');
const ids = ['lap-msi-modern-14-c13m', 'lap-msi-cyborg-15-a13v', 'lap-dell-16-plus', 'pc-msi-codex-6-14', 'monitor-msi-274qrf-qd-e2', 'part-msi-pro-b650-s', 'part-msi-4060-ti-gaming-x', 'part-corsair-3000d', 'accessory-corsair-k65-plus'];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss());
    await page.route(/^https?:/, route => route.abort());
    const catalogUrl = pathToFileURL(path.join(root, 'pages/products.html')).href;
    const detailUrl = pathToFileURL(path.join(root, 'pages/product.html')).href;
    await page.goto(catalogUrl);
    const catalog = await page.evaluate(() => catalogProducts());
    assert.equal(catalog.length, 64);
    assert.equal(new Set(catalog.map(product => product.id)).size, 64, 'No duplicate product IDs');
    const additions = catalog.filter(product => ids.includes(product.id));
    assert.equal(additions.length, 9);
    const photos = await page.evaluate(() => catalogProducts().flatMap(product => [product.image, ...(product.gallery || []).map(photo => photo.src)]));
    const broken = await page.evaluate(async sources => (await Promise.all([...new Set(sources)].map(src => new Promise(resolve => {
      const photo = new Image();
      photo.onload = () => resolve(photo.naturalWidth >= 400 ? null : src);
      photo.onerror = () => resolve(src);
      photo.src = src;
    })))).filter(Boolean), photos);
    assert.deepEqual(broken, [], 'All catalog photos load locally at useful resolution');
    for (const product of additions) {
      await page.fill('#productSearch', product.name);
      const card = page.locator('[data-product-id="' + product.id + '"]');
      await card.locator('img').first().evaluate(image => image.decode());
      await card.locator('[data-product-detail]').click();
      assert.equal(await page.locator('dialog[open]').count(), 1);
      await page.keyboard.press('Escape');
      await card.locator('[data-wishlist-product]').click();
      await card.locator('[data-add-product]').click();
    }
    await page.reload();
    assert.equal(await page.evaluate(() => getCart().length), 9);
    assert.equal(await page.evaluate(() => getWishlist().length), 9);
    for (const product of additions) {
      await page.goto(detailUrl + '?id=' + product.id);
      assert.equal(await page.locator('#detailProductName').textContent(), product.name);
      const views = await page.evaluate(id => productGallery(catalogProducts().find(product => product.id === id)), product.id);
      assert.ok(views.some(view => view.shortLabel === 'Close-up'));
      assert.ok(new Set(views.map(view => view.src)).size >= 2, 'Every new product has multiple real photos');
      for (let index = 0; index < views.length; index++) {
        await page.locator('#productGalleryThumbnails button').nth(index).click();
        await page.locator('#detailProductImage').evaluate(image => image.decode());
        assert.equal(await page.locator('#detailProductImage').getAttribute('src'), views[index].src);
      }
    }
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(catalogUrl + '?part=motherboard');
      await page.locator('#computer-parts').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(root, 'images/previews/expanded-motherboards-' + width + '.png') });
      await page.goto(detailUrl + '?id=lap-dell-16-plus');
      await page.locator('#detailProductImage').evaluate(image => image.decode());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(root, 'images/previews/dell-16-plus-' + width + '.png') });
    }
    assert.deepEqual(errors, []);
    console.log('Passed 64 unique products, every catalog photo, all nine existing expansion galleries, retained close-ups, quick views, wishlist/cart persistence, and responsive browsing.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
