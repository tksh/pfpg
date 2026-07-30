// From:
//   src/js/page-specific/index/main.js
//     await resvg.initWasm(fetch("../../../resvg-js-wasm/index_bg.wasm"))
//
//     s2.src = "../../../resvg-js-wasm/index.min.js";
//
// To:
//   dist/index-********.js
//     await resvg.initWasm(fetch("./resvg-js-wasm/index_bg.wasm"))
//
//     s2.src = "./resvg-js-wasm/index.min.js";

async function main() {
    // Get index-********.js file name
    //   Wrap readDirSync in Array.from() so we can use .find()
    const distDir = Array.from(Deno.readDirSync("./dist/"));
    const indexJs = distDir.find(
        (f) => f.name.startsWith("index") && f.name.endsWith(".js"),
    );

    if (!indexJs) {
        throw new Error("Could not find index file in ./dist/");
    }

    // Get a string
    const content = await Deno.readTextFile(`dist/${indexJs.name}`);

    // Read and update content multiple times by chaining .replace()
    const updatedContent = content
        .replace(
            `fetch("../../../resvg-js-wasm/index_bg.wasm")`,
            `fetch("./resvg-js-wasm/index_bg.wasm")`,
        )
        .replace(
            `s2.src = "../../../resvg-js-wasm/index.min.js";`,
            `s2.src = "./resvg-js-wasm/index.min.js";`,
        );

    // Write the string back to the file
    await Deno.writeTextFile(`dist/${indexJs.name}`, updatedContent);

    console.log(`Successfully updated ${indexJs.name}`);
}

// メインスクリプトとして実行された場合にmain関数を呼び出す
if (import.meta.main) {
    await main();
}
