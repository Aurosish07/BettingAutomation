import { launch } from 'puppeteer';

async function scrap() {
    let browser = await launch({ headless: false });
    let page = await browser.newPage();

    await page.goto("https://tirangaapk.com/#/login", { waitUntil: 'networkidle0', timeout: 60000 });

    await page.waitForSelector('.phoneInput__container-input input[name="userNumber"]');
    await page.waitForSelector('.passwordInput__container-input input[type="password"]');
    await page.waitForSelector('.signIn__container-button button:nth-child(1)');

    await page.type('.phoneInput__container-input input[name="userNumber"]', '6396048902');
    await page.type('.passwordInput__container-input input[type="password"]', 'asad2005');

    await page.click('.signIn__container-button button:nth-child(1)');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Adding a delay to ensure everything is loaded
    await new Promise(resolve => setTimeout(resolve, 2000));


    const confirmButtonSelector = '.van-button__text';
    await page.waitForSelector('.van-button__text')
    const confirmButton = await page.$(confirmButtonSelector);

    if (confirmButton) {
        await confirmButton.click();
    } else {
        console.log("Confirm button not found");
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.waitForSelector('.daman-lottery');

    const firstChildSelector = '.daman-lottery > .daman_img:first-child';

    const firstChild = await page.$(firstChildSelector);

    if (firstChild) {

        const buttonSelector = '.daman-btn';
        const button = await firstChild.$(buttonSelector);
        if (button) {
            console.log("Button found, clicking...");
            await button.click();
        } else {
            console.log("Button not found inside the first child");
        }
    } else {
        console.log("First child not found inside .damn-lottery");
    }

    //g
    //p
    //r

    const violate = '.Betting__C-head .Betting__C-head-p';
    await violateColor(page , violate)

}

async function violateColor(page , violate) {
    await page.waitForSelector(violate, { timeout: 100000 });

    const bettingButton = await page.$(violate);

    if (bettingButton) {
        console.log("Betting button found, clicking...");
        await bettingButton.click();
    } else {
        console.log("Betting button not found");
    }
}

scrap().catch(error => console.error('Error:', error));
