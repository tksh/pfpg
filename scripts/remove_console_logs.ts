import { parseArgs } from "jsr:@std/cli/parse-args";

const flags = parseArgs(Deno.args, {
  string: ["input", "output"],
  default: {
    input: "stdin",     // デフォルト値
    output: "stdout",    // デフォルト値
  },
});

//console.log('flags: ', flags)

// Files:
//     > deno run --allow-read --allow-write scripts/remove_console_logs.ts --input=input.js --output=output.js
//         flags:  {
//           input: "input.js",
//           output: "output.js",
//         }

// Std IO:
//     > cat input.js | deno run --allow-read --allow-write scripts/remove_console_logs.ts --input=stdin --output=stdout
//         flags:  {
//           input: "stdin",
//           output: "stdout",
//         }


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
    return await new Response(Deno.stdin.readable).text();
}


async function main() {
    let input: string;

    if (flags.input === "stdin") {
        // 標準入力から読み込む場合
        input = await readFromStdin();
    } else {
        // ファイルから読み込む場合
        input = await Deno.readTextFile(flags.input);
    }

    // 全体の内容に対して removeConsoleLogs 関数を適用
    const formatted: string = removeConsoleLogs(input);
    // console.log('formatted: ', formatted)

    if (flags.output === "stdout") {
        // 標準出力に書き込む場合
        await Deno.stdout.write(new TextEncoder().encode(formatted));
    } else {
        // ファイルに書き込む場合
        await Deno.writeTextFile(flags.output, formatted);
    }
}

// メインスクリプトとして実行された場合にmain関数を呼び出す
if (import.meta.main) {
    main();
}