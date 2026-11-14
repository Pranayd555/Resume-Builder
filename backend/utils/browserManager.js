const puppeteer = require('puppeteer');
const logger = require('./logger');

let sharedBrowser = null;
let initializing = null;
let activePages = 0;
const MAX_CONCURRENT_PAGES = 5; // Increased to allow more concurrent pages
const MAX_RETRIES = 3; // Define max retries for page operations
const queue = [];

/**
 * Chromium launch options shared by every Puppeteer caller.
 * In Docker/production PUPPETEER_EXECUTABLE_PATH points at the system Chromium
 * (/usr/bin/chromium in the image). Locally it is unset and Puppeteer uses the
 * Chrome it downloaded on npm install.
 */
function getLaunchOptions() {
  return {
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run'
    ],
    defaultViewport: null
  };
}

async function launchBrowser() {
  const browser = await puppeteer.launch(getLaunchOptions());

  browser.on('disconnected', () => {
    sharedBrowser = null;
  });

  return browser;
}

async function getBrowser() {
  if (sharedBrowser) return sharedBrowser;
  if (!initializing) {
    initializing = launchBrowser()
      .then((b) => {
        sharedBrowser = b;
        return b;
      })
      .finally(() => {
        initializing = null;
      });
  }
  return initializing;
}

async function withPage(fn) {
  // Simple concurrency gate
  if (activePages >= MAX_CONCURRENT_PAGES) {
    await new Promise((resolve) => queue.push(resolve));
  }

  activePages += 1;
  let page; // Declare page outside the try block to ensure it's accessible in finally
  try {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const browser = await getBrowser();
        page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(60000);
        return await fn(page);
      } catch (error) {
        logger.error(`Error during page function execution (attempt ${i + 1}/${MAX_RETRIES}): ${error.message}`);
        if (page) {
          await new Promise(resolve => setTimeout(resolve, 100));
          await page.close().catch(e => logger.error(`Error closing page during retry: ${e.message}`));
        }
        if (i === MAX_RETRIES - 1) {
          throw error; // Re-throw the error if all retries are exhausted
        }
        // Optionally, add a delay before retrying
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1))); // Exponential backoff
      }
    }
  } finally {
    if (page) {
      await new Promise(resolve => setTimeout(resolve, 100));
      await page.close().catch(e => logger.error(`Error closing page in final block: ${e.message}`));
    }
    activePages -= 1;
    const next = queue.shift();
    if (next) next();
  }
}

module.exports = {
  getBrowser,
  getLaunchOptions,
  withPage,
};

