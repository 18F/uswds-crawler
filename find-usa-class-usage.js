const markdownTable = require('markdown-table');
const sites = require('./sites');
const classes = {};

sites.getCachedSync().forEach(site => {
  const html = site.getCacheSync();
  const re = /usa-([A-Za-z0-9\-_]+)/g;
  let match;

  while (match = re.exec(html)) {
    const className = `usa-${match[1]}`;
    if (!(className in classes)) {
      classes[className] = 0;
    }
    classes[className] += 1;
  }
});

const sorted = Object.keys(classes).sort((a, b) => {
  return classes[b] - classes[a];
});

const table = markdownTable([
  ['Class', 'Count'],
].concat(sorted.map(className => [className, classes[className]])));

console.log(table);
