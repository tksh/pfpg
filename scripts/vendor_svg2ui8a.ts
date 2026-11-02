/**
 * Refresh the vendored rasterizer Wasm.
 *
 * `@tksh/svg2ui8a` ships its Wasm binary as a separate `.wasm` file and
 * loads it from a URL at runtime: `deno bundle` inlines the module but emits
 * no Wasm asset, and the library's own default location points at the
 * package on JSR. pfpg serves the binary from its own origin instead, so the
 * page never reaches for a third-party host while it renders.
 *
 * The binary is fetched from JSR's file server, which serves the published
 * package files as they are. The pinned checksum proves the vendored copy is
 * the published one. The browser loads this copy with `wasmUrl`; the OGP
 * server reads it as bytes instead, so neither path fetches jsr.io at runtime.
 *
 * Run after changing the pinned version: `deno task vendor:svg2ui8a`.
 */

// The version must match the `imports` in deno.jsonc.
export const SVG2UI8A_VERSION = "0.6.1";

// JSR's file server serves the published files of a version. The
// `@scope/name@version` form of the URL is not a file-server path.
const PACKAGE_URL = `https://jsr.io/@tksh/svg2ui8a/${SVG2UI8A_VERSION}`;

const WASM_DEST = "src/assets/svg2ui8a";

export interface VendoredFile {
  /** Path inside the published package. */
  from: string;
  /** Path under `src/`, where the build reads it from. */
  to: string;
  /** Size of the published file in bytes. */
  size: number;
  /** sha256 of the published file, as 64 lowercase hex characters. */
  sha256: string;
  /** Why the file is here. */
  note: string;
}

const SVG2RGBA_FILE: VendoredFile = {
  from: "/assets/svg2rgba_bg.wasm",
  to: `${WASM_DEST}/svg2rgba_bg.wasm`,
  size: 998801,
  sha256: "efe5a798399e181b1acecd7b7f4b9e736f2a13451222e4f9cb513415717a4bb6",
  note: "the rasterizer (resvg/usvg/tiny-skia), loaded by `svg2rgba`",
};

export const FILES: VendoredFile[] = [SVG2RGBA_FILE];

const PROVENANCE = `# Vendored rasterizer assets

These files are copied verbatim out of the published package by
\`deno task vendor:svg2ui8a\`; do not edit them by hand. The browser loads
its Wasm with \`wasmUrl\`, which \`deno bundle\` does not turn into an emitted
asset, so the page fetches it from here (the build copies this directory to
\`dist/svg2ui8a/\`). The OGP server reads the same local file with
\`Deno.readFile()\` and initializes from \`wasmBytes\`, without a runtime
jsr.io fetch.

| File | From | Size | sha256 |
| --- | --- | --- | --- |
| \`svg2rgba_bg.wasm\` | \`@tksh/svg2ui8a@${SVG2UI8A_VERSION}\` \`assets/\` | ${
  (SVG2RGBA_FILE.size / 1024).toFixed(0)
} KB | \`efe5a798…a4bb6\` |

The binary contains the \`resvg\`, \`usvg\`, \`tiny-skia\` and \`roxmltree\`
code; their licenses are listed in the Credits section of \`index.html\`, and
the package itself is published at <https://jsr.io/@tksh/svg2ui8a>.
`;

/** The sha256 of the given bytes, as lowercase hex. */
export async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    bytes.slice().buffer as ArrayBuffer,
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Fail unless the bytes match the recorded size and sha256. */
export async function verifyFile(
  file: VendoredFile,
  bytes: Uint8Array,
): Promise<void> {
  if (bytes.byteLength !== file.size) {
    throw new Error(
      `vendor_svg2ui8a: ${file.to} has ${bytes.byteLength} bytes, expected ${file.size}`,
    );
  }
  const actual = await sha256(bytes);
  if (actual !== file.sha256) {
    throw new Error(
      `vendor_svg2ui8a: ${file.to} has sha256 ${actual}, expected ${file.sha256}`,
    );
  }
}

/**
 * Format the generated Markdown the way `deno fmt` would.
 *
 * The provenance file mentions the package version, so its table columns and
 * line wrapping depend on it; formatting it here keeps the file canonical
 * after a version bump.
 */
async function formatMarkdown(text: string): Promise<string> {
  const command = new Deno.Command("deno", {
    args: ["fmt", "--ext=md", "-"],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  const child = command.spawn();
  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(text));
  writer.releaseLock();
  await child.stdin.close();
  const output = await child.output();
  if (!output.success) {
    throw new Error(
      `vendor_svg2ui8a: deno fmt failed: ${
        new TextDecoder().decode(output.stderr)
      }`,
    );
  }
  return new TextDecoder().decode(output.stdout);
}

/** Fail unless the pinned version matches the import in `deno.jsonc`. */
async function verifyConfiguredVersion(): Promise<void> {
  const config = await Deno.readTextFile(
    new URL("../deno.jsonc", import.meta.url),
  );
  const match = config.match(
    /"svg2ui8a":\s*"jsr:@tksh\/svg2ui8a@\^([^/"]+)\/svg2rgba"/,
  );
  if (match === null) {
    throw new Error("vendor_svg2ui8a: cannot read the svg2ui8a import version");
  }
  if (match[1] !== SVG2UI8A_VERSION) {
    throw new Error(
      `vendor_svg2ui8a: deno.jsonc imports ${
        match[1]
      }, but the vendor script expects ${SVG2UI8A_VERSION}`,
    );
  }
}

export async function main(): Promise<void> {
  await verifyConfiguredVersion();
  await Deno.mkdir(WASM_DEST, { recursive: true });

  for (const file of FILES) {
    const url = `${PACKAGE_URL}${file.from}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `vendor_svg2ui8a: cannot fetch ${url} (${response.status} ${response.statusText})`,
      );
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    await verifyFile(file, bytes);
    await Deno.writeFile(file.to, bytes);
    const size = `${(bytes.byteLength / 1024).toFixed(0)} KB`;
    console.log(`✅ ${file.to} (${size}) — ${file.note}`);
  }

  await Deno.writeTextFile(
    `${WASM_DEST}/README.md`,
    await formatMarkdown(PROVENANCE),
  );
  console.log(`✅ ${WASM_DEST}/README.md (provenance)`);
}

if (import.meta.main) {
  await main();
}
