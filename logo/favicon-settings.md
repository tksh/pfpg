# Favicon settings

## Generate favicon

- original drawing with Affinity Designer: <logo/pfpg-logo.afdesign>
- finished svg: <logo/pfpg-logo-simplified-linecap_butt.svg>
- rendered via resvg-js playground: <logo/pfpg-logo-simplified-linecap_butt_512x512.png>
  - for input to below generator
- generator: <https://realfavicongenerator.net/>
- checker: <https://realfavicongenerator.net/favicon_checker?protocol=https&site=pfpg.netlify.app%2F>

Code generated via realfavicongenerator.net:

```html
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
```

And some deleting and editing referenced by:
[How to Favicon in 2024: Six files that fit most needs—Martian Chronicles, Evil Martians’ team blog](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

### Added tags in `<head>`

```html
    <!-- Favicon -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
```

### Added files

```sh
-rw-r--r-- 1 tksh tksh 6.6K Feb  4 05:57 android-chrome-192x192.png
-rw-r--r-- 1 tksh tksh  13K Feb  4 05:57 android-chrome-512x512.png
-rw-r--r-- 1 tksh tksh 9.9K Feb  4 14:49 apple-touch-icon.png
-rw-r--r-- 1 tksh tksh  15K Feb  4 05:57 favicon.ico
-rw-r--r-- 1 tksh tksh  292 Feb  4 14:07 favicon.svg
-rw-r--r-- 1 tksh tksh  426 Feb  4 05:57 site.webmanifest
```

### Apple touch icon processing

1. Resize to 180 x 180 px
2. Add 20 px borders
3. Resize to 180 x 180 px, again
