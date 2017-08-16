This repository contains some tooling that can be used to quickly
obtain information about how websites use the
[U.S. Web Design Standards][uswds].

## Quick start

You'll need [Node JS][].

```
npm install
node cache-sites.js
```

At this point, the front page of all sites that use the Standards
will be cached in the `cache` directory.

## Clearing and re-populating the cache

To clear your cached copies of the front pages of all Standards sites,
just delete the `cache` directory, e.g. `rm -rf cache`.

Then run `node cache-sites.js` to re-populate the cache with the latest
version of each page.

## Updating the site list

The site list is stored in the [`WHO_IS_USING_USWDS.md`][] file in
the Standards repository. To change the version of the repository
used to obtain the list, change the `uswds` dependency in `package.json`.

[uswds]: https://standards.usa.gov/
[Node JS]: https://nodejs.org/
[`WHO_IS_USING_USWDS.md`]: https://github.com/18F/web-design-standards/blob/develop/WHO_IS_USING_USWDS.md
