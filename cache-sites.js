const request = require('request');
const async = require('async');
const chalk = require('chalk');

const sites = require('./sites');

const MAX_REQUESTS = 10;
const WARNING = chalk.yellow('WARNING');

function cacheSites() {
  return new Promise((resolve, reject) => {
    async.eachLimit(sites.all, MAX_REQUESTS, (site, cb) => {
      if (site.hasCacheSync()) return cb();
      request.get(site.url, (err, res, body) => {
        if (err) {
          console.log(`${WARNING}: Fetching ${site.desc} ` +
                      `errored with ${err}`);
        } else if (res.statusCode !== 200) {
          console.log(`${WARNING}: Fetching ${site.desc} ` +
                      `failed with HTTP ${res.statusCode}`);
        } else {
          site.setCacheSync(body);
          console.log(`Cached ${site.desc}.`);
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
