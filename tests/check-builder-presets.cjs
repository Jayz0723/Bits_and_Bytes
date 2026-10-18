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
    page.on('dialog', dialog => dialog.dismiss());
    await page.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(path.resolve(__dirname, '../pages/build.html')).href);
    for (const name of ['student', 'gaming', 'creator', 'student']) {
      await page.click('[data-build-preset="' + name + '"]');
      const result = await page.evaluate(() => {
        const parts = selectedBuildParts();
        return { ...getCompatibilityMessages(parts), count: Object.keys(parts).length, size: parts.motherboard.size, supports: parts.case.supports, socket: parts.cpu.socket, boardSocket: parts.motherboard.socket, memory: parts.ram.memory, boardMemory: parts.motherboard.memory };
      });
      assert.deepEqual(result.errors, [], name + ' preset is compatible');
      assert.equal(result.count, 11);
      assert.ok(result.supports.includes(result.size));
      assert.equal(result.socket, result.boardSocket);
      assert.equal(result.memory, result.boardMemory);
      assert.equal(await page.locator('#compatibilityBox.bad').count(), 0);
    }
    assert.equal(await page.locator('#motherboard option:checked').textContent().then(text => text.includes('ASRock A620M Pro RS')), true);
    await page.click('#addBuildToCart');
    assert.equal(await page.evaluate(() => getCart().length), 1);
    // Manual mismatches must still be rejected, not hidden by the preset fix.
    await page.selectOption('#motherboard', '2');
    assert.match(await page.locator('#compatibilityBox').textContent(), /does not support the motherboard size/);
    await page.click('#addBuildToCart');
    assert.equal(await page.evaluate(() => getCart().length), 1);
    assert.deepEqual(errors, []);
    console.log('Passed all three presets, repeated preset switching, sockets, memory, case sizing, power checks, cart addition and manual-incompatibility rejection.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
