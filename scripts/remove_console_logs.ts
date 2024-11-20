import { readFile, writeFile } from "fs/promises";
import { stdin, stdout, argv } from "process";
import { parseArgs } from "util";

const flags = parseArgs({
  args: argv.slice(2),      // 最初の2つの要素をスキップ, argvには 実行コマンド と スクリプト名 が含まれるため それらを除外
  options: {
    input: {
      type: "string",
      default: "stdin",     // デフォルト値
    },
    output: {
      type: "string",
      default: "stdout",    // デフォルト値
    },
  },
  strict: true,             // 未定義のオプションをエラーとする
  allowPositionals: false,  // 位置引数を許可しない
});

//console.log('flags: ', flags)

// Files:
//     > bun run js/bun/remove_console_logs.ts --input=input.js --output=output.js
//         flags:  {
//             values: {
//               input: "input.js",
//               output: "output.js",
//             },
//             positionals: [],
//           }

// Std IO:
//     > cat input.js | bun run js/bun/remove_console_logs.ts --input=stdin --output=stdout
//         flags:  {
//             values: {
//               input: "stdin",
//               output: "stdout",
//             },
//             positionals: [],
//           }


// 'console.log' を削除
function removeConsoleLogs(input: string): string {
    const lines: string[] = input.split('\n');
    const result: string[] = [];
    let isInMultilineConsoleLog = false;
    let openParenCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line: string = lines[i].trim();

        if (!isInMultilineConsoleLog) {
            if (line.startsWith('console.log(')) {
                if (line.endsWith(')') ||                           // 行が 閉じ括弧で 終わる場合
                    line.endsWith(');') ||                          // 行が セミコロン付きの閉じ括弧で 終わる場合
                    (line.includes(');') && line.includes('//')) ||  // 行に セミコロン付きの閉じ括弧とコメント（//）の両方が 含まれる場合
                    (line.includes(')') && line.includes('//'))) {   // 行に 閉じ括弧とコメント（//）の両方が 含まれる場合
                    // 一行のコンソール出力は単純に無視する
                    continue;
                } else {
                    // 複数行のコンソール出力の開始
                    isInMultilineConsoleLog = true;
                    openParenCount = 1;
                    openParenCount += (line.match(/\(/g) || []).length - 1; // 最初の'('は既にカウント済み
                    openParenCount -= (line.match(/\)/g) || []).length;
                }
            } else {
                // 通常の行はそのまま結果に追加
                result.push(lines[i]);
            }
        } else {
            // 複数行のコンソール出力の中
            openParenCount += (line.match(/\(/g) || []).length;
            openParenCount -= (line.match(/\)/g) || []).length;

            if (openParenCount === 0) {
                // 複数行のコンソール出力の終了
                isInMultilineConsoleLog = false;
            }
            // 複数行のコンソール出力の行は無視する
        }
    }

    return result.join('\n');
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

    // 全体の内容に対して removeConsoleLogs 関数を適用
    const formatted: string = removeConsoleLogs(input);
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