const fs = require('fs');
const path = require('path');
const request = require('request');
const async = require('async');
const chalk = require('chalk');

const sites = require('./sites');

const CACHE_DIR = path.join(__dirname, 'cache');
const MAX_REQUESTS = 10;
const WARNING = chalk.yellow('WARNING');

const cachedName = site => path.join(CACHE_DIR, `${site.slug}.html`);
const siteDesc = site => `${chalk.white.bold(site.name)} ` +
                         `(${chalk.gray.dim(site.url)})`;

function cacheSites() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR);
    }

    async.eachLimit(sites, MAX_REQUESTS, (site, cb) => {
      const cached = cachedName(site);
      if (fs.existsSync(cached)) return cb();
      request.get(site.url, (err, res, body) => {
        if (err) {
          console.log(`${WARNING}: Fetching ${siteDesc(site)} ` +
                      `errored with ${err}`);
        } else if (res.statusCode !== 200) {
          console.log(`${WARNING}: Fetching ${siteDesc(site)} ` +
                      `failed with HTTP ${res.statusCode}`);
        } else {
          fs.writeFileSync(cached, body);
          console.log(`Cached ${siteDesc(site)}.`);
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
  });
}
