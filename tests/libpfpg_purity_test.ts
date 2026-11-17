import { assert, assertEquals } from "@std/assert";

// `src/js/libpfpg/` is the DOM-free seed of the future @tksh/libpfpg package
// (see src/js/libpfpg/README.md). Nothing in it may reach the DOM, the page
// location, the network, or the app's own modules, or the directory stops being
// publishable as a library.

const LIB_DIR = new URL("../src/js/libpfpg/", import.meta.url);

const FORBIDDEN_PATTERNS: Array<[string, RegExp]> = [
  ["document", /\bdocument\b/],
  ["location", /\blocation\b/],
  ["fetch", /\bfetch\s*\(/],
  ["import.meta.hot", /import\.meta\.hot/],
  ["window", /\bwindow\b/],
];

// App-internal specifiers from deno.jsonc. The library may only import
// `@tksh/*` packages, the standard library, and its own relative modules.
const APP_SPECIFIER =
  /^(?:\.{0,2}\/)?(?:src\/js\/)?(?:constants|state|tab-|button|modal|shared-image|svg-to-png|common-utils|color-formatter|group-colors-svg|utils|init|i18n|encode\/|io\/)/;

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function sourceFiles(): string[] {
  const entries: string[] = [];
  for (const entry of Deno.readDirSync(LIB_DIR)) {
    if (entry.isFile && entry.name.endsWith(".ts")) {
      entries.push(entry.name);
    }
  }
  return entries.sort();
}

Deno.test("libpfpg contains TypeScript sources", () => {
  assert(sourceFiles().length > 0, "no .ts files found in src/js/libpfpg/");
});

for (const name of sourceFiles()) {
  Deno.test(`libpfpg/${name} stays DOM-free and app-free`, async () => {
    const source = stripComments(
      await Deno.readTextFile(new URL(name, LIB_DIR)),
    );

    for (const [label, pattern] of FORBIDDEN_PATTERNS) {
      const match = source.match(pattern);
      assertEquals(
        match,
        null,
        `libpfpg/${name} must not reference ${label}`,
      );
    }

    const specifiers = [...source.matchAll(/(?:from|import)\s*"([^"]+)"/g)]
      .map((match) => match[1]!);
    for (const specifier of specifiers) {
      // Relative imports inside libpfpg are fine.
      if (specifier.startsWith("./") || specifier.startsWith("../")) continue;
      // Bare specifiers must be a published package, never an app alias.
      assert(
        !specifier.startsWith("node:"),
        `libpfpg/${name} must not import ${specifier}`,
      );
      assert(
        !APP_SPECIFIER.test(specifier),
        `libpfpg/${name} must not import app module "${specifier}"`,
      );
      assert(
        specifier.startsWith("@tksh/") || specifier.startsWith("@std/") ||
          specifier.startsWith("jsr:"),
        `libpfpg/${name} imports "${specifier}", which is neither a @tksh ` +
          "package nor the standard library",
      );
    }
  });
}
