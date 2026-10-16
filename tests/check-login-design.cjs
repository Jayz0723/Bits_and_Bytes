const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(path.resolve(__dirname, '../pages/login.html')).href);
    assert.equal(await page.locator('.login-intro h1').evaluate(element => getComputedStyle(element).color), 'rgb(237, 245, 248)', 'Intro title stays readable on the dark background');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('#loginForm').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      for (const selector of ['#loginEmail', '.password-field', '#openRegistration', '.login-help']) {
        const box = await page.locator(selector).boundingBox();
        const card = await page.locator('#loginForm').boundingBox();
        assert.ok(box.x >= card.x && box.x + box.width <= card.x + card.width + 1, selector + ' fits the panel');
      }
      assert.ok(await page.locator('#loginForm').evaluate(form => form.scrollWidth <= form.clientWidth));
      await page.screenshot({ path: path.resolve(__dirname, '../images/previews/login-redesign-' + width + '.png') });
    }
    await page.fill('#loginPassword', 'example-password');
    await page.click('#togglePassword');
    assert.equal(await page.locator('#loginPassword').getAttribute('type'), 'text');
    assert.equal(await page.locator('#togglePassword').getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('#togglePassword img').getAttribute('src'), /eye-off/);
    await page.click('#togglePassword');
    assert.equal(await page.locator('#loginPassword').getAttribute('type'), 'password');
    await page.fill('#loginEmail', 'missing@example.com');
    await page.check('#rememberMe');
    await page.locator('#loginForm button[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('#loginMessage').textContent.includes('incorrect'));
    assert.ok(await page.locator('#loginMessage').isVisible());
    await page.reload();
    assert.equal(await page.inputValue('#loginEmail'), 'missing@example.com');
    assert.equal(await page.inputValue('#loginPassword'), '');
    await page.click('#openRegistration');
    assert.ok(await page.locator('#accountDialog').isVisible());
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, []);
    console.log('Passed sign-in design at four widths, password visibility icons, validation, remembered email, and registration access.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
