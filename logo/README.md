# Favicon settings

## Generate favicon

- Original drawing with Affinity Designer: <logo/pfpg-logo.afdesign>
- Finished svg: <logo/pfpg-logo-simplified-linecap_butt.svg>
- Rendered via resvg-js playground: <logo/pfpg-logo-simplified-linecap_butt_512x512.png>
  - For input to below generator
- Generator: <https://realfavicongenerator.net/>
- Checker: <https://realfavicongenerator.net/favicon_checker?protocol=https&site=pfpg.netlify.app%2F>

HTML code generated via [realfavicongenerator.net](https://realfavicongenerator.net/):

```html
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
```

- And some deleting and editing
  - Merge the `<path>`s into one using [SVGOMG](https://jakearchibald.github.io/svgomg/)
  - Reference: [How to Favicon in 2024: Six files that fit most needs—Martian Chronicles, Evil Martians’ team blog](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

### Processing for Apple touch icon size

1. Resize to 180 x 180 px
2. Add 20 px borders
3. Resize to 180 x 180 px, again

## Added tags at `<head>` of `index.html` and `data-manipulator.html`

```html
    <!-- Favicon -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
```

## Added files to `./src/`

```sh
6.6K android-chrome-192x192.png
 13K android-chrome-512x512.png
9.9K apple-touch-icon.png
 15K favicon.ico
 292 favicon.svg
 426 site.webmanifest
```
