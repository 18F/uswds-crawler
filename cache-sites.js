'use strict';

const request = require('request');
const async = require('async');
const chalk = require('chalk');
const puppeteer = require('puppeteer');

const findUsaClassUsage = require('./find-usa-class-usage');
const sites = require('./sites');

const MAX_REQUESTS = 10;
const USER_AGENT = "uswds-crawler";
const WARNING = chalk.yellow('WARNING');

let browserPromise = null;

function loadBrowser() {
  if (!browserPromise) {
    console.log(`Launching headless Chromium...`);
    browserPromise = puppeteer.launch();
  }

  return browserPromise;
}

async function cacheSiteWithBrowser(site) {
  const browser = await loadBrowser();
  const page = await browser.newPage();

  console.log(`Loading ${site.desc} in the headless browser...`);

  const startTime = Date.now();

  await page.goto(site.url, { waitUntil: 'networkidle' });

  const loadTime = Date.now() - startTime;

  const html = await page.evaluate(() => {
    return Promise.resolve(document.documentElement.outerHTML);
  });

  site.setCacheSync(html);
  console.log(`Cached ${site.desc} via headless browser (${loadTime} ms).`);

  await page.close();
}

function cacheSites() {
  return new Promise((resolve, reject) => {
    async.eachLimit(sites.all, MAX_REQUESTS, (site, cb) => {
      if (site.hasCacheSync()) return cb();
      request({
        url: site.url,
        headers: {
          'User-Agent': USER_AGENT
        },
      }, (err, res, body) => {
        if (err) {
          console.log(`${WARNING}: Fetching ${site.desc} ` +
                      `errored with ${err}`);
          site.setCacheErrorSync(err);
        } else if (res.statusCode !== 200) {
          console.log(`${WARNING}: Fetching ${site.desc} ` +
                      `failed with HTTP ${res.statusCode}`);
          site.setCacheErrorSync(`HTTP ${res.statusCode}`);
        } else {
          if (findUsaClassUsage(body).size === 0) {
            return cacheSiteWithBrowser(site).then(cb).catch(cb);
          }
          site.setCacheSync(body);
          console.log(`Cached ${site.desc} via raw HTTP request.`);
        }
        cb();
      });
    }, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

if (!module.parent) {
  cacheSites().then(() => {
    console.log('Done.');

    // Ordinarily we'd close the browser if it was launched, which would
    // then result in a clean exit, but we need to work around
    // https://github.com/GoogleChrome/puppeteer/issues/298.
    process.exit(0);
  }).catch(err => {
    console.log(chalk.red("ERROR"), err);
    process.exit(1);
  });
}
