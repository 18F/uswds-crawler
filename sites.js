const fs = require('fs');
const path = require('path');

const WHO_IS_USING_USWDS = fs.readFileSync(
  path.join(__dirname, 'node_modules', 'uswds', 'WHO_IS_USING_USWDS.md'),
  'utf-8'
);

const sites = [];
const slugs = new Set();

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
    const name = match[1];
    const url = match[2];
    const slug = slugify(name);
    if (slugs.has(slug)) {
      throw new Error(`Duplicate slug: ${slug}`);
    }
    slugs.add(slug);
    sites.push({ slug, name, url });
  }
});

module.exports = sites;

if (!module.parent) {
  console.log(sites);
}
