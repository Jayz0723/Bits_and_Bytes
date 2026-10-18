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
    const open = file => page.goto(pathToFileURL(path.join(root, file.split('?')[0].split('#')[0])).href + (file.includes('?') ? '?' + file.split('?')[1] : file.includes('#') ? '#' + file.split('#')[1] : ''));
    await open('pages/profile.html#orders');
    assert.equal(await page.locator('.nav-group.current').count(), 1);
    assert.ok(await page.locator('.nav-account.current').count());
    assert.equal(await page.locator('.foldable-nav a.active').count(), 1);
    const summary = page.locator('.nav-account > summary');
    await summary.click();
    assert.equal(await summary.evaluate(element => getComputedStyle(element).outlineStyle), 'none', 'Pointer clicks do not leave a focus box');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Tab');
    await summary.focus();
    assert.equal(await summary.evaluate(element => element.matches(':focus-visible')), true);
    assert.equal(await summary.evaluate(element => getComputedStyle(element).outlineStyle), 'solid', 'Keyboard focus stays visible');
    await summary.click();
    await page.locator('.account-shell').click({ position: { x: 4, y: 4 } });
    assert.equal(await page.locator('.nav-account').getAttribute('open'), null, 'Outside click closes dropdown');
    await open('pages/products.html#laptops');
    assert.equal(await page.locator('.shop-submenu a.active').count(), 1);
    assert.equal(await page.locator('.shop-submenu a.active').getAttribute('href'), 'pages/products.html#laptops');
    await page.evaluate(() => { location.hash = 'computer-parts'; });
    await page.waitForFunction(() => document.querySelector('.shop-submenu a.active')?.getAttribute('href') === 'pages/products.html#computer-parts');
    await open('pages/product.html?id=part-msi-pro-b650-s');
    assert.equal(await page.locator('.shop-submenu a.active').getAttribute('href'), 'pages/products.html');
    await open('pages/profile.html');
    await page.evaluate(async () => registerDemoAccount('Keyboard Shopper', 'keyboard@example.com', 'test-only-password'));
    await page.setViewportSize({ width: 320, height: 900 });
    await page.locator('.nav-toggle').click();
    await page.locator('.nav-account summary').click();
    await page.locator('.nav-account a[href="pages/profile.html#addresses"]').click();
    assert.ok(await page.locator('#addressesPanel').isVisible());
    assert.equal(await page.locator('.foldable-nav.is-open').count(), 0, 'Choosing a same-page account tab closes the mobile menu');
    await page.click('#addProfileAddress');
    await page.fill('#addressBookLabel', 'Home');
    assert.equal(await page.locator('#addressBookLabel').evaluate(element => getComputedStyle(element).boxShadow), 'none');
    await page.screenshot({ path: path.join(root, 'images/previews/audit-focus-mobile.png') });
    await page.keyboard.press('Escape');

    // Corrupted browser records must not stop the shared navigation or account gate.
    for (const value of ['broken-json', '{}', '[null,{},42]']) {
      await page.evaluate(value => {
        localStorage.setItem('bitsAndBytesCart', value);
        localStorage.setItem('bitsAndBytesAccounts', value);
        localStorage.setItem('bitsAndBytesWishlist', value);
        sessionStorage.removeItem('bitsAndBytesSignedInEmail');
      }, value);
      await open('pages/cart.html');
      assert.ok(await page.locator('#checkoutButton').isDisabled());
      assert.ok(await page.locator('.store-toolbar .cart-pill').isVisible());
      assert.equal(await page.evaluate(() => getCart().length), 0);
      assert.equal(await page.evaluate(() => getWishlist().length), 0);
      assert.ok(await page.evaluate(() => getDemoAccounts().some(account => account.email === 'jcherrera0723@gmail.com')));
    }
    await page.evaluate(() => localStorage.setItem('bitsAndBytesCart', JSON.stringify([null, { ...catalogProducts()[0], quantity: 1 }, { ...catalogProducts()[1], quantity: -2 }])));
    await page.reload();
    assert.equal(await page.evaluate(() => getCart().length), 1, 'Invalid entries do not discard healthy cart items');
    await open('pages/tracking.html');
    await page.evaluate(() => localStorage.setItem(storeOrdersKey, JSON.stringify([null, { id: 'BROKEN', items: [null], events: [], recipient: {}, address: {} }])));
    assert.deepEqual(await page.evaluate(() => savedStoreOrders()), [], 'Incomplete orders do not break tracking');
    assert.deepEqual(errors, []);
    console.log('Passed single correct navigation highlights, hash changes, keyboard focus, pointer focus, dropdown dismissal, mobile account links, and malformed browser-storage recovery.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
