import puppeteer from "puppeteer";

async function scrapeGroupBuys() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const currentQuarter = getCurrentQuarterAndYear();
    //console.log(currentQuarter);
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
            
            const groupBuyStatus = compareQuarters(estimatedArrival, currentQuarter);

            // Push the data into your groupBuys array if needed
            groupBuys.push({ type: groupBuyType, title, currentStatus, estimatedArrival, currentQuarter, groupBuyStatus});
        }

        // Push the groupBuys array into the allGroupBuys array if needed
        allGroupBuys.push(groupBuys);
    }

    await browser.close();

    return allGroupBuys;
}

function getCurrentQuarterAndYear(date) {
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

function compareQuarters(estimatedArrival, currentQuarter) {
// Map quarter names to their corresponding months
    const quarters = {
        'Q1': [0, 1, 2],  // January, February, March
        'Q2': [3, 4, 5],  // April, May, June
        'Q3': [6, 7, 8],  // July, August, September
        'Q4': [9, 10, 11] // October, November, December
    };

    // Split the estimatedArrival into quarter and year
    const [quarter, year] = estimatedArrival.split(' ');

    // Calculate the first month of the quarter
    const firstMonthOfQuarter = quarters[quarter][0];

    // Calculate the last month of the quarter
    const lastMonthOfQuarter = quarters[quarter][2];

    // Calculate the last day of the quarter
    const lastDayOfQuarter = new Date(year, lastMonthOfQuarter + 1, 0);

    // Create a date object for the estimated arrival (last day of the quarter)
    const estimatedArrivalDate = new Date(year, lastMonthOfQuarter, lastDayOfQuarter.getDate());

    // Calculate the start and end dates of the current quarter
    const currentQuarterParts = currentQuarter.split(' ');
    const currentQuarterStart = new Date(currentQuarterParts[1], quarters[currentQuarterParts[0]][0], 1);
    const currentQuarterEnd = new Date(currentQuarterParts[1], quarters[currentQuarterParts[0]][2] + 1, 0);

    // Compare the estimated arrival date with the current quarter
    if (estimatedArrivalDate < currentQuarterStart) {
        return "Group Buy is Late. Notify Vendor.";
    } else if (estimatedArrivalDate >= currentQuarterStart && estimatedArrivalDate <= currentQuarterEnd) {
        return "Expect Group Buy soon";
    } else {
        return "Group Buy is in Progress";
    }
}
  

// Modified code to count the number of group buys in each status category
function countGroupBuysByStatus(data) {
    const statusCounts = {
        "Group Buy is Late. Notify Vendor.": 0,
        "Expect Group Buy soon": 0,
        "Group Buy is in Progress": 0
    };

    data.forEach(groupBuys => {
        groupBuys.forEach(groupBuy => {
            statusCounts[groupBuy.groupBuyStatus]++;
        });
    });

    return Object.values(statusCounts);
}

// Ensure this code runs after the document is loaded
document.addEventListener('DOMContentLoaded', function () {
    scrapeGroupBuys().then(data => {
        // Count the number of group buys in each status category
        const statusCounts = countGroupBuysByStatus(data);

        // Log the statusCounts to the console
        console.log(statusCounts);

        // Create a bar chart
        const ctx = document.getElementById('statusChart').getContext('2d');
        const statusChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    label: 'Number of Group Buys',
                    data: statusCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }
            }
        });
    });
});
