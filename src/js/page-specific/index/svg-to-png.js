import { updateButtonWithSvgSize
       , updateButtonWithPngSize }  from 'button/update-button-text'
import { generateAndUploadOgImage } from 'dynamic-ogp/generate-og-image'
import { updateMetadata }           from 'dynamic-ogp/update-metadata'
import { extractViewboxValues }     from 'tab-canvas/crop-side-margins'

export
    { executeSvg2png
    , measureSvg2pngTime
    }


// addMultipleEventListener(svgTextarea, ['change', 'keyup', 'paste'], function (event) {
//   const svgString = event.target.value.trim()
//   const hasCrop = cropElement.checked
//   if (!svgString) return
//   svg2png(svgString, resvgOption, hasCrop)
// })

// 上記の resvg-jsオリジナルの playground において SVGテキストエリアの編集イベントごとに PNGへの変換処理が呼び出される部分を
// <input>や<select>などの 追加された選択要素からの更新でも それが呼び出されるように 下記の通りに変更した
// - 'executeSvg2png' という関数を作り 選択要素から得られた値に従って SVGテキストエリアを更新し 直後に
// - 'executeSvg2png({ target: { value: updatedSvg } })' として呼び出す
// - 'svgTextarea' に対してSVG文字列を取得する際の 'event.target.value' と同じオブジェクト構造にする

// svg2png() を呼び出し 処理時間を計測する measureSvg2pngTime() を実行し 処理時間結果を表示する
async function executeSvg2png(event, resvgOption) {
    // 処理時間を表示する HTML要素を 取得
    const renderingStatusElements = new Map([
        ['pngActionButton', document.getElementById("png-action-button")],
        ['lastRenderingTimeP', document.getElementById("last-rendering-time")]
    ]);

    // Input SVG string
    const svgString = event.target.value.trim();

    try {
        // Processing from SVG to PNG and measuring the time
        const pngData = await measureSvg2pngTime(svgString, resvgOption, renderingStatusElements);
        console.log('pngData: ', pngData);

//        // pngData から  OGイメージ を 生成, Cloudinaryに アップロード
//        const ogImageUrl = await generateAndUploadOgImage(pngData);
//        console.log('ogImageUrl: ', ogImageUrl);  // Uploaded image URL, version path removed.
//
//        // Update the OGP meta tag
//        updateMetadata(
//            "pfpg - Custom Profile Picture Generator",
//            "A custom profile picture generator for a specific svg artwork that was made with the UIntNPortray ruleset.",
//            window.location.href,  // It includes URL params for artwork data and current settings states
//            ogImageUrl
//        )

        console.log('svg2png processing has completed.');

    } catch (error) {
        console.error('An error occurred during the processing of svg2png:', error);
    }

    // SVGファイルサイズを ダウンロードボタンに 表示する
    updateButtonWithSvgSize(svgString);
}




// 現在の リソースを追跡する グローバル変数
const renderResources = {
    currentBlobUrl: null,
    pngData: null
};

// 前回の renderResources をクリーンアップ
function cleanupPreviousRender() {
    // 前回の Blob URL をリボーク
    if (renderResources.currentBlobUrl) {
      URL.revokeObjectURL(renderResources.currentBlobUrl);
      renderResources.currentBlobUrl = null
    }

    // 前回の pngData を解放
    if (renderResources.pngData) {
      renderResources.pngData.free()
      renderResources.pngData = null
    }

    // 前回の resvgJSオブジェクト を解放
    if (renderResources.resvgJS) {
      renderResources.resvgJS.free()
      renderResources.resvgJS = null
    }

    // Check the cleanup results
    console.log('renderResources: ', renderResources)
    // renderResources:
    //     {currentBlobUrl: null, pngData: null, resvgJS: null}
    //         currentBlobUrl: "blob:http://172.19.175.126:4507/e41fdaf1-3f87-4ae5-bd59-6ba05e6633f9"
    //         pngData: e {__wbg_ptr: 2345856}
    //         resvgJS: Q {__wbg_ptr: 1550136}
    //         [[Prototype]]: Object

    // このコンソール出力は、JavaScript のオブジェクト参照の特殊な動作を示しています。
    // - console.log() は、オブジェクトの初期状態（null）を表示します。
    // - コンソールを展開すると、実際のデータが表示されます。これは、ブラウザの開発者ツールがオブジェクトの最新の状態をリアルタイムで反映するためです。
    // この動作は、開発者ツールと実際のメモリ管理の微妙な違いを示しています。null 代入は、明示的なクリーンアップの意図を示す重要な手法です。
  }

// Rendering from SVG to PNG with options
async function svg2png(svgString, resvgOption) {
    // 前回のリソースをクリーンアップ
    cleanupPreviousRender()

    // Create the Resvg object
    const resvgJS = new resvg.Resvg(svgString, resvgOption)
    renderResources.resvgJS = resvgJS                          // 追跡用に保存
    console.log('resvgJS: ', resvgJS)

    // Render
    const pngData = resvgJS.render()
    renderResources.pngData = pngData                          // 追跡用に保存

    const pngBuffer = pngData.asPng()

    // Create a blob and its url
    const blob = new Blob([pngBuffer], { type: 'image/png' })
    const blobUrl = URL.createObjectURL(blob)
    renderResources.currentBlobUrl = blobUrl                   // 追跡用に保存

    // Display the PNG img on output area
    document.querySelector('#output img').src = blobUrl


    // Option: You can get the Micro SVG (usvg) strings like below
    // console.log('Simplified svg string: \n', resvgJS.toString()) // <svg>...</svg>


    // Update the size info in HTML

    // PNG file size on the download button
    updateButtonWithPngSize(pngBuffer)
    // PNG pixel size and SVG viewBox size on the <div id="xxx-info"> elements
    updatePngInfo(pngData)
    updateSvgInfo(svgString)

    return pngData
}

// Result of resvgJS and pngData
// - both have '.free()' for garbage correction

// resvgJS:
//    Q {__wbg_ptr: 1876528}
//    __wbg_ptr: 1876528
//    height: (...)
//    width: (...)
//    [[Prototype]]: A
//      constructor: class extends
//      height: (...)
//      width: (...)
//      [[Prototype]]: Object
//        constructor: class
//        cropByBBox: ƒ cropByBBox(t)
//        free: ƒ free()
//        getBBox: ƒ getBBox()
//        height: (...)
//        imagesToResolve: ƒ imagesToResolve()
//        innerBBox: ƒ innerBBox()
//        render: ƒ render()
//        resolveImage: ƒ resolveImage(t,n)
//        toString: ƒ toString()
//        width: (...)
//        __destroy_into_raw: ƒ __destroy_into_raw()
//        get height: ƒ height()
//        get width: ƒ width()
//        [[Prototype]]: Object


// pngData:
//   e {__wbg_ptr: 1552808}
//     __wbg_ptr: 1552808
//     height: (...)
//     pixels: (...)
//     width: (...)
//     [[Prototype]]: Object
//       asPng: ƒ asPng()
//       constructor: class e
//       free: ƒ free()
//       height: (...)
//       pixels: (...)
//       width: (...)
//       __destroy_into_raw: ƒ __destroy_into_raw()
//       get height: ƒ height()
//       get pixels: ƒ pixels()
//       get width: ƒ width()
//       [[Prototype]]: Object



function updatePngInfo(pngData) {
    // PNGピクセルサイズを <div id="png-info">要素に 表示する
    document.querySelector('#png-info').innerHTML = `Rendered PNG pixel size:&nbsp;<wbr>${pngData.width} x ${pngData.height}`
}

function updateSvgInfo(svgString) {
    // Indicate the SVG viewBox size in HTML

    // The resvg-js library outputs the width and height as integers by default, so the code below works fine:
    // document.querySelector('#svg-info').innerHTML = 'Source SVG viewbox: ' + resvgJS.width + ' x ' + resvgJS.height

    // However, when 'Crop side margins:' is applied in the Canvas tab, the viewBox size values can be floats, not just integers.
    // Therefore, we need to extract the size values from the SVG string using a regular expression, as shown below.

    // Outputs the viewBox size as float to indicate at #svg-info <textarea>
    const viewboxValues = extractViewboxValues(svgString) // e.g: Map(4) {'x' => 0, 'y' => 0, 'w' => 31, 'h' => 31}
    document.querySelector('#svg-info').innerHTML = `Source SVG viewBox size:&nbsp;<wbr>${viewboxValues.get('w')} x ${viewboxValues.get('h')}`
}


// Processing from SVG to PNG and measuring the time
async function measureSvg2pngTime(svgString, resvgOption, renderingStatusElements) {
    try {
        // 処理中メッセージを表示
        await updateRenderingStatus("Now rendering ...<br> Please wait a moment :)", renderingStatusElements.get('pngActionButton'));

        // 開始時刻を記録
        const startTime = performance.now();
        console.log('svg2png startTime: ', startTime);

        // svg2png関数を呼び出す
        const pngData = await svg2png(svgString, resvgOption);

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
