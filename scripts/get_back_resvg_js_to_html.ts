// Get back the resvg-js script link tag to the HTML.
// `deno bundle` unfortunately remove it.

// Target file: ./dist/index.html

// From:
//    <!-- resvg-js via local -->

// To:
//    <!-- resvg-js via local -->
//    <script src="./resvg-js-wasm/index.min.js" ></script>

async function main() {
  // Get a string
  const content = await Deno.readTextFile("./dist/index.html");

  // Add after the "<!-- resvg-js via local -->" line
  const updatedContent = content.replace(
      `<!-- resvg-js via local -->`,
      `<!-- resvg-js via local -->
      <script src="./resvg-js-wasm/index.min.js"></script>`,
  );


  // Write the string back to the file
  await Deno.writeTextFile("./dist/index.html", updatedContent);

  console.log(`Successfully updated ./dist/index.html`);
}

// メインスクリプトとして実行された場合にmain関数を呼び出す
if (import.meta.main) {
  await main();
}
