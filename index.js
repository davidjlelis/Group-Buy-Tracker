import puppeteer from "./node_modules/puppeteer";

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

    clean_text = await (await text.replaceAll(/\s{2,}/g,','));
    
    /* need to figure out a way to keep "Current Status: xxxxxx" and "Estimated Arrival: QX YYYY" into a single element */
    // splitting in to an array 
    let text_array = await (await clean_text.split(","));

    //console.log("Text is: " + text);
    //console.log("Text is: " + clean_text);
    
    
    text_array.forEach(element => {
        console.log(element);
    });
    
    await browser.close();
    

/*
    // testing puppeteer
    await page.screenshot({ path: 'screenshot.png'});
    await browser.close();
*/
}

main();