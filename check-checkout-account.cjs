const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/John Carlo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'shop.test') return route.abort();
      const file = path.resolve(__dirname, decodeURIComponent(url.pathname.slice(1)));
      if (!file.startsWith(__dirname + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
      return route.fulfill({ body: fs.readFileSync(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    await page.goto('https://shop.test/cart.html');
    assert.ok(await page.locator('#checkoutButton').isDisabled());
    await page.evaluate(() => localStorage.setItem('bitsAndBytesCart', JSON.stringify([{ ...catalogProducts()[0], quantity: 1 }])));
    await page.reload();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width === 320 ? 640 : 900 });
      await page.click('#checkoutButton');
      assert.ok(await page.locator('#accountDialog').isVisible());
      assert.ok(await page.locator('#checkoutPanel').isHidden());
      for (const mode of ['login', 'register']) {
        await page.click('[data-account-mode="' + mode + '"]');
        const box = await page.locator('#accountDialog').boundingBox();
        const viewport = page.viewportSize();
        assert.ok(box.x >= 0 && box.x + box.width <= width && box.y >= 0 && box.y + box.height <= viewport.height + 1);
        assert.ok(Math.abs(box.x + box.width / 2 - width / 2) < 2, 'Popup is horizontally centered');
        assert.ok(Math.abs(box.y + box.height / 2 - viewport.height / 2) < 2, 'Popup is vertically centered');
        assert.ok(await page.locator('#accountDialog').evaluate(element => element.scrollWidth <= element.clientWidth), 'No popup horizontal overflow');
        await page.screenshot({ path: path.join(__dirname, 'images/previews/checkout-' + mode + '-' + width + '.png') });
      }
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.getElementById('accountDialog'));
      assert.ok(await page.locator('#checkoutPanel').isHidden());
      assert.equal(await page.evaluate(() => getCart().length), 1, 'Cancel retains cart');
    }
    await page.click('#checkoutButton');
    await page.fill('#accountEmail', 'guest@example.com');
    await page.fill('#accountPassword', 'not-registered');
    await page.click('#accountDialogSubmit');
    await page.waitForFunction(() => document.getElementById('accountDialogError').textContent.includes('incorrect'));
    assert.ok(await page.locator('#checkoutPanel').isHidden());
    await page.click('[data-account-mode="register"]');
    await page.fill('#accountName', 'Guest shopper');
    await page.fill('#accountPassword', 'demo-password-123');
    await page.fill('#accountConfirm', 'different-password');
    await page.click('#accountDialogSubmit');
    assert.equal(await page.locator('#accountConfirm').evaluate(input => input.checkValidity()), false);
    await page.fill('#accountConfirm', 'demo-password-123');
    await page.click('#accountDialogSubmit');
    await page.waitForFunction(() => !document.getElementById('accountDialog'));
    assert.ok(await page.locator('#checkoutPanel').isVisible(), 'Registration resumes checkout');
    assert.equal(await page.inputValue('#checkoutEmail'), 'guest@example.com');
    const accounts = await page.evaluate(() => getDemoAccounts());
    assert.equal(accounts.length, 1);
    assert.equal(accounts[0].password, undefined);
    assert.ok(accounts[0].salt && accounts[0].passwordHash.length === 64);
    assert.ok(!(await page.evaluate(() => JSON.stringify(localStorage))).includes('demo-password-123'));
    await page.reload();
    await page.click('#checkoutButton');
    assert.equal(await page.locator('#accountDialog').count(), 0, 'Signed-in session skips popup');
    assert.ok(await page.locator('#checkoutPanel').isVisible());
    await page.goto('https://shop.test/login.html');
    assert.ok(await page.locator('#signedInAccount').isVisible());
    await page.click('#signOutAccount');
    assert.ok(await page.locator('#loginForm').isVisible());
    await page.click('#openRegistration');
    await page.fill('#accountName', 'Duplicate shopper');
    await page.fill('#accountEmail', 'GUEST@example.com');
    await page.fill('#accountPassword', 'another-demo-password');
    await page.fill('#accountConfirm', 'another-demo-password');
    await page.click('#accountDialogSubmit');
    await page.waitForFunction(() => document.getElementById('accountDialogError').textContent.includes('already'));
    await page.locator('.account-dialog-close').click();
    await page.fill('#loginEmail', 'guest@example.com');
    await page.fill('#loginPassword', 'wrong-password');
    await page.locator('#loginForm button[type=submit]').click();
    await page.waitForFunction(() => document.getElementById('loginMessage').textContent.includes('incorrect'));
    await page.fill('#loginPassword', 'demo-password-123');
    await page.locator('#loginForm button[type=submit]').click();
    await page.waitForFunction(() => document.getElementById('loginForm').hidden);
    await page.goto('https://shop.test/cart.html');
    await page.click('#checkoutButton');
    // Expiring a session after opening delivery must still block placing an order.
    await page.evaluate(() => {
      sessionStorage.removeItem('bitsAndBytesSignedInEmail');
      document.getElementById('deliveryCheckoutForm').dispatchEvent(new Event('submit', { cancelable: true }));
    });
    assert.ok(await page.locator('#accountDialog').isVisible());
    assert.ok(await page.locator('#checkoutPanel').isHidden());
    await page.fill('#accountEmail', 'guest@example.com');
    await page.fill('#accountPassword', 'demo-password-123');
    await page.click('#accountDialogSubmit');
    await page.waitForFunction(() => !document.getElementById('accountDialog'));
    assert.ok(await page.locator('#checkoutPanel').isVisible(), 'Popup login resumes delivery');
    // The actual project is also opened directly from its HTML files.
    const localPage = await browser.newPage();
    await localPage.route(/^https?:/, route => route.abort());
    const { pathToFileURL } = require('node:url');
    await localPage.goto(pathToFileURL(path.join(__dirname, 'login.html')).href);
    await localPage.evaluate(() => registerDemoAccount('Local shopper', 'local@example.com', 'local-demo-123'));
    await localPage.goto(pathToFileURL(path.join(__dirname, 'cart.html')).href);
    assert.equal(await localPage.evaluate(() => getSignedInUser()?.email), 'local@example.com', 'Account session works between local HTML files');
    await localPage.close();
    assert.deepEqual(errors, []);
    console.log('Passed guest gate, centered desktop/mobile login/register popup, cancellation, password errors, confirmation, duplicate email, hashed storage, automatic checkout resume, login page, sign-out, and expired-session submission guard.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
