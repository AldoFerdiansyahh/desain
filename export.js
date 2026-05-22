const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1080,
      height: 1350
    },
    deviceScaleFactor: 1
  });

  const filePath = 'file://' + path.resolve(__dirname, 'aldoferdii_carousel_template_poppins.html');
  await page.goto(filePath, { waitUntil: 'networkidle' });

  for (let i = 1; i <= 5; i++) {
    const slide = page.locator(`#slide-${i}`);
    await slide.screenshot({
      path: `slide-${i}.png`
    });

    console.log(`slide-${i}.png berhasil dibuat`);
  }

  await browser.close();
})();