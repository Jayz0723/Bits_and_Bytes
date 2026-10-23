const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');
const url = file => pathToFileURL(path.join(root, file)).href;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const errors = [], dialogs = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });
    await page.route(/^https?:/, route => route.abort());
    await page.goto(url('pages/products.html'));
    const card = page.locator('.product-card').first();
    const id = await card.getAttribute('data-product-id');
    await card.locator('[data-wishlist-product]').click();
    await page.locator('#shoppingFeedback.is-visible').waitFor();
    assert.equal(await page.locator('#shoppingFeedback strong').textContent(), 'Saved to your wishlist');
    assert.ok(await page.evaluate(id => getWishlist().includes(id), id));
    assert.ok(await card.locator('[data-wishlist-product]').evaluate(heart => heart.getAnimations().length > 0));
    await card.locator('[data-wishlist-product]').click();
    assert.equal(await page.locator('#shoppingFeedback strong').textContent(), 'Removed from your wishlist');
    assert.equal(await page.evaluate(id => getWishlist().includes(id), id), false);
    await card.locator('[data-add-product]').click();
    assert.equal(await page.locator('#shoppingFeedback strong').textContent(), 'Added to your cart');
    assert.equal(await page.locator('#cartCount').textContent(), '1');
    assert.equal(await page.locator('#shoppingFeedback').count(), 1);
    assert.equal(await page.locator('#shoppingFeedback [role="status"]').getAttribute('aria-live'), 'polite');
    assert.deepEqual(dialogs, [], 'Successful shopping actions do not use blocking alerts');
    await page.locator('.shopping-feedback-close').click();
    await page.locator('#shoppingFeedback').waitFor({ state: 'hidden' });
    await card.locator('[data-product-detail]').click();
    await page.locator('[data-detail-add]').click();
    assert.ok(await page.locator('#productDetailsDialog #shoppingFeedback').isVisible(), 'Confirmation remains visible inside native dialog');
    await page.keyboard.press('Escape');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => showShoppingFeedback('Added to your cart', 'Corsair Vengeance RGB DDR5 32GB - Black', 'cart'));
      await page.locator('#shoppingFeedback.is-visible').waitFor();
      const box = await page.locator('#shoppingFeedback').boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
      assert.ok(await page.locator('#shoppingFeedback').evaluate(element => element.scrollWidth <= element.clientWidth));
      await page.screenshot({ path: path.join(root, 'images/previews/shopping-feedback-' + width + '.png') });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(id => toggleWishlist(id), id);
    assert.equal(await card.locator('[data-wishlist-product]').evaluate(heart => heart.getAnimations().length), 0);
    await page.goto(url('pages/cart.html'));
    await page.evaluate(async () => {
      await registerDemoAccount('Map Tester', 'map-test@example.com', 'test-only-password');
    });
    await page.click('#checkoutButton');
    const map = page.locator('#deliveryGoogleMap');
    const mapLink = page.locator('#deliveryGoogleMapLink');
    assert.match(await map.getAttribute('title'), /Google Maps delivery area/);
    assert.match(await map.getAttribute('src'), /www\.google\.com\/maps\?q=/);
    assert.match(await mapLink.getAttribute('href'), /query=Philippines/);
    assert.ok(await page.getByRole('heading', { name: 'Delivered across the Philippines' }).isVisible());
    assert.deepEqual(await page.locator('.island-legend span').allTextContents(), ['Luzon', 'Visayas', 'Mindanao']);
    await page.selectOption('#provinceSelect', 'Cebu');
    await page.selectOption('#citySelect', 'Cebu City');
    const source = await mapLink.getAttribute('href');
    assert.match(decodeURIComponent(source), /Cebu City, Cebu, Philippines/);
    await page.fill('#streetAddress', 'Private Street 123');
    await page.locator('#streetAddress').dispatchEvent('change');
    assert.equal(await mapLink.getAttribute('href'), source, 'Private street is never included in the Google link');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await map.scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.ok(await map.evaluate(element => element.clientHeight >= 278));
    }
    assert.deepEqual(errors, []);
    console.log('Passed cart/wishlist animations, non-blocking confirmations, quick-view top layer, mobile layouts, reduced motion, map location updates and address privacy.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
