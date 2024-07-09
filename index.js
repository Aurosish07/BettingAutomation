import { launch } from 'puppeteer';
import express from "express";
import bodyParser from 'body-parser';

let jsonData;

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: 1 }));


app.get("/", (req, res) => {

    res.sendFile("public/index.html", { root: __dirname + "/public" });

})

app.post("/submit", (req, resp) => {

    let data = {
        login: {
            userid: req.body.userId,
            password: req.body.password
        },
        betType: req.body.betType,
        amounts: req.body.betAmounts.split(',').map(Number),
        Betno: req.body.betNumber
    };

    jsonData = data;

    console.log(data)

    resp.redirect("/handler")

})

app.get("/handler", (req, resp) => {


    if (jsonData.betType == "color") {

        scrap1().catch(error => {
            console.error('Error:', error);
            resp.status(500).send({ error: 'An error occurred' });
        });

    } else {
        scrap2().catch(error => {
            console.error('Error:', error);
            resp.status(500).send({ error: 'An error occurred' });
        });
    }


})




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

//The main function
async function scrap1() {

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

    //clicking on the win-go
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

    // await manageNumberBetCycle(page, jsonData.amounts[0]);
}





async function scrap2() {

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

    //clicking on the win-go
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

    // await manageBetCycle(page, jsonData.amounts);

    await manageNumberBetCycle(page, jsonData.amounts[0]);
}

//Betting started
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

//to get current Timing
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


    const timerSelector = '.TimeLeft__C-time';
    const RealTime = await page.evaluate(timerSelector => {
        const timerElement = document.querySelector(timerSelector);
        if (timerElement) {
            const timerChildren = timerElement.children;
            const tensSeconds = parseInt(timerChildren[3].innerText, 10);
            const unitsSeconds = parseInt(timerChildren[4].innerText, 10);
            const seconds = tensSeconds * 10 + unitsSeconds;
            return seconds;
        }
        return null;
    }, timerSelector);

    const waitTime = (RealTime + 2) * 1000;
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


//To cheak and return the result of bet
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












//Function section for Number Bet ______________________________________________________________  Starting


async function manageNumberBetCycle(page, initialAmount) {
    let amount = initialAmount;
    let betIndex = 1;
    const betArray = jsonData.amounts;
    const userNumber = parseInt(jsonData.Betno, 10);

    while (true) {
        let timerValue = await getTimerValue(page);
        console.log(`Timer value: ${timerValue}`);

        if (timerValue > 6) {
            const result = await placeNumberBet(page, amount, userNumber, timerValue);
            if (result === 'loss') {
                amount = betArray[betIndex];
                betIndex = (betIndex + 1) % betArray.length;
            } else if (result === 'win') {
                amount = initialAmount;
                betIndex = 0;
            }
        } else {
            console.log("Waiting for timer to be above 6 seconds...");
            await new Promise(resolve => setTimeout(resolve, 600));
        }
    }
}

async function placeNumberBet(page, amount, number, timerValue) {
    const numberSelector = `.Betting__C-numC-item${number}`;
    await page.waitForSelector(numberSelector);

    const checkAndClickButton = async () => {
        const numberButton = await page.$(numberSelector);
        if (numberButton) {
            const isDisabled = await page.evaluate(button => button.disabled, numberButton);
            if (!isDisabled) {
                console.log(`Number button ${number} found and enabled, clicking...`);
                await numberButton.click();
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
        return await placeNumberBet(page, amount, number, timerValue);
    }

    const timerSelector = '.TimeLeft__C-time';
    const RealTime = await page.evaluate(timerSelector => {
        const timerElement = document.querySelector(timerSelector);
        if (timerElement) {
            const timerChildren = timerElement.children;
            const tensSeconds = parseInt(timerChildren[3].innerText, 10);
            const unitsSeconds = parseInt(timerChildren[4].innerText, 10);
            const seconds = tensSeconds * 10 + unitsSeconds;
            return seconds;
        }
        return null;
    }, timerSelector);

    const waitTime = (RealTime + 2) * 1000; // Adjusting the wait time calculation
    await new Promise(resolve => setTimeout(resolve, waitTime));

    const result = await checkNumberBetResult(page, number);
    return result;
}

async function checkNumberBetResult(page, number) {
    const resultSelector = '.GameRecord__C-body .van-row';
    await page.waitForSelector(resultSelector, { timeout: 100000 });

    const lastResult = await page.evaluate(resultSelector => {
        const resultElement = document.querySelector(resultSelector);
        if (resultElement) {
            const secondChild = resultElement.children[1];
            if (secondChild) {
                const resultNumberElement = secondChild.querySelector('.GameRecord__C-body-num');
                if (resultNumberElement) {
                    const resultNumber = parseInt(resultNumberElement.innerText, 10);
                    return resultNumber;
                }
            }
        }
        return null;
    }, resultSelector);

    if (lastResult === number) {
        return 'win';
    } else {
        return 'loss';
    }
}


// scrap1().catch(error => console.error('Error:', error));
// scrap2().catch(error => console.error('Error:', error));
