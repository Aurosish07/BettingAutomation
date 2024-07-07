import { launch } from 'puppeteer';
import { readFile } from 'fs/promises';

async function scrap() {
    const data = await readFile('data.json', 'utf8');
    const jsonData = JSON.parse(data);

    let browser = await launch({ headless: false });
    let page = await browser.newPage();

    await page.goto("https://tirangaapk.com/#/login", { waitUntil: 'networkidle0', timeout: 100000 });

    await page.waitForSelector('.phoneInput__container-input input[name="userNumber"]');
    await page.waitForSelector('.passwordInput__container-input input[type="password"]');
    await page.waitForSelector('.signIn__container-button button:nth-child(1)');

    await page.type('.phoneInput__container-input input[name="userNumber"]', `${jsonData.login.userid}`);
    await page.type('.passwordInput__container-input input[type="password"]', `${jsonData.login.password}`);

    await page.click('.signIn__container-button button:nth-child(1)');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const confirmButtonSelector = '.van-button__text';
    await page.waitForSelector(confirmButtonSelector);
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
        console.log("First child not found inside .daman-lottery");
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    await manageBetCycle(page, jsonData.amounts);
}

async function manageBetCycle(page, amounts) {
    let currentIndex = 0;

    while (true) {
        let timerValue = await getTimerValue(page);
        console.log(`Timer value: ${timerValue}`);

        while (timerValue <= 6) {
            console.log("Waiting for timer to be above 10 seconds...");
            timerValue = await getTimerValue(page);
        }

        const result = await placeBet(page, amounts[currentIndex], timerValue);

        if (result === 'violate') {
            currentIndex = 0;
            console.log("Violation occurred, restarting with 10");
        } else {
            currentIndex = (currentIndex + 1) % amounts.length;
            console.log(`Bet placed successfully, moving to amount: ${amounts[currentIndex]}`);
        }
    }
}

async function getTimerValue(page) {
    const timerSelector = '.TimeLeft__C-time';
    const timerValue = await page.evaluate(timerSelector => {
        const timerElement = document.querySelector(timerSelector);
        if (timerElement) {
            const timerChildren = timerElement.children;
            const tens = parseInt(timerChildren[3].innerText, 10);
            const units = parseInt(timerChildren[4].innerText, 10);
            return tens * 10 + units;
        }
        return null;
    }, timerSelector);
    return timerValue;
}

async function placeBet(page, amount, timerValue) {
    const violateSelector = '.Betting__C-head .Betting__C-head-p';
    await page.waitForSelector(violateSelector, { timeout: 100000 });

    const checkAndClickButton = async () => {
        const bettingButton = await page.$(violateSelector);
        if (bettingButton) {
            const isDisabled = await page.evaluate(button => button.disabled, bettingButton);
            if (!isDisabled) {
                console.log("Betting button found and enabled, clicking...");
                await bettingButton.click();
                return true;
            }
        }
        return false;
    };

    let clicked = false;
    while (!clicked) {
        clicked = await checkAndClickButton();
        if (!clicked) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    try {
        await enterAmount(amount, page);
    } catch (error) {
        console.error("Error in enterAmount: ", error);
        console.log("Retrying to place the bet...");
        return await placeBet(page, amount, timerValue);
    }


    const waitTime = (60 - timerValue + 1) * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));

    const result = await checkBetResult(page);
    return result;
}


async function enterAmount(amount, page) {
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
        try {
            await page.evaluate(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        element.click();
                    } else {
                        throw new Error('Element is not visible');
                    }
                }
            }, confirmButtonSelector);
            console.log("Confirm button clicked successfully");
        } catch (error) {
            console.log("Error clicking confirm button: ", error.message);
        }
    } else {
        console.log("Confirm button not found in popup");
    }
}


async function checkBetResult(page) {
    const firstChildSelector = '.GameRecord__C-body > .van-row:first-child .van-col:last-child .GameRecord__C-origin';
    await page.waitForSelector(firstChildSelector);

    const lastElementColor = await page.evaluate(firstChildSelector => {
        const firstChild = document.querySelector(firstChildSelector);
        if (firstChild) {
            const lastChild = firstChild.lastElementChild;
            return lastChild.className.split(' ').pop();
        }
        return null;
    }, firstChildSelector);

    if (lastElementColor === 'violet') {
        console.log("Violation detected!");
        return 'violate';
    }
    return 'continue';
}

scrap().catch(error => console.error('Error:', error));
