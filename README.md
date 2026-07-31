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

## Libraries

- [resvg-js](https://github.com/yisibl/resvg-js) (MPL 2.0 license)
- [URLCompressor](https://synapse.kyoto/lib/url-comp/page001.html) (MIT license), convert to ESM
- [Alwan](https://github.com/sefianecho/alwan) (MIT license)
- [Deno standard library](https://github.com/denoland/deno_std) (MIT license), ported to JS
- [bech32](https://github.com/bitcoinjs/bech32) (MIT license)

## License

[Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/)

© 2023-present, SAITO Takashi (tksh)
