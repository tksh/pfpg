// 'console.log' を削除
function removeConsoleLogs(input: string): { output: string; removedCount: number } {
    const lines: string[] = input.split('\n');
    const result: string[] = [];
    let isInMultilineConsoleLog = false;
    let openParenCount = 0;
    let removedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line: string = lines[i].trim();

        if (!isInMultilineConsoleLog) {
            if (line.startsWith('console.log(')) {
                if (line.endsWith(')') ||                            // 行が 閉じ括弧で 終わる場合
                    line.endsWith(');') ||                           // 行が セミコロン付きの閉じ括弧で 終わる場合
                    (line.includes(');') && line.includes('//')) ||  // 行に セミコロン付きの閉じ括弧とコメント（//）の両方が 含まれる場合
                    (line.includes(')') && line.includes('//'))) {   // 行に 閉じ括弧とコメント（//）の両方が 含まれる場合
                    // 一行のコンソール出力は単純に無視する
                    removedCount++;
                    continue;
                } else {
                    // 複数行のコンソール出力の開始
                    isInMultilineConsoleLog = true;
                    openParenCount = 1;
                    openParenCount += (line.match(/\(/g) || []).length - 1; // 最初の'('は既にカウント済み
                    openParenCount -= (line.match(/\)/g) || []).length;
                    removedCount++;
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
            removedCount++;
        }
    }

    return { output: result.join('\n'), removedCount };
}

// Get the all .js files in the dist directory and apply removeConsoleLogs to each of them
async function main() {
    // Get the list of index-********.js file names
    const distDir = Array.from(Deno.readDirSync("./dist/"));

    // Get all .js files in the dist directory
    const jsFiles = distDir.filter((f) => f.name.endsWith(".js"));

    if (jsFiles.length === 0) {
        console.error("No .js files found in ./dist/");
        return;
    }

    let totalRemovedCount = 0;

    // Apply removeConsoleLogs to the all .js file found
    for (const jsFile of jsFiles) {
        const content = await Deno.readTextFile(`dist/${jsFile.name}`);
        const { output: updatedContent, removedCount } = removeConsoleLogs(content);
        
        await Deno.writeTextFile(`dist/${jsFile.name}`, updatedContent);
        totalRemovedCount += removedCount;
        
        console.log(`Successfully updated ${jsFile.name} (Removed ${removedCount} lines)`);
    }

    console.log(`Total removed: ${totalRemovedCount} console lines.`);
}

// メインスクリプトとして実行された場合にmain関数を呼び出す
if (import.meta.main) {
    await main();
}