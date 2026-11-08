// Exercise history across both editions and verify shopping data is never changed.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');
const url = file => pathToFileURL(path.join(root, file)).href;
const key = 'bitsAndBytesRecentlyViewedV1';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    await page.goto(url('index.html'));
    assert.equal(await page.locator('.recent-products').isVisible(), false);
    const fixtures = await page.evaluate(() => catalogProducts().slice(0, 6).map(item => ({ id: item.id,
      variants: item.variants?.options.map(option => option.id) || [] })));
    const before = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([name]) => /cart|wishlist/i.test(name))));
    for (const fixture of fixtures) {
      await page.goto(url('pages/product.html') + '?id=' + fixture.id);
    }
    assert.equal(await page.locator('.recent-products-card').count(), fixtures.length);
    await page.goto(url('pages/product.html') + '?id=' + fixtures[0].id);
    assert.equal(await page.locator('.recent-products-card').count(), fixtures.length, 'Repeated visits do not create duplicates');
    const variantProduct = fixtures.find(fixture => fixture.variants.length > 1);
    assert.ok(variantProduct);
    await page.goto(url('pages/product.html') + '?id=' + variantProduct.id);
    await page.locator('#detailVariant').selectOption(variantProduct.variants[1], { force: true });
    const first = page.locator('.recent-products-link').first();
    assert.ok((await first.getAttribute('href')).includes('variant=' + variantProduct.variants[1]));
    const selectedImage = await page.locator('#detailProductImage').getAttribute('src');
    assert.ok((await first.locator('img').getAttribute('src')).endsWith(selectedImage));
    const history = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    const after = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([name]) => /cart|wishlist/i.test(name))));
    assert.deepEqual(after, before, 'Viewing history does not alter the cart or wishlist');

    for (const file of ['index.html', 'pages/products.html', 'frontend-html/index.html', 'frontend-html/pages/products.html']) {
      await page.goto(url(file));
      assert.equal(await page.locator('.recent-products-card').count(), history.length, file + ' shares history');
      await page.locator('.recent-products img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
      assert.equal(await first.locator('h3').textContent(), history[0].name);
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator('.recent-products').scrollIntoViewIfNeeded();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), file + ' has no horizontal overflow');
      }
    }
    await page.locator('.recent-products').screenshot({ path: path.join(root, 'images/previews/recently-viewed-mobile.png') });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('.recent-products').evaluate(section => window.scrollTo(0, section.getBoundingClientRect().top + scrollY - 160));
    await page.locator('.recent-products').screenshot({ path: path.join(root, 'images/previews/recently-viewed-desktop.png') });
    await page.getByRole('button', { name: 'Next recently viewed products', exact: true }).click();
    await page.waitForTimeout(600);
    assert.ok(await page.locator('.recent-products-list').evaluate(list => list.scrollLeft > 0));
    await first.click();
    await page.waitForURL('**/pages/product.html?**');
    await page.waitForLoadState('domcontentloaded');
    assert.equal(await page.locator('#detailVariant').inputValue(), variantProduct.variants[1]);
    await page.locator('.recent-products-remove').first().click();
    assert.equal(await page.locator('.recent-products-card').count(), history.length - 1);
    await page.getByRole('button', { name: 'Clear recently viewed history' }).click();
    assert.equal(await page.locator('.recent-products-card').count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'recentProductsTitle');
    await page.reload();
    // Reloading a detail page intentionally remembers that new visit.
    assert.equal(await page.locator('.recent-products-card').count(), 1);
    await page.goto(url('frontend-html/index.html'));
    await page.getByRole('button', { name: 'Clear recently viewed history' }).click();
    await page.reload();
    assert.equal(await page.locator('.recent-products').isVisible(), false);
    await page.evaluate(storageKey => localStorage.setItem(storageKey, '{broken'), key);
    await page.reload();
    assert.equal(await page.locator('.recent-products').isVisible(), false);
    await page.evaluate(({ storageKey, item }) => localStorage.setItem(storageKey, JSON.stringify([
      { ...item, viewedAt: Date.now() - 31 * 86400000 },
      { ...item, image: 'javascript:alert(1)' },
      { ...item, id: '<script>' }
    ])), { storageKey: key, item: history[0] });
    await page.reload();
    assert.equal(await page.locator('.recent-products-card').count(), 0, 'Expired and malformed data is ignored');
    await page.goto(url('pages/products.html'));
    await page.locator('[data-product-detail]').first().click();
    assert.equal(await page.locator('#productDetailsDialog').isVisible(), true);
    assert.equal(await page.locator('.recent-products-card').count(), 1, 'Quick View is remembered');
    await page.locator('#quickViewVariant').selectOption({ index: 1 }, { force: true });
    const quickVariant = await page.locator('#quickViewVariant').inputValue();
    assert.ok((await first.getAttribute('href')).includes('variant=' + quickVariant));
    await page.locator('.product-dialog-close').click();
    assert.equal(await page.locator('#productDetailsDialog').isVisible(), false);
    await page.evaluate(({ storageKey, item }) => localStorage.setItem(storageKey, JSON.stringify(
      Array.from({ length: 18 }, (_, index) => ({ ...item, id: 'stored-' + index, viewedAt: Date.now() }))
    )), { storageKey: key, item: history[0] });
    await page.goto(url('frontend-html/index.html'));
    assert.equal(await page.locator('.recent-products-card').count(), 12, 'History is capped at twelve cards');
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => {
      // Limit this fault injection to the new feature, outside the support iframe.
      if (window !== window.top) return;
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
    });
    const blockedPage = await blocked.newPage();
    blockedPage.on('pageerror', error => errors.push(error.message));
    await blockedPage.route(/^https?:/, route => route.abort());
    await blockedPage.goto(url('frontend-html/index.html'));
    assert.equal(await blockedPage.locator('.recent-products').isVisible(), false);
    await blocked.close();
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log('Recently viewed passed in both editions: variants, persistence, deduplication, images, mobile layout, controls, and storage isolation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
