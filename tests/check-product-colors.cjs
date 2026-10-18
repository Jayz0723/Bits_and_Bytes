const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');
const url = file => pathToFileURL(path.join(root, file)).href;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    await page.goto(url('pages/products.html'));
    const families = await page.evaluate(() => catalogProducts().filter(product => product.variants?.kind === 'color').map(product => ({ id: product.id, variants: product.variants.options.map(option => ({ id: option.id, label: option.label, image: option.image, gallery: productGallery(productWithVariant(product, option.id)) })) })));
    assert.equal(families.length, 5);
    let colors = 0;
    for (const family of families) {
      await page.goto(url('pages/product.html') + '?id=' + family.id);
      for (const variant of family.variants) {
        await page.locator('#detailVariants [data-product-color="' + variant.id + '"]').click();
        assert.equal(await page.locator('#detailVariants [aria-pressed="true"]').count(), 1);
        assert.equal(await page.locator('#detailVariants [data-selected-color]').textContent(), variant.label);
        assert.ok(page.url().includes('variant=' + variant.id));
        assert.match(await page.locator('#detailProductName').textContent(), new RegExp(variant.label));
        assert.equal(await page.locator('#detailBreadcrumb').textContent(), await page.locator('#detailProductName').textContent());
        assert.equal(await page.locator('#configSummaryImage').getAttribute('alt'), await page.locator('#detailProductName').textContent());
        assert.equal(await page.locator('#detailProductImage').getAttribute('src'), variant.gallery[0].src);
        for (const [index, photo] of variant.gallery.entries()) {
          await page.locator('#productGalleryThumbnails button').nth(index).click();
          assert.equal(await page.locator('#detailProductImage').getAttribute('src'), photo.src);
          await page.locator('#detailProductImage').evaluate(image => { image.loading = 'eager'; return image.decode(); });
          assert.equal(await page.locator('#detailProductImage').evaluate(image => getComputedStyle(image).filter), 'none', 'Real photos are not CSS recolors');
        }
        colors++;
      }
      await page.reload();
      assert.equal(await page.locator('#detailVariant').inputValue(), family.variants.at(-1).id);
    }
    assert.equal(colors, 13);
    await page.goto(url('pages/products.html'));
    let card = page.locator('[data-product-id="part-corsair-3000d"]');
    await card.locator('[data-product-color="white"]').click();
    assert.match(await card.locator('img').first().getAttribute('src'), /3000d-white/);
    await card.locator('[data-wishlist-product]').click();
    assert.match(await card.locator('img').first().getAttribute('src'), /3000d-white/, 'Saving a favorite keeps the chosen finish');
    await card.locator('[data-product-detail]').click();
    assert.equal(await page.locator('#quickViewVariant').inputValue(), 'white');
    await page.locator('#productDetailsDialog [data-product-color="black"]').click();
    assert.equal(await page.locator('#quickViewVariant').inputValue(), 'black');
    assert.match(await page.locator('.product-detail-photo img').getAttribute('src'), /corsair-3000d-1/);
    await page.keyboard.press('Escape');
    await card.locator('[data-add-product]').click();
    await card.locator('[data-product-color="black"]').click();
    await card.locator('[data-add-product]').click();
    await page.goto(url('pages/cart.html'));
    const cart = await page.evaluate(() => getCart());
    assert.equal(cart.length, 2);
    assert.equal(cart.find(item => item.variantId === 'white').image, 'images/products/colors/corsair-3000d-white-1.webp');
    assert.equal(cart.find(item => item.variantId === 'black').image, 'images/products/corsair-3000d-1.webp');
    await page.reload();
    assert.equal(await page.locator('.cart-item').count(), 2);
    await page.evaluate(async () => registerDemoAccount('Color Shopper', 'color@example.com', 'test-only-password'));
    await page.click('#checkoutButton');
    await page.fill('#checkoutFirstName', 'Color');
    await page.fill('#checkoutSurname', 'Shopper');
    await page.fill('#checkoutPhone', '09171234567');
    await page.fill('#streetAddress', '123 Sample Street');
    await page.selectOption('#provinceSelect', 'Metro Manila');
    await page.selectOption('#citySelect', 'Quezon City');
    await page.selectOption('#barangaySelect', 'Commonwealth');
    await page.click('#reviewOrderButton');
    await page.click('#verifySamplePayment');
    await page.locator('#checkoutSuccess').waitFor({ state: 'visible' });
    await page.click('#continueToTracking');
    await page.locator('#trackingOrder').waitFor({ state: 'visible' });
    const order = await page.evaluate(() => accountStoreOrders()[0]);
    assert.equal(order.items.find(item => item.variantId === 'white').image, 'images/products/colors/corsair-3000d-white-1.webp');
    assert.ok(await page.locator('#trackingItems a[href*="variant=white"]').count());
    await page.goto(url('pages/profile.html') + '#orders');
    assert.ok(await page.locator('#profileOrders a[href*="variant=white"]').count());
    await page.goto(url('pages/product.html') + '?id=lap-apple-creator&variant=starlight');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const button = page.locator('#detailVariants [data-product-color="silver"]');
      await button.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#detailVariant').inputValue(), 'silver');
      const box = await button.boundingBox();
      assert.equal(Math.round(box.width), 34);
      assert.equal(Math.round(box.height), 34);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: path.join(root, 'images/previews/product-colors-' + width + '.png') });
    }
    assert.deepEqual(errors, []);
    console.log('Passed 13 real-photo finishes across five models, color-specific galleries, catalog/quick-view switching, separate cart colors, reload, order/tracking color snapshots, keyboard swatches, and responsive layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
