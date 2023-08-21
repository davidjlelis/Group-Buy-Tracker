import puppeteer from "puppeteer";

const url = "https://novelkeys.com/pages/product-updates";

const main = async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const f = await page.$("[class='tab']")

    const text = await (await f.getProperty('textContent')).jsonValue()
    const clean_text = await (await text.replaceAll(/\s/g,''))
    console.log("Text is: " + clean_text)
    await browser.close();


/*
    await page.screenshot({ path: 'screenshot.png'});
    await browser.close();
*/
}

main();