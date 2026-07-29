import { parseArgs } from "jsr:@std/cli/parse-args";

const flags = parseArgs(Deno.args, {
  string: ["input", "output"],
  default: {
    input: "stdin",    // デフォルト値
    output: "stdout",   // デフォルト値
  },
});

console.log('flags: ', flags)

// Files:
//     > deno run --allow-read --allow-write scripts/remove_importmap.ts --input=input.html --output=output.html
//         flags:  {
//           input: "input.html",
//           output: "output.html",
//         }

// Std IO:
//     > cat input.html | deno run --allow-read --allow-write scripts/remove_importmap.ts --input=stdin --output=stdout
//         flags:  {
//           input: "stdin",
//           output: "stdout",
//         }


// インポートマップの 開始タグと終了タグの間のすべて を削除
function removeImportmap(content: string): string {
    return content.replace(/<script type="importmap">(?:.|\s)*?<\/script>/g, '')
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

    // 全体の内容に対して removeImportmap 関数を適用
    const formatted: string = removeImportmap(input);
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