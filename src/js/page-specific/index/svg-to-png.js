import { roundToOneDecimal }    from 'utils/number-rounding'
import { extractViewboxValues } from 'tab-canvas/crop-side-margins'
import { getStateUrlsOfImageCustomization }       from 'state/state-as-url-params'

export
    { measureSvg2pngTime
    , svg2png
    }


// Rendering from SVG to PNG with options
async function svg2png(svgString, opts, hasCrop) {

//    const svg = svgString ? svgString : svgInputElement.value.trim()
//    // svgString が真（例えば、文字列が空でない、nullでないなど）であれば、その値を svg 変数に代入します。
//    // svgString が偽（例えば、nullや空文字列）であれば、svgInputElement.value.trim() の結果を svg 変数に代入します。ここで、svgInputElement.value はおそらくHTML要素の値を取得し、trim() メソッドはその値の前後の空白を削除します。
//    // したがって、このコードは svgString が提供されている場合はそれを使用し、そうでない場合は svgInputElement から取得した値を使用して、その後空白を削除した状態を svg 変数に代入します。
//
//    if (!svg) {
//        alert('SVG is empty')
//        return
//    }

    // Get the customization states from url params
    const paramsOfCustomization = getStateUrlsOfImageCustomization()
    console.log('||||paramsOfCustomization: ', paramsOfCustomization)

    // Rendering
    const svg = svgString
    const resvgJS = new resvg.Resvg(svg, opts)
    console.log('resvgJS: ', resvgJS)

    // resvg-js default outputs the w and h size as integer
    // document.querySelector('#svg-info').textContent = 'Source SVG viewbox: ' + resvgJS.width + ' x ' + resvgJS.height

    // Outputs the viewBox size as float to indicate at #svg-info <textarea>
    const viewboxValues = extractViewboxValues(svgString) // e.g: Map(4) {'x' => 0, 'y' => 0, 'w' => 31, 'h' => 31}
    document.querySelector('#svg-info').textContent = 'Source SVG viewBox size: ' + viewboxValues.get('w') + ' x ' + viewboxValues.get('h')

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

    // PNGデータの長さ（バイト数）を取得
    const pngSize = pngBuffer.length
    const pngSizeAsKb = roundToOneDecimal(pngSize / 1024)

    // Create a blob and its url
    document.querySelector('#output img').src = URL.createObjectURL(
        new Blob([pngBuffer], { type: 'image/png' })
    )

    // Outputs the Micro SVG (usvg) strings
    // console.log('Simplified svg string: \n', resvgJS.toString()) // <svg>...</svg>


    // PNGピクセルサイズを <div id="png-info">要素に 表示する
    document.querySelector('#png-info').textContent = `Rendered PNG pixel size: ${pngData.width} x ${pngData.height}`

    // PNGファイルサイズを ダウンロードボタンに 表示する

    // 挿入したいタグを含めたテキスト (改行を 'Download as PNG' の直後にする)
    const pngDownloadSizeText = `Download as PNG<br>(size: ${pngSizeAsKb} kb / ${pngSize} bytes)`

    // button要素 を取得し innerHTML を変更する
    document.getElementById("png-download-button").innerHTML = pngDownloadSizeText
}


// Processing from SVG to PNG and measuring the time
async function measureSvg2pngTime(svgString, opts, hasCrop, renderingStatusElements) {
    // 処理中メッセージを表示
    await updateRenderingStatus("Now rendering ...<br> Please wait a moment :)", renderingStatusElements.get('pngDownloadButton'))

    // setTimeoutを使用して 非同期処理を実行
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            // 開始時刻を記録
            const startTime = performance.now()
            console.log('svg2png startTime: ', startTime)

            try {
                // svg2png関数を呼び出す
                const result = await svg2png(svgString, opts, hasCrop)

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
                await updateRenderingStatus("An error occurred", pngDownloadButtonElement)
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
