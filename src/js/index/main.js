(async function () {
    // Generate the HTML elements of group attrs color-pickers
    // generateGroupColorsHtmlElements(getOpacitySteps())
    generateGroupColorsHtmlElements(getInitialOpacitySteps())

    await resvg.initWasm(fetch('./wasm/index_bg.2.6.2.wasm')) // Path that relative from index.html
    const svgInputElement = document.querySelector('#input-svg') // <textarea id="input-svg" ... >
    //console.log('svgInputElement.value.trim(): ', svgInputElement.value.trim()) // <svg xmlns="http://www.w3.org/2000/svg" ... </svg>

    let resvgOpts = {}

    // addMultipleEventListener(svgInputElement, ['change', 'keyup', 'paste'], function (event) {
    //   const svgString = event.target.value.trim()
    //   const hasCrop = cropElement.checked
    //   if (!svgString) return
    //   svg2png(svgString, resvgOpts, hasCrop)
    // })

    // 上記のSVGテキストエリアの編集イベントごとに PNGへの変換処理が呼び出される部分を
    // <input>や<select>などの 追加された選択要素からの更新でも それが呼び出されるように 下記の通りに変更した
    // 'executeSvg2png' という関数を作り 選択要素からSVGテキストエリアを更新した直後に
    // 'executeSvg2png({ target: { value: updatedSvg } })' として呼び出す
    // 'svgInputElement' に対してSVG文字列を取得する際の 'event.target.value' と同じオブジェクト構造にする


    // svg2png関数を呼び出し 処理時間を計測する 関数を定義
    const executeSvg2png = async (event) => {

        // 処理時間を表示する HTML要素を 取得
        const renderingStatusElements = new Map([
            ['pngDownloadButton', document.getElementById("png-download-button")], // <button> at below of output image
            ['lastRenderingTimeP', document.getElementById("last-rendering-time")] // <p> at bottom of 'Render' tab
        ])

        // Arguments for rendering
        const svgString = event.target.value.trim() // SVG文字列 / '.trim()' = 文字列の両端の空白を削除
        const hasCrop = cropElement.checked         // 'Crop by BBox' チェックボックスがチェックされている場合は trueを チェックされていない場合は falseを 返す
        if (!svgString) return

        // Processing from SVG to PNG and measuring the time
        measureSvg2pngTime(svgString, resvgOpts, hasCrop, renderingStatusElements)
            .then((result) => {
                console.log('result: ', result); // undefined

                // 処理結果を利用する
                console.log('svg2png processing has completed.');

            })
            .catch((error) => {
                console.error('An error occurred during the processing of svg2png:', error);
            });

        // SVGファイルサイズを ダウンロードボタンに 表示する
        countSvgSize(svgString)
    };


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////// textarea ////////////////////////////////

    // <textarea>のSVGテキストを編集するたびに変換処理が呼び出される関数を設定
    function addMultipleEventListener(element, events, handler) {
        events.forEach(e => element.addEventListener(e, handler))
    }
    addMultipleEventListener(svgInputElement, ['change', 'keyup', 'paste'], executeSvg2png);

    //////////////////////////////// textarea ////////////////////////////////
    //////////////////////////////////////////////////////////////////////////




    // Options for 'Line' tab /////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////
    ///////// Group colors: 'stroke', 'opacity' and 'stroke-opacity' /////////

    // Add multiple event listener for whole stroke colors
    const numberOfGroups = getNumberOfGroups(getInputSvg())
    addEventListenerForGroupColorsInputs(numberOfGroups, 'stroke')
    addEventListenerForGroupColorsInputs(numberOfGroups, 'opacity')
    addEventListenerForGroupColorsInputs(numberOfGroups, 'stroke-opacity')

    function addEventListenerForGroupColorsInputs(numberOfGroups, attrName) {

        // id `group-colors-${attrName}-N` の要素の変更を監視
        for (let i = 0; i < numberOfGroups; i++) {
            const elementId = `group-colors-${attrName}-${i}`;
            console.log('elementId: ', elementId) // group-colors-${attrName}-0

            const element = document.querySelector(`#${elementId}`);
            console.log('i, element: ', i, element) // 0 <input type=​"number" min=​"0" max=​"1" step=​"0.1" value=​"1" id=​"group-colors-${attrName}-0">​

            element.addEventListener('change', function (event) {

                const inputValue = event.target.value;  // 'attrName' の input値を 取得
                console.log(`'${attrName}' changes to ${inputValue}`)

                if (!inputValue) return;

                // elementId最後の idの数値のみ を抽出して 変更されたグループの indexナンバー を特定
                const groupId = elementId.replace(`group-colors-${attrName}-`, '');
                //console.log('groupId: ', groupId)                 // e.g: '0', '1', '2' ...
                //console.log('typeof(groupId): ', typeof(groupId)) // string

                // Get the matches for <g> from current SVG string in textarea
                const currentSvg = getInputSvg()
                const matches = regexMatchesOfGroupColors(currentSvg)
                // console.log('matches: ', matches)
                // e.g: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']

                // Get three group colors value
                const stroke = '#' + hexExpandTo6(getStroke(matches[i]).slice(1)) // 6 digits hex (with hash mark)
                const opacity = getOpacity(matches[i])             // [0-1] number
                const strokeOpacity = getStrokeOpacity(matches[i]) // [0-1] number


                // Generate the array with input value, as structure like regex 'match' object
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
                // e.g: (4) [undefined, '#FF0000', '0.8', '1']

                // 更新された <g>タグを生成する
                changedGroupElem = generateGroupColorsSvgTags(valueAsMatchesStructure)
                console.log('changedGroupElem: ', changedGroupElem)
                // e.g: <g stroke="#FF7523" opacity="1" stroke-opacity="1">


                // Replace the changed <g> elements via group ID
                const pattern = /<g stroke=[^>]*>/g;
                const updatedSvg = replaceAtIndex(currentSvg, pattern, changedGroupElem, groupId)

                // Refresh the SVG string in <textarea>
                svgInputElement.value = updatedSvg;

                // Rendering the PNG image
                executeSvg2png({ target: { value: updatedSvg } })
            });
        }
    }

    ///////// Group colors: 'stroke', 'opacity' and 'stroke-opacity' /////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Path mode ////////////////////////////////

    //  Event listeners for 'Path mode' selection changes
    document.getElementById("path-mode").addEventListener("change", () => {

        // 現在の設定の値を保存しておく
        // Get the SVG textarea element and string
        const svgTextareaAndString = getSvgTextareaAndString()
        const currentPathModeSvgStr = svgTextareaAndString.get('string')
        const svgTextarea = svgTextareaAndString.get('element')


        // Line tab

        // Group colors
        const patternGroupColors = /<g stroke=[^>]*>/g
        const matchOfGroupColors = currentPathModeSvgStr.match(patternGroupColors)
        // e.g.: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="# ...

        // Opacity steps の選択肢の値は svgのコンテンツではなく UIのみに関わるので 保存しておいて元に戻す 必要はない


        // Canvas tab

        // Base color (include opacity)
        const patternBaseRectFill = /<rect width="100%" height="100%" fill="[^"]*"/g
        const matchOfBaseRectFill = currentPathModeSvgStr.match(patternBaseRectFill)
        const valueOfBaseRectFill = matchOfBaseRectFill[0] // Hex string
        // Shape to trim
        const patternShapeToTrim = /<clipPath id="clipShape">[^>]*>/g
        const matchOfShapeToTrim = currentPathModeSvgStr.match(patternShapeToTrim)
        const valueOfShapeToTrim = matchOfShapeToTrim[0] // 'square' | 'circle' | 'squircle' | 'squircle, slimmed'
        // viewBox (for 'Crop side margins' checked.)
        const patternViewbox = /viewBox="[^"]*"/; // viewBox属性を抽出する正規表現
        const matchOfViewbox = currentPathModeSvgStr.match(patternViewbox)
        const valueOfViewbox = matchOfViewbox[0] // e.g.: viewBox="1.55 0 27.9 31"


        // Render tab

        // Anti-aliasing (shape-rendering)
        const patternShapeRendering = /shape-rendering="[^"]*"/g
        const matchOfShapeRendering = currentPathModeSvgStr.match(patternShapeRendering)
        const valueOfShapeRendering = matchOfShapeRendering[0] // 'geometricPrecision' | 'crispEdges'



        // 選択された 'Path mode'の値を 取得
        const valueOfPathMode = document.getElementById("path-mode").value; // 'relativeMerged' | 'absoluteSeparated'

        // Get new 'Path mode' styled svg string, decode from url params
        const newPathModeSvgStr = decodeAsSelectedPathMode(valueOfPathMode)


        // レンダリングし直す前に 保存しておいた 設定の値を 元に戻す

        // Anti-alias, Base color, Shape to trim, viewBox
        const recoverShapeRendering = recoverCurrentOptionValue(newPathModeSvgStr, patternShapeRendering, valueOfShapeRendering);
        const recoverBaseRectFill = recoverCurrentOptionValue(recoverShapeRendering, patternBaseRectFill, valueOfBaseRectFill);
        const recoverShapeToTrim = recoverCurrentOptionValue(recoverBaseRectFill, patternShapeToTrim, valueOfShapeToTrim);
        const recoverViewbox = recoverCurrentOptionValue(recoverShapeToTrim, patternViewbox, valueOfViewbox);

        // Group colors (stroke, opacity, stroke-opacity)
        const recoverGroupColors = recoverCurrentGroupColorsValues(recoverViewbox, patternGroupColors, matchOfGroupColors)


        // 保存しておいた設定の値を 全て元に戻した 最終的な新しいSVG文字列を <textarea>のvalue属性に挿入する
        svgTextarea.value = recoverGroupColors

        // executeSvg2png関数を呼び出す
        executeSvg2png({ target: { value: recoverGroupColors } })
        // executeSvg2png({ target: recoverGroupColors })
        // executeSvg2png(recoverGroupColors)
    });

    /////////////////////////////// Path mode ////////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Opacity steps /////////////////////////////

    // Event listeners for 'Opacity steps' value changes
    document.getElementById("opacity-steps").addEventListener("change", () => {

        // 選択されたセレクトメニューの値を取得
        const step = Number(document.getElementById("opacity-steps").value); // 0.04 | 0.1 | 0.2

        // 新しいセレクトメニューに更新
        changeOpacitySelectOptionsAsNewStep(step)

        // 新しいセレクトメニューへの更新で選ばれた その step での 一番近い値の表示と 元々のSVGの色情報が ずれてしまうので
        // 新しいセレクトメニューでの値を取得して <g stroke=" ... >部分のSVG文字列を 生成し 置き換える
        const updatedSvg = updateSvgForNewStep()

        // Render the image via SVG with new step opacity value
        // executeSvg2png(updatedSvg)
        executeSvg2png({ target: { value: updatedSvg } })
    });

    ////////////////////////////// Opacity steps /////////////////////////////
    //////////////////////////////////////////////////////////////////////////



    // Options for 'Canvas' tab ///////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Base color ///////////////////////////////

    // Color-picker: Base color (base rect fill color)
    document.querySelector('#base-rect-color-picker').addEventListener('change', (event) => {

        // console.log('event.target.value: ', event.target.value) // e.g: #60D7FF

        // Get the selected color hex (includes alpha-channel values)
        // via '.jscolor.toHEXAString()' instead of above '.value' method
        const hexAColor = event.target.jscolor.toHEXAString();
        console.log("Base color (hex includes alpha-channel): " + hexAColor);                 // e.g: #FFFFFF99

        // Attempt to shorten the string after removing '#', then prepend '#' again
        const hexAColorShorten = '#' + tryDeleteF(tryReduceAsHalf(hexAColor.substring(1)));
        console.log("Base color (hex shorten): " + hexAColorShorten); // e.g: #FFF9


        // SVGの <textarea>要素と テキストを 取得
        const svgTextareaAndString = getSvgTextareaAndString()
        // 正規表現パターンを作成
        const pattern = /<rect width="100%" height="100%" fill="[^"]*"/g;
        // 正規表現でマッチした部分を書き換える
        const updatedSvg = svgTextareaAndString.get('string').replace(pattern, `<rect width="100%" height="100%" fill="${hexAColorShorten}"`);
        // <textarea>のvalue属性を更新する
        svgTextareaAndString.get('element').value = updatedSvg;

        // executeSvg2png関数を呼び出す
        executeSvg2png({ target: { value: updatedSvg } })
    })
    /////////////////////////////// Base color ///////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Shapes to trim /////////////////////////////

    document.getElementById('width-narrowness').addEventListener('change', () => {
        const updatedSvg = updateSvgWithSelectedShapePath('squircleSlimmed', getSvgTextareaAndString());
        executeSvg2png({ target: { value: updatedSvg } })
    });

    document.getElementById('top-heavy-ratio').addEventListener('change', () => {
        const updatedSvg = updateSvgWithSelectedShapePath('squircleSlimmed', getSvgTextareaAndString());
        executeSvg2png({ target: { value: updatedSvg } })
    });


    // 'shape-to-trim' changeイベントリスナーを設定
    document.getElementById('shape-to-trim').addEventListener("change", () => {

        // 選択された値を取得
        const shape = document.getElementById('shape-to-trim').value; // square|circle|squircle|squircleSlimmed

        // 'squircleSlimmed'が 選ばれた時だけ表示される
        // 2つのオプション選択用の<select>要素 と 横幅クロップ用の<label>&<input>要素 を取得し 表示または非表示にする
        const elementsToToggle = ['width-narrowness-div', 'top-heavy-ratio-div', 'crop-side-margins-div'];

        if (shape === 'squircleSlimmed') {
            toggleDisplay(elementsToToggle, 'inline');
        } else {
            toggleDisplay(elementsToToggle, 'none');
        }

        const updatedSvg = updateSvgWithSelectedShapePath(shape, getSvgTextareaAndString());
        executeSvg2png({ target: { value: updatedSvg } })

    });
    ///////////////////////////// Shapes to trim /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////// Crop side margins ///////////////////////////

    // Event listener for 'Crop side margins' checkbox state changes
    document.getElementById('crop-side-margins').addEventListener('change', (event) => {
        if (event.target.checked) {
            // チェックボックスがチェックされた場合、クロップ処理を実行
            console.log('Crop side margins: [x]')
            const svgTextareaAndString = getSvgTextareaAndString()
            const updatedSvg = viewboxSlimmed(svgTextareaAndString); // 1. Crop the SVG, Replace the textarea content.
            executeSvg2png({ target: { value: updatedSvg } })
        } else {
            // チェックボックスが外れた場合、元のデータと同じ矩形のサイズに戻す
            console.log('Crop side margins: [ ]')
            const svgTextareaAndString = getSvgTextareaAndString()
            const updatedSvg = viewboxUnSlimmed(svgTextareaAndString); // 1. Un-Crop the SVG, Replace the textarea content.
            executeSvg2png({ target: { value: updatedSvg } })
        }
    });
    //////////////////////////// Crop side margins ///////////////////////////
    //////////////////////////////////////////////////////////////////////////



    // Options for 'Render' tab ///////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Anti-aliasing /////////////////////////////

    // Event listeners for 'shape-rendering' type changes
    document.getElementById("shape-rendering").addEventListener("change", () => {
        // 選択された値を取得
        const value = document.getElementById("shape-rendering").value; // 'geometricPrecision' | 'crispEdges'
        // <textarea>のvalue属性を取得
        const svgString = svgInputElement.value;

        // 正規表現パターンを作成
        const patternForShapeRendering = /shape-rendering="[^"]*"/g;
        // 正規表現でマッチした部分を書き換える
        const updatedSvg = svgString.replace(patternForShapeRendering, `shape-rendering="${value}"`);
        // <textarea>のvalue属性を更新する
        svgInputElement.value = updatedSvg;
        // executeSvg2png関数を呼び出す
        executeSvg2png({ target: { value: updatedSvg } })
    });

    ////////////////////////////// Anti-aliasing /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////// Width pixel size ////////////////////////////

    // Function to update resvgOpts and convert SVG
    const updateAndConvert = (value) => {
        console.log("New value of 'Width pixel size':", value);
        Object.assign(resvgOpts, {
            fitTo: {
                mode: 'height',
                value: parseInt(value, 10),
            }
        });
        executeSvg2png({ target: { value: svgInputElement.value.trim() } })
    };

    // Event listener for both png-size-number and png-size-range
    const pngSizeElement = (event) => {
        updateAndConvert(event.target.value);
    };

    // Attach event listeners
    document.querySelector('#png-size-number').addEventListener('change', pngSizeElement);
    document.querySelector('#png-size-range').addEventListener('change', pngSizeElement);

    // Function to handle button clicks
    const handleButtonClick = (step) => {
        const value = adjustWidthNum(step);
        if (value !== null) {
            updateAndConvert(value);
        }
    };

    // Attach event listeners to buttons
    document.querySelector('#width-size-dec').addEventListener('click', () => handleButtonClick(-1));
    document.querySelector('#width-size-inc').addEventListener('click', () => handleButtonClick(1));

    //////////////////////////// Width pixel size ////////////////////////////
    //////////////////////////////////////////////////////////////////////////




    // Disabled options ///////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Crop by BBox //////////////////////////////

    // resvg-js playground original cropping function checkbox

    const cropElement = document.querySelector('#crop-by-bbox')
    cropElement.addEventListener('change', function (event) {
        const hasCrop = event.target.checked
        svg2png(null, resvgOpts, hasCrop)
    })

    ////////////////////////////// Crop by BBox //////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////// Change background ///////////////////////////

    // resvg-js playground original background color picker

    // const backgroundColorPickerElement = document.querySelector('#background-color-picker')
    // backgroundColorPickerElement.addEventListener('change', function (event) {
    //   const value = event.target.value
    //   const hasCrop = cropElement.checked
    //   if (!value) return
    //   resvgOpts.background = value
    //   console.log('resvgOpts.background value is ' + resvgOpts.background) // e.g.: resvgOpts.background value is #87FF634C
    //   svg2png(null, resvgOpts, hasCrop)
    // })

    //////////////////////////// Change background ///////////////////////////
    //////////////////////////////////////////////////////////////////////////



    // Initialize the 'Width pixel size' as 256

    const setPngSize = (value) => { // 直接数値を指定するため 上のサイズ変更用関数から 引数 を event から value に変更
        //const value = event.target.value // を disableして 直接 引数の数値を value とする

        // 引数(value)の値で svg2png() の第二引数となる resvgOpts オブジェクトを新しく更新する
        Object.assign(resvgOpts, {
            fitTo: {
                mode: 'height',
                value: parseInt(value, 10), // parseInt(string, radix= 10 進数)
            }
        })

        // Set the width number of input area with argument value
        document.querySelector('#png-size-number').value = value;
        document.querySelector('#png-size-range').value = value;
        console.log(`Set 'Width pixel size' initial value as "${value}"`)
    }

    // Force to apply the '256' as PNG rendering size
    // The half of `<input type="range" max="512">` is 256
    setPngSize(256);


    // 非同期にgetBoundingClientRect()を呼び出す
    setTimeout(() => {

        // Initial PNG rendering
        // executeSvg2png(svgInputElement.value.trim())
        executeSvg2png({ target: { value: svgInputElement.value.trim() } })

        // To fit the contents (header + main) height to viewport
        const headerRect = document.querySelector('header').getBoundingClientRect()
        console.log('headerRect size (for adjusting the contents as viewport size): ', headerRect.width, headerRect.height);
        adjustBox(headerRect.height)

    }, 0);

})(); // `(async function () {` の 即時実行関数