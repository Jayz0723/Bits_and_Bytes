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
    const url = pathToFileURL(path.join(root, 'pages/profile.html')).href;
    await page.goto(url);
    assert.ok(await page.locator('#profileGate').isVisible());
    assert.ok(await page.locator('#profileAccount').isHidden());
    await page.click('#profileLogin');
    assert.ok(await page.locator('#accountDialog').isVisible());
    await page.keyboard.press('Escape');
    await page.evaluate(async () => {
      saveWishlist([catalogProducts()[0].id]);
      await registerDemoAccount('Alex Shopper', 'alex@example.com', 'test-password-123');
      const item = catalogProducts()[0];
      function order(id, step, paid) {
        return { id, accountEmail: getSignedInUser().email, sample: true, items: [{ ...item, quantity: 1 }], total: item.price, paymentMethod: paid ? 'GCash' : 'Cash on Delivery', paymentStatus: paid ? 'Sample payment verified' : 'Due on delivery', paymentReference: paid ? 'SP-TEST' : '', createdAt: new Date().toISOString(), recipient: { firstName: 'Alex', surname: 'Shopper' }, address: { street: '123 Test Road', barangay: 'Commonwealth', city: 'Quezon City', province: 'Metro Manila', postalCode: '1121' }, contact: { email: 'alex@example.com', phone: '09171234567' }, events: Array.from({ length: step + 1 }, (_, index) => ({ step: index, time: new Date().toISOString() })) };
      }
      localStorage.setItem(storeOrdersKey, JSON.stringify([order('BB-RECEIVING', 1, false), order('BB-DELIVERED', 4, true), order('BB-UNPAID', 4, false)]));
      window.dispatchEvent(new Event('store-account-change'));
    });
    assert.equal(await page.locator('#profileOrders .account-order').count(), 3);
    assert.equal(await page.locator('#favoritesCount').textContent(), '1');
    assert.equal(await page.evaluate(() => localStorage.getItem('bitsAndBytesWishlist')), null, 'Guest favorites move into the signed-in account');
    await page.click('[data-order-filter="receiving"]');
    assert.equal(await page.locator('#profileOrders .account-order').count(), 1);
    await page.click('[data-order-filter="completed"]');
    assert.equal(await page.locator('#profileOrders .account-order').count(), 2);
    await page.fill('#profileOrderSearch', 'BB-DELIVERED');
    assert.equal(await page.locator('#profileOrders .account-order').count(), 1);
    await page.fill('#profileOrderSearch', 'nothing-matches');
    assert.ok(await page.locator('#profileOrders .account-empty').isVisible());
    await page.fill('#profileOrderSearch', '');
    await page.click('[data-order-filter="all"]');
    await page.screenshot({ path: path.join(root, 'images/previews/profile-desktop.png'), fullPage: true });
    const validation = await page.evaluate(() => {
      const failures = [];
      for (const id of ['BB-RECEIVING', 'BB-UNPAID', 'BB-OTHER-ACCOUNT']) {
        try { createRefundRequest(id, 'Wrong item received', 'An incorrect item was received.'); } catch { failures.push(id); }
      }
      return failures;
    });
    assert.equal(validation.length, 3, 'Refunds reject undelivered, unpaid, or unowned orders');
    await page.getByRole('button', { name: 'Return / Refund', exact: true }).click();
    await page.selectOption('#refundReason', 'Damaged or faulty item');
    await page.fill('#refundDetails', 'The item arrived with a damaged connector.');
    await page.setViewportSize({ width: 320, height: 700 });
    assert.ok(await page.locator('#refundDialog').evaluate(element => element.scrollWidth <= element.clientWidth), 'Refund dialog fits a narrow phone');
    await page.screenshot({ path: path.join(root, 'images/previews/profile-refund.png') });
    await page.getByRole('button', { name: 'Save request', exact: true }).click();
    await page.waitForFunction(() => location.hash === '#refunds');
    assert.equal(await page.locator('#profileRefunds .account-order').count(), 1);
    assert.match(await page.locator('#profileRefunds').textContent(), /Request recorded/);
    assert.equal(await page.evaluate(() => {
      try { createRefundRequest('BB-DELIVERED', 'Other', 'Trying to submit the same order twice.'); return false; } catch { return true; }
    }), true);
    await page.reload();
    assert.equal(await page.locator('#profileRefunds .account-order').count(), 1, 'Request survives reload');
    await page.getByRole('button', { name: 'Withdraw request' }).click();
    assert.match(await page.locator('#profileRefunds').textContent(), /Withdrawn/);
    assert.equal(await page.evaluate(() => accountStoreOrders().find(order => order.id === 'BB-DELIVERED').paymentStatus), 'Sample payment verified', 'Requests never change payment status');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const section of ['orders', 'tracking', 'refunds', 'favorites', 'addresses', 'details']) {
        await page.locator('[data-account-section="' + section + '"]').click();
        await page.waitForTimeout(250);
        assert.ok(await page.locator('[data-account-panel="' + section + '"]').isVisible());
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), section + ' fits ' + width);
      }
      await page.screenshot({ path: path.join(root, 'images/previews/profile-' + width + '.png'), fullPage: true });
    }
    await page.fill('#profileDisplayName', 'Alex Updated');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    assert.equal(await page.locator('#profileName').textContent(), 'Alex Updated');
    assert.match(await page.locator('#profileAddresses').textContent(), /123 Test Road/);
    await page.locator('[data-account-section="favorites"]').click();
    assert.equal(await page.locator('#profileFavorites .account-favorite').count(), 1);
    await page.getByRole('button', { name: /^Remove .* from favorites$/ }).click();
    assert.equal(await page.locator('#profileFavorites .account-favorite').count(), 0);
    await page.evaluate(() => saveWishlist([catalogProducts()[0].id]));
    await page.locator('[data-account-section="tracking"]').click();
    assert.equal(await page.locator('#profileDeliveries .account-order').count(), 1);
    const track = page.locator('#profileDeliveries a').filter({ hasText: 'View delivery timeline' });
    assert.match(await track.getAttribute('href'), /tracking.html\?order=BB-RECEIVING/);
    await page.evaluate(async () => { await registerDemoAccount('Other Shopper', 'other@example.com', 'test-password-456'); });
    assert.equal(await page.locator('#profileOrders .account-order').count(), 0);
    assert.equal(await page.locator('#profileFavorites .account-favorite').count(), 0);
    assert.equal(await page.locator('#profileRefunds .account-order').count(), 0);
    assert.equal(await page.locator('#profileAddresses .account-address').count(), 0);
    assert.equal(await page.evaluate(() => { try { withdrawRefundRequest(savedRefundRequests()[0].id); return false; } catch { return true; } }), true);
    await page.click('#profileLogout');
    assert.ok(await page.locator('#profileGate').isVisible());
    assert.equal(await page.locator('#profileName').textContent(), '');
    assert.equal(await page.locator('#profileAccountEmail').inputValue(), '');
    assert.deepEqual(errors, []);
    console.log('Passed profile login gate, orders/status/search, refund validation/persistence/withdrawal, tracking links, private favorites, guest favorites migration, name updates, addresses, account isolation, sign-out, and all six sections at four screen widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
