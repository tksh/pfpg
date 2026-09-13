// From:
//   src/js/page-specific/index/main.js
//     await initialize(await fetch("../../../assets/svg2png-wasm/svg2png_wasm_bg.wasm"))
//
// To:
//   dist/index-********.js
//     await initialize(await fetch("./svg2png-wasm/svg2png_wasm_bg.wasm"))

async function main() {
  // Get the list of index-********.js file names
  const distDir = Array.from(Deno.readDirSync("./dist/"));

  // Get all .js files in the dist directory
  const jsFiles = distDir.filter((f) => f.name.endsWith(".js"));

  if (jsFiles.length === 0) {
    console.error("No .js files found in ./dist/");
    return;
  }

  // Filter the list to only the file that includes "../../../assets/svg2png-wasm/" in its content
  const filteredJsFiles = [];
  for (const jsFile of jsFiles) {
    const content = await Deno.readTextFile(`dist/${jsFile.name}`);
    if (content.includes("../../../assets/svg2png-wasm/")) {
      filteredJsFiles.push(jsFile);
    }
  }

  if (filteredJsFiles.length === 0) {
    console.error(
      "No .js files found in ./dist/ that include '../../../assets/svg2png-wasm/'",
    );
    return;
  }

  // Iterate over each .js file and update its content
  for (const jsFile of filteredJsFiles) {
    // Get a string
    const content = await Deno.readTextFile(`dist/${jsFile.name}`);

    // Read and update content
    const updatedContent = content.replace(
      `fetch("../../../assets/svg2png-wasm/svg2png_wasm_bg.wasm")`,
      `fetch("./svg2png-wasm/svg2png_wasm_bg.wasm")`,
    );

    // Write the string back to the file
    await Deno.writeTextFile(`dist/${jsFile.name}`, updatedContent);

    console.log(`Successfully updated ${jsFile.name}`);
  }
}

// メインスクリプトとして実行された場合にmain関数を呼び出す
if (import.meta.main) {
  await main();
}
