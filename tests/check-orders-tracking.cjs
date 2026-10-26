const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss());
    await page.route(/^https?:/, route => route.abort());
    const cartUrl = pathToFileURL(path.join(root, 'pages/cart.html')).href;
    const trackingUrl = pathToFileURL(path.join(root, 'pages/tracking.html')).href;
    await page.goto(cartUrl);
    await page.evaluate(async () => {
      await registerDemoAccount('Maria Cruz', 'maria@example.com', 'test-only-password');
      const product = catalogProducts().find(product => product.id === 'part-msi-pro-b650-s');
      saveCart([{ ...product, quantity: 1 }]);
    });
    await page.reload();
    await page.click('#checkoutButton');
    assert.equal(await page.locator('#checkoutName').count(), 0, 'No combined full-name field');
    assert.ok(await page.locator('#provinceSelect option').count() >= 84);
    assert.ok(await page.evaluate(() => Object.values(philippineAddresses).reduce((sum, cities) => sum + Object.keys(cities).length, 0)) >= 1600);

    for (const [province, city, expected] of [['Cebu', 'Cebu City', '6000'], ['Cavite', 'Bacoor City', '4102'], ['Benguet', 'Baguio City', '2600']]) {
      await page.selectOption('#provinceSelect', province);
      await page.selectOption('#citySelect', city);
      assert.equal(await page.inputValue('#postalCode'), expected);
      assert.ok(await page.locator('#barangaySelect option').count() > 5);
    }
    await page.selectOption('#provinceSelect', 'Metro Manila');
    assert.equal(await page.inputValue('#postalCode'), '');
    assert.ok(await page.locator('#barangaySelect').isDisabled());
    await page.selectOption('#citySelect', 'Quezon City');
    await page.selectOption('#barangaySelect', 'Holy Spirit');
    assert.equal(await page.inputValue('#postalCode'), '1127');
    await page.selectOption('#barangaySelect', 'Commonwealth');
    assert.equal(await page.inputValue('#postalCode'), '1121');

    async function fillDelivery() {
      await page.fill('#checkoutFirstName', 'Maria Elena');
      await page.fill('#checkoutMiddleName', 'Reyes');
      await page.fill('#checkoutSurname', 'Cruz');
      await page.selectOption('#checkoutSuffix', 'III');
      await page.fill('#checkoutPhone', '09171234567');
      await page.fill('#streetAddress', '123 Example Street');
      await page.selectOption('#provinceSelect', 'Metro Manila');
      await page.selectOption('#citySelect', 'Quezon City');
      await page.selectOption('#barangaySelect', 'Commonwealth');
    }
    await fillDelivery();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(300);
      await page.locator('#deliveryCheckoutForm').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Delivery form fits width ' + width);
      await page.screenshot({ path: path.join(root, 'images/previews/checkout-address-' + width + '.png') });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.check('[name="paymentMethod"][value="E-wallet"]');
    await page.fill('#walletAccountName', 'Maria Cruz');
    await page.fill('#walletMobile', '09171234567');
    await page.click('#reviewOrderButton');
    await page.locator('#samplePaymentQr').evaluate(image => image.decode());
    await page.click('#verifySamplePayment');
    assert.match(await page.locator('#samplePaymentError').textContent(), /Complete the sample payment/);
    assert.equal(await page.evaluate(() => savedStoreOrders().length), 0);
    await page.locator('.provided-gcash-qr img').evaluate(image => image.decode());
    assert.ok(await page.locator('.provided-gcash-qr img').isVisible(), 'Original owner QR is visible without expanding a menu');
    assert.equal(await page.locator('.provided-gcash-qr img').getAttribute('src'), 'images/uploads/gcash-owner-qr.png');
    assert.match(await page.locator('.provided-gcash-qr').textContent(), /cannot verify/);
    assert.match(await page.locator('#paymentRecipient').textContent(), /Maria/);
    assert.equal(await page.locator('#paymentItems li').count(), 1);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const box = await page.locator('#samplePaymentDialog').boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
      assert.ok(await page.locator('#samplePaymentDialog').evaluate(element => element.scrollWidth <= element.clientWidth));
      await page.locator('.provided-gcash-qr img').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(root, 'images/previews/gcash-qr-' + width + '.png') });
    }
    await page.click('#completeSamplePayment');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => savedStoreOrders().length), 0, 'Cancel does not create an order');
    assert.equal(await page.evaluate(() => getCart().length), 1, 'Cancel retains the cart');

    const checks = await page.evaluate(() => {
      const total = getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
      const order = { id: 'TEST', accountEmail: getSignedInUser().email, total, paymentMethod: 'GCash', items: [], recipient: {}, address: {} };
      const attempt = { order, cartSignature: cartSignature(), expiresAt: Date.now() + 10000, receipt: { status: 'paid', orderId: 'TEST', amount: total, provider: 'GCash' } };
      const valid = samplePaymentProblem(attempt);
      const expired = samplePaymentProblem({ ...attempt, expiresAt: Date.now() - 1 });
      const amount = samplePaymentProblem({ ...attempt, receipt: { ...attempt.receipt, amount: 1 } });
      const reference = samplePaymentProblem({ ...attempt, receipt: { ...attempt.receipt, orderId: 'OTHER' } });
      const changedCart = samplePaymentProblem({ ...attempt, cartSignature: 'changed' });
      const otherAccount = samplePaymentProblem({ ...attempt, order: { ...order, accountEmail: 'someone@example.com' } });
      const setItem = Storage.prototype.setItem;
      let storageError = false;
      try {
        Storage.prototype.setItem = function (key, value) { if (key === storeOrdersKey) throw new Error('Storage full'); return setItem.call(this, key, value); };
        recordSampleOrder(attempt);
      } catch { storageError = getCart().length === 1 && savedStoreOrders().length === 0; }
      finally { Storage.prototype.setItem = setItem; }
      return { valid, expired, amount, reference, changedCart, otherAccount, storageError };
    });
    assert.equal(checks.valid, '');
    for (const key of ['expired', 'amount', 'reference', 'changedCart', 'otherAccount']) assert.ok(checks[key], key + ' is rejected');
    assert.ok(checks.storageError, 'Storage failure does not clear cart or claim success');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.click('#reviewOrderButton');
    await page.click('#completeSamplePayment');
    await page.click('#verifySamplePayment');
    await page.waitForSelector('#checkoutSuccess:not([hidden])');
    assert.match(await page.locator('#checkoutSuccess h2').textContent(), /You are all set/);
    assert.ok(await page.locator('.checkout-success-mark').evaluate(element => element.getAnimations().length > 0));
    await page.screenshot({ path: path.join(root, 'images/previews/checkout-all-set.png') });
    assert.equal(await page.evaluate(() => savedStoreOrders().length), 1);
    assert.equal(await page.evaluate(() => getCart().length), 0);
    const order = await page.evaluate(() => savedStoreOrders()[0]);
    assert.equal(order.recipient.firstName, 'Maria Elena');
    assert.equal(order.recipient.surname, 'Cruz');
    assert.equal(order.paymentStatus, 'Sample payment verified');
    assert.equal(order.address.postalCode, '1121');
    assert.ok(!JSON.stringify(order).includes('walletAccountName'));
    assert.ok(await page.locator('#checkoutReceipt .order-receipt').isVisible());
    await page.click('#continueToTracking');
    await page.waitForURL(url => url.pathname.endsWith('/pages/tracking.html'), { timeout: 10000 });
    assert.equal(await page.locator('#trackingCurrentStatus').textContent(), 'Order recorded');
    assert.equal(await page.locator('#trackingItems .tracking-product').count(), 1);
    assert.match(await page.locator('#trackingRecipient').textContent(), /Maria Elena Reyes Cruz III/);
    assert.equal(await page.locator('[aria-current="step"]').count(), 1);
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(root, 'images/previews/tracking-' + width + '.png') });
    }
    for (let step = 1; step < 5; step++) await page.click('#advanceSampleDelivery');
    assert.equal(await page.locator('#trackingCurrentStatus').textContent(), 'Delivered');
    assert.ok(await page.locator('#advanceSampleDelivery').isDisabled());
    await page.reload();
    assert.equal(await page.locator('#trackingCurrentStatus').textContent(), 'Delivered');
    await page.fill('#trackingReference', 'BB-NOT-AN-ORDER');
    await page.locator('#trackingLookup button').click();
    assert.ok(await page.locator('#trackingOrder').isHidden());
    assert.match(await page.locator('#trackingMessage').textContent(), /not found/);
    await page.evaluate(() => registerDemoAccount('Other Person', 'other@example.com', 'another-test-password'));
    await page.goto(trackingUrl + '?order=' + order.id);
    assert.ok(await page.locator('#trackingOrder').isHidden(), 'Another account cannot view the order');
    assert.equal(await page.locator('#trackingAddress').textContent(), '');
    await page.evaluate(() => { sessionStorage.removeItem('bitsAndBytesSignedInEmail'); window.dispatchEvent(new Event('store-account-change')); });
    assert.ok(await page.locator('#trackingSignIn').isVisible());

    await page.evaluate(async () => {
      await signInDemoAccount('maria@example.com', 'test-only-password');
      saveCart([{ ...catalogProducts()[0], quantity: 1 }]);
    });
    await page.goto(cartUrl);
    await page.click('#checkoutButton');
    await fillDelivery();
    await page.click('#reviewOrderButton');
    assert.ok(await page.locator('#completeSamplePayment').isHidden());
    await page.click('#verifySamplePayment');
    await page.waitForSelector('#checkoutSuccess:not([hidden])');
    assert.equal(await page.evaluate(() => savedStoreOrders()[0].paymentStatus), 'Due on delivery', 'COD is never marked paid');
    assert.equal(await page.evaluate(() => savedStoreOrders().length), 2);
    await page.locator('.payment-dialog-close').click();
    assert.deepEqual(errors, []);
    console.log('Passed split names, nationwide addresses, area postal suggestions, GCash QR, payment guards, cancellation/storage failure, success receipt, tracking navigation, persistent sample delivery, account isolation, and COD.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
