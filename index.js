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

      const progressBar = await element.$('.preorder-timeline-progress-bar');
      let progressValue = null;

      if (progressBar) {
        progressValue = await progressBar.evaluate(node => node.style.width);
      }

      groupBuys.push({ type: groupBuyType, title, progressValue });
    }

    allGroupBuys.push(groupBuys);
  }

  await browser.close();

  return allGroupBuys;
}

scrapeGroupBuys().then(data => {
  console.log(data);
});
