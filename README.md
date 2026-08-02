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

| Library                                                     | License | Purpose                                      |
| ----------------------------------------------------------- | ------- | -------------------------------------------- |
| [svg2png-wasm](https://www.npmjs.com/package/svg2png-wasm)  | MIT     | Renders SVG into PNG images                  |
| [Alwan](https://www.npmjs.com/package/alwan)                | MIT     | Color picker UI                              |
| [@tksh/url-compressor](https://jsr.io/@tksh/url-compressor) | MIT     | URL-safe string compression                  |
| [@std/collections](https://jsr.io/@std/collections)         | MIT     | Deno standard library array/object utilities |
| [@scure/base](https://jsr.io/@scure/base)                   | MIT     | Bech32 and other binary-to-text encoding     |

## License

[Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/)

© 2023-present, SAITO Takashi (tksh)
