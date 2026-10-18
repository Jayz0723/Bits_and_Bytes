const assert = require('node:assert/strict');
const path = require('node:path');
const { once } = require('node:events');
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  const server = createStoreServer(':memory:');
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'www.google.com' && url.pathname === '/maps') return route.fulfill({ contentType: 'text/html', body: '<p>Google Maps test frame</p>' });
      return url.origin === origin ? route.continue() : route.abort();
    });
    await page.goto(origin + '/pages/cart.html');
    await page.evaluate(async () => {
      await storeDatabase.ready;
      await registerDemoAccount('Receipt Tester', 'receipt@example.com', 'test-only-password');
      saveCart([{ ...catalogProducts()[0], quantity: 2 }]); renderCart();
    });
    await page.click('#checkoutButton');
    await page.fill('#checkoutFirstName', 'Receipt'); await page.fill('#checkoutSurname', 'Tester'); await page.fill('#checkoutPhone', '09171234567');
    assert.ok(await page.locator('#deliveryGoogleMap').isVisible());
    assert.match(await page.locator('#deliveryGoogleMap').getAttribute('src'), /www\.google\.com\/maps\?q=/);
    await page.fill('#streetAddress', '12 Example Avenue');
    assert.equal(await page.inputValue('#checkoutFirstName'), 'Receipt');
    await page.check('[name="fulfillmentMethod"][value="pickup"]');
    assert.equal(await page.evaluate(() => selectedDeliveryRate().fee), 0);
    assert.ok(await page.locator('#storePickupDetails').isVisible());
    assert.match(await page.locator('#deliveryGoogleMapLink').getAttribute('href'), /14\.2119/);
    assert.match(await page.locator('#deliveryGoogleMap').getAttribute('src'), /14\.2119/);
    await page.check('[name="fulfillmentMethod"][value="delivery"]');
    assert.equal(await page.inputValue('#streetAddress'), '12 Example Avenue');
    assert.equal(await page.locator('#streetAddress').isDisabled(), false);
    await page.check('[name="fulfillmentMethod"][value="pickup"]');
    assert.ok(await page.locator('#streetAddress').isDisabled());
    assert.equal(await page.locator('#deliveryCheckoutForm').evaluate(form => form.reportValidity()), true);
    await page.click('#reviewOrderButton');
    await page.click('#verifySamplePayment');
    await page.locator('#checkoutSuccess:not([hidden])').waitFor();
    let order = await page.evaluate(() => savedStoreOrders()[0]);
    assert.equal(order.delivery.method, 'pickup');
    assert.equal(order.paymentMethod, 'Pay at pickup');
    assert.equal(order.paymentStatus, 'Due at pickup');
    assert.equal(order.total, order.subtotal);
    assert.match(await page.locator('#checkoutReceipt').textContent(), /Due at pickup/);
    await page.waitForTimeout(2800);
    assert.ok(page.url().endsWith('/pages/cart.html'), 'Receipt stays open for reading');
    await page.evaluate(() => { window.print = () => { window.printedReceipt = document.getElementById('storeReceiptPrint').textContent; }; });
    await page.click('#printCheckoutReceipt');
    assert.match(await page.evaluate(() => window.printedReceipt), /Due at pickup/);
    assert.equal(await page.locator('#storeReceiptPrint').count(), 0);
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const receipt = page.locator('#checkoutReceipt .order-receipt');
      assert.ok(await receipt.evaluate(element => element.scrollWidth <= element.clientWidth), 'Receipt fits ' + width);
      await page.locator('#samplePaymentDialog').evaluate(dialog => dialog.scrollTop = 0);
      await page.screenshot({ path: path.join(root, 'images/previews/order-receipt-' + width + '.png') });
    }
    await page.click('#continueToTracking');
    await page.locator('#trackingOrder:visible').waitFor();
    await page.click('#trackingReceiptButton');
    assert.match(await page.locator('#orderReceiptDialog').textContent(), new RegExp(order.id));
    await page.keyboard.press('Escape');
    for (let i = 0; i < 4; i++) await page.click('#advanceSampleDelivery');
    assert.equal(await page.locator('#trackingCurrentStatus').textContent(), 'Collected');
    await page.goto(origin + '/pages/profile.html#orders');
    await page.evaluate(() => storeDatabase.ready);
    await page.getByRole('button', { name: 'View receipt', exact: true }).first().click();
    assert.match(await page.locator('#orderReceiptDialog').textContent(), /Due at pickup/);
    await page.evaluate(() => signOutStoreAccount());
    await page.locator('#orderReceiptDialog').waitFor({ state: 'detached' });
    await page.evaluate(() => openOrderReceipt(savedStoreOrders()[0].id));
    assert.equal(await page.locator('#orderReceiptDialog').count(), 0);
    assert.deepEqual(errors, []);
    console.log('Passed Google Maps embed, zero-fee pickup, restored delivery fields, deferred-payment status, readable receipts, print cleanup, tracking/history reopen and sign-out privacy.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exit(1); });
