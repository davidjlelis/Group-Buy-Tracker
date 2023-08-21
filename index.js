import puppeteer from "puppeteer";

const url = "https://novelkeys.com/pages/product-updates";

const main = async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const f = await page.$("[class='tab']");

    const text = await (await f.getProperty('textContent')).jsonValue();
    
    // remove new line
    let clean_text = await (await text.replaceAll(/\n/g,''));
    // separating group buys
    clean_text = await (await text.replaceAll(/\t/g,'splitting group buys'));

    //clean_text = await (await text.replaceAll(/\v/g,'splitting test'));
    //console.log("Text is: " + text);
    console.log("Text is: " + clean_text);
    await browser.close();


/*
    await page.screenshot({ path: 'screenshot.png'});
    await browser.close();
*/
}

main();