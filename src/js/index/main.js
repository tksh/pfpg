const INIT_INPUT_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.775 0 29.45 31" shape-rendering="crispEdges">
<title>202308_001</title>
<defs>
    <clipPath id="clipShape">
        <path d="M 1.55,15.5Q 1.24,0 15.5,0T 29.45,15.5 15.5,31 1.55,15.5" />
    </clipPath>
</defs>
<g clip-path="url(#clipShape)">
    <rect width="100%" height="100%" fill="#9999" />
    <g stroke="#000000" opacity="1" stroke-opacity="1">
        <path stroke-width="3" d="m1 0 0 26m3-26 0 25m3-25-1 23m0-8 4 6m-2-1 0 3m-1-18 4-5m8 0 5 5m1-5 1 24m-2-9 0 7m4-22 0 25m2-25 0 27m-13 1 3 3m-16-7 4-2m14-22 2 9m2 2-3 6m-1-1 0 4m0-1 2 4m-1-1 8 5m-8-19 3 2" />
    </g>
    <g stroke="#000000" opacity="1" stroke-opacity="1">
        <path stroke-width="2" d="m0 0 31 1m-22 2 5-3m-7 8 2-6m-3 8 2 7m1 5 1-2m-8 5 2-1m12-24 2 2m0-2 2 2m-8 27 2 1m-1-2 2 1m4 0 3 2m2-3 0 3m-3-14 1-1m2-1-2 1m1-8 0 2m-9-10 2 1" />
    </g>
    <g stroke="#000000" opacity="1" stroke-opacity="1">
        <path stroke-width="1" d="m1 26-1 1m7-20 1 4m-1-6 1 4m-1 3 1-3m4 14 3 3m-1-1 3 2m-3 0 1 0m-1 1 1 2m0-2 0 2m2-2-1 3m2-4 2 3m-4-1 2-2m2-4-1 2m-1 0 0 1m2 1 3 2m-2-4 3 3m0-5-4 7m5-6-3 7m4-6-2 6m3-5-1 5m3-5-1 5m3-3-2 3m-4-2 1 2m0-4 2 4m0-3 3 3m-17-11 2 2m-1-1 2 3m-1 0 1 2m-4-9 2 3m0-4 1 2m-3-1 3-2m-2 3 2-1m-2 2 2 0m2-9-3 5m2-3 1 2m-6-5 2 4m-1-2 2 3m-2-4-2 4m1-1 0 1m0 0 3 0m-3-2 2 2m0-4 4 0m-2 1 1-2m-2 1 2-3m-2 1 2-3m-1 0 2-3m-4 6 1-1m-6 3 1 1m3-9 2 1m-1-2 5 4m-2-4 3 3m-4 0 2 3m-3-1 2 4m-5 8 2 0m-2 2 4 1m-2-1 3-2m-3 0 3-2m5-5 1 2m-2 1 1-2m0-1 1 0m-21 17 2 3m6-1 4-2" />
    </g>
    <g stroke="#eeeeee" opacity="1" stroke-opacity="1">
        <path stroke-width="1" d="m14 6-5 2m0-2 5-2m-4 0 2-1m-1 6 0 1m2-1 2-1m-7 2 2-2m-1 4 1 4m1-1 1 0m-1 2 1 0m1 5 2 3m0-14 1 1m-6 12 0 5m1-3 1 2m-12 0 2 2m2-2 3 2m-1-3 3 2m0-3 1 1m0 2 3-2m5 0 2-2" />
    </g>
    <g stroke="#ffffff" opacity="1" stroke-opacity="1">
        <path stroke-width="1" d="m12 21 0 2m-1-19-2 3m2-1-1 2m1 3-2 3m2 1-1 1m2 5 2 1m-1 1 2 1" />
    </g>
</g>
</svg>`

let SVG_STRING = ''


async function getFontBuffer() {
    if (fetchFontLock) return

    fetchFontLock = true
    const controller = new AbortController()
    const signal = controller.signal
    setTimeout(() => controller.abort(), 3000) // Cancel the fetch request

    try {
        const t = performance.now()
        const font = await fetch(fontFile)

        if (!font.ok) return

        const data = await font.arrayBuffer()
        const buffer = new Uint8Array(data)
        fetchFontLock = false
        console.info('✨ 字体请求用时:', performance.now() - t + 'ms')
        return {
            buffer,
            family_name: 'Source Han Serif CN Light',
        }
    } catch (error) {
        return console.error('fetch font error', error)
    }
}

(async function () {
    await resvg.initWasm(fetch('./wasm/index_bg.2.6.2.wasm')) // Path that relative from index.html
    const output = document.getElementById('output')
    const svgInputElement = document.querySelector('#input-svg') // Select <textarea id="input-svg" ...
    // svgInputElement.value = INIT_INPUT_SVG_STRING // Un-comment to force to use `INIT_INPUT_SVG_STRING` for testing
    console.log('svgInputElement: ', svgInputElement)

    // let resvgOpts = {}
    const inputSvgElement = new DOMParser().parseFromString(INIT_INPUT_SVG_STRING, 'image/svg+xml').documentElement
    let resvgOpts = {
        font: {},
        fitTo: {
            mode: 'zoom',
            value: 2,
        },
    }

    //await svg2png(svgString, resvgOpts)

    async function svg2png(svgString, opts, hasCrop) {
        //console.log('svgString (below of "svg2png"): ', svgString)

        const svg = svgString ? svgString : svgInputElement.value.trim()
        // svgString が真（例えば、文字列が空でない、nullでないなど）であれば、その値を svg 変数に代入します。
        // svgString が偽（例えば、nullや空文字列）であれば、svgInputElement.value.trim() の結果を svg 変数に代入します。ここで、svgInputElement.value はおそらくHTML要素の値を取得し、trim() メソッドはその値の前後の空白を削除します。
        // したがって、このコードは svgString が提供されている場合はそれを使用し、そうでない場合は svgInputElement から取得した値を使用して、その後空白を削除した状態を svg 変数に代入します。

        if (!svg) {
            alert('SVG is empty')
            return
        }
        const resvgJS = new resvg.Resvg(svg, opts)

        // resvg-js default outputs the w and h size as integer
        // document.querySelector('#svg-info').textContent = 'Source SVG grid size: ' + resvgJS.width + ' x ' + resvgJS.height

        // Outputs the viewBox size as float
        const viewboxStr = getViewboxStr(svgString)
        const viewboxValues = extractViewboxValues(viewboxStr)
        //console.log('viewboxValues: ', viewboxValues)     // Object { x: 0, y: 0, w: 31, h: 31 }
        document.querySelector('#svg-info').textContent = 'Source SVG viewBox size: ' + viewboxValues.w + ' x ' + viewboxValues.h

        // SVG内に含まれる外部リンクの画像を取得して解決する
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

        // Crop
        const innerBBox = resvgJS.innerBBox()
        const bbox = resvgJS.getBBox()
        console.log('SVG innerBBox: ', innerBBox)
        console.log('SVG getBBox: ', bbox)
        if (hasCrop && bbox) resvgJS.cropByBBox(bbox)
        //renderingStatusElement.textContent = 'Now rendering ..'
        // Render
        const pngData = resvgJS.render()
        const pngBuffer = pngData.asPng()

        // PNGデータの長さ（バイト数）を取得
        const pngSize = pngBuffer.length;
        const pngSizeAsKb = roundToOneDecimal(pngSize / 1024)

        // Create a blob and its url
        document.querySelector('#output img').src = URL.createObjectURL(
            new Blob([pngBuffer], { type: 'image/png' })
        )

        // console.log('Simplified svg string: \n', resvgJS.toString()) // Micro SVG strings <svg>...</svg>

        document.querySelector('#png-info').textContent = 'Rendered PNG pixel size: ' + pngData.width + ' x ' + pngData.height + ' px'


        // PNGファイルサイズを ダウンロードボタンに 表示する

        // button要素を取得
        const pngDownloadButtonElement = document.getElementById("png-download-button");

        // 挿入したいタグを含めたテキスト
        // 改行を `Download as PNG ` の直後にする
        const pngDownloadSizeText = `Download as PNG<br>(size: ${pngSizeAsKb} kb / ${pngSize} bytes)`
        //console.log('pngDownloadSizeText: ', pngDownloadSizeText)

        pngDownloadButtonElement.innerHTML = pngDownloadSizeText

    }
    // The end of `async function svg2png(svgString, opts, hasCrop) {`


    function addMultipleEventListener(element, events, handler) {
        events.forEach(e => element.addEventListener(e, handler))
    }


    // addMultipleEventListener(svgInputElement, ['change', 'keyup', 'paste'], function (event) {
    //   const svgString = event.target.value.trim()
    //   const hasCrop = cropElement.checked
    //   if (!svgString) return
    //   svg2png(svgString, resvgOpts, hasCrop)
    // })

    // 上記のSVGテキストエリアの編集イベントごとに PNGへの変換処理が呼び出される部分を
    // <input>や<select>などの選択要素からの更新でも それが呼び出されるように 下記の通りに変更した
    // `convertSvg` という関数を作り 選択要素からSVGテキストエリアを更新した直後に
    // `convertSvg(svgInputElement.value.trim())` として呼び出す


    // svg2png関数を呼び出す関数を定義
    const convertSvg = async (svgString) => {
        //console.log('svgString: ', svgString)

        // HTML要素を取得
        const pngDownloadButtonElement = document.getElementById("png-download-button");
        const lastRenderingTimeElement = document.getElementById("last-rendering-time");

        // Update .innerHtml
        async function updateRenderingStatus(text, element) {
            return new Promise((resolve) => {
                // メッセージを更新し、次のフレームで反映させる
                element.innerHTML = text;
                requestAnimationFrame(() => {
                    resolve();
                });
            });
        }

        async function measureSvg2PngPerformance(svgString, opts, hasCrop) {
            // 処理中メッセージを表示
            await updateRenderingStatus("Now rendering ...<br> Please wait a moment :)", pngDownloadButtonElement);

            // setTimeoutを使用して非同期処理を実行
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    // 開始時刻を記録
                    const startTime = performance.now();

                    try {
                        // svg2png関数を呼び出す
                        const result = await svg2png(svgString, opts, hasCrop);

                        // 終了時刻を記録
                        const endTime = performance.now();

                        // 処理時間を計算
                        const elapsedTime = Math.floor(endTime - startTime);

                        // 処理時間をコンソールに出力
                        console.log(`Rendering time: ${elapsedTime} ms`);

                        // 処理完了メッセージを表示
                        await updateRenderingStatus(`Last rendering time: ${elapsedTime} ms`, lastRenderingTimeElement);

                        // 処理結果を返す
                        resolve(result);
                    } catch (error) {
                        // エラー処理
                        console.error('An error occurred during the processing of svg2png:', error);
                        await updateRenderingStatus("An error occurred", pngDownloadButtonElement);
                        reject(error);
                    }
                }, 0); // 0ミリ秒後に実行
            });
        } // End of 'async function measureSvg2PngPerformance(svgString, opts, hasCrop) {'

        //// const svgString = event.target.value.trim()
        const hasCrop = cropElement.checked
        if (!svgString) return

        measureSvg2PngPerformance(svgString, resvgOpts, hasCrop)
            .then((result) => {
                console.log('result: ', result); // undefined

                // 処理結果を利用する
                console.log('svg2png processing has completed.');

            })
            .catch((error) => {
                console.error('An error occurred during the processing of svg2png:', error);
            });

        countSvgSize()
    }; // End of 'const convertSvg = async (event) => {'

    // テキストを編集するたびに変換処理が呼び出される関数を設定
    addMultipleEventListener(svgInputElement, ['change', 'keyup', 'paste'], convertSvg);


    //////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Path-mode ////////////////////////////////

    // <select>要素を取得
    const selectOfPathMode = document.getElementById("path-mode");

    // changeイベントを設定
    selectOfPathMode.addEventListener("change", () => {

        // 現在の設定の値を保存しておく
        // Get the SVG textarea element and string
        const svgElemAndStr = getSvgElementAndString()
        const currentPathModeSvgStr = svgElemAndStr.string
        const svgElement = svgElemAndStr.element
        //const currentPathModeSvgStr = getInputSvg()


        // Line tab

        // Group colors
        const patternGroupColors = /<g stroke=[^>]*>/g
        const matchOfGroupColors = currentPathModeSvgStr.match(patternGroupColors) // (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="# ...

        // Opacity steps の選択肢の値は svgのコンテンツではなく UIのみに関わるので 保存しておいて元に戻す 必要はない


        // Canvas tab

        // Background color (include opacity)
        const patternBgRectFill = /<rect width="100%" height="100%" fill="[^"]*"/g
        const matchOfBgRectFill = currentPathModeSvgStr.match(patternBgRectFill)
        const valueOfBgRectFill = matchOfBgRectFill[0] // Hex string
        // Shape to trim
        const patternShapeToTrim = /<clipPath id="clipShape">[^>]*>/g
        const matchOfShapeToTrim = currentPathModeSvgStr.match(patternShapeToTrim)
        const valueOfShapeToTrim = matchOfShapeToTrim[0] // 'square' | 'circle' | 'squircle' | 'squircle, slimmed'
        // Squircle, slimmed options
        // - Width narrowness
        const selectWidthNarrowness = document.getElementById('width-narrowness');
        const valueOfSelectWidthNarrowness = selectWidthNarrowness.value; // 0-10, 15, 20, 25, 30
        // - Top-heavy ratio
        const selectTopHeavyRatio = document.getElementById('top-heavy-ratio');
        const valueOfTopHeavyRatio = selectTopHeavyRatio.value;
        // - Crop side margins
        const hasCropSideMargins = getBoolOfCropSideMargins() // boolean, true=cropped[checked], false=un-cropped[!checked]

        const patternViewbox = /viewBox="[^"]+"/; // viewBox属性を抽出する正規表現
        const matchOfViewbox = currentPathModeSvgStr.match(patternViewbox)
        const valueOfViewbox = matchOfViewbox[0] // e.g.: viewBox="1.55 0 27.9 31"


        // Render tab

        // Anti-aliasing (shape-rendering)
        const patternShapeRendering = /shape-rendering="[^"]*"/g
        const matchOfShapeRendering = currentPathModeSvgStr.match(patternShapeRendering)
        const valueOfShapeRendering = matchOfShapeRendering[0] // 'geometricPrecision' | 'crispEdges'



        // 選択された 'Path mode'の値を 取得
        const valueOfPathMode = selectOfPathMode.value; // relativeMerged | absoluteSeparated

        // Get new 'Path mode' styled svg string, decode from url params
        const newPathModeSvgStr = decodeAsSelectedPathMode(valueOfPathMode)


        // レンダリングし直す前に 保存しておいた 設定の値を 元に戻す

        // Anti-alias, Backdrop color, Shape to trim, viewBox
        const recoverShapeRendering = recoverCurrentOptionValue(newPathModeSvgStr, patternShapeRendering, valueOfShapeRendering);
        const recoverBgRectFill     = recoverCurrentOptionValue(recoverShapeRendering, patternBgRectFill, valueOfBgRectFill);
        const recoverShapeToTrim    = recoverCurrentOptionValue(recoverBgRectFill, patternShapeToTrim, valueOfShapeToTrim);
        const recoverViewbox        = recoverCurrentOptionValue(recoverShapeToTrim, patternViewbox, valueOfViewbox);

        // Group colors (stroke, opacity, stroke-opacity)
        const recoverGroupColors = recoverCurrentGroupColorsValues(recoverViewbox, patternGroupColors, matchOfGroupColors)


        const finishedNewPathModeSvgStr = recoverGroupColors
        // 設定の値を 元に戻した 新しいSVG文字列を <textarea>のvalue属性 に挿入し更新する
        svgElement.value = finishedNewPathModeSvgStr

        // convertSvg関数を呼び出す
        convertSvg(finishedNewPathModeSvgStr)
    });
    /////////////////////////////// Path-mode ////////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Opacity steps /////////////////////////////

    // セレクトメニューの要素を取得
    const selectOfOpacitySteps = document.getElementById("opacity-steps");

    // changeイベントを設定
    selectOfOpacitySteps.addEventListener("change", () => {

        // 選択されたセレクトメニューの値を取得
        const step = Number(selectOfOpacitySteps.value);
        console.log('selectOfOpacitySteps.value: ', typeof (step), step); // number, 0.04|0.1|0.2

        // 新しいセレクトメニューに更新
        changeOpacitySelectOptionsAsNewStep(step)

        // 新しいセレクトメニューへの更新で選ばれた そのstepでの 一番近い値の表示と
        // 元々の 'input-svg' のSVGの色情報がずれてしまうので 新しいセレクトメニューでの現在の値を取得して
        // 新しい <g stroke=" ... > 部分のSVG文字列を生成して置き換える
        updateSvgForNewStep()

        // Re-rendering the image from new step opacity value SVG
        convertSvg(svgInputElement.value.trim())
    });

    ////////////////////////////// Opacity steps /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Anti-aliasing /////////////////////////////

    // <select>要素を取得
    const selectOfShapeRendering = document.getElementById("shape-rendering");
    //console.log('selectOfShapeRendering is ', selectOfShapeRendering);
    //console.log('selectOfShapeRendering.length is ', selectOfShapeRendering.length); // 2

    // changeイベントを設定
    selectOfShapeRendering.addEventListener("change", () => {
        // 選択された値を取得
        const value = selectOfShapeRendering.value;
        //console.log('selectOfShapeRendering value is', value) // 'geometricPrecision' | 'crispEdges'
        // <textarea>のvalue属性を取得
        const svgString = svgInputElement.value;

        // 正規表現パターンを作成
        const patternForShapeRendering = /shape-rendering="[^"]*"/g;
        // 正規表現でマッチした部分を書き換える
        const updatedSvg = svgString.replace(patternForShapeRendering, `shape-rendering="${value}"`);
        // <textarea>のvalue属性を更新する
        svgInputElement.value = updatedSvg;
        // convertSvg関数を呼び出す
        convertSvg(svgInputElement.value.trim())
    });
    ///////////////////////////// Anti-aliasing /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Shapes to trim /////////////////////////////

    // セレクターの要素を取得
    const selectOfClipPathShape = document.getElementById('shape-to-trim');
    console.log('selectOfClipPathShape.length is ', selectOfClipPathShape.length); // 4


    // 'shape-to-trim' changeイベントリスナーを設定
    selectOfClipPathShape.addEventListener("change", () => {

        // 選択された 'shape-to-trim' の値を取得
        const shape = selectOfClipPathShape.value;
        //console.log('selectOfClipShape shape is ', shape) // square|circle|squircle|squircleSlimmed


        // `squircleSlimmed`が 選ばれた時だけ表示される
        // 2つのオプション選択用の<select>要素 と 横幅クロップ用の<label>&<input>要素 を取得
        const divWidthNarrowness = document.getElementById('width-narrowness-div');
        const divTopHeavyRatio = document.getElementById('top-heavy-ratio-div');
        const divCropSideMargins = document.getElementById('crop-side-margins-div');

        // 選択されたオプションによって 2つの<select> と 1つの<label>&<input> を 表示または非表示にする
        if (shape === 'squircleSlimmed') {
            divWidthNarrowness.style.display = 'inline'; // 表示
            divTopHeavyRatio.style.display = 'inline';   // 表示
            divCropSideMargins.style.display = 'inline'; // 表示
        } else {
            divWidthNarrowness.style.display = 'none'; // 非表示
            divTopHeavyRatio.style.display = 'none';   // 非表示
            divCropSideMargins.style.display = 'none'; // 非表示
        }


        // Get the SVG textarea element and string
        const svgElemAndStr = getSvgElementAndString()
        const svgString = svgElemAndStr.string
        const svgElement = svgElemAndStr.element

        // Get the grid size
        const gridSize = getGridSize(svgString)

        // Generate the 'Squircle' shape path
        const center = roundToTwoDecimals(gridSize / 2)
        //console.log('center: ', center)
        const shapePathOfSquircle = `<path d="M 0,${center}Q 0,0 ${center},0T ${gridSize},${center} ${center},${gridSize} 0,${center}" />`
        //console.log('shapePathOfSquircle is ', shapePathOfSquircle)
        // <path d="M 0,15.5Q 0,0 15.5,0T 31,15.5 15.5,31 0,15.5" />

        // Generate the 'Squircle, slimmed' shape path
        const widthNarrowness = getWidthNarrowness()
        const topHeavyRatio = getTopHeavyRatio()
        const shapePathOfSquircleSlimmed = generateClipPathShapeOfSquircleSlimmed(svgString, widthNarrowness, topHeavyRatio)
        //console.log('shapePathOfSquircleSlimmed:', shapePathOfSquircleSlimmed)
        // <path d="M 10.2,127.5Q 7.65,0 127.5,0T 244.8,127.5 127.5,255 10.2,127.5" />

        // Get the new svg string with selected shape path
        const pathUpdatedSvg = svgWithNewShapeClippath(shape, svgString, shapePathOfSquircle, shapePathOfSquircleSlimmed)
        const svgElemAndUpdatedStr = { element: svgElemAndStr.element, string: pathUpdatedSvg }
        console.log('svgElemAndUpdatedStr: ', svgElemAndUpdatedStr)

        const hasCropSideMargins = getBoolOfCropSideMargins() // boolean, true=cropped[checked], false=un-cropped[!checked]
        const viewboxUpdatedString = svgWithNewShapeViewbox(shape, hasCropSideMargins, svgElemAndUpdatedStr)
        console.log('viewboxUpdatedString: ', viewboxUpdatedString)
        // <textarea>のvalue属性を更新する
        svgElement.value = viewboxUpdatedString;
        // convertSvg関数を呼び出す
        convertSvg(viewboxUpdatedString)
    });
    // The end of `selectOfClipPathShape.addEventListener("change", () => {`


    // Two option <select> for 'Squircle, slimmed'

    // Width narrowness
    // changeイベントリスナーを設定
    const selectWidthNarrowness = document.getElementById('width-narrowness');
    selectWidthNarrowness.addEventListener("change", () => {
        // 選択された<select>の値を取得
        const selectedValue = selectWidthNarrowness.value;
        console.log('selectedValue(Width narrowness): ', selectedValue)

        // もう片方の オプションの値を取得
        const topHeavyRatio = getTopHeavyRatio()

        // Get the SVG textarea element and string
        const svgElemAndStr = getSvgElementAndString()
        const svgString = svgElemAndStr.string
        const svgElement = svgElemAndStr.element

        // 'Squircle, slimmed'のパスを生成
        const shapePathOfSquircleSlimmed = generateClipPathShapeOfSquircleSlimmed(svgString, selectedValue, topHeavyRatio)
        // cliPathとして使う かたち のパス文字列 を 取得する正規表現パターン
        const patternForClipPathShape = /<clipPath id="clipShape">\n.*\n.*<\/clipPath>/g;
        // Replace the path of shape to trim
        const pathUpdatedSvg = svgString.replace(patternForClipPathShape, `<clipPath id="clipShape">\n            ${shapePathOfSquircleSlimmed}\n        <\/clipPath>`);
        const svgElemAndUpdatedStr = { element: svgElemAndStr.element, string: pathUpdatedSvg }
        const shape = 'squircleSlimmed'
        const hasCropSideMargins = getBoolOfCropSideMargins() // boolean, true=cropped[checked], false=un-cropped[!checked]
        const viewboxUpdatedString = svgWithNewShapeViewbox(shape, hasCropSideMargins, svgElemAndUpdatedStr)
        // <textarea>のvalue属性を更新する
        svgElement.value = viewboxUpdatedString;
        // convertSvg関数を呼び出す
        convertSvg(viewboxUpdatedString)
    });

    // Top-heavy ratio
    // changeイベントリスナーを設定
    const selectTopHeavyRatio = document.getElementById('top-heavy-ratio');
    selectTopHeavyRatio.addEventListener("change", () => {
        // 選択された<select>の値を取得
        const selectedValue = selectTopHeavyRatio.value;
        console.log('selectedValue(Top-heavy ratio): ', selectedValue)

        // もう片方の オプションの値を取得
        const widthNarrowness = getWidthNarrowness()

        // Get the SVG textarea element and string
        const svgElemAndStr = getSvgElementAndString()
        const svgString = svgElemAndStr.string
        const svgElement = svgElemAndStr.element

        // 'Squircle, slimmed'のパスを生成
        const shapePathOfSquircleSlimmed = generateClipPathShapeOfSquircleSlimmed(svgString, widthNarrowness, selectedValue)
        // cliPathとして使う かたち のパス文字列 を 取得する正規表現パターン
        const patternForClipPathShape = /<clipPath id="clipShape">\n.*\n.*<\/clipPath>/g;
        // Replace the path of shape to trim
        const pathUpdatedSvg = svgString.replace(patternForClipPathShape, `<clipPath id="clipShape">\n            ${shapePathOfSquircleSlimmed}\n        <\/clipPath>`);
        const svgElemAndUpdatedStr = { element: svgElemAndStr.element, string: pathUpdatedSvg }
        const shape = 'squircleSlimmed'
        const hasCropSideMargins = getBoolOfCropSideMargins() // boolean, true=cropped[checked], false=un-cropped[!checked]
        const viewboxUpdatedString = svgWithNewShapeViewbox(shape, hasCropSideMargins, svgElemAndUpdatedStr)
        // <textarea>のvalue属性を更新する
        svgElement.value = viewboxUpdatedString;
        // convertSvg関数を呼び出す
        convertSvg(viewboxUpdatedString)
    });
    ///////////////////////////// Shapes to trim /////////////////////////////
    //////////////////////////////////////////////////////////////////////////



    // Unused Query Selectors for bg(rect), width(number, range), crop-by-bbox

    // const backgroundColorPickerElement = document.querySelector('#background-color-picker') // original bg color picker, now disabled
    // const strokeColorPickerElement = document.querySelector('#stroke-color-picker') // original mono color picker, now disabled
    const cropElement = document.querySelector('#crop-by-bbox') // original cropping function checkbox, now disabled

    //////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Crop by BBox //////////////////////////////

    cropElement.addEventListener('change', function (event) {
        const hasCrop = event.target.checked
        svg2png(null, resvgOpts, hasCrop)
    })
    ////////////////////////////// Crop by BBox //////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    /////////////////////////// Background color ///////////////////////////

    // // Color-picker: Background color (via resvg original)
    // backgroundColorPickerElement.addEventListener('change', function (event) {
    //   const value = event.target.value // get value from color picker
    //   const hasCrop = cropElement.checked
    //   if (!value) return
    //   resvgOpts.background = value
    //   console.log('resvgOpts.background value is ' + resvgOpts.background) // resvgOpts.background value is #87FF634C
    //   svg2png(null, resvgOpts, hasCrop)
    // })
    /////////////////////////// Background color ///////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ////////// Group 'stroke', 'opacity' and 'stroke-opacity' [n] ///////////

    function addEventListenerForGroupColorsInputs(numberOfGroups, attrName) {

        // id `group-colors-${attrName}-N` の要素の変更を監視
        for (let i = 0; i < numberOfGroups; i++) {
            const elementId = `group-colors-${attrName}-${i}`;
            console.log('elementId: ', elementId) // group-colors-${attrName}-0

            const element = document.querySelector(`#${elementId}`);
            console.log('i, element: ', i, element) // 0 <input type=​"number" min=​"0" max=​"1" step=​"0.1" value=​"1" id=​"group-colors-${attrName}-0">​

            element.addEventListener('change', function (event) {

                console.log(`/////// Event changed for '${attrName}' ///////`)
                const inputValue = event.target.value;  // ${attrName} input の値を取得
                console.log('inputValue: ', inputValue) // [0-1] Number

                if (!inputValue) return;

                // elementId最後の idの数値のみ を抽出して 変更されたグループの indexナンバー を特定
                const groupId = elementId.replace(`group-colors-${attrName}-`, '');
                //console.log('groupId: ', groupId)                 // like '0', '1', '2' ...
                //console.log('typeof(groupId): ', typeof(groupId)) // string

                // Get the matches for <g> from current SVG string in textarea
                const currentSVG = getInputSvg()
                const matches = regexMatchesOfGroupColors(currentSVG)
                // console.log('matches: ', matches)
                // (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']

                // Get three group colors value
                const stroke = hexExpandTo6(getStroke(matches[i]))       // 6 digits hex (with hash mark)
                const opacity = getOpacity(matches[i])       // [0-1] number
                const strokeOpacity = getStrokeOpacity(matches[i]) // [0-1] number


                // Generate the array like regex 'matche' object with input value
                let valueAsMatchesStructure = [];

                if (attrName === 'stroke') {

                    valueAsMatchesStructure = [
                        undefined,     // [0] = undefined
                        inputValue,    // [1] = value of stroke
                        opacity,       // [2] = value of opacity
                        strokeOpacity  // [3] = value of stroke-opacity
                    ]
                } else if (attrName === 'opacity') {

                    valueAsMatchesStructure = [
                        undefined,     // [0] = undefined
                        stroke,        // [1] = value of stroke
                        inputValue,    // [2] = value of opacity
                        strokeOpacity  // [3] = value of stroke-opacity
                    ]
                } else if (attrName === 'stroke-opacity') {

                    valueAsMatchesStructure = [
                        undefined,     // [0] = undefined
                        stroke,        // [1] = value of stroke
                        opacity,       // [2] = value of opacity
                        inputValue     // [3] = value of stroke-opacity
                    ]
                }
                console.log('valueAsMatchesStructure: ', valueAsMatchesStructure)
                // (4) [undefined, '#FF0000', '0.8', '1']

                // 更新された <g>タグを生成する
                changedGroupElem = generateGroupColorsSvgTags(valueAsMatchesStructure)
                console.log('changedGroupElem: ', changedGroupElem)
                // <g stroke="#FF7523" opacity="1" stroke-opacity="1">


                // Replace the changed <g> elements via group ID
                const pattern = /<g stroke=[^>]*>/g;
                const updatedSvg = replaceAtIndex(currentSVG, pattern, changedGroupElem, groupId)

                // Refresh the SVG string in <textarea>
                svgInputElement.value = updatedSvg;

                // Re-rendering the image
                convertSvg(svgInputElement.value.trim())
            });
        }
    }

    // Add multiple event listener for whole stroke colors
    const numberOfGroups = getNumberOfGroups(getInputSvg())
    addEventListenerForGroupColorsInputs(numberOfGroups, 'stroke')
    addEventListenerForGroupColorsInputs(numberOfGroups, 'opacity')
    addEventListenerForGroupColorsInputs(numberOfGroups, 'stroke-opacity')

    ////////// Group 'stroke', 'opacity' and 'stroke-opacity' [n] ///////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    /////////////////////////// Backdrop color ///////////////////////////

    const rectColorPickerElement = document.querySelector('#rect-color-picker')

    // Color-picker: Backdrop color (background rect color)
    rectColorPickerElement.addEventListener('change', function (event) {

        // console.log('event.target.value: ', event.target.value) // #60D7FF

        // Get the selected color via '.jscolor.toHEXAString()' instead of above '.value' method
        const hexaColor = event.target.jscolor.toHEXAString();
        const hexaColorShorten = eightToFourOrThree(hexaColor);
        console.log("Selected color (HexA): " + hexaColor); // #FFFFFF99
        console.log("Selected color (HexA, shorten): " + hexaColorShorten); // #FFF9


        // SVGのテキストを取得
        const svgString = getInputSvg()
        // 正規表現パターンを作成
        const pattern = /<rect width="100%" height="100%" fill="[^"]*"/g; // <<rect width="100%" height="100%" fill="#fff9"> is default background rect color
        // 正規表現でマッチした部分を書き換える
        const updatedSvg = svgString.replace(pattern, `<rect width="100%" height="100%" fill="${hexaColorShorten}"`);
        // <textarea>のvalue属性を更新する
        svgInputElement.value = updatedSvg;

        // convertSvg関数を呼び出す
        convertSvg(svgInputElement.value.trim())
    })
    /////////////////////////// Backdrop color ///////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ////////////////////////// Crop side margins //////////////////////////

    // Crop チェックボックス要素にイベントリスナーを追加
    const checkbox = document.getElementById('crop-side-margins');
    checkbox.addEventListener('change', onCropCheckboxChanged);

    // Crop チェックボックスの状態が変わったときに呼ばれる関数
    function onCropCheckboxChanged(event) {
        if (event.target.checked) {
            // チェックボックスがチェックされた場合、クロップ処理を実行
            console.log('Check the `Crop side margins: ` checkbox.')
            const svgElemAndStr = getSvgElementAndString()
            const updatedSvg = viewboxSlimmed(svgElemAndStr); // 1. Crop the SVG, Replace the textarea content.
            convertSvg(updatedSvg);                           // 2. Rasterize to PNG, Replace the img-box content.
        } else {
            // チェックボックスが外れた場合、元のデータと同じ矩形のサイズに戻す
            console.log('Un-check the `Crop side margins: ` checkbox.')
            const svgElemAndStr = getSvgElementAndString()
            const updatedSvg = viewboxUnSlimmed(svgElemAndStr); // 1. Un-Crop the SVG, Replace the textarea content.
            convertSvg(updatedSvg);                             // 2. Rasterize to PNG, Replace the img-box content.
        }
    }
    ////////////////////////// Crop side margins //////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////// Width pixel size ////////////////////////////

    const pngSizeChangeViaNumber = document.querySelector('#png-size-number')
    const pngSizeChangeViaRange = document.querySelector('#png-size-range')

    // png-size-number, png-size-range のどちらによって 数値が変更されても この処理がされる
    const pngSizeElement = (event) => {
        // 変更された pngSizeElement の値を取得
        const value = event.target.value;
        console.log('value:', value)

        // 変更されたサイズ(value)の値で svg2png() の第二引数となる resvgOpts オブジェクトを新しく作る
        Object.assign(resvgOpts, {
            fitTo: {
                mode: 'height',
                value: parseInt(value, 10), // parseInt(string, radix= 10 進数)
            }
        })

        // convertSvg関数を呼び出す
        convertSvg(svgInputElement.value.trim())
    }

    pngSizeChangeViaNumber.addEventListener('change', pngSizeElement); // change value via png-size-number
    pngSizeChangeViaRange.addEventListener('change', pngSizeElement); // change value via png-size-range

    // Constraint validation
    const numberInput = document.getElementById("png-size-number");
    // 入力値が変更されたときの処理
    numberInput.addEventListener("change", () => {
        // 入力値の妥当性を報告する
        numberInput.reportValidity();
    });


    // '-' or '+' ボタンクリック時の共通処理を行う関数
    const handleButtonClick = (step) => {
        const newValue = adjustWidthNum(step);

        if (newValue !== null) { // 返り値がnullでなければ PNGレンダリング処理を行う
            console.log("New value of 'Width pixel size':", newValue);

            // ボタンで変更された結果のサイズ(newValue)の値で svg2png() の第二引数となる resvgOpts オブジェクトを新しく作る
            Object.assign(resvgOpts, {
                fitTo: {
                    mode: 'height',
                    value: newValue,
                }
            });

            convertSvg(svgInputElement.value.trim())
        }
    };

    // ボタンのクリックイベントに対して共通処理を呼び出す
    const pngSizeDecButton = document.querySelector('#width-size-dec');
    const pngSizeIncButton = document.querySelector('#width-size-inc');

    pngSizeDecButton.addEventListener('click', () => handleButtonClick(-1));
    pngSizeIncButton.addEventListener('click', () => handleButtonClick(1));

    //////////////////////////// Width pixel size ////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    // Initialize the 'Width pixel size'

    const setPngSize = (value) => { // 直接数値を指定するため 上のサイズ変更用関数から 引数 を event から value に変更
        //const value = event.target.value // disableして 直接引数の数値を value とする
        //const hasCrop = cropElement.checked

        // 引数(value)の値で svg2png() の第二引数となる resvgOpts オブジェクトを新しく作る
        Object.assign(resvgOpts, {
            fitTo: {
                mode: 'height',
                value: parseInt(value, 10), // parseInt(string, radix= 10 進数)
            }
        })

        // Set the width number of input area with argument value
        pngSizeChangeViaNumber.value = value;
        pngSizeChangeViaRange.value = value;
        console.log(`Set 'Width pixel size' initial value as "${value}"`)
    }

    // // Force to apply the '256' as PNG rendering size
    // // The half of `<input type="range" max="512">` is 256
    setPngSize(256);

    // First PNG rendering
    convertSvg(svgInputElement.value.trim())

})(); // `(async function () {` の 即時実行関数