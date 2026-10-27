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
    for (const width of [1440, 1100, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
      await page.goto(origin);
      assert.equal(await page.locator('main > section').first().getAttribute('id'), 'landingHero', 'Landing introduction leads the homepage');
      assert.ok(await page.locator('#landingTitle').isVisible());
      await page.locator('.landing-photo').evaluate(image => image.decode());
      assert.equal(await page.locator('#featuredProducts .product-card').count(), 6);
      assert.ok(await page.locator('#featuredProducts').textContent().then(text => text.includes('Dell') && text.includes('Microsoft')));
      for (const href of await page.locator('.landing-hero a').evaluateAll(links => links.map(link => link.getAttribute('href')))) {
        assert.equal((await page.request.get(origin + '/' + href)).status(), 200, 'Landing action opens: ' + href);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Landing fits ' + width);
      await page.screenshot({ path: path.join(__dirname, '../images/previews/landing-' + width + '.png') });
      await page.locator('#siteSearchToggle').click();
      assert.equal(await page.locator('#siteSearchInput').evaluate(node => document.activeElement === node), true);
      await page.fill('#siteSearchInput', 'RAM');
      assert.ok(await page.locator('#siteSearchResults .site-search-result').count() > 0);
      assert.match(await page.locator('#siteSearchResults .site-search-result').first().getAttribute('href'), /part-/);
      await page.fill('#siteSearchInput', 'delivery');
      assert.match(await page.locator('#siteSearchResults').textContent(), /Track your order|checkout|doorstep/i);
      await page.fill('#siteSearchInput', '<script>window.bad=true</script>');
      assert.match(await page.locator('#siteSearchStatus').textContent(), /No matches/);
      assert.equal(await page.evaluate(() => window.bad), undefined);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.activeElement === document.querySelector('#siteSearchToggle'));
      await page.waitForFunction(() => !document.body.classList.contains('search-is-open'));
      assert.equal(await page.locator('#siteSearchToggle').evaluate(node => document.activeElement === node), true);
      assert.equal(await page.locator('body').evaluate(node => node.classList.contains('search-is-open')), false);
      await page.click('#siteSearchToggle');
      await page.fill('#siteSearchInput', 'Microsoft');
      await page.press('#siteSearchInput', 'Enter');
      await page.waitForURL('**/pages/search.html?q=Microsoft');
      assert.ok(await page.locator('#searchPageResults .site-search-result').count() > 0);
      await page.click('[data-search-kind="Articles"]');
      assert.equal(await page.locator('[data-search-kind="Articles"]').getAttribute('aria-pressed'), 'true');
      await page.goto(origin + '/pages/articles.html');
      assert.equal(await page.locator('#articleGrid .journal-card').count(), 6);
      await page.getByRole('button', { name: 'Components', exact: true }).click();
      assert.equal(await page.locator('#articleGrid .journal-card').count(), 2);
      await page.locator('#articleGrid a').first().click();
      await page.waitForURL('**/pages/article.html?id=ram-upgrade-guide');
      assert.match(await page.locator('#articleView h1').textContent(), /Memory/);
      assert.equal(await page.locator('.article-body section').count(), 3);
      await page.locator('.article-contents a').nth(1).click();
      assert.ok(page.url().includes('id=ram-upgrade-guide#section-1'));
      assert.equal(await page.locator('#articleView h1').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Article fits ' + width);
      await page.goto(origin + '/pages/article.html?id=not-real');
      assert.match(await page.locator('#articleView h1').textContent(), /not found/);
      await page.goto(origin);
      await page.evaluate(() => { document.querySelector('#promoCarousel').scrollIntoView({ behavior: 'instant', block: 'start' }); document.activeElement.blur(); });
      await page.waitForTimeout(100);
      await page.locator('#promoCarousel').hover();
      await page.waitForTimeout(1200);
      const backdropPosition = await page.locator('body').evaluate(node => getComputedStyle(node, '::before').backgroundPosition);
      await page.waitForTimeout(150);
      assert.notEqual(await page.locator('body').evaluate(node => getComputedStyle(node, '::before').backgroundPosition), backdropPosition, 'Backdrop animates');
      assert.equal(await page.locator('#promoCarousel').getAttribute('data-paused'), 'false');
      const scale = await page.locator('#promoCarouselDots button.active span').evaluate(node => getComputedStyle(node).transform);
      assert.ok(scale !== 'matrix(0, 0, 0, 1, 0, 0)', 'Progress bar fills');
      if (width === 1440) {
        await page.waitForTimeout(4200);
        assert.equal(await page.locator('#promoCarouselDots button.active').getAttribute('data-promo-slide'), '1');
      }
      await page.click('#promoPause');
      assert.equal(await page.locator('#promoPause').getAttribute('aria-pressed'), 'true');
      await page.click('#promoNext');
      assert.equal(await page.locator('#promoCarouselDots button.active').count(), 1);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('body').evaluate(node => getComputedStyle(node, '::before').animationName), 'none');
      assert.equal(await page.locator('#promoPause').getAttribute('aria-pressed'), 'true');
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Home fits ' + width);
      const controls = await page.locator('.foldable-nav > .site-search-toggle, .foldable-nav > .background-music, .foldable-nav > .nav-toggle, .foldable-nav > .mobile-store-brand').all();
      const boxes = [];
      for (const control of controls) if (await control.isVisible()) boxes.push(await control.boundingBox());
      for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
        const x = boxes[a], y = boxes[b];
        assert.ok(!(x.x < y.x + y.width && x.x + x.width > y.x && x.y < y.y + y.height && x.y + x.height > y.y), 'Navigation controls do not overlap at ' + width);
      }
      if ([1440, 390].includes(width)) {
        await page.screenshot({ path: path.join(__dirname, '../images/previews/experience-home-' + width + '.png') });
        await page.locator('.journal-section').scrollIntoViewIfNeeded();
        await page.locator('.journal-section img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
        await page.screenshot({ path: path.join(__dirname, '../images/previews/experience-journal-' + width + '.png') });
        await page.click('#siteSearchToggle');
        await page.fill('#siteSearchInput', 'RAM');
        await page.locator('#siteSearchResults img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
        await page.screenshot({ path: path.join(__dirname, '../images/previews/experience-search-' + width + '.png') });
        await page.goto(origin + '/pages/article.html?id=choose-your-laptop');
        await page.locator('.article-cover').evaluate(image => image.decode());
        await page.screenshot({ path: path.join(__dirname, '../images/previews/experience-article-' + width + '.png') });
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Passed site-wide product/article/support search, keyboard modal/focus, results page, article filters/detail/anchors/not-found, timed progress and hover advance, pause/manual controls, reduced motion, and layout at five widths.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
