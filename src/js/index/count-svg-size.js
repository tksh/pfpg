// SVGファイルサイズを ダウンロードボタンに 表示する関数
function countSvgSize(svgString) {
    // バイトサイズを表示する button要素を取得
    const svgDownloadButtonElement = document.getElementById("svg-download-button");

    // バイトサイズを計算して表示
    const svgSize = byteCount(svgString);
    const svgSizeAsKb = roundToOneDecimal(svgSize / 1024)
    console.log('SVG file size: ', svgSize)
    svgDownloadButtonElement.innerHTML = `Download as SVG<br>(size: ${svgSizeAsKb} kb / ${svgSize} bytes)`;
}

// テキストのバイトサイズを計算する関数
function byteCount(s) {
    // Blobオブジェクトを使ってUTF-8でのバイトサイズを取得
    return new Blob([s]).size;
}