import puppeteer from 'puppeteer';
import express from "express";
import bodyParser from 'body-parser';
import dotnv from "dotenv";
import Xvfb from "xvfb"

var xvfb = new Xvfb({
    silent: true,
    xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
});

let jsonData;
let browser;

dotnv.config();
const app = express();
const port = process.env.PORT || 4000;

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

    } else if (jsonData.betType == "number") {
        scrap2().catch(error => {
            console.error('Error:', error);
            resp.status(500).send({ error: 'An error occurred' });
        });
    } else {
        scrap3().catch(error => {
            console.error('Error:', error);
            resp.status(500).send({ error: 'An error occurred' });
        });
    }


})


app.post('/stop', async (req, res) => {
    try {
        if (browser) {
            await browser.close(); // Close the browser
            browser = null; // Set the browser to null
            res.status(200).send({ message: 'Browser closed successfully.' });
        } else {
            res.status(200).send({ message: 'Browser is not running.' });
        }
    } catch (error) {
        console.error('Error closing the browser:', error);
        res.status(500).send({ message: 'Error closing the browser.' });
    }
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

//The main function
async function scrap1() {
    console.log("phase1")

    xvfb.start((err) => { if (err) console.error(err) });

    console.log("phase2")

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--start-fullscreen',
            '--disable-setuid-sandbox',
            '--display=' + xvfb._display
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });

    console.log("phase3")

    let page = await browser.newPage();

    console.log("phase3")
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
    browser = await puppeteer.launch({
        headless: false,
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    });

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


async function scrap3() {

    browser = await puppeteer.launch({
        headless: false,
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    });

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

    await manageNumberBetCycle2(page, jsonData.amounts[0]);
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
            await closePopup(page);
            currentIndex = 0;
            console.log("Violation occurred, restarting with 10");
        } else {
            await closePopup(page);
            currentIndex = (currentIndex + 1);
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
                await closePopup(page);
                amount = betArray[betIndex];
                betIndex = (betIndex + 1);
            } else if (result === 'win') {
                await closePopup(page);
                amount = initialAmount;
                betIndex = 1;
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




async function closePopup(page) {
    const closeButtonSelector = '.WinningTip__C-body .closeBtn';
    try {
        await page.waitForSelector(closeButtonSelector, { timeout: 5000, visible: true });
        const closeButton = await page.$(closeButtonSelector);
        if (closeButton) {
            console.log("Close button found, clicking...");
            await closeButton.click();
            console.log("Close button clicked successfully");
        } else {
            console.log("Close button not found");
        }
    } catch (error) {
        console.log("Error finding or clicking close button:", error.message);
    }
}







// function for automatic Number bet , this section _________________________________________________ reserved


async function manageNumberBetCycle2(page, initialAmount) {
    let amount = initialAmount;
    let betIndex = 1;
    const betArray = jsonData.amounts;
    let result = 'win';
    let userNumber = null;

    while (true) {
        let timerValue = await getTimerValue(page);
        console.log(`Timer value: ${timerValue}`);

        if (timerValue > 6) {
            // Get the best number to bet on if the previous result was a win
            if (result === 'win' || userNumber === null) {
                userNumber = await getChartData(page);
                console.log('Betting on Number:', userNumber);
            }

            result = await placeNumberBet2(page, amount, userNumber, timerValue);

            if (result === 'loss') {
                await closePopup(page);
                amount = betArray[betIndex];
                betIndex++;
            } else if (result === 'win') {
                await closePopup(page);
                amount = initialAmount;
                betIndex = 1;
                userNumber = null; // Reset userNumber to get a new number after the next win
            }
        } else {
            console.log("Waiting for timer to be above 6 seconds...");
            await new Promise(resolve => setTimeout(resolve, 600));
        }
    }
}




async function getChartData(page) {

    await page.evaluate(() => {
        const recordNav = document.querySelector('.RecordNav__C');
        if (recordNav) {
            const chartButton = recordNav.children[1];
            if (chartButton) {
                chartButton.click();
            }
        }
    });

    console.log("chat section");


    await page.waitForSelector('.Trend__C-body1');

    console.log("Body is found");

    await new Promise(resolve => setTimeout(resolve, 1000));

    const numbersData = await page.evaluate(() => {
        // The parent container of the numbers data
        const trendBody = document.querySelector('.Trend__C-body1');

        // Elements representing the winning numbers
        const winningNumberElements = Array.from(trendBody.querySelectorAll('.Trend__C-body1-line-num')[0].children);

        // Elements representing the missing values
        const missingElements = Array.from(trendBody.querySelectorAll('.Trend__C-body1-line-num')[1].children);

        // Elements representing the frequencies
        const frequencyElements = Array.from(trendBody.querySelectorAll('.Trend__C-body1-line-num')[3].children);

        const numbersData = [];

        frequencyElements.forEach((frequencyElement, index) => {
            const frequency = parseInt(frequencyElement.innerText); // Get frequency value
            const missing = parseInt(missingElements[index].innerText); // Get corresponding missing value
            const number = parseInt(winningNumberElements[index].innerText); // Get corresponding winning number
            numbersData.push({ number, frequency, missing }); // Store the data
        });

        // Sort data by frequency in descending order, and by missing in descending order if frequencies are the same
        numbersData.sort((a, b) => b.frequency - a.frequency || b.missing - a.missing);

        return numbersData;
    });

    console.log(numbersData);

    // Return the winning number based on the highest frequency and missing value
    if (numbersData && numbersData.length > 0) {
        return numbersData[0].number;
    } else {
        return null;
        // Return null if no data is found
    }
}



async function placeNumberBet2(page, amount, number, timerValue) {
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
        return await placeNumberBet2(page, amount, number, timerValue);
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

    const result = await checkNumberBetResult2(page, number);
    return result;
}

async function checkNumberBetResult2(page, number) {
    const resultSelector = '.Trend__C-body2 div:first-child';
    await page.waitForSelector(resultSelector, { timeout: 100000 });

    const lastResult = await page.evaluate(resultSelector => {
        const resultElement = document.querySelector(resultSelector);
        if (resultElement) {
            const resultNumber = parseInt(resultElement.getAttribute('number'), 10);
            return resultNumber;
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
