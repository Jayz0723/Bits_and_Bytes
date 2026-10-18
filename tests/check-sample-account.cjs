const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');

(async () => {
  const password = process.env.SAMPLE_ACCOUNT_PASSWORD;
  assert.ok(password, 'Provide SAMPLE_ACCOUNT_PASSWORD to test the supplied login');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(path.resolve(__dirname, '../pages/login.html')).href);
    const result = await page.evaluate(async password => {
      const email = 'jcherrera0723@gmail.com';
      await signInDemoAccount(email, password);
      const user = getSignedInUser();
      sessionStorage.removeItem('bitsAndBytesSignedInEmail');
      let rejected = false;
      try { await signInDemoAccount(email, 'incorrect-password'); } catch { rejected = true; }
      const saved = { ...getDemoAccounts().find(account => account.email === email), name: 'Existing local account' };
      localStorage.setItem('bitsAndBytesAccounts', JSON.stringify([saved]));
      return { user, rejected, preserved: getDemoAccounts().filter(account => account.email === email) };
    }, password);
    assert.equal(result.user.email, 'jcherrera0723@gmail.com');
    assert.equal(result.rejected, true);
    assert.equal(result.preserved.length, 1);
    assert.equal(result.preserved[0].name, 'Existing local account');
    console.log('Passed supplied sample login, incorrect-password rejection, and existing-account preservation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
