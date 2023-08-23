import puppeteer from "puppeteer";

async function scrapeGroupBuys() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

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
    const groupBuys = [];

    const groupBuyType = allGroupBuyTypes.shift(); // Get the type from the array

    const groupBuyElements = await tab.$$('.preorder-timeline-title');

    for (const element of groupBuyElements) {
      const title = await element.evaluate(node => node.textContent.trim());
 
      // Wait for the <progress> element to become available
      await page.waitForSelector('.preorder-timeline-progress-bar'); // Replace with your selector
  
      // Extract the progress bar text and parse out progress step, progress value, and estimated arrival
      const progressValue = await page.evaluate(() => {
        const progressBar = document.querySelector('.preorder-timeline-progress-bar'); // Replace with your selector
        return progressBar.value;
      });
      console.log(progressValue);

      //groupBuys.push({ type: groupBuyType, title, progressStep, progressValue, estimatedArrival });
    }

    //allGroupBuys.push(groupBuys);
  }

  await browser.close();

  return allGroupBuys;
}

scrapeGroupBuys().then(data => {
  console.log(data);
});
