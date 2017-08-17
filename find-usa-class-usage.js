const markdownTable = require('markdown-table');
const sites = require('./sites');

function findUsaClassUsage(html) {
  const re = /usa-([A-Za-z0-9\-_]+)/g;
  let classes = new Map();
  let match;

  while (match = re.exec(html)) {
    const className = `usa-${match[1]}`;
    classes.set(className, (classes.get(className) || 0) + 1);
  }

  return classes;
}

function reportUsaClassUsageSync() {
  const cachedSites = sites.getCachedSync();
  const siteClasses = new Map();
  const invalidSites = [];

  cachedSites.forEach(site => {
    const html = site.getCacheSync();
    const classes = findUsaClassUsage(html);

    if (classes.size === 0) {
      invalidSites.push(site);
    }

    for (let className of classes.keys()) {
      siteClasses.set(className, (siteClasses.get(className) || 0) + 1);
    }
  });

  const sorted = Array.from(siteClasses.keys()).sort((a, b) => {
    return siteClasses.get(b) - siteClasses.get(a);
  });

  const numValidSites = cachedSites.length - invalidSites.length;

  const rows = sorted.map(className => [
    className,
    Math.floor(siteClasses.get(className) / numValidSites * 100) + '%',
  ]);

  const table = markdownTable([
    ['Class', 'Usage'],
  ].concat(rows));

  console.log(table);

  console.log(
    "\nUsage represents the percentage of USWDS sites whose front page\n" +
    "uses the class at least once."
  );

  if (invalidSites.length) {
    console.log("\nAdditionally, the following sites do not use *any*\n" +
                "clases that begin with `usa-`:\n");
    invalidSites.forEach(site => console.log(`* ${site.desc}`));
  }
}

module.exports = findUsaClassUsage;

if (!module.parent) {
  reportUsaClassUsageSync();
}
