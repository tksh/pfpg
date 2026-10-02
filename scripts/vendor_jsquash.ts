/**
 * Refresh the vendored image-encoder Wasm and their license texts.
 *
 * The jsquash packages load their Wasm with
 * `new URL("<name>.wasm", import.meta.url)`, which is a bundler contract:
 * `deno bundle` inlines the JS glue but emits no Wasm asset, so the browser
 * would look for the file next to the bundle and 404. pfpg therefore serves
 * the binaries itself, and the same goes for the license texts Apache-2.0
 * requires recipients to be able to read.
 *
 * Run after changing the pinned versions: `deno task vendor:jsquash`.
 */

// The versions must match the `imports` in deno.jsonc.
const WEBP = "npm:@jsquash/webp@1.5.0";
const OXIPNG = "npm:@jsquash/oxipng@2.3.0";

interface VendoredFile {
  /** Path inside the npm package, as `import.meta.resolve` knows it. */
  from: string;
  /** Path under `src/`, where the build reads it from. */
  to: string;
  /** Why the file is here, and what it obliges us to ship. */
  note: string;
}

const WASM_DEST = "src/assets/jsquash";
const LICENSE_DEST = "src/licenses";

const FILES: VendoredFile[] = [
  {
    // Wasm the encoder loads at runtime; see the copy:encoder-wasm task.
    from: `${WEBP}/codec/enc/webp_enc.wasm`,
    to: `${WASM_DEST}/webp_enc.wasm`,
    note: "libwebp encoder, used when the browser has no Wasm SIMD",
  },
  {
    from: `${WEBP}/codec/enc/webp_enc_simd.wasm`,
    to: `${WASM_DEST}/webp_enc_simd.wasm`,
    note: "libwebp encoder, used when the browser reports Wasm SIMD",
  },
  {
    from: `${OXIPNG}/codec/pkg/squoosh_oxipng_bg.wasm`,
    to: `${WASM_DEST}/squoosh_oxipng_bg.wasm`,
    note:
      "oxipng, single-threaded build; the multi-threaded one needs a Worker " +
      "and COOP/COEP headers, which pfpg does not use",
  },
  {
    from: `${WEBP}/LICENSE`,
    to: `${LICENSE_DEST}/jsquash-webp-Apache-2.0.txt`,
    note: "license of the @jsquash/webp glue we ship as JavaScript",
  },
  {
    from: `${WEBP}/codec/LICENSE.codec.md`,
    to: `${LICENSE_DEST}/jsquash-webp-codec-libwebp-BSD-3-Clause.md`,
    note: "license of the libwebp code inside the WebP encoder Wasm",
  },
  {
    from: `${OXIPNG}/LICENSE`,
    to: `${LICENSE_DEST}/jsquash-oxipng-Apache-2.0.txt`,
    note: "license of the @jsquash/oxipng glue we ship as JavaScript",
  },
  {
    from: `${OXIPNG}/codec/LICENSE.codec.md`,
    to: `${LICENSE_DEST}/jsquash-oxipng-codec-oxipng-MIT.md`,
    note: "license of the oxipng code inside the PNG optimizer Wasm",
  },
];

const PROVENANCE = `# Vendored image encoder assets

These files are copied verbatim out of the pinned packages by
\`deno task vendor:jsquash\`; do not edit them by hand. The two encoders load
their Wasm with \`new URL("<name>.wasm", import.meta.url)\`, which \`deno bundle\`
does not turn into an emitted asset, so the page fetches them from here (the
build copies this directory to \`dist/jsquash/\`).

| File | From | Size | License |
| --- | --- | --- | --- |
| \`webp_enc.wasm\` | \`@jsquash/webp@1.5.0\` \`codec/enc/\` | 281 KB | BSD-3-Clause (libwebp) |
| \`webp_enc_simd.wasm\` | \`@jsquash/webp@1.5.0\` \`codec/enc/\` | 346 KB | BSD-3-Clause (libwebp) |
| \`squoosh_oxipng_bg.wasm\` | \`@jsquash/oxipng@2.3.0\` \`codec/pkg/\` | 164 KB | MIT (oxipng) |

The multi-threaded \`squoosh_oxipng_bg.wasm\` variant is deliberately not
vendored: it only engages inside a Worker and additionally requires
\`Cross-Origin-Opener-Policy\` and \`Cross-Origin-Embedder-Policy\` headers,
which would apply to the whole page and block the Google Fonts and Cloudinary
subresources \`index.html\` loads.

The license texts of the packages and of the codecs live in \`src/licenses/\`
and are copied to \`dist/licenses/\` by the \`copy:licenses\` task.
`;

// `import.meta.resolve` answers with a `file:` URL once Deno has the package,
// which it does as soon as the import map references it. The URL has to be
// passed to Deno as a URL: a `file://` string is treated as a literal path.
function resolveInsidePackage(specifier: string): URL {
  const url = import.meta.resolve(specifier);
  if (!url.startsWith("file:")) {
    throw new Error(
      `vendor_jsquash: ${specifier} did not resolve to a file: ${url}`,
    );
  }
  return new URL(url);
}

export async function main(): Promise<void> {
  for (const dir of [WASM_DEST, LICENSE_DEST]) {
    await Deno.mkdir(dir, { recursive: true });
  }

  for (const file of FILES) {
    const source = await resolveInsidePackage(file.from);
    const bytes = await Deno.readFile(source);
    await Deno.writeFile(file.to, bytes);
    const size = `${(bytes.byteLength / 1024).toFixed(0)} KB`;
    console.log(`✅ ${file.to} (${size}) — ${file.note}`);
  }

  await Deno.writeTextFile(
    `${WASM_DEST}/README.md`,
    PROVENANCE,
  );
  console.log(`✅ ${WASM_DEST}/README.md (provenance)`);
}

if (import.meta.main) {
  await main();
}
