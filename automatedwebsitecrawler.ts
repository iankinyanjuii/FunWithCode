import { chromium, Page } from 'playwright';

async function visitPage(page: Page, url: string, visitedPages: Set<string>, pagesToVisit: Set<string>) {
    await page.goto(url); // Navigate to the base URL link
    console.log(`Visited: ${url}`); // Log the visited web address
    visitedPages.add(url); // Add the vistied web address to the set of already visited pages

    // Pause for 5 seconds on each page -- this can be adjusted to any timeline depending on preference 
    await page.waitForTimeout(5000);

    // where the magic happens -- this finds all links on the page
    const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
    
    // loop over the links and navigate to next 
    for (const href of links) {
        // if the link has not been visited, add it to the pagesToVisit set
        if (href && href.startsWith('https://.com') && !visitedPages.has(href)) {
            pagesToVisit.add(href);
            console.log(`Found link to visit: ${href}`); // Log the new link to visit
        }
    }
}

async function main() {
    const browser = await chromium.launch({ headless: false }); // Launch a non-headless browser instance -- Chromium is preferred in my Playwright setup 
    const context = await browser.newContext(); // opens a new browser context or window 
    const page = await context.newPage(); // opens new page in the Chromium window 

    const baseUrl = 'https://myexample.com'; // This is the base URL to start with -- adjust it to whichever website you need to do this on

    const visitedPages = new Set<string>(); // this stores the visited web pages in the log file 
    const pagesToVisit = new Set<string>([baseUrl]); // this tracks the pending visit pages from the base link

    try {
        // loops until pages to visit are over 
        while (pagesToVisit.size > 0) {
            const nextPage = pagesToVisit.values().next().value; // navigates to next page in the set 
            pagesToVisit.delete(nextPage); // deletes a visited page from the pagesToVisit set 
            await visitPage(page, nextPage, visitedPages, pagesToVisit); // continuous loop to visit unopened pages 
        }
    } catch (error) {
        console.error('An error occurred:', error); // Error Logging Functionality 
    } finally {
        await browser.close(); // Closes the browser after tests are done 
    }

    // output log of all the visited pages
    console.log('\nVisited pages:');
    visitedPages.forEach(page => console.log(page)); 
}

// error logging for the main function 
main().catch(console.error);
