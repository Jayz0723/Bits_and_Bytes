const assert = require('node:assert/strict');
const path = require('node:path');
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');
(async () => {
  const server = createStoreServer(':memory:');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    assert.equal((await page.request.patch(origin + '/api/profile', { data: { avatar: '' } })).status(), 401);
    await page.request.post(origin + '/api/register', { data: { name: 'Alex Rivera', email: 'photo@example.com', password: 'photo-test-password' } });
    await page.goto(origin + '/pages/profile.html#details');
    await page.locator('#profileAccount:not([hidden])').waitFor();
    const png = await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 300;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#38bace'; ctx.fillRect(0, 0, 400, 300);
      return canvas.toDataURL('image/png').split(',')[1];
    });
    await page.locator('#profilePhotoFile').setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
    await page.locator('#saveProfilePhoto').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#profileAvatar img').count(), 0, 'Preview does not save prematurely');
    await page.click('#saveProfilePhoto');
    await page.locator('#profileAvatar img').waitFor();
    await page.reload();
    await page.locator('#profileAvatar img').waitFor();
    const session = await (await page.request.get(origin + '/api/session')).json();
    assert.match(session.user.avatar, /^data:image\/jpeg;base64,/);
    for (const avatar of ['data:image/svg+xml;base64,PHN2Zz4=', 'https://example.com/avatar.jpg', 'data:image/jpeg;base64,YQ==', 'data:image/jpeg;base64,' + 'A'.repeat(81000)]) {
      assert.equal((await page.request.patch(origin + '/api/profile', { data: { avatar } })).status(), 400);
    }
    const other = await browser.newContext();
    await other.request.post(origin + '/api/register', { data: { name: 'Another Shopper', email: 'other-photo@example.com', password: 'photo-test-password' } });
    assert.equal((await (await other.request.get(origin + '/api/session')).json()).user.avatar, '', 'Photos stay private to their account');
    await other.close();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Profile fits ' + width);
      await page.screenshot({ path: path.join(__dirname, '../images/previews/profile-photo-' + width + '.png'), fullPage: true });
    }
    await page.click('#removeProfilePhoto');
    await page.waitForFunction(() => !document.querySelector('#profileAvatar img'));
    await page.reload();
    await page.locator('#profileAccount:not([hidden])').waitFor();
    assert.equal(await page.locator('#profileAvatar').textContent(), 'AR');
    await page.locator('#profilePhotoFile').setInputFiles({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
    await page.waitForFunction(() => document.querySelector('#profilePhotoStatus').textContent.length > 0);
    assert.equal(await page.locator('#saveProfilePhoto').isHidden(), true);
    assert.deepEqual(errors, []);
    console.log('Passed profile photo upload, preview, JPEG resizing, account persistence/isolation, removal, invalid images and four responsive layouts.');
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
