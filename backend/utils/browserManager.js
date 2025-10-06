const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');
const logger = require('./logger');

let sharedBrowser = null;
let initializing = null;
let activePages = 0;
const MAX_CONCURRENT_PAGES = 1; // keep low on Render free/shared plans
const queue = [];

async function launchBrowser() {
  const isLinux = process.platform === 'linux';
  let executablePath;
  let launchArgs;
  let defaultViewport;
  let headlessOption;

  if (isLinux) {
    try {
      executablePath = await chromium.executablePath();
      launchArgs = chromium.args;
      defaultViewport = chromium.defaultViewport;
      headlessOption = chromium.headless;
    } catch (e) {
      logger.warn('Chromium (Sparticuz) path resolution failed; falling back to Puppeteer default');
    }
  }

  if (!executablePath) {
    executablePath = typeof puppeteer.executablePath === 'function' ? puppeteer.executablePath() : undefined;
    launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ];
    defaultViewport = null;
    headlessOption = 'new';
  }

  const browser = await puppeteer.launch({
    headless: headlessOption,
    executablePath,
    args: launchArgs,
    defaultViewport
  });

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
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(60000);
      return await fn(page);
    } finally {
      await page.close().catch(() => {});
    }
  } finally {
    activePages -= 1;
    const next = queue.shift();
    if (next) next();
  }
}

module.exports = {
  getBrowser,
  withPage,
};

