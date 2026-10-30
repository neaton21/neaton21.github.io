/* Optional QA only. The website itself has no JavaScript or dependencies. */
const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const base = process.env.SITE_URL || 'http://127.0.0.1:8000/neaton21.github.io/';
  const out = path.resolve(__dirname, '../artifacts');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  const errors = [];
  try {
    for (const [width, height] of [[320, 800], [390, 844], [768, 1024], [1440, 1000]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      const response = await page.goto(base);
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('h1').innerText(), 'Nate\nEaton.');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}px`);
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
      for (const link of await page.locator('a').all()) {
        if (await link.getAttribute('class') === 'skip-link') continue;
        const bounds = await link.boundingBox();
        assert(bounds.width >= 44 && bounds.height >= 44, `Touch target too small: ${await link.innerText()} (${bounds.width}×${bounds.height})`);
      }
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip-link').evaluate(e => e === document.activeElement), true);
      assert.notEqual(await page.locator('.skip-link').evaluate(e => getComputedStyle(e).outlineStyle), 'none');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
      for (const target of ['about', 'projects', 'contact']) {
        await page.locator(`nav a[href="#${target}"]`).click();
        assert.equal(new URL(page.url()).hash, `#${target}`);
        const box = await page.locator(`#${target}`).boundingBox();
        assert(box.y >= -1 && box.y < height, `Anchor ${target} is visible`);
      }
      assert.equal(await page.locator('a[href^="mailto:"]').getAttribute('href'), 'mailto:nateceaton@gmail.com');
      const project = page.locator('#projects article');
      assert.equal(await project.locator('h3').innerText(), 'Feardetector');
      assert(!/TBD|Projects to come/.test(await page.locator('#projects').innerText()));
      assert.equal(await project.getAttribute('aria-labelledby'), await project.locator('h3').getAttribute('id'));
      assert.deepEqual(await project.locator('a').evaluateAll(links => links.map(a => a.href)), [
        'https://github.com/neaton21/feardetector',
        'https://feardetector.neaton2.workers.dev/'
      ]);
      const allowedExternalLinks = new Set([
        'https://github.com/neaton21',
        'https://github.com/neaton21/feardetector',
        'https://feardetector.neaton2.workers.dev/'
      ]);
      for (const a of await page.locator('a[href^="https:"]').all()) {
        assert(allowedExternalLinks.has(await a.getAttribute('href')));
      }
      await page.locator('footer a').click();
      assert.equal(await page.evaluate(() => scrollY), 0);
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `Accessibility at ${width}px`);
      await page.screenshot({ path: path.join(out, `preview-${width}.png`), fullPage: true });
      results.push({ width, height, horizontalOverflow: false, navigation: 'passed', keyboard: 'passed', axeViolations: audit.violations.length });
      await context.close();
    }
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const plain = await noJs.newPage();
    await plain.goto(base);
    assert(await plain.locator('#about').isVisible());
    await plain.locator('nav a[href="#contact"]').click();
    assert.equal(new URL(plain.url()).hash, '#contact');
    await noJs.close();
    assert.deepEqual(errors, []);
    const report = { base, layouts: results, noJavaScript: 'passed', browserErrors: errors };
    fs.writeFileSync(path.join(out, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
