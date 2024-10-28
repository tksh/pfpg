import { roundToOneDecimal }         from 'utils/number-rounding'

export
    { initButtonActionSelect
    , updateButtonWithSvgSize
    , updateButtonWithPngSize
    }


function initButtonActionSelect() {
    // セレクトメニューの変更時にボタンのテキストを更新
    document.getElementById('button-action').addEventListener('change', (event) => {

        // Selected action value: 'download' or 'copy'
        const selectedAction = event.target.value

        // ボタン要素を取得
        const pngActionButton = document.getElementById('png-action-button');
        const svgActionButton = document.getElementById('svg-action-button');

        updateButtonText(selectedAction, pngActionButton)
        updateButtonText(selectedAction, svgActionButton)
    })
}

function updateButtonText(selectedAction, button) {
    const buttonText = button.innerHTML;

    // "Download" または "Copy" を含む部分を探す
    const regex = /(Download|Copy)/i;
    const match = buttonText.match(regex);

    if (match) {
        // マッチした部分を置き換える
        const replacement = selectedAction === 'download' ? 'Download' : 'Copy';
        button.innerHTML = buttonText.replace(match[0], replacement);
    }
}



// PNG/SVG ファイルサイズを ダウンロードボタンに 表示する関数


// Get current action type as string
function getActionText() {
    const actionSelect = document.getElementById('button-action');
    const selectedAction = actionSelect.value;

    if (selectedAction === 'download') {
        return 'Download';
    } else if (selectedAction === 'copy') {
        return 'Copy';
    }
}

// SVGテキストのバイトサイズを計算する関数
function byteCount(s) {
    // Blobオブジェクトを使ってUTF-8でのバイトサイズを取得
    return new Blob([s]).size
}


function updateButtonWithSvgSize(svgString) {
    // サイズを表示する button要素を取得
    const svgActionButtonElement = document.getElementById("svg-action-button")

    // サイズを計算して表示
    const svgSize = byteCount(svgString)
    const svgSizeAsKb = roundToOneDecimal(svgSize / 1024)
    console.log('SVG file size: ', svgSize, svgSizeAsKb)

    // Get current action type as string
    const actionText = getActionText()

    svgActionButtonElement.innerHTML = `${actionText} as SVG<br>(size: ${svgSizeAsKb} kb / ${svgSize} bytes)`;
}

function updateButtonWithPngSize(pngBuffer) {
    // サイズを表示する button要素を取得
    const pngActionButtonElement = document.getElementById("png-action-button")

    // PNGデータの長さ（バイト数）を取得
    const pngSize = pngBuffer.length
    const pngSizeAsKb = roundToOneDecimal(pngSize / 1024)
    console.log('PNG file size: ', pngSize, pngSizeAsKb)

    // Get current action type as string
    const actionText = getActionText()

    pngActionButtonElement.innerHTML = `${actionText} as PNG<br>(size: ${pngSizeAsKb} kb / ${pngSize} bytes)`;
}
