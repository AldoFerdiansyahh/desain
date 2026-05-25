const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  // Ambil nama file dari command line argument
  const htmlFile = process.argv[2] || 'aldoferdii_jasa_joki_promo_v2.html';
  
  // Cek apakah file ada
  if (!fs.existsSync(htmlFile)) {
    console.error(`❌ File tidak ditemukan: ${htmlFile}`);
    process.exit(1);
  }
  
  // Baca HTML untuk auto-detect jumlah slide
  const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
  const slideMatches = htmlContent.match(/id="slide-(\d+)"/g) || [];
  const slideCount = slideMatches.length;
  
  if (slideCount === 0) {
    console.error(`❌ Tidak ada slide ditemukan di ${htmlFile}`);
    process.exit(1);
  }
  
  console.log(`✓ Ditemukan ${slideCount} slide di ${htmlFile}\n`);

  const filePath = 'file://' + path.resolve(__dirname, htmlFile);
  
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

  await page.goto(filePath, { waitUntil: 'networkidle' });

  for (let i = 1; i <= slideCount; i++) {
    // Jalankan JavaScript untuk show slide yang sesuai
    await page.evaluate((slideNum) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach(slide => slide.classList.remove('active'));
      const targetSlide = document.getElementById(`slide-${slideNum}`);
      if (targetSlide) {
        targetSlide.classList.add('active');
        targetSlide.style.display = 'flex'; // Ensure display is flex for active slide
      }
    }, i);

    // Wait sebentar untuk rendering
    await page.waitForTimeout(300);

    const slide = page.locator(`#slide-${i}`);
    
    try {
      await slide.screenshot({
        path: `slide-${i}.png`,
        timeout: 30000
      });
      console.log(`✓ slide-${i}.png berhasil dibuat`);
    } catch (error) {
      console.error(`❌ Error pada slide-${i}: ${error.message}`);
    }
  }

  console.log(`\n✓ Semua ${slideCount} slide berhasil di-export!`);
  await browser.close();
})();