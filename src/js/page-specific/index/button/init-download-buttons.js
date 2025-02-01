import { downloadSvgAsFile
       , downloadPngAsFile }  from 'button/download-as-file'
import { copySvgToClipboard
       , copyPngToClipboard } from 'button/copy-to-clipboard'


// Initialize download/copy button for SVG and PNG

export function initDownloadButtons() {
    const pngActionButton = document.getElementById('png-action-button')
    if (pngActionButton) {
        pngActionButton.addEventListener('click', executeActionForPng)
    }

    const svgActionButton = document.getElementById('svg-action-button')
    if (svgActionButton) {
        svgActionButton.addEventListener('click', executeActionForSvg)
    }
}


// 選択されているアクション を 実行する関数

function executeActionForSvg() {
    const actionSelect = document.getElementById('button-action');
    const selectedAction = actionSelect.value;

    if (selectedAction === 'download') {
        downloadSvgAsFile();
    } else if (selectedAction === 'copy') {
        copySvgToClipboard();
    }
}

function executeActionForPng() {
    const actionSelect = document.getElementById('button-action');
    const selectedAction = actionSelect.value;

    if (selectedAction === 'download') {
        downloadPngAsFile();
    } else if (selectedAction === 'copy') {
        copyPngToClipboard();
    }
}
