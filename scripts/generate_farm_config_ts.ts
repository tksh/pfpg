// Usage:
//     > deno run --allow-read --allow-write ../scripts/generate_farm_config_ts.ts


console.log('Deno.cwd(): ', Deno.cwd())
// Deno.cwd():  /opt/build/repo/farm (at Netlify deploy environment)


// 上書き生成するファイルのパス
const filePath = '../farm/farm.config.ts';

// Tab space
const TAB_SPACE = '\u0020\u0020' // Two spaces


// Generate the compilation.input values
// - Find the *.html files from ./farm/src
//     find ./farm/src/ -maxdepth 1 -name '*.html'
//         ./farm/src/index.html
//         ./farm/src/data-manipulator.html
// - and transform it like :
//      'index': './src/index.html',
//      'data-manipulator': './src/data-manipulator.html'

const htmlFiles = Array.from(Deno.readDirSync('../farm/src'))
  .filter(entry => entry.isFile && entry.name.endsWith('.html'))
  .map(entry => entry.name.replace('.html', ''));

//console.log('htmlFiles: ', htmlFiles)
//     [ "index", "data-manipulator" ]


const inputObject: Record<string, string> = {};
htmlFiles.forEach(file => {
  inputObject[file] = `../farm/src/${file}.html`;
});

//console.log('inputObject: ', inputObject)
//     inputObject:  {
//         index: "./src/index.html",
//         "data-manipulator": "./src/data-manipulator.html",
//       }



// Set the value of compilations.output.path
const outputPath = 'build'


// Generate the compilation.resolve.alias values via above html files header section
// - 1. Extract the kv pairs of paths
// - 2. Merge and remove the duplicated pairs extracted from multiple html files
// - 3. Transform it as values under compilation.resolve.alias

// Original 'importmap' in *.html

//     <script type="importmap">
//     {
//         "imports": {
//             "libs/url-comp-0-1-0/url-comp":      "./js/libs/url-comp-0-1-0/url-comp.js",
//             "libs/bech32-and-bech32m":      "./js/libs/bech32-and-bech32m.js"
//         }
//     }

// Merged and transformed in farm.config.ts

//     resolve: {
//         alias: {
//           'libs/url-comp-0-1-0/url-comp': resolve('./src/js/libs/url-comp-0-1-0/url-comp.js'),
//           'libs/bech32-and-bech32m': resolve('./src/js/libs/bech32-and-bech32m.js')
//         }
//     }


const aliasMap = new Map<string, string>();

// JSON パース前の文字列整形関数
function sanitizeImportMapJson(jsonString: string): string {
    // 最後の項目の後にコンマがある場合、それを削除する (コンマがあっても インポートマップとしては 機能する)
    // 空白行やスペースも考慮する
    return jsonString
      .trim()                       // 先頭末尾の空白を削除
      .replace(/\s*,\s*\}/g, '}')   // 最後のコンマと閉じ括弧の間の空白を削除
      .replace(/\s*,\s*$/g, '')     // 最後のコンマとその後の空白を削除
      .replace(/^\s+|\s+$/gm, '');  // 各行の先頭末尾の空白を削除
  }

// Import Map の解析と alias の生成
htmlFiles.forEach(file => {
    const content = Deno.readTextFileSync(`../farm/src/${file}.html`);
    const importMapMatch = content.match(/<script type="importmap">([\s\S]*?)<\/script>/);

    //console.log(`importMapMatch in ${file}: `, importMapMatch)
    //console.log(`importMapMatch[1] in ${file}: `, importMapMatch[1])
    //     importMapMatch[1] in index:
    //         {
    //             "imports": {
    //                 "libs/url-comp-0-1-0/url-comp": "./js/libs/url-comp-0-1-0/url-comp.js",

    if (importMapMatch) {
        try {
            // 整形した文字列を JSON パースに渡す
            const sanitizedJsonString = sanitizeImportMapJson(importMapMatch[1]);
            //console.log('sanitizedJsonString: ', sanitizedJsonString)
            const importMap = JSON.parse(sanitizedJsonString);

            Object.entries(importMap.imports).forEach(([key, value]) => {
                aliasMap.set(key, value as string);
            });
        } catch (_error) {
            console.warn(`Failed to parse import map in ${file}.html`);
            Deno.exit(1);
        }
    }
});

// console.log('aliasMap: ', aliasMap)
//     Map(118) {
//         "libs/url-comp-0-1-0/url-comp": "./js/libs/url-comp-0-1-0/url-comp.js",
//         "libs/bech32-and-bech32m": "./js/libs/bech32-and-bech32m.js",
//         ...
//     }



const aliasEntries = Array.from(aliasMap.entries()).map(([key, value]) => {
    return `${JSON.stringify(key)}: resolve('./src${value.substring(1)}')`;  // .substring(1) removes unnecessary '.'
})

// console.log('aliasEntries: ', aliasEntries)
//     aliasEntries:  [
//         "\"libs/url-comp-0-1-0/url-comp\": resolve('./src/js/libs/url-comp-0-1-0/url-comp.js')",
//         "\"libs/bech32-and-bech32m\": resolve('./src/js/libs/bech32-and-bech32m.js')",
//         ...
//         "\"tab-lines/path-mode\": resolve('./src/js/page-specific/index/tab-lines/path-mode.js')",
//         "\"tab-lines/update-svg-color-format\": resolve('./src/js/page-specific/index/tab-lines/update-svg-color-format.js')",
//         ... 18 more items
//     ]



// Generate whole content of config file
const fileContent = `
import { defineConfig } from '@farmfe/core';
import { resolve } from 'path';

export default defineConfig({
  compilation: {
    input: {
      ${Object.entries(inputObject).map(([key, value]) => `'${key}': '${value}'`).join(`,\n${TAB_SPACE.repeat(3)}`)}
    },
    output: {
      path: '${outputPath}'
    },
    resolve: {
      alias: {
        ${aliasEntries.join(`,\n${TAB_SPACE.repeat(4)}`).replace(/"/g, "'")}
      }
    }
  },
});
`;

// console.log('fileContent: ', fileContent)
//
//     import { defineConfig } from '@farmfe/core';
//     import { resolve } from 'path';
//
//     export default defineConfig({
//       compilation: {
//         input: {
//           'index': './src/index.html',
//           'data-manipulator': './src/data-manipulator.html'
//         },
//         output: {
//           path: 'build'
//         },
//         resolve: {
//           alias: {
//             'libs/url-comp-0-1-0/url-comp': resolve('./src/js/libs/url-comp-0-1-0/url-comp.js'),
//             'libs/bech32-and-bech32m': resolve('./src/js/libs/bech32-and-bech32m.js'),
//             ...
//             'io/download-url-params': resolve('./src/js/page-specific/data-manipulator/io/download-url-params.js'),
//             'io/select-file': resolve('./src/js/page-specific/data-manipulator/io/select-file.js')
//           }
//         }
//       },
//     });



// ファイルを上書き生成
Deno.writeTextFileSync(filePath, fileContent);

console.log('File generated successfully.');