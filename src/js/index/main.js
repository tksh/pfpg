(async function () {
    await resvg.initWasm(fetch('../../wasm/index_bg_20230424.wasm'))
    const output = document.getElementById('output')
    const svgElement = document.querySelector('#input-svg') // Select <textarea id="input-svg" ...
    const inputSVG = svgElement.value.trim() // `.trim()` = 文字列の両端の空白を削除
    //console.log('inputSVG: ', inputSVG)
    let resvgOpts = {}
    //await svg2png(inputSVG, resvgOpts)

    async function svg2png(inputSVG, opts, hasCrop) {

        const svg = inputSVG ? inputSVG : svgElement.value.trim()

        if (!svg) {
            alert('SVG is empty')
            return
        }
        const resvgJS = new resvg.Resvg(svg, opts)
        document.querySelector('#svg-info').textContent = 'Source SVG grid size: ' + resvgJS.width + ' x ' + resvgJS.height

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

        document.querySelector('#png-info').textContent = 'Rendered PNG image size: ' + pngData.width + ' x ' + pngData.height + ' px'


        // PNGファイルサイズを ダウンロードボタンに 表示する

        // button要素を取得
        const pngDownloadButtonElement = document.getElementById("png-download-button");

        // 挿入したいタグを含めたテキスト
        // 改行を `Download as PNG ` の直後にする
        const pngDownloadSizeText = `Download as PNG<br>(size: ${pngSizeAsKb} kb / ${pngSize} bytes)`
        //console.log('pngDownloadSizeText: ', pngDownloadSizeText)

        pngDownloadButtonElement.innerHTML = pngDownloadSizeText

    }
    // The end of `async function svg2png(inputSVG, opts, hasCrop) {`


    function addMultipleEventListener(element, events, handler) {
        events.forEach(e => element.addEventListener(e, handler))
    }

    // addMultipleEventListener(svgElement, ['change', 'keyup', 'paste'], function (event) {
    //   const inputSVG = event.target.value.trim()
    //   const hasCrop = cropElement.checked
    //   if (!inputSVG) return
    //   svg2png(inputSVG, resvgOpts, hasCrop)
    // })

    // 上のテキスト編集イベントごとに変換処理が走る部分を ラジオボックスの更新でもそれが走る用に 下記のように書き換え
    // `convertSvg` という名前を関数に付けておいて ラジオボタンでテキストコンテンツを更新した直後に
    // `convertSvg({ target: svgElement });` で呼び出す


    // svg2png関数を呼び出す関数を定義
    const convertSvg = async (event) => {
        countSvgSize()
        // HTML要素を取得
        const pngDownloadButtonElement = document.getElementById("png-download-button");
        const lastRenderingTimeElement = document.getElementById("last-redering-time");
        //console.log('pngDownloadButtonElement: ', lastRenderingTimeElement)

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

        async function measureSvg2PngPerformance(inputSVG, opts, hasCrop) {
            // 処理中メッセージを表示
            await updateRenderingStatus("Now rendering ...<br> Please wait a moment :)", pngDownloadButtonElement);

            // setTimeoutを使用して非同期処理を実行
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    // 開始時刻を記録
                    const startTime = performance.now();

                    try {
                        // svg2png関数を呼び出す
                        const result = await svg2png(inputSVG, opts, hasCrop);

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
        }

        const inputSVG = event.target.value.trim()
        const hasCrop = cropElement.checked
        if (!inputSVG) return

        measureSvg2PngPerformance(inputSVG, resvgOpts, hasCrop)
            .then((result) => {
                // 処理結果を利用する
                console.log('svg2png processing has completed.');

            })
            .catch((error) => {
                console.error('An error occurred during the processing of svg2png:', error);
            });
    };

    // テキストを編集するたびに変換処理が走る関数を設定
    addMultipleEventListener(svgElement, ['change', 'keyup', 'paste'], convertSvg);


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
        //console.log('selectOfShapeRendering value is', value) // geometricPrecision | crispEdges
        // <textarea>のvalue属性を取得
        const inputSVG = svgElement.value;

        // 正規表現パターンを作成
        const patternForShapeRendering = /shape-rendering="[^"]*"/g;
        // 正規表現でマッチした部分を書き換える
        const updatedSVG = inputSVG.replace(patternForShapeRendering, `shape-rendering="${value}"`);
        // <textarea>のvalue属性を更新する
        svgElement.value = updatedSVG;
        // convertSvg関数を呼び出す
        convertSvg({ target: svgElement });
    });
    ///////////////////////////// Anti-aliasing /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Shape to trim /////////////////////////////

    // セレクターの要素を取得
    const selectOfClipPathShape = document.getElementById('shapes-to-trim');
    //console.log('selectOfClipPathShape is ', selectOfClipPathShape);
    //console.log('selectOfClipPathShape.length is ', selectOfClipPathShape.length); // 3


    // 'shapes-to-trim' changeイベントリスナーを設定
    selectOfClipPathShape.addEventListener("change", () => {

        // 選択された 'shapes-to-trim' の値を取得
        const value = selectOfClipPathShape.value;
        //console.log('selectOfClipShape value is ', value) // square|circle|squircle|squircleSlimmed


        // `squircleSlimmed`が 選ばれた時だけ表示される 2つの オプション選択用の <select>要素を 取得
        const optionDivWidthNarrowness = document.getElementById('width-narrowness-div');
        const optionDivTopHeavyRatio = document.getElementById('top-heavy-ratio-div');

        // 選択されたオプションによって2つのオプション<select>を表示または非表示にする
        if (value === 'squircleSlimmed') {
            optionDivWidthNarrowness.style.display = 'inline'; // 表示
            optionDivTopHeavyRatio.style.display = 'inline'; // 表示
        } else {
            optionDivWidthNarrowness.style.display = 'none'; // 非表示
            optionDivTopHeavyRatio.style.display = 'none'; // 非表示
        }


        // Get SVG string from textarea
        const inputSVG = getInputSvg()

        // Get the grid size
        const gridSize = getGridSize()

        // Generate the 'Squircle' shape path
        const center = roundToTwoDecimals(gridSize / 2)
        //console.log('center: ', center)
        const shapePathOfSquircle = `<path d="M 0,${center}Q 0,0 ${center},0T ${gridSize},${center} ${center},${gridSize} 0,${center}" />`
        //console.log('shapePathOfSquircle is ', shapePathOfSquircle)
        // <path d="M 0,15.5Q 0,0 15.5,0T 31,15.5 15.5,31 0,15.5" />

        // Generate the 'Squircle, slimmed' shape path
        const widthNarrowness = getWidthNarrowness()
        const topHeavyRatio = getTopHeavyRatio()
        const shapePathOfSquircleSlimmed = generateClipPathShapeOfSquircleSlimmed(widthNarrowness, topHeavyRatio)
        //console.log('shapePathOfSquircleSlimmed:', shapePathOfSquircleSlimmed)
        // <path d="M 10.2,127.5Q 7.65,0 127.5,0T 244.8,127.5 127.5,255 10.2,127.5" />

        // Get the new svg string with selected shape path
        const updatedSVG = svgWithNewShapeToTrim(value, inputSVG, shapePathOfSquircle, shapePathOfSquircleSlimmed)
        // <textarea>のvalue属性を更新する
        svgElement.value = updatedSVG;
        // convertSvg関数を呼び出す
        convertSvg({ target: svgElement });
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

        // 'Squircle, slimmed'のパスを生成
        const shapePathOfSquircleSlimmed = generateClipPathShapeOfSquircleSlimmed(selectedValue, topHeavyRatio)
        // cliPathとして使う かたち のパス文字列 を 取得する正規表現パターン
        const patternForClipPathShape = /<clipPath id="clipShape">\n.*\n.*<\/clipPath>/g;
        // Replace the path of shape to trim
        const inputSVG = getInputSvg()
        const updatedSVG = inputSVG.replace(patternForClipPathShape, `<clipPath id="clipShape">\n            ${shapePathOfSquircleSlimmed}\n        <\/clipPath>`);
        // 'inpu-svg' <textarea> の value属性を 更新する
        svgElement.value = updatedSVG;
        // convertSvg関数を呼び出す
        convertSvg({ target: svgElement });
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

        // 'Squircle, slimmed'のパスを生成
        const shapePathOfSquircleSlimmed = generateClipPathShapeOfSquircleSlimmed(widthNarrowness, selectedValue)
        // cliPathとして使う かたち のパス文字列 を 取得する正規表現パターン
        const patternForClipPathShape = /<clipPath id="clipShape">\n.*\n.*<\/clipPath>/g;
        // Replace the path of shape to trim
        const inputSVG = getInputSvg()
        const updatedSVG = inputSVG.replace(patternForClipPathShape, `<clipPath id="clipShape">\n            ${shapePathOfSquircleSlimmed}\n        <\/clipPath>`);
        // 'inpu-svg' <textarea> の value属性を 更新する
        svgElement.value = updatedSVG;
        // convertSvg関数を呼び出す
        convertSvg({ target: svgElement });
    });
    ///////////////////////////// Shape to trim /////////////////////////////
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
    /////////////////////////// Background colors ///////////////////////////

    // // Color-picker: Background color (via resvg original)
    // backgroundColorPickerElement.addEventListener('change', function (event) {
    //   const value = event.target.value // get value from color picker
    //   const hasCrop = cropElement.checked
    //   if (!value) return
    //   resvgOpts.background = value
    //   console.log('resvgOpts.background value is ' + resvgOpts.background) // resvgOpts.background value is #87FF634C
    //   svg2png(null, resvgOpts, hasCrop)
    // })
    /////////////////////////// Background colors ///////////////////////////
    //////////////////////////////////////////////////////////////////////////



    //////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Stroke color [n] /////////////////////////////

    // todo: whole-color の時に 色を変更すると上手く動かない

    // Color-picker: for multipul stroke colors

    function addEventListenerForAllStrokeColorPickers(numberOfColorPickers) {
        console.log('numberOfColorPickers(addEvent..ForAll..Pockers): ', numberOfColorPickers) // 3

        // `multipul-stroke-color-pickers-N` カラーピッカータグの変更を監視
        for (let i = 0; i < numberOfColorPickers; i++) {
            const colorPickerId = `multipul-stroke-color-pickers-${i}`;
            console.log('colorPickerId: ', colorPickerId) // multipul-stroke-color-pickers-0

            const colorPickerElement = document.querySelector(`#${colorPickerId}`);
            //console.log('colorPickerElement: ', colorPickerElement)
            // <input id="multipul-stroke-color-pickers-0" class="input-color add-margin-bottom" value="#000" style="width: 9rem;" data-jscolor="{}" autocomplete="off">
            // <input id="multipul-stroke-color-pickers-1" class="input-color add-margin-bottom" value="#eee" style="width: 9rem;" data-jscolor="{}" autocomplete="off">
            // <input id="multipul-stroke-color-pickers-2" class="input-color add-margin-bottom" value="#fff" style="width: 9rem;" data-jscolor="{}" autocomplete="off">

            colorPickerElement.addEventListener('change', function (event) {
                const hexCode = event.target.value; // カラーピッカーの値を取得
                if (!hexCode) return;
                //console.log('g stroke color value is ', value) // #D6EE4B

                // Force to convert as 8 digits hex
                const hexCodeEightDigits = mergeOpacityAndExtended(hexCode)
                console.log('hexCodeEightDigits: ', hexCodeEightDigits) // #FF6F25FF

                // カラーピッカータグのidから対応するグループを特定
                const groupId = colorPickerId.replace('multipul-stroke-color-pickers-', '');
                //console.log('groupId: ', groupId) // 0 or 1 or 2
                //console.log('typeof(groupId): ', typeof (groupId)) // string

                // 現在の <textarea>の要素を取得
                const svgElement = document.getElementById("input-svg");
                // 'input-svg' <textarea> の value属性を 取得
                const inputSVG = svgElement.value;

                // RegEx pattern to capture <g stroke="#000000" opacity="0.4">
                // stroke属性と opacity属性が有っても無くても <g>全体を抽出する
                const pattern = /<g stroke=.*>/g;

                // パターンにマッチする部分全てをを配列に追加
                const currentScopeGroupElemArray = inputSVG.match(pattern); // matchメソッドで配列を返す
                console.log('currentScopeGroupElemArray: ', currentScopeGroupElemArray)
                // opacityが無い場合: Array(3) [ '<g stroke="#000">', '<g stroke="#eee">', '<g stroke="#fff">' ]
                // opacityが有る場合: Array(3) [ '<g stroke="#000" opacity="0.4">', '<g stroke="#eee" opacity="0.4">', '<g stroke="#fff" opacity="0.4">' ]

                // 'groupId' を インデックスナンバーとして 変更された色の <g>のみを 抽出
                const changedIdCurrentScopeGroupElem = currentScopeGroupElemArray[groupId]


                // 正規表現パターンを作成
                const pattern_2 = /<g stroke="([^"]+)"\s*(?:opacity="([^"]+)")?\s*>/g;
                //console.log('pattern(for stroke color): ', pattern) // /g stroke="[^"]*"/g

                // Get the current status of transparency-scope
                const matches_2 = pattern_2.exec(changedIdCurrentScopeGroupElem); // exec メソッドでマッチする部分を探す
                console.log('matches_2: ', matches_2)
                // opacityが無い場合: [ '<g stroke="#000">', "#000", undefined ]
                // opacityが有る場合: [ '<g stroke="#000000FF" opacity="1.0">', "#000000FF", "1.0" ]

                // これによって 現在の状態が whole-group or per-stroke のどちらかが分かる
                //   もし opacityが無い場合(per-stroke) には インデックス[2] の 'opacity'の数値 が 'undefined' になる
                //   そうでなければ whole-group と判断できる
                let currentTransScope = "";
                let valueAsMatchesStructure = []; // [1] が hex, [2] が opacity の値
                if (matches_2[2] === undefined) {
                    console.log('"Opacity=" not found')
                    currentTransScope = 'per-stroke'

                    valueAsMatchesStructure[0] = undefined;
                    valueAsMatchesStructure[1] = hexCodeEightDigits;  // hex 8 digits // #FF6F25FF
                    // [2]は 何も指定しなければ 'undefined'になる

                } else {
                    currentTransScope = 'whole-group'

                    valueAsMatchesStructure[0] = undefined;
                    console.log('splitHexAndOpacity(hexCodeEightDigits)[1]: ', splitHexAndOpacity(hexCodeEightDigits)[1]) // ##FF6F2
                    valueAsMatchesStructure[1] = splitHexAndOpacity(hexCodeEightDigits.slice(1))[1]; // hex without opacity, and '#' remove with '.slice(1)'
                    valueAsMatchesStructure[2] = splitHexAndOpacity(hexCodeEightDigits.slice(1))[2]; // opacity value [0-1]
                }
                console.log('currentTransScope: ', currentTransScope) // 'whole-group' or 'per-stroke'
                console.log('valueAsMatchesStructure: ', valueAsMatchesStructure) // Array(3) [ undefined, "#FF882A", 1 ]


                // 選択された scope ('whole-group' or 'per-stroke') に合わせて それぞれの <g>タグを生成する
                newChangedIdCurrentScopeGroupElem = generateGroupElemInStyleOfSelectedScope(currentTransScope, valueAsMatchesStructure)
                console.log('newChangedIdCurrentScopeGroupElem: ', newChangedIdCurrentScopeGroupElem)

                // Replace
                // function replaceAtIndex(inputString, regexPattern, replacement, index)
                const updatedSVG = replaceAtIndex(inputSVG, pattern, newChangedIdCurrentScopeGroupElem, groupId)

                // 'input-svg' <textarea> の value属性を 更新
                svgElement.value = updatedSVG;

                // convertSvg関数を呼び出す
                convertSvg({ target: svgElement });

            });
        }
    }

    // Add multipul event listener for whole stroke colors
    const numberOfColorPickers = getNumberOfStrokeGroups(getInputSvg())
    addEventListenerForAllStrokeColorPickers(numberOfColorPickers)

    // Get the number of stroke colors to add multipul event listener
    function getNumberOfStrokeGroups(inputSVG) {
        // // SVGのテキストを取得
        // const inputSVG = getInputSvg()

        // 正規表現パターンを作成
        const pattern = /g stroke="[^"]*"/g; // g stroke="..." にマッチするパターン
        // パターンにマッチする部分をすべて探す
        const matches = inputSVG.match(pattern); // matchメソッドで配列を返す
        console.log('matches(g stroke="#XXX"): ', matches) // Array(3) [ 'g stroke="#000"', 'g stroke="#eee"', 'g stroke="#fff"' ]
        // マッチした部分の数を取得
        const numberOfColorPickers = matches.length; // 配列の長さでマッチした部分の数を得る
        console.log('numberOfColorPickers: ', numberOfColorPickers) // 3
        return numberOfColorPickers
    }

    ///////////////////////////// Stroke color [n] /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    /////////////////////////// Transparency scope ///////////////////////////
    const transparencyScopeSelectorElement = document.getElementById('transparency-scope')

    // changeイベントを設定
    transparencyScopeSelectorElement.addEventListener("change", () => {
        // 選択された値を取得
        const selectedTransScope = transparencyScopeSelectorElement.value;
        console.log('selectedTransScope:', selectedTransScope) // whole-group | per-stroke

        // whole-group | per-stroke に応じて生成された<g>要素 を含む新しいSVG文字列を 取得
        const updatedSVG = generateSvgInStyleOfSelectedScope(selectedTransScope, inputSVG)

        // 'input-svg' <textarea> の value属性を 更新
        svgElement.value = updatedSVG;

        // convertSvg関数を呼び出す
        convertSvg({ target: svgElement });

    });
    /////////////////////////// Transparency scope ///////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    /////////////////////////// Background colors ///////////////////////////

    const rectColorPickerElement = document.querySelector('#rect-color-picker')

    // Color-picker: Background color (background rect color)
    rectColorPickerElement.addEventListener('change', function (event) {

        // console.log('event.target.value: ', event.target.value) // #60D7FF

        // Get the selected color via '.jscolor.toHEXAString()' instead of above '.value' method

        // Get the selected color in hex (with alphachannel) format
        //const hexColor = event.target.jscolor.toHEXString();
        //console.log("Selected color (Hex): " + hexColor); // #C9FF7E
        const hexaColor = event.target.jscolor.toHEXAString();
        const hexaColorShorten = eightToFourOrThree(hexaColor);
        console.log("Selected color (HexA): " + hexaColor); // #C9FF7EFF
        console.log("Selected color (HexA, shorten): " + hexaColorShorten); // #C9FF7EFF


        // SVGのテキストを取得
        const inputSVG = getInputSvg()
        // 正規表現パターンを作成
        const pattern = /<rect width="100%" height="100%" fill="[^"]*"/g; // <<rect width="100%" height="100%" fill="#fff9"> is default background rect color
        // 正規表現でマッチした部分を書き換える
        const updatedSVG = inputSVG.replace(pattern, `<rect width="100%" height="100%" fill="${hexaColorShorten}"`);
        //console.log('updatedSVG(background rect color); ', updatedSVG)
        // <textarea>のvalue属性を更新する
        //console.log('textarea(for bg rect): ', textarea)
        svgElement.value = updatedSVG;
        // convertSvg関数を呼び出す
        convertSvg({ target: svgElement });
    })
    /////////////////////////// Background colors ///////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////// Width and height ////////////////////////////

    const pngSizeElementViaNumber = document.querySelector('#png-size-number')
    const pngSizeElementViaRange = document.querySelector('#png-size-range')

    // png-size-number, png-size-range のどちらによって 数値が変更されても この処理がされる
    const pngSizeElement = (event) => {
        // 変更された pngSizeElement の値を取得
        const value = event.target.value;
        console.log('value:', value)

        // 変更されたサイズ(value)の値で svg2png() の第二引数となる resvgOpts オブジェクトを新しく作る
        Object.assign(resvgOpts, {
            fitTo: {
                mode: 'width',
                value: parseInt(value, 10), // parseInt(string, radix= 10 進数)
            }
        })

        // convertSvg関数を呼び出す
        convertSvg({ target: svgElement });
    }

    pngSizeElementViaNumber.addEventListener('change', pngSizeElement); // change value via png-size-number
    pngSizeElementViaRange.addEventListener('change', pngSizeElement); // change value via png-size-range
    //////////////////////////// Width and height ////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    // Initialize the 'Width and height' and 'Transparency scope'

    const setPngSize = (value) => { // 直接数値を指定するため 上のサイズ変更用関数から 引数 を event から value に変更
        //const value = event.target.value // disableして 直接引数の数値を value とする
        const hasCrop = cropElement.checked

        Object.assign(resvgOpts, {
            fitTo: {
                mode: 'width',
                value: parseInt(value, 10), // parseInt(string, radix= 10 進数)
            }
        })
        svg2png(null, resvgOpts, hasCrop)

        // Set the width number of input area with argument value
        pngSizeElementViaNumber.value = value;
        console.log(`Set 'Width and height' value as "${value}"`)
    }
    // // Force to apply the '256' as PNG rendering size
    // // The half of `<input type="range" max="512">` is 256
    setPngSize(256);

    const setTransScope = (value) => {
        // Force to apply the 'whole-group' style as transparency scope to generate <g> tags
        defaultTransScope = value
        const updatedSVG = generateSvgInStyleOfSelectedScope(defaultTransScope, inputSVG)
        svgElement.value = updatedSVG;
        convertSvg({ target: svgElement });
        transparencyScopeSelectorElement.value = value
        console.log(`Set 'Transparency scope' value as "${value}"`)
    }
    setTransScope('whole-group')

    countSvgSize()

})(); // `(async function () {` の 即時実行関数