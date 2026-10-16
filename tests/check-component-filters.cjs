// Check component categories against catalog data, including new products and photos.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss());
    await page.route(/^https?:/, route => route.abort());
    const catalogUrl = pathToFileURL(path.join(root, 'pages/products.html')).href;
    await page.goto(catalogUrl);
    const catalog = await page.evaluate(() => catalogProducts());
    assert.equal(catalog.length, 50, 'Nine more models retain all forty-one existing products');
    const categories = await page.evaluate(() => computerPartCategories);
    for (const product of catalog.filter(product => product.type === 'Computer Part')) {
      assert.ok(categories.some(category => category.id === product.partCategory), product.name + ' has a component category');
    }
    assert.equal(await page.locator('#partTypeOptions option').count(), categories.length);
    for (const category of categories) {
      await page.selectOption('#typeFilter', 'part:' + category.id);
      const actual = await page.locator('.product-card').evaluateAll(cards => cards.map(card => card.dataset.productId).sort());
      const expected = catalog.filter(product => product.type === 'Computer Part' && product.partCategory === category.id).map(product => product.id).sort();
      assert.ok(expected.length > 0, category.label + ' has stock');
      assert.deepEqual(actual, expected, category.label + ' returns exactly its parts');
      assert.equal(await page.locator('[data-catalog-type="Computer Part"]').getAttribute('aria-pressed'), 'true');
    }
    await page.selectOption('#typeFilter', 'part:ram');
    await page.check('[data-brand-filter][value="Corsair"]');
    assert.equal(await page.locator('.product-card').count(), 1);
    const ram = page.locator('[data-product-id="part-corsair-vengeance-32"]');
    assert.match(await ram.locator('.product-photo-capacity').innerText(), /32GB.*2 x 16GB/s);
    await ram.locator('[data-add-product]').click();
    assert.ok(await page.evaluate(() => getCart().some(product => product.id === 'part-corsair-vengeance-32' && product.photoCapacity === '32GB')));
    await page.click('#resetFilters');
    await page.selectOption('#typeFilter', 'part:storage');
    await page.fill('#productSearch', 'samsung 1tb');
    assert.equal(await page.locator('.product-card').count(), 1);
    assert.match(await page.locator('.product-photo-capacity').innerText(), /1TB/);
    await page.click('#resetFilters');
    assert.equal(await page.locator('.product-card').count(), catalog.length);

    const previousAdditionIds = ['lap-dell-latitude-5440', 'lap-dell-g15-5530', 'pc-hp-pro-mini-400-g9', 'part-corsair-4000d', 'part-corsair-ml120-red', 'part-corsair-vengeance-32', 'part-msi-b760-gaming-plus', 'part-msi-4070-super', 'part-samsung-990-pro-1tb', 'accessory-logitech-g502', 'accessory-logitech-g435'];
    const additions = catalog.filter(product => previousAdditionIds.includes(product.id));
    assert.equal(additions.length, previousAdditionIds.length);
    const photos = await page.evaluate(ids => catalogProducts().filter(product => ids.includes(product.id)).flatMap(product => [product.image, ...productGallery(product).map(view => view.src)]), additions.map(product => product.id));
    const broken = await page.evaluate(async sources => {
      return (await Promise.all([...new Set(sources)].map(src => new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(image.naturalWidth >= 500 ? null : src);
        image.onerror = () => resolve(src);
        image.src = src;
      })))).filter(Boolean);
    }, photos);
    assert.deepEqual(broken, [], 'Every new product and gallery photo loads clearly');
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(catalogUrl + '?part=ram');
      assert.equal(await page.locator('#typeFilter').inputValue(), 'part:ram');
      if (width < 761) await page.click('#toggleFilters');
      await page.selectOption('#typeFilter', 'part:case');
      if (width < 761) await page.click('#toggleFilters');
      assert.equal(await page.locator('.product-card').count(), catalog.filter(product => product.partCategory === 'case').length);
      await page.locator('#computer-parts').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(root, 'images/previews/component-case-' + width + '.png') });
    }
    await page.goto(pathToFileURL(path.join(root, 'pages/product.html')).href + '?id=part-samsung-990-pro-1tb');
    assert.equal(await page.locator('#detailPhotoCapacity .product-photo-capacity').innerText(), '1TB');
    assert.deepEqual(errors, []);
    console.log('Passed 50 products, all 9 component filters, brand/search combinations, capacity labels, product photos, cart persistence, URL filters, and desktop/mobile layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
