const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const issues = [];
    page.on('pageerror', error => issues.push({ type: 'script', page: page.url(), error: error.message }));
    await page.route(/^https?:/, route => route.abort());
    const files = ['index.html', ...fs.readdirSync(path.join(root, 'pages')).filter(file => file.endsWith('.html')).map(file => 'pages/' + file)];
    for (const width of [1440, 1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const file of files) {
        const query = file === 'pages/product.html' ? '?id=part-msi-pro-b650-s' : '';
        await page.goto(pathToFileURL(path.join(root, file)).href + query);
        await page.evaluate(async () => {
          const images = [...document.images].filter(image => image.getAttribute('src') && image.src.startsWith('file:'));
          images.forEach(image => { image.loading = 'eager'; });
          await Promise.allSettled(images.map(image => image.decode()));
        });
        const result = await page.evaluate(() => {
          const images = [...document.images];
          const broken = images.filter(image => image.getAttribute('src') && image.src.startsWith('file:') && !image.naturalWidth).map(image => image.getAttribute('src'));
          const icons = images.filter(image => (image.getAttribute('src')?.startsWith('images/icons/') || image.getAttribute('src') === 'images/branding/bitsandbyteslogo.png') && image.getBoundingClientRect().width > 0).filter(image => {
            const box = image.getBoundingClientRect();
            return box.width > box.height * 1.3 || box.height > box.width * 1.3 || getComputedStyle(image).backgroundImage !== 'none';
          }).map(image => image.getAttribute('src'));
          const clipped = [...document.querySelectorAll('button')].filter(button => button.clientWidth > 0 && button.scrollWidth > button.clientWidth + 2).map(button => button.textContent.trim().slice(0, 60));
          return { overflow: document.documentElement.scrollWidth > innerWidth, broken, icons, clipped };
        });
        if (result.overflow || result.broken.length || result.icons.length || result.clipped.length) issues.push({ file, width, ...result });
      }
      console.log('Audited every page at ' + width + 'px');
    }
    assert.deepEqual(issues, [], JSON.stringify(issues, null, 2));
    console.log('Passed page layouts, local images, icon proportions/backgrounds, unclipped button text, and runtime errors across five screen widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
