# pfpg

![logo of pfpg](src/favicon.ico)

Profile picture generator

<https://pfpg.netlify.app>

## Development

```sh
# Clone
git clone git@github.com:tksh/pfpg.git
cd pfpg/

# Install dependencies
deno install

# Build with `deno bundle`
deno task build  # Build index.html and data-manipulator.html
```

## Deploy on Netlify

`git push` to run `build.sh` on Netlify, which forces installation of the latest Deno.

## Dependencies

- [resvg-js](https://github.com/yisibl/resvg-js) (MPL 2.0 license)
- [Alwan](https://github.com/sefianecho/alwan) (MIT license)
- [@tksh/url-compressor - JSR](https://jsr.io/@tksh/url-compressor) (MIT license)
- [@std/collections - JSR](https://jsr.io/@std/collections) (MIT license)
- [@scure/base - JSR](https://jsr.io/@scure/base) (MIT license)

## License

[Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/)

© 2023-present, SAITO Takashi (tksh)
