const markdownTable = require('markdown-table');
const cachedSites = require('./sites').getCachedSync();
const siteClasses = new Map();

cachedSites.forEach(site => {
  const html = site.getCacheSync();
  const re = /usa-([A-Za-z0-9\-_]+)/g;
  let classes = new Map();
  let match;

  while (match = re.exec(html)) {
    const className = `usa-${match[1]}`;
    classes.set(className, (classes.get(className) || 0) + 1);
  }

  for (let className of classes.keys()) {
    siteClasses.set(className, (siteClasses.get(className) || 0) + 1);
  }
});

const sorted = Array.from(siteClasses.keys()).sort((a, b) => {
  return siteClasses.get(b) - siteClasses.get(a);
});

const rows = sorted.map(className => [
  className,
  Math.floor(siteClasses.get(className) / cachedSites.length * 100) + '%',
]);

const table = markdownTable([
  ['Class', 'Usage'],
].concat(rows));

console.log(table);

console.log(
  "\nUsage represents the percentage of USWDS sites whose front page " +
  "uses the class at least once."
);
