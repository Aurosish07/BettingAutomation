import { launch } from 'puppeteer';
import { readFile } from 'fs';


let jsonData;
async function scrap() {

    readFile('data.json', 'utf8', (err, data) => {

        if (err) {
            console.error(err);
            return;
        }

        // Parse the JSON data
        jsonData = JSON.parse(data);

    });


    let browser = await launch({ headless: false });
    let page = await browser.newPage();

    await page.goto("https://tirangaapk.com/#/login", { waitUntil: 'networkidle0', timeout: 60000 });

    await page.waitForSelector('.phoneInput__container-input input[name="userNumber"]');
    await page.waitForSelector('.passwordInput__container-input input[type="password"]');
    await page.waitForSelector('.signIn__container-button button:nth-child(1)');

    await page.type('.phoneInput__container-input input[name="userNumber"]', `${jsonData.login.userid}`);
    await page.type('.passwordInput__container-input input[type="password"]', `${jsonData.login.password}`);

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


    await new Promise(resolve => setTimeout(resolve, 2000));


    await violateColor(page, violate)
    await EnterAmout(10, page);


}

async function violateColor(page, violateSelector) {
    await page.waitForSelector(violateSelector, { timeout: 100000 });

    const checkAndClickButton = async () => {
        const bettingButton = await page.$(violateSelector);

        if (bettingButton) {
            const isDisabled = await page.evaluate(button => button.disabled, bettingButton);
            if (!isDisabled) {
                console.log("Betting button found and enabled, clicking...");
                await bettingButton.click();
                return true;
            } else {
                console.log("Betting button is disabled, waiting...");
                return false;
            }
        } else {
            console.log("Betting button not found");
            return false;
        }
    };

    let clicked = false;
    while (!clicked) {
        clicked = await checkAndClickButton();
        if (!clicked) {
            await page.waitForTimeout(500);  // Wait for 500ms before trying again
        }
    }
}

async function EnterAmout(amount, page) {

    const amountInputSelector = '.van-field__body input[type="tel"]';
    const confirmButtonSelector = '.Betting__Popup-foot .Betting__Popup-foot-s';

    await page.waitForSelector(amountInputSelector);

    await page.evaluate(selector => {
        const input = document.querySelector(selector);
        if (input) {
            input.value = "";
        }
    }, amountInputSelector);

    await page.type(amountInputSelector, String(amount));

    await page.waitForSelector(confirmButtonSelector);
    const confirmButton = await page.$(confirmButtonSelector);

    if (confirmButton) {
        await confirmButton.click();
    } else {
        console.log("Confirm button not found in popup");
    }
}


scrap().catch(error => console.error('Error:', error));
