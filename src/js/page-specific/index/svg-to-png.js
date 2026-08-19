import { svg2png as svg2pngWasm }  from "npm:svg2png-wasm";
import { updateButtonWithSvgSize
       , updateButtonWithPngSize } from 'button/update-button-text'
import { generateAndUploadImage }  from 'dynamic-ogp/generate-and-upload'
import { extractViewboxValues }    from 'tab-canvas/crop-side-margins'

export
    { executeSvg2png
    , measureSvg2pngTime
    }


// IHDR helper to read PNG dimensions from the binary data
function pngSize(buf) {
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
}


// svg2png() を呼び出し 処理時間を計測する measureSvg2pngTime() を実行し 処理時間結果を表示する
async function executeSvg2png(event, svg2pngOption) {
    // 処理時間を表示する HTML要素を 取得
    const renderingStatusElements = new Map([
        ['pngActionButton', document.getElementById("png-action-button")],
        ['lastRenderingTimeP', document.getElementById("last-rendering-time")]
    ]);

    // Input SVG string
    const svgString = event.target.value.trim();

    try {
        // Processing from SVG to PNG and measuring the time
        const pngData = await measureSvg2pngTime(svgString, svg2pngOption, renderingStatusElements);
        console.log('pngData: ', pngData);

        //////////////// OGP ////////////////
        // pngData から  OGイメージを生成 Cloudinary に アップロード
        const ogImageUrl = await generateAndUploadImage(pngData);
        console.log('ogImageUrl: ', ogImageUrl);  // Uploaded image URL, version path removed.
        //////////////// OGP ////////////////

        console.log('svg2png processing has completed.');

    } catch (error) {
        console.error('An error occurred during the processing of svg2png:', error);
    }

    // SVGファイルサイズを ダウンロードボタンに 表示する
    updateButtonWithSvgSize(svgString);
}




// Rendering from SVG to PNG with options
async function svg2png(svgString, svg2pngOption) {
    // Render using svg2png-wasm
    const pngUint8Array = await svg2pngWasm(svgString, svg2pngOption);

    // Create a blob and its url
    const blob = new Blob([pngUint8Array], { type: 'image/png' })
    const blobUrl = URL.createObjectURL(blob)

    // Display the PNG img on output area
    document.querySelector('#output img').src = blobUrl

    // Update the size and dimension info in HTML elements

    // PNG file size on the download/copy button
    updateButtonWithPngSize(pngUint8Array)

    // PNG pixel dimensions - use IHDR helper
    const { width, height } = pngSize(pngUint8Array);
    updateDimensionInfo('png', width, height)

    // SVG viewBox dimension
    const viewboxValues = extractViewboxValues(svgString)
    updateDimensionInfo('svg', viewboxValues.get('w'), viewboxValues.get('h'))

    return pngUint8Array
}

/**
 * Updates the dimension information displayed for either a PNG or SVG image.
 * @param {string} pngOrSvg    - 'png' or 'svg' to specify which element to update.
 * @param {number} widthValue  - The width value to display.
 * @param {number} heightValue - The height value to display.
 */
function updateDimensionInfo(pngOrSvg, widthValue, heightValue) {
    const container = document.querySelector(`#${pngOrSvg}-info`)

    // Create label element
    const label = document.createElement('span')
    label.textContent = pngOrSvg === 'png'
        ? 'Rendered PNG pixel size:\u00A0'
        : 'Source SVG viewBox size:\u00A0'

    // Create value element
    const value = document.createElement('span')
    value.textContent = `${widthValue} x ${heightValue}`

    // Clear existing content
    container.innerHTML = ''

    // Append new elements
    container.appendChild(label)
    container.appendChild(value)
}


// Processing from SVG to PNG and measuring the time
async function measureSvg2pngTime(svgString, svg2pngOption, renderingStatusElements) {
    try {
        // 処理中メッセージを表示
        await updateRenderingStatus("Now rendering ...<br> Please wait a moment :)", renderingStatusElements.get('pngActionButton'));

        // 開始時刻を記録
        const startTime = performance.now();
        console.log('svg2png startTime: ', startTime);

        // svg2png関数を呼び出す
        const pngData = await svg2png(svgString, svg2pngOption);

        // 終了時刻を記録
        const endTime = performance.now();
        console.log('svg2png endTime: ', endTime);

        // 処理時間を計算
        const elapsedTime = Math.floor(endTime - startTime);

        // 処理時間をコンソールに出力
        console.log(`svg2png rendering time: ${elapsedTime} ms`);

        // 処理完了メッセージを表示
        await updateRenderingStatus(`Last rendering time: ${elapsedTime} milliseconds`, renderingStatusElements.get('lastRenderingTimeP'));

        // 処理結果を返す
        return pngData;

    } catch (error) {
        // エラー処理
        console.error('An error occurred during the processing of svg2png:', error);
        await updateRenderingStatus("An error occurred", renderingStatusElements.get('pngActionButton'));
        throw error;
    }
}

// Update .innerHtml text
async function updateRenderingStatus(text, element) {
    return new Promise((resolve) => {
        // メッセージを更新し、次のフレームで反映させる
        element.innerHTML = text
        requestAnimationFrame(() => {
            resolve()
        })
    })
}
