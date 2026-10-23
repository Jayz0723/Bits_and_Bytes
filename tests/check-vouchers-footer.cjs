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
    await page.route(/^https?:/, route => route.abort());
    const cartUrl = pathToFileURL(path.join(root, 'pages/cart.html')).href;
    await page.goto(cartUrl);
    await page.evaluate(async () => {
      await registerDemoAccount('Voucher Tester', 'voucher@example.com', 'test-only-password');
      const product = catalogProducts().find(item => item.price >= 10000 && item.price < 50000);
      saveCart([{ ...product, quantity: 1 }]);
      renderCart();
    });
    const rules = await page.evaluate(() => {
      const cart = price => [{ price, quantity: 1 }];
      return {
        minimum: evaluateCartVoucher(cart(4999), 'WELCOME10'),
        valid: evaluateCartVoucher(cart(5000), ' welcome10 '),
        capped: evaluateCartVoucher(cart(50000), 'WELCOME10'),
        fixed: evaluateCartVoucher(cart(10000), 'SAVE500'),
        invalid: evaluateCartVoucher(cart(50000), '__proto__'),
        empty: evaluateCartVoucher([], 'WELCOME10')
      };
    });
    assert.ok(rules.minimum.error);
    assert.equal(rules.valid.discount, 500);
    assert.equal(rules.capped.discount, 1500);
    assert.equal(rules.fixed.discount, 500);
    assert.ok(rules.invalid.error && rules.empty.error);
    await page.fill('#voucherCode', 'welcome10');
    await page.locator('#voucherCode').press('Enter');
    let pricing = await page.evaluate(() => checkoutPricing());
    assert.equal(pricing.discount, Math.min(Math.round(pricing.subtotal * 10) / 100, 1500));
    assert.ok(await page.locator('#cartDiscountRow').isVisible());
    await page.reload();
    assert.equal(await page.locator('#activeVoucherCode').textContent(), 'WELCOME10');
    await page.fill('#voucherCode', 'NOTREAL');
    await page.locator('#voucherCode').press('Enter');
    assert.equal(await page.evaluate(() => selectedVoucherCode()), 'WELCOME10', 'Invalid replacement preserves applied voucher');
    assert.match(await page.locator('#voucherStatus').textContent(), /not recognized/);
    await page.fill('#voucherCode', 'SAVE500');
    await page.locator('#voucherCode').press('Enter');
    pricing = await page.evaluate(() => checkoutPricing());
    assert.equal(pricing.discount, 500, 'Vouchers replace each other rather than stack');
    assert.equal(pricing.total, pricing.subtotal - 500 + 150);
    await page.click('#checkoutButton');
    await page.check('[name="deliveryService"][value="express"]');
    assert.equal(await page.evaluate(() => checkoutPricing().total), pricing.subtotal - 500 + 300);
    await page.selectOption('#countryRegion', 'Japan');
    assert.equal(await page.evaluate(() => checkoutPricing().total), pricing.subtotal - 500 + 2700);
    await page.check('[name="fulfillmentMethod"][value="pickup"]');
    assert.equal(await page.evaluate(() => checkoutPricing().total), pricing.subtotal - 500);
    await page.fill('#checkoutFirstName', 'Voucher');
    await page.fill('#checkoutSurname', 'Tester');
    await page.fill('#checkoutPhone', '09171234567');
    await page.check('[name="paymentMethod"][value="Cash on Delivery"]');
    await page.click('#reviewOrderButton');
    assert.match(await page.locator('#sampleDeliveryBreakdown').textContent(), /SAVE500/);
    // Discount changes invalidate an in-progress payment, even before confirmation.
    const staleProblem = await page.evaluate(() => {
      const pricing = checkoutPricing();
      const attempt = { cartSignature: cartSignature(), expiresAt: Date.now() + 10000, order: { accountEmail: getSignedInUser().email, subtotal: pricing.subtotal, discount: pricing.discount, voucher: { code: 'SAVE500', discount: 500 }, delivery: pricing.delivery, total: pricing.total, paymentMethod: 'Pay at pickup' } };
      saveVoucherCode('WELCOME10');
      const problem = samplePaymentProblem(attempt);
      saveVoucherCode('SAVE500');
      return problem;
    });
    assert.match(staleProblem, /voucher has changed/);
    await page.click('#verifySamplePayment');
    await page.locator('#checkoutSuccess:not([hidden])').waitFor();
    const order = await page.evaluate(() => savedStoreOrders()[0]);
    assert.equal(order.discount, 500);
    assert.equal(order.voucher.code, 'SAVE500');
    assert.equal(order.total, order.subtotal - 500);
    assert.match(await page.locator('#checkoutReceipt').textContent(), /Voucher SAVE500/);
    assert.equal(await page.evaluate(() => selectedVoucherCode()), '');
    await page.locator('.payment-dialog-close').click();
    await page.evaluate(() => {
      saveCart([{ ...catalogProducts().find(item => item.price < 5000), quantity: 1 }]);
      saveVoucherCode('WELCOME10'); renderCart();
    });
    assert.equal(await page.evaluate(() => checkoutPricing().discount), 0);
    assert.match(await page.locator('#voucherStatus').textContent(), /requires an items subtotal/);
    await page.click('#removeVoucher');
    assert.equal(await page.evaluate(() => selectedVoucherCode()), '');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('#voucherForm').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(root, 'images/previews/vouchers-' + width + '.png') });
      await page.locator('.footer-legal').scrollIntoViewIfNeeded();
      const privacy = page.locator('.footer-legal a[href="pages/privacy.html"]');
      await privacy.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await privacy.hover();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.footer-legal a[href="pages/privacy.html"]'), '::after').transform === 'matrix(1, 0, 0, 1, 0, 0)');
      assert.equal(await privacy.evaluate(node => getComputedStyle(node, '::after').transform), 'matrix(1, 0, 0, 1, 0, 0)');
      assert.equal(await privacy.evaluate(node => getComputedStyle(node, '::after').transformOrigin.split(' ')[0]), '0px');
      assert.equal(await page.locator('.site-footer a[href="pages/terms.html"]').count(), 1);
      assert.equal(await page.locator('.site-footer a[href="pages/privacy.html"]').count(), 1);
      await page.screenshot({ path: path.join(root, 'images/previews/footer-dividers-' + width + '.png') });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.footer-legal a').first().evaluate(node => getComputedStyle(node, '::after').transitionDuration), '0s');
    assert.deepEqual(errors, []);
    console.log('Passed voucher validation, minimums/caps, case normalization, replacement/removal, persistence, delivery/express/overseas/pickup totals, payment-change rejection, saved discounts/receipts, empty/ineligible carts, footer links/dividers/underline, reduced motion and four responsive widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
