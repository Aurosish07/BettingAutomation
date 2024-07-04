import { launch } from 'puppeteer';

async function scrap() {
    let browser = await launch({ headless: false });
    let page = await browser.newPage();

    await page.goto("https://tirangaapk.com/#/login", { waitUntil:'domcontentloaded' });

    await page.waitForSelector('.phoneInput__container-input input[name="userNumber"]');
    await page.waitForSelector('.passwordInput__container-input input[type="password"]');
    await page.waitForSelector('.signIn__container-button button:nth-child(1)');




    await page.type('.phoneInput__container-input input[name="userNumber"]', '1294567890');

    await page.type('.passwordInput__container-input input[type="password"]', 'wdokjnwdwod');

    await page.click('.signIn__container-button button:nth-child(1)');

}

scrap().catch(error => console.error('Error:', error));
