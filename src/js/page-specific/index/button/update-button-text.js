import { updateState }       from 'state/url-state-manager'
import { roundToOneDecimal } from 'utils/number-rounding'

export
    { initButtonActionSelect
    , replaceButtonText
    , updateButtonWithSvgSize
    , updateButtonWithPngSize
    }


function initButtonActionSelect() {
    // セレクトメニューの変更時にボタンのテキストを更新
    document.getElementById('button-action').addEventListener('change', (event) => {

        // Selected action value: 'download' or 'copy'
        const buttonAction = event.target.value

        // Update the state
        updateState('buttonAction', buttonAction)

        // Get the button elements, PNG and SVG
        const pngActionButton = document.getElementById('png-action-button');
        const svgActionButton = document.getElementById('svg-action-button');

        // Update the button innerHtml as selected action
        replaceButtonText(buttonAction, pngActionButton)
        replaceButtonText(buttonAction, svgActionButton)
    })
}

function replaceButtonText(buttonAction, button) {
    const buttonText = button.innerHTML;

    // "Download" または "Copy" を含む部分を探す
    const regex = /(Download|Copy)/i;
    const match = buttonText.match(regex);

    if (match) {
        // マッチした部分を置き換える
        const replacement = buttonAction === 'download' ? 'Download' : 'Copy';
        button.innerHTML = buttonText.replace(match[0], replacement);
    }
}



// PNG/SVG ファイルサイズを ダウンロードボタンに 表示する関数

function updateButtonText(pngOrSvg, byteSize) {
    // Get button element
    const actionButtonElement = document.getElementById(`${pngOrSvg}-action-button`)

    // Get current action type as string
    const actionType = getActionType()

    // Convert number value from 'byte' to 'KB'
    const sizeAsKb = roundToOneDecimal(byteSize / 1024)

    // Create action element
    const action = document.createElement('span')
    action.textContent = `${actionType} as ${pngOrSvg.toUpperCase()}:\u00A0`

    // Create size element
    const size = document.createElement('span')
    size.textContent = `(${sizeAsKb} KB, ${byteSize.toLocaleString()} bytes)`

    // Clear existing content
    actionButtonElement.innerHTML = ''

    // Append new elements
    actionButtonElement.appendChild(action)
    actionButtonElement.appendChild(size)
}

// Get current action type as string
function getActionType() {
    const actionSelect = document.getElementById('button-action');
    const buttonAction = actionSelect.value;

    if (buttonAction === 'download') {
        return 'Download';
    } else if (buttonAction === 'copy') {
        return 'Copy';
    }
}

// SVGテキストのバイトサイズを計算する関数
function byteCount(s) {
    // Blobオブジェクトを使ってUTF-8でのバイトサイズを取得
    return new Blob([s]).size
}

// SVG
function updateButtonWithSvgSize(svgString) {
    // SVGテキストの サイズ（バイト数）を計算して表示
    const svgByteSize = byteCount(svgString)
    updateButtonText('svg', svgByteSize)
}
// PNG
function updateButtonWithPngSize(pngBuffer) {
    // PNGデータの サイズ（バイト数）を取得して表示
    const pngByteSize = pngBuffer.length
    updateButtonText('png', pngByteSize)
}
