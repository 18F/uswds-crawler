'use strict';

const cheerio = require('cheerio');
const chalk = require('chalk');

const sites = require('./sites');

function findBadGovbannersSync() {
  return sites.getCachedSync().filter(site => {
    const $ = cheerio.load(site.getCacheSync());
    const bannerText = $('.usa-banner-content').text().replace(/\s+/g, ' ');
    const falseStatements = [
      /Federal government websites always use a \.gov or \.mil domain/i,
      /signed by the U\.S\. government/i,
    ];
    return falseStatements.some(re => re.test(bannerText));
  });
}

module.exports = findBadGovbannersSync;

if (!module.parent) {
  console.log('The following sites are using old gov banner text:\n');
  findBadGovbannersSync().forEach(site => console.log(site.desc));
  console.log(
    '\nFor more details, see:',
    chalk.green('https://github.com/18F/web-design-standards/issues/1738')
  );
}
