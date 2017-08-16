const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const CACHE_DIR = path.join(__dirname, 'cache');
const WHO_IS_USING_USWDS = fs.readFileSync(
  path.join(__dirname, 'node_modules', 'uswds', 'WHO_IS_USING_USWDS.md'),
  'utf-8'
);

class Site {
  constructor(name, url) {
    this.name = name;
    this.url = url;
    this.slug = slugify(name);
    this.desc = `${chalk.white.bold(name)} (${chalk.gray.dim(url)})`;
    this._cacheFilename = path.join(CACHE_DIR, `${this.slug}.html`);
  }

  hasCacheSync() {
    return fs.existsSync(this._cacheFilename);
  }

  setCacheSync(content) {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR);
    }

    fs.writeFileSync(this._cacheFilename, content);
  }

  getCacheSync() {
    if (this.hasCacheSync()) {
      return fs.readFileSync(this._cacheFilename, 'utf-8');
    }
    return null;
  }
}

Site.all = [];
Site.slugs = new Set();
Site.add = function(site) {
  if (this.slugs.has(site.slug)) {
    throw new Error(`Duplicate slug: ${site.slug}`);
  }
  this.slugs.add(site.slug);
  this.all.push(site);
};

// https://gist.github.com/mathewbyrne/1280286
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

WHO_IS_USING_USWDS.split('\n').forEach(line => {
  const match = line.match(/- \[(.+)\]\((.+)\)/);
  if (match) {
    Site.add(new Site(match[1], match[2]));
  }
});

module.exports = Site;

if (!module.parent) {
  Site.all.forEach(site => {
    console.log(site.desc);
  });
}
