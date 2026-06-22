const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Users/user1/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  const bodyText = await page.locator('body').innerText();
  const html = await page.content();
  console.log(JSON.stringify({ bodyText: bodyText.slice(0, 1000), errors, hasRoot: html.includes('id="root"') }, null, 2));
  await browser.close();
})();
