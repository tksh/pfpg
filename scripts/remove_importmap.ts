import { readFile, writeFile } from "fs/promises";
import { stdin, stdout, argv } from "process";
import { parseArgs } from "util";

const flags = parseArgs({
  args: argv.slice(2),     // 最初の2つの要素をスキップ, argvには 実行コマンド と スクリプト名 が含まれるため それらを除外
  options: {
    input: {
      type: "string",
      default: "stdin",    // デフォルト値
    },
    output: {
      type: "string",
      default: "stdout",   // デフォルト値
    },
  },
  strict: true,  // 未定義のオプションをエラーとする
  allowPositionals: false, // 位置引数を許可しない
});

console.log('flags: ', flags)

// Files:
//     > bun run js/bun/remove_importmap.ts --input=input.html --output=output.html
//         flags:  {
//             values: {
//               input: "input.html",
//               output: "output.html",
//             },
//             positionals: [],
//           }

// Std IO:
//     > cat input.html | bun run js/bun/remove_importmap.ts --input=stdin --output=stdout
//         flags:  {
//             values: {
//               input: "stdin",
//               output: "stdout",
//             },
//             positionals: [],
//           }


// インポートマップの 開始タグと終了タグの間のすべて を削除
function removeImportmap(content: string): string {
    return content.replace(/<script type="importmap">(?:.|\s)*?<\/script>/g, '')
}


async function readFromStdin(): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stdin) {
        chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks).toString("utf-8");
}


async function main() {
    let input: string;

    if (flags.values.input === "stdin") {
        // 標準入力から読み込む場合
        input = await readFromStdin();
    } else {
        // ファイルから読み込む場合
        input = await readFile(flags.values.input, "utf-8");
    }

    // 全体の内容に対して removeImportmap 関数を適用
    const formatted: string = removeImportmap(input);
    // console.log('formatted: ', formatted)

    if (flags.values.output === "stdout") {
        // 標準出力に書き込む場合
        stdout.write(formatted);
    } else {
        // ファイルに書き込む場合
        await writeFile(flags.values.output, formatted, "utf-8");
    }
}

// メインスクリプトとして実行された場合にmain関数を呼び出す
if (import.meta.main) {  // https://bun.sh/docs/api/import-meta
                         // - `true` if this file is directly executed by `bun run`
                         // - `false` otherwise
    main()
}