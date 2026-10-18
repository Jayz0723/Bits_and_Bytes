const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { once } = require('node:events');
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
  const directory = fs.mkdtempSync(path.join(root, 'tmp/database-test-'));
  const database = path.join(directory, 'store.sqlite');
  let server = createStoreServer(database);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  let origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await page.goto(origin + '/pages/profile.html');
    await page.evaluate(() => storeDatabase.ready);
    await page.evaluate(() => registerDemoAccount('Database Tester', 'database@example.com', 'test-only-password'));
    assert.equal(await page.evaluate(() => getSignedInUser().name), 'Database Tester');
    const cookies = await context.cookies();
    assert.ok(cookies.find(cookie => cookie.name === 'bb_session' && cookie.httpOnly && cookie.sameSite === 'Strict'));
    assert.equal(await page.evaluate(() => localStorage.getItem('bitsAndBytesAccounts')), null);
    await page.locator('a[href="pages/profile.html#addresses"]').last().click();
    await page.locator('#addProfileAddress').click();
    await page.fill('#addressBookLabel', 'Japan home');
    await page.fill('#checkoutFirstName', 'Test');
    await page.fill('#checkoutSurname', 'Buyer');
    await page.fill('#checkoutPhone', '+819012345678');
    await page.selectOption('#countryRegion', 'Japan');
    await page.fill('#streetAddress', 'Example Building 1');
    await page.fill('#internationalRegion', 'Tokyo');
    await page.fill('#internationalCity', 'Shinjuku');
    await page.fill('#postalCode', '160-0022');
    assert.equal(await page.locator('#addressBookForm').evaluate(form => form.reportValidity()), true);
    await page.locator('#addressBookForm button[type="submit"]').click();
    await page.locator('#addressBookDialog').waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => getAddressBook().addresses.length), 1);
    await page.goto(origin + '/pages/cart.html');
    await page.evaluate(async () => { await storeDatabase.ready; addToCart(catalogProducts()[0]); renderCart(); });
    await page.click('#checkoutButton');
    assert.equal(await page.inputValue('#countryRegion'), 'Japan');
    assert.equal(await page.inputValue('#internationalCity'), 'Shinjuku');
    assert.equal(await page.inputValue('#checkoutFirstName'), 'Test');
    assert.ok(await page.locator('[value="Cash on Delivery"]').isDisabled());
    assert.equal(await page.locator('#checkoutOverseasFee').textContent(), '₱1,400.00');
    const standard = await page.evaluate(() => selectedDeliveryRate().fee);
    assert.equal(standard, 1550);
    await page.check('[name="deliveryService"][value="express"]');
    assert.equal(await page.evaluate(() => selectedDeliveryRate().fee), 2700);
    for (const [country, region, city, postal] of [
      ['China', 'Beijing', 'Beijing', '100000'], ['Spain', 'Madrid', 'Madrid', '28001'],
      ['France', 'Ile-de-France', 'Paris', '75001'], ['United States', 'New York', 'New York', '10001']
    ]) {
      await page.selectOption('#countryRegion', country);
      await page.fill('#internationalRegion', region);
      await page.fill('#internationalCity', city);
      await page.fill('#postalCode', postal);
      assert.ok(await page.evaluate(() => validateDeliveryAddress()));
      assert.ok(await page.evaluate(() => selectedDeliveryRate().fee > 300));
    }
    await page.selectOption('#countryRegion', 'Philippines');
    await page.selectOption('#provinceSelect', 'Metro Manila');
    await page.selectOption('#citySelect', 'Quezon City');
    await page.selectOption('#barangaySelect', 'Commonwealth');
    assert.equal(await page.inputValue('#postalCode'), '1121');
    assert.equal(await page.evaluate(() => selectedDeliveryRate().fee), 300);
    assert.equal(await page.locator('[value="Cash on Delivery"]').isDisabled(), false);
    for (const width of [1440, 1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.selectOption('#countryRegion', 'Japan');
      await page.locator('#languageSelectTrigger').click();
      const menu = page.locator('#languageSelectOptions');
      assert.ok(await menu.isVisible());
      const box = await menu.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1, 'Menu fits ' + width);
      await page.keyboard.press('End');
      assert.equal(await page.evaluate(() => document.activeElement.textContent.includes('简体中文')), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#languageSelectTrigger').getAttribute('aria-expanded'), 'false');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Checkout fits ' + width);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#currencySelectTrigger').click();
    await page.screenshot({ path: path.join(root, 'images/previews/store-currency-menu.png') });
    await page.keyboard.press('Escape');
    // A second browser can sign in and retrieve the saved database address.
    const other = await browser.newContext();
    const second = await other.newPage();
    await second.route(/^https?:/, route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await second.goto(origin + '/pages/profile.html');
    await second.evaluate(async () => { await storeDatabase.ready; await signInDemoAccount('database@example.com', 'test-only-password'); });
    assert.equal(await second.evaluate(() => getAddressBook().addresses[0].label), 'Japan home');
    await second.evaluate(() => signOutStoreAccount());
    assert.equal(await second.evaluate(() => getSignedInUser()), null);
    await second.evaluate(() => registerDemoAccount('Another Buyer', 'another-db@example.com', 'test-only-password'));
    assert.equal(await second.evaluate(() => getAddressBook().addresses.length), 0, 'Other accounts cannot read this address book');
    const anonymous = await fetch(origin + '/api/addresses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(anonymous.status, 401);
    const forbidden = await fetch(origin + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' }, body: '{}' });
    assert.equal(forbidden.status, 403);
    assert.equal((await fetch(origin + '/data/store.sqlite')).status, 404);
    assert.equal((await fetch(origin + '/.git/config')).status, 404);
    // Optimistic revisions prevent a second tab from silently overwriting newer addresses.
    const stale = await page.evaluate(async () => {
      const book = getAddressBook();
      await storeDatabase.saveBook(book);
      try { await storeDatabase.saveBook(book); return false; } catch (error) { return error.message.includes('another tab'); }
    });
    assert.equal(stale, true);
    await page.fill('#internationalRegion', 'Tokyo');
    await page.fill('#internationalCity', 'Shinjuku');
    await page.fill('#postalCode', '160-0022');
    await page.check('[name="paymentMethod"][value="E-wallet"]');
    await page.fill('#walletAccountName', 'Test Buyer');
    await page.fill('#walletMobile', '09171234567');
    await page.click('#reviewOrderButton');
    await page.click('#completeSamplePayment');
    await page.click('#verifySamplePayment');
    await page.locator('#checkoutSuccess:not([hidden])').waitFor();
    const order = await page.evaluate(() => savedStoreOrders()[0]);
    assert.equal(order.address.country, 'Japan');
    assert.equal(order.delivery.fee, 2700);
    assert.equal(order.total, order.subtotal + 2700);
    await page.click('#continueToTracking');
    await page.locator('#trackingOrder:visible').waitFor();
    assert.match(await page.locator('#trackingAddress').textContent(), /Japan/);
    await other.close();
    await context.close();
    await new Promise(resolve => server.close(resolve));
    server = createStoreServer(database);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    origin = 'http://127.0.0.1:' + server.address().port;
    const response = await fetch(origin + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'database@example.com', password: 'test-only-password' }) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).book.addresses[0].address.country, 'Japan');
    assert.deepEqual(errors, []);
    console.log('Passed SQLite persistence/restart, cookie sessions, cross-browser addresses, autofill, overseas rates, domestic switching, dark menus/keyboard/mobile layouts, account isolation and protected database files.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exit(1); });
