import puppeteer from 'puppeteer';

const url = "https://novelkeys.com/pages/product-updates";

const main = async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({ path: 'screenshot.png'});
    await browser.close();

}

main();