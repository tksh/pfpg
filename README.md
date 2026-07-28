# pfpg

![logo of pfpg](src/favicon.ico)

Profile picture generator

<https://pfpg.netlify.app>

## Run

```sh
# Clone
git clone git@github.com:tksh/pfpg.git
cd pfpg/

# Install `Alwan` library
bun install

# For local dev
bash scripts/build_and_preview.sh  # Execute Bun and Farm

# For deploy (without preview)
#   Execute `scripts/build.sh` via netlify.toml when `git push`
```

## Build to Netlify using Bun and Farm

`git push` to published on [Netlify](https://www.netlify.com/) automatically.

- Tools for build
  - [Bun](https://bun.sh/)
  - [Farm](https://www.farmfe.org/)

- Files for build
  - netlify.toml
  - ./scripts/*

## Libraries

- [resvg-js](https://github.com/yisibl/resvg-js) (MPL 2.0 license)
- [URLCompressor](https://synapse.kyoto/lib/url-comp/page001.html) (MIT license), convert to ESM
- [Alwan](https://github.com/sefianecho/alwan) (MIT license)
- [Deno standard library](https://github.com/denoland/deno_std) (MIT license), ported to JS
- [numcodecs.js](https://github.com/manzt/numcodecs.js) (MIT license)
- [bech32](https://github.com/bitcoinjs/bech32) (MIT license)

## License

[Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/)

© 2023-present, SAITO Takashi (tksh)
