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
    // Every option updates its own image and honest model/reference caption.
    const categories = await page.evaluate(() => Object.keys(pcParts));
    for (const key of categories) {
      const count = await page.evaluate(key => pcParts[key].length, key);
      for (let index = 0; index < count; index++) {
        await page.selectOption('#' + key, String(index));
        const card = page.locator('[data-builder-choice="' + key + '"]');
        assert.equal(await card.locator('.builder-part-name').textContent(), await page.evaluate(({ key, index }) => pcParts[key][index].name, { key, index }));
        if (key === 'gpu' && index === 0) assert.ok(await card.locator('.builder-part-photo').isHidden());
        else await card.locator('.builder-part-photo img').evaluate(image => image.decode());
      }
    }
    await page.selectOption('#cpu', '0');
    await page.click('[data-preview-part="cpu"]');
    await page.locator('.builder-photo-dialog img').evaluate(image => image.decode());
    assert.equal(await page.locator('#builderPhotoTitle').textContent(), 'Intel Core i5-14600K');
    assert.match(await page.locator('.builder-photo-caption').textContent(), /selected model/);
    await page.keyboard.press('Escape');
    await page.locator('.builder-photo-dialog').waitFor({ state: 'detached' });
    assert.equal(await page.locator('.builder-photo-dialog').count(), 0);
    await page.selectOption('#cpu', '');
    assert.ok(await page.locator('[data-builder-choice="cpu"] .builder-part-preview').isHidden());
    await page.click('[data-build-preset="gaming"]');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('[data-builder-choice="cpu"]').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Builder fits ' + width);
      await page.screenshot({ path: path.resolve(__dirname, '../images/previews/builder-pictures-' + width + '.png') });
      await page.click('[data-preview-part="cpu"]');
      assert.ok(await page.locator('.builder-photo-dialog').evaluate(node => node.scrollWidth <= node.clientWidth));
      await page.keyboard.press('Escape');
      await page.locator('.builder-photo-dialog').waitFor({ state: 'detached' });
    }
    await page.fill('#buildSearch', 'nothing-matches');
    assert.ok(await page.locator('[data-builder-choice="cpu"]').isHidden());
    await page.click('[data-builder-part="cpu"]');
    assert.ok(await page.locator('[data-builder-choice="cpu"]').isVisible());
    assert.equal(await page.inputValue('#buildSearch'), '');
    await page.click('[data-build-preset="student"]');
    // Manual mismatches must still be rejected, not hidden by the preset fix.
    await page.selectOption('#motherboard', '2');
    assert.match(await page.locator('#compatibilityBox').textContent(), /does not support the motherboard size/);
    await page.click('#addBuildToCart');
    assert.equal(await page.evaluate(() => getCart().length), 1);
    assert.deepEqual(errors, []);
    console.log('Passed photos for all builder options, exact/reference labels, enlarged previews, keyboard close, clearing selections, four responsive widths, search shortcuts, all presets and compatibility/cart guards.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
