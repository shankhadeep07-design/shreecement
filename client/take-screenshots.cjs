const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1564,715'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1564, height: 715 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/shreecement', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'login-screenshot.png' });
  console.log('Login screenshot saved.');

  console.log('Logging in...');
  await page.type('input[type="email"]', 'admin@shreecement.com');
  await page.type('input[type="password"]', 'Admin@1234');
  
  // Wait a second for captcha to render if needed
  await new Promise(r => setTimeout(r, 1000));
  
  // Read captcha
  const captchaText = await page.evaluate(() => {
    const el = document.querySelector('.modern-captcha-display') || document.querySelector('.cap-img');
    return el ? el.innerText : '1234'; // Fallback
  });
  
  console.log('Captcha:', captchaText);
  
  const captchaInputs = await page.$$('input[type="text"]');
  if (captchaInputs.length > 0) {
    await captchaInputs[captchaInputs.length - 1].type(captchaText);
  }

  await page.click('button[type="submit"]');

  console.log('Waiting for dashboard...');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => console.log('Timeout waiting for nav'));
  await new Promise(r => setTimeout(r, 2000)); // wait for animations
  
  await page.screenshot({ path: 'dashboard-screenshot.png' });
  console.log('Dashboard screenshot saved.');

  await browser.close();
})();
