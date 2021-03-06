const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const config = require('../config/envconfig');

async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

async function writeFile(path, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, 'base64', function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

exports.createDriver = async function () {
    const width = 1920;
    const height = 1080;

    const service = new chrome.ServiceBuilder(config.chrome_driver && config.chrome_driver.length > 0 ? config.chrome_driver : undefined).build();
    chrome.setDefaultService(service);

    let options = new chrome.Options();
    if (config.chrome_binary && config.chrome_binary.length > 0) {
        options = options.setChromeBinaryPath(config.chrome_binary);
    }
    if (config.chrome_headless) {
        options = options.headless();
    }
    if (config.chrome_profile) {
        options = options.addArguments("user-data-dir=" + config.chrome_profile);
    }
    options = options.windowSize({ width, height });

    return new Promise((resolve, reject) => {
        new webdriver.Builder()
            .withCapabilities(webdriver.Capabilities.chrome())
            .setChromeOptions(options)
            .build()
            .then(driver => {
                driver.cleanup = async function () {
                    await driver.quit();
                    await service.kill();
                };
                resolve(driver);
            });
    });
};

exports.waitForId = async function (driver, id, timeoutSeconds, predicate) {

    for (let i = 0; i < timeoutSeconds * 10; i++) {
        await sleep(100);

        try {
            const elements = await driver.findElements(webdriver.By.id(id));
            if (elements && elements.length) {
                for (const element of elements) {
                    if (await predicate(element)) {
                        return element;
                    }
                }
            }
        }
        catch (e) {
        }
    }

    return null;
};

exports.waitForCss = async function (driver, css, timeoutSeconds, predicate) {

    for (let i = 0; i < timeoutSeconds * 10; i++) {
        await sleep(100);

        try {
            const elements = await driver.findElements(webdriver.By.css(css));
            if (elements && elements.length) {
                for (const element of elements) {
                    if (await predicate(element)) {
                        return element;
                    }
                }
            }
        }
        catch (e) {
        }
    }

    return null;
};

exports.waitForXpath = async function (driver, xpath, timeoutSeconds, predicate) {

    for (let i = 0; i < timeoutSeconds * 10; i++) {
        await sleep(100);

        try {
            const elements = await driver.findElements(webdriver.By.xpath(xpath));
            if (elements && elements.length) {
                for (const element of elements) {
                    if (await predicate(element)) {
                        return element;
                    }
                }
            }
        }
        catch (e) {
        }
    }

    return null;
};

async function checkPreviousAction(driver) {
    const retries = await driver.findElements(webdriver.By.id("previousActionNotFinishedOverlayFormContainer"));
    if (retries && retries.length) {
        for (const retry of retries) {
            if (retry.isDisplayed()) {
                throw new Error("Previous action was not finished");
            }
        }
    }
}

async function killOverlay(driver) {
    const overlays = await driver.findElements(webdriver.By.xpath("//div[contains(@class,'ui-widget-overlay')]"));
    if (overlays && overlays.length) {
        for (const overlay of overlays) {
            if (overlay.isDisplayed()) {
                await driver.executeScript("arguments[0].setAttribute('display','none');", overlay);
            }
        }
    }
}

exports.saveScreenshot = async function (driver) {
    try {
        if (!driver || !driver.takeScreenshot) {
            throw new Error("Could not save screenshot: " + driver + "\n" + JSON.stringify(driver));
        }
        const base64Png = await driver.takeScreenshot();
        if (base64Png) {
            await writeFile(new Date().getTime() + ".png", base64Png);
        }
    }
    catch (error) {
        console.log("Error while saving screenshot: " + error.message + "\n" + error.stack);
    }
}

exports.click = async function (driver, element) {
    await checkPreviousAction(driver);
    await killOverlay(driver);
    await driver.executeScript("$(arguments[0]).click();", element);
};

exports.sendKeys = async function (driver, element, value) {
    await checkPreviousAction(driver);
    await killOverlay(driver);
    await driver.executeScript("$(arguments[0]).val(arguments[1]);", element, value);
}

