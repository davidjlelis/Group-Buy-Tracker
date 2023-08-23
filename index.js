import puppeteer from "puppeteer";

async function scrapeGroupBuys() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const currentQuarter = getCurrentQuarterAndYear;

    await page.goto('https://novelkeys.com/pages/product-updates');
    await page.waitForSelector('.tab-button-text', { timeout: 10000 });

    const tabButtons = await page.$$('.tab-button');

    const allGroupBuyTypes = [];

    for (const tabButton of tabButtons) {
        const groupBuyType = await tabButton.$eval('.tab-button-text', node => node.textContent.trim());
        allGroupBuyTypes.push(groupBuyType);
    }

    const tabs = await page.$$('.tab');

    const allGroupBuys = [];

    for (const tab of tabs) {
        const groupBuyType = allGroupBuyTypes.shift(); // Get the type from the array
        const groupBuyElements = await tab.$$('.preorder-timeline-link');
        const groupBuys = [];
        for (const element of groupBuyElements) {
            const title = await element.$eval('.preorder-timeline-title', node => node.textContent.trim());

            // Extract all text content within the .preorder-timeline-details element
            const detailsText = await element.$eval('.preorder-timeline-details', node => node.textContent);

            // Parse the details text to find "Current Status" and "Estimated Arrival"
            const currentStatusMatch = detailsText.match(/Current Status:(.*?)Estimated Arrival:/s);
            const estimatedArrivalMatch = detailsText.match(/Estimated Arrival:(.*?)\n/s);

            // Extract Current Status and Estimated Arrival if found, otherwise set to empty strings
            const currentStatus = currentStatusMatch ? currentStatusMatch[1].trim() : '';
            const estimatedArrival = estimatedArrivalMatch ? estimatedArrivalMatch[1].trim() : '';

            //console.log(groupBuyType, title, currentStatus, estimatedArrival);
            
            if(currentQuarter !== estimatedArrival){
                console.log("Not Match");
            } else {
                console.log("Match");
            }

            // Push the data into your groupBuys array if needed
            groupBuys.push({ type: groupBuyType, title, currentStatus, estimatedArrival });
        }

        // Push the groupBuys array into the allGroupBuys array if needed
        allGroupBuys.push(groupBuys);
    }

    await browser.close();

    return allGroupBuys;
}

function getCurrentQuarterAndYear() {
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-based, so we add 1

    let quarter;
    if (month >= 1 && month <= 3) {
        quarter = "Q1";
    } else if (month >= 4 && month <= 6) {
        quarter = "Q2";
    } else if (month >= 7 && month <= 9) {
        quarter = "Q3";
    } else {
        quarter = "Q4";
    }

    const year = now.getFullYear();

    return (quarter+" "+year);
}

scrapeGroupBuys().then(data => {
    console.log(data);
});
