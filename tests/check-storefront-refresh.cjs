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
    await page.goto(url('index.html'));
    assert.equal(await page.locator('.hero-grid a').count(), 6);
    await page.locator('.hero-grid img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.store-skip-link').evaluate(link => link === document.activeElement), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('main').evaluate(main => main === document.activeElement), true);
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('.showcase-hero').evaluate(section => window.scrollTo(0, section.getBoundingClientRect().top + scrollY - 170));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(root, `images/previews/refreshed-collections-${width}.png`) });
    }
    await page.locator('.hero-grid a[href*="type=Laptop"]').click();
    await page.waitForURL('**/pages/products.html?type=Laptop');
    await page.waitForLoadState('domcontentloaded');
    assert.equal(await page.locator('#typeFilter').inputValue(), 'Laptop');
    assert.equal(await page.locator('.catalog-filter-chip').count(), 1);
    await page.getByRole('button', { name: 'Remove filter: Laptops', exact: true }).click();
    const total = await page.evaluate(() => catalogProducts().length);
    assert.equal(await page.locator('.product-card').count(), total);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-catalog-type="Monitor"]').click();
    assert.match(await page.locator('#typeFilterTrigger').textContent(), /Monitors/);
    await page.locator('.catalog-brand-search').fill('samsung');
    assert.equal(await page.locator('.brand-filter-option:not([hidden])').count(), 1);
    await page.locator('[data-brand-filter][value="Samsung"]').check();
    assert.equal(await page.locator('.catalog-filter-chip').count(), 2);
    await page.getByRole('button', { name: 'Remove filter: Samsung', exact: true }).click();
    assert.equal(await page.locator('[data-brand-filter][value="Samsung"]').isChecked(), false);
    await page.locator('#productSearch').fill('not-a-real-product-12345');
    assert.equal(await page.locator('#catalogEmpty').isVisible(), true);
    await page.getByRole('button', { name: 'Show all products', exact: true }).click();
    assert.equal(await page.locator('.product-card').count(), total);
    assert.equal(await page.locator('.catalog-brand-search').inputValue(), '');
    assert.equal(await page.locator('.catalog-active-filters').isVisible(), false);
    await page.locator('#minPrice').fill('5000');
    await page.locator('#maxPrice').fill('50000');
    await page.locator('#inStockFilter').check();
    assert.equal(await page.locator('.catalog-filter-chip').count(), 3);
    await page.locator('#resetFilters').click();
    assert.equal(await page.locator('.product-card').count(), total);
    await page.locator('.product-card [data-product-color]').first().click();
    const card = page.locator('.product-card').first();
    await card.locator('[data-add-product]').click();
    assert.equal(await page.evaluate(() => getCart().reduce((sum, item) => sum + item.quantity, 0)), 1);
    await card.locator('[data-wishlist-product]').click();
    assert.equal(await page.evaluate(() => getWishlist().length), 1);
    await card.locator('[data-product-detail]').click();
    assert.equal(await page.locator('#productDetailsDialog').isVisible(), true);
    await page.keyboard.press('Escape');
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const view of ['list', 'grid']) {
        await page.locator(`[name="catalogView"][value="${view}"]`).check();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width} in ${view} view`);
      }
    }
    await page.locator('#toggleFilters').click();
    assert.equal(await page.locator('#filterControls').isVisible(), true);
    await page.locator('#typeFilterTrigger').click();
    await page.locator('#typeFilterOptions').getByRole('option', { name: /Laptops/ }).click();
    await page.locator('#toggleFilters').click();
    assert.equal(await page.locator('#filterControls').isVisible(), false);
    assert.equal(await page.locator('.catalog-filter-chip').count(), 1);
    await page.locator('.product-card').first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'images/previews/refreshed-products-mobile.png') });
    await page.locator('.product-name-button').first().click();
    await page.waitForURL('**/pages/product.html?**');
    await page.waitForLoadState('domcontentloaded');
    assert.equal(await page.locator('#productOverview').isVisible(), true);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log('Passed main storefront: collection photos/links, filter chips, brand search, reset, category menus, grid/list mobile layouts, cart, wishlist, Quick View, and details.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
