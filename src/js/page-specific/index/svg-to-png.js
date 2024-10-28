import { updateButtonWithSvgSize, updateButtonWithPngSize }         from 'download'
import { extractViewboxValues } from 'tab-canvas/crop-side-margins'
// import { updateButtonWithPngSize }    from 'button/update-with-counted-size'

export
    { executeSvg2png
    , measureSvg2pngTime
    , svg2png
    }


// addMultipleEventListener(svgStringElement, ['change', 'keyup', 'paste'], function (event) {
//   const svgString = event.target.value.trim()
//   const hasCrop = cropElement.checked
//   if (!svgString) return
//   svg2png(svgString, resvgOption, hasCrop)
// })

// 上記の resvg-jsオリジナルの playground において SVGテキストエリアの編集イベントごとに PNGへの変換処理が呼び出される部分を
// <input>や<select>などの 追加された選択要素からの更新でも それが呼び出されるように 下記の通りに変更した
// - 'executeSvg2png' という関数を作り 選択要素から得られた値に従って SVGテキストエリアを更新し 直後に
// - 'executeSvg2png({ target: { value: updatedSvg } })' として呼び出す
// - 'svgStringElement' に対してSVG文字列を取得する際の 'event.target.value' と同じオブジェクト構造にする

// svg2png() を呼び出し 処理時間を計測する measureSvg2pngTime() を実行し 処理時間結果を表示する
async function executeSvg2png(event, resvgOption) {
    //console.dir(resvgOption,  { depth: null })

    // 処理時間を表示する HTML要素を 取得
    const renderingStatusElements = new Map([
        ['pngActionButton', document.getElementById("png-action-button")], // <button> at below of output image
        ['lastRenderingTimeP', document.getElementById("last-rendering-time")] // <p> at bottom of 'Render' tab
    ])

    // Arguments for rendering
    const svgString = event.target.value.trim() // SVG文字列 / '.trim()' = 文字列の両端の空白を削除
    const hasCrop = document.querySelector('#crop-by-bbox').checked // 'Crop by BBox' チェックボックスがチェックされている場合は true を チェックされていない場合は false を 返す

    // Processing from SVG to PNG and measuring the time
    measureSvg2pngTime(svgString, resvgOption, hasCrop, renderingStatusElements)
        .then((result) => {
            console.log('result: ', result) // undefined

            // 処理結果を利用する
            console.log('svg2png processing has completed.')

        })
        .catch((error) => {
            console.error('An error occurred during the processing of svg2png:', error)
        })

    // SVGファイルサイズを ダウンロードボタンに 表示する
    updateButtonWithSvgSize(svgString)
}

// Rendering from SVG to PNG with options
async function svg2png(svgString, resvgOption, hasCrop) {

    // Create the Resvg object
    const resvgJS = new resvg.Resvg(svgString, resvgOption)
    console.log('resvgJS: ', resvgJS)

    // SVG内に含まれる外部リンクの画像を取得して解決する (Un-used)
    const resolved = await Promise.all(
        resvgJS.imagesToResolve().map(async (url) => {
            console.log('image url', url)
            const img = await fetch(url)
            const buffer = await img.arrayBuffer()
            // const MIME = img.headers.get('Content-Type')
            return {
                url,
                buffer: new Uint8Array(buffer),
            }
        }),
    )
    if (resolved.length > 0) {
        for (const result of resolved) {
            const { url, buffer } = result
            resvgJS.resolveImage(url, buffer)
        }
    }

    // Crop by BBox (Un-used)
    const innerBBox = resvgJS.innerBBox()
    const bbox = resvgJS.getBBox()
    console.log('SVG innerBBox: ', innerBBox)
    console.log('SVG getBBox: ', bbox)
    if (hasCrop && bbox) resvgJS.cropByBBox(bbox)

    // Render
    const pngData = resvgJS.render()
    const pngBuffer = pngData.asPng()

    // Create a blob and its url
    document.querySelector('#output img').src = URL.createObjectURL(
        new Blob([pngBuffer], { type: 'image/png' })
    )

    // Outputs the Micro SVG (usvg) strings
    // console.log('Simplified svg string: \n', resvgJS.toString()) // <svg>...</svg>


    // Indicate the PNG data size in html

    // PNGファイルサイズを ダウンロードボタンに 表示する
    updateButtonWithPngSize(pngBuffer)

    // PNGピクセルサイズを <div id="png-info">要素に 表示する
    document.querySelector('#png-info').textContent = `Rendered PNG pixel size: ${pngData.width} x ${pngData.height}`


    // Indicate the SVG viewBox size in html

    // resvg-js default outputs the w and h size as integer
    // document.querySelector('#svg-info').textContent = 'Source SVG viewbox: ' + resvgJS.width + ' x ' + resvgJS.height

    // Outputs the viewBox size as float to indicate at #svg-info <textarea>
    const viewboxValues = extractViewboxValues(svgString) // e.g: Map(4) {'x' => 0, 'y' => 0, 'w' => 31, 'h' => 31}
    document.querySelector('#svg-info').textContent = 'Source SVG viewBox size: ' + viewboxValues.get('w') + ' x ' + viewboxValues.get('h')
}


// Processing from SVG to PNG and measuring the time
async function measureSvg2pngTime(svgString, resvgOption, hasCrop, renderingStatusElements) {
    // 処理中メッセージを表示
    await updateRenderingStatus("Now rendering ...<br> Please wait a moment :)", renderingStatusElements.get('pngActionButton'))

    // setTimeoutを使用して 非同期処理を実行
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            // 開始時刻を記録
            const startTime = performance.now()
            console.log('svg2png startTime: ', startTime)

            try {
                // svg2png関数を呼び出す
                const result = await svg2png(svgString, resvgOption, hasCrop)

                // 終了時刻を記録
                const endTime = performance.now()
                console.log('svg2png endTime: ', endTime)

                // 処理時間を計算
                const elapsedTime = Math.floor(endTime - startTime)

                // 処理時間をコンソールに出力
                console.log(`svg2png rendering time: ${elapsedTime} ms`)

                // 処理完了メッセージを表示
                await updateRenderingStatus(`Last rendering time: ${elapsedTime} milliseconds`, renderingStatusElements.get('lastRenderingTimeP'))

                // 処理結果を返す
                resolve(result)

            } catch (error) {
                // エラー処理
                console.error('An error occurred during the processing of svg2png:', error)
                await updateRenderingStatus("An error occurred", pngActionButtonElement)
                reject(error)
            }
        }, 0) // 0ミリ秒後に実行
    })
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
