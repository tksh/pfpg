import { isOnDataManipulatorPage }               from 'common-utils/select-output-textarea'
import { decodeUrlToSvg }                        from 'decode/decode'
import { getSvgString
       , initDownloadButtons}                    from 'download'
import { adjustBox }                             from 'init/adjust-output-boxes-size'
import { setDefaultValueOfOptions }              from 'init/set-defaults'
import { getState
       , updateState}                            from 'state/state-as-map-obj'
import { initTabs }                              from 'init/tab-setup'
import { initSvgOptModal }                       from 'svg-opt-modal/modal'
import { initSvgOptCheckbox
       , optimizeSvg}                            from 'svg-opt-modal/optimize-svg'
import { executeSvg2png
       , svg2png}                                from 'svg-to-png'
import { viewboxSlimmed
       , viewboxUnSlimmed}                       from 'tab-canvas/crop-side-margins'
import { toggleDisplay
       , updateSvgWithSelectedShapePath}         from 'tab-canvas/shape-to-trim'
import { updateSvgAsNewColorFormat }             from 'tab-lines/color-format'
import { addEventListenerForGroupColorsInputs }  from 'tab-lines/group-colors-listener'
import { generateGroupColorsHtmlElements }       from 'tab-lines/group-colors'
import { changeOpacitySelectOptionsAsNewStep
       , updateSvgForNewStep}                    from 'tab-lines/opacity-steps'
import { decodeAsSelectedPathMode
       , recoverCurrentGroupColorsValues
       , recoverCurrentOptionValue}              from 'tab-lines/path-mode'
import { adjustWidthNum
       , syncWidthNum}                           from 'tab-render/sync-number-and-range'
import { initWidthValidatorListener }            from 'tab-render/width-pixel-size'
import { initCheckerboardBgCheckbox }            from 'tab-ui/checkerboard-bg'
import { initTextWrappingCheckbox }              from 'tab-ui/text-wrapping'
import { initThemeColorSelect
       , setSchemeAsDefaultTheme}                from 'tab-ui/theme-color'
import { initViewScalingSelect }                 from 'tab-ui/view-scaling'
import { getNumberOfGroups }                     from 'utils/get-number-of-groups'
import { applyCustomization }                    from 'state/apply-current-states'
import { getStateUrlsOfImageCustomization }      from 'state/state-as-url-params'


(async function () {
    // If there is no url params to decode at index.html, fetch the alternative text from the HTML element and insert it as sample url params.
    if (!window.location.search) {
        console.log("There is no url params, sample one will be inserted.")
        const sampleUrlParamsStr = document.getElementById("sample-artwork-encoded-string").textContent
        window.history.pushState({}, '', window.location.pathname + sampleUrlParamsStr)
    }

    let resvgOpts = {}
    // let resvgOpts = {
    //     fitTo: {
    //         mode: 'height',
    //         value: 256
    //     }
    // }

    // Initial decoding from url param to svg

    // Get the path-mode value
    // If there is no url param of 'pathMode', use default value of path-mode 'Absolute and separated'
    const isRelative = getState('pathMode') === 'relativeMerged'
    console.log('isRelative: ', isRelative)

    // Decode the SVG from url params
    const initialDecodedSvgString = decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
    console.log('initialDecodedSvgString: ', initialDecodedSvgString)

    // Get the customization states from url params, and apply them to initial decoded svg string
    const paramsOfImageCustomization = getStateUrlsOfImageCustomization()
    const svgString = applyCustomization(initialDecodedSvgString, resvgOpts, paramsOfImageCustomization)


    // Insert the decoded svg string to textarea
    const svgStringElement = document.querySelector('#svg-string') // <textarea id="svg-string" ... >
    //console.log('svgStringElement.value.trim(): ', svgStringElement.value.trim()) // <svg xmlns="http://www.w3.org/2000/svg" ... </svg>
    svgStringElement.value = svgString

    await resvg.initWasm(fetch('./wasm/index_bg.2.6.2.wasm'))    // Path that relative from index.html



    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////// textarea ////////////////////////////////

    // // <textarea>のSVGテキストを編集するたびに変換処理が呼び出される関数を設定
    // function addMultipleEventListener(element, events, handler) {
    //     events.forEach(e => element.addEventListener(e, handler))
    // }
    // addMultipleEventListener(svgStringElement, ['change', 'keyup', 'paste'], executeSvg2png(svgString, resvgOpts))

    //////////////////////////////// textarea ////////////////////////////////
    //////////////////////////////////////////////////////////////////////////





    // Options for 'Lines' tab /////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////
    ///////// Group colors: 'stroke', 'opacity' and 'stroke-opacity' /////////

    // Add multiple event listener for whole stroke colors
    const numberOfGroups = getNumberOfGroups(getSvgString())
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'stroke')
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'opacity')
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'stroke-opacity')


    ///////// Group colors: 'stroke', 'opacity' and 'stroke-opacity' /////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Path mode ////////////////////////////////

    //  Event listeners for 'Path mode' selection changes
    document.getElementById("path-mode").addEventListener("change", async (event) => {

        // 現在の設定の値を保存しておく

        // Get the SVG string value
        const currentPathModeSvg = getSvgString()


        // Lines tab

        // Group colors
        const patternGroupColors = /<g stroke=[^>]*>/g
        const matchOfGroupColors = currentPathModeSvg.match(patternGroupColors)
        console.log('matchOfGroupColors: ', matchOfGroupColors)
        // e.g.: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="# ...


        // Opacity steps の選択肢の値は svgのコンテンツではなく UIのみに関わるので 保存しておいて元に戻す 必要はない


        // Canvas tab

        // Shape to trim
        const patternShapeToTrim = /<clipPath id="shape-to-trim">[^>]*>/g
        const matchOfShapeToTrim = currentPathModeSvg.match(patternShapeToTrim)
        const valueOfShapeToTrim = matchOfShapeToTrim[0]   // 'square' | 'circle' | 'squircle' | 'squircle, slimmed'
        // viewBox (for 'Crop side margins' checked.)
        const patternViewbox = /viewBox="[^"]*"/
        const matchOfViewbox = currentPathModeSvg.match(patternViewbox)
        const valueOfViewbox = matchOfViewbox[0]           // e.g.: viewBox="1.55 0 27.9 31"


        // Render tab

        // Anti-aliasing (shape-rendering)
        const patternShapeRendering = /shape-rendering="[^"]*"/g
        const matchOfShapeRendering = currentPathModeSvg.match(patternShapeRendering)
        const valueOfShapeRendering = matchOfShapeRendering[0]  // 'shape-rendering="geometricPrecision"' | 'shape-rendering="crispEdges"'



        // 選択された 'Path mode'の値を 取得
        const pathMode = event.target.value  // 'relativeMerged' | 'absoluteSeparated'
        console.log(`"${pathMode}" selected.`)

        // Re-decode as new 'Path mode' styled svg string from url params
        const newPathModeSvg = decodeAsSelectedPathMode(pathMode)

        // レンダリングし直す前に 保存しておいた 設定の値を 元に戻す

        // Anti-alias, Base color, Shape to trim, viewBox
        const recoverShapeRendering = recoverCurrentOptionValue(newPathModeSvg, patternShapeRendering, valueOfShapeRendering)
        const recoverShapeToTrim    = recoverCurrentOptionValue(recoverShapeRendering, patternShapeToTrim, valueOfShapeToTrim)
        const recoverViewbox        = recoverCurrentOptionValue(recoverShapeToTrim, patternViewbox, valueOfViewbox)
        const updatedSvg            = recoverCurrentGroupColorsValues(recoverViewbox, patternGroupColors, matchOfGroupColors)

        // Update the state
        updateState('pathMode', pathMode)

        // 保存しておいた設定の値を 全て元に戻した 新しいSVG文字列 を
        // SVG最適化モーダルウィンドウでの 3つのチェックボックスの状態に応じた形にしてから
        // <textarea>のvalue属性に 挿入する

        // Optimize the SVG string using current three checkboxes status
        const svgOptState = new Map([
            ['removeOpacity',  getState('removeOpacity') ],  // SVG optimization modal
            ['removeNewlines', getState('removeNewlines')],  // SVG optimization modal
            ['removeSpaces',   getState('removeSpaces')  ],  // SVG optimization modal
        ])
        const optimizedSvg = optimizeSvg(updatedSvg, svgOptState)

        svgStringElement.value = optimizedSvg

        // executeSvg2png関数を呼び出す
        executeSvg2png({ target: { value: updatedSvg } }, resvgOpts)
    })

    /////////////////////////////// Path mode ////////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Opacity steps /////////////////////////////

    // Event listeners for 'Opacity steps' value changes
    document.getElementById("opacity-steps").addEventListener("change", (event) => {

        // 選択されたセレクトメニューの値を取得
        const opacitySteps = Number(event.target.value)  // 0.04 | 0.1 | 0.2

        // グローバルステート更新
        updateState('opacitySteps', opacitySteps)

        // 新しいセレクトメニューに更新
        changeOpacitySelectOptionsAsNewStep(getSvgString(), opacitySteps)

        // 新しいセレクトメニューへの 更新で選ばれた その opacitySteps での 一番近い値の表示と 元々のSVGの色情報が ずれてしまうので
        // 新しいセレクトメニューでの 値 を取得して <g stroke=" ... >部分のSVG文字列を 生成し 置き換える
        const updatedSvg = updateSvgForNewStep(getSvgString())

        svgStringElement.value = updatedSvg                 // Update textarea
        executeSvg2png({ target: { value: updatedSvg } }, resvgOpts)  // Rendering to PNG
    })

    ////////////////////////////// Opacity steps /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Color format ////////////////////////////////

    //  Event listeners for 'Color format' selection changes
    document.getElementById("color-format").addEventListener("change", (event) => {
        // 選択されたセレクトメニューの値を 取得
        const colorFormat = event.target.value  // rgb | hex
        console.log('Color format: ', colorFormat)

        // グローバルステートを 更新
        updateState('colorFormat', colorFormat)

        // HTMLを 新しい表示フォーマットの js-color input に更新
        generateGroupColorsHtmlElements(getSvgString(), colorFormat, getState('opacitySteps'))

        // Add event listener for new format js-color inputs and opacity selectors
        addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'stroke')
        addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'opacity')
        addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'stroke-opacity')

        // 新しいセレクトメニューでの 値 を取得して <g stroke=" ... >部分のSVG文字列を 生成し 置き換える
        const updatedSvg = updateSvgAsNewColorFormat(colorFormat)
        svgStringElement.value = updatedSvg

        // Only update the SVG strings in the textarea.
        // No need to execute `executeSvg2png()`,
        // because the color-format does not affect the appearance of the artwork.
        // But `executeSvg2png()` has executed in 'addEventListenerForGroupColorsInputs()'
    })

    /////////////////////////////// Color format ////////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    // Options for 'Canvas' tab ///////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Shapes to trim /////////////////////////////

    document.getElementById('width-narrowness').addEventListener('change', () => {
        const updatedSvg = updateSvgWithSelectedShapePath('squircleSlimmed', getSvgString())
        svgStringElement.value = updatedSvg                 // Update textarea
        executeSvg2png({ target: { value: updatedSvg } })  // Render to PNG
    })

    document.getElementById('top-heavy-ratio').addEventListener('change', () => {
        const updatedSvg = updateSvgWithSelectedShapePath('squircleSlimmed', getSvgString())
        svgStringElement.value = updatedSvg                 // Update textarea
        executeSvg2png({ target: { value: updatedSvg } })  // Render to PNG
    })


    // 'shape-to-trim' changeイベントリスナーを設定
    document.getElementById('shape-to-trim').addEventListener("change", (event) => {

        // 選択された値を取得
        const shape = event.target.value // square|circle|squircle|squircleSlimmed

        // 'squircleSlimmed'が 選ばれた時だけ表示される
        // 2つのオプション選択用の<select>要素 と 横幅クロップ用の<label>&<input>要素 を取得し 表示または非表示にする
        const elementsToToggle = ['width-narrowness-div', 'top-heavy-ratio-div', 'crop-side-margins-div']

        if (shape === 'squircleSlimmed') {
            toggleDisplay(elementsToToggle, 'inline')
        } else {
            toggleDisplay(elementsToToggle, 'none')
        }

        const inputSvg = getSvgString()

        // Update thee SVG string with new clip shape path and viewBox
        const updatedSvg = updateSvgWithSelectedShapePath(shape, inputSvg)

        svgStringElement.value = updatedSvg                 // Update textarea
        executeSvg2png({ target: { value: updatedSvg } })  // Render to PNG

    })
    ///////////////////////////// Shapes to trim /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////// Crop side margins ///////////////////////////

    // Event listener for 'Crop side margins' checkbox state changes
    document.getElementById('crop-side-margins').addEventListener('change', (event) => {
        if (event.target.checked) {
            // チェックボックスがチェックされた場合、クロップ処理を実行
            console.log('Crop side margins: [x]')
            updateState('cropSideMargins', true)  // グローバルステート更新

            const inputSvg = getSvgString()
            const updatedSvg = viewboxSlimmed(inputSvg)
            svgStringElement.value = updatedSvg
            executeSvg2png({ target: { value: updatedSvg } })

        } else {
            // チェックボックスが外れた場合、元のデータと同じ矩形のサイズに戻す
            console.log('Crop side margins: [ ]')
            updateState('cropSideMargins', false)  // グローバルステート更新

            const inputSvg = getSvgString()
            const updatedSvg = viewboxUnSlimmed(inputSvg)
            svgStringElement.value = updatedSvg
            executeSvg2png({ target: { value: updatedSvg } })
        }
    })
    //////////////////////////// Crop side margins ///////////////////////////
    //////////////////////////////////////////////////////////////////////////



    // Options for 'Render' tab ///////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Anti-aliasing /////////////////////////////

    // Event listeners for 'shape-rendering' type changes
    document.getElementById("shape-rendering").addEventListener("change", (event) => {
        // 選択された値を取得
        const value = event.target.value // 'geometricPrecision' | 'crispEdges'
        console.log("Updated value of 'Anti-aliasing (shape-rendering)': ", value)
        updateState('shapeRendering', value)

        // <textarea>のvalue属性を取得
        const svgString = svgStringElement.value

        // 正規表現パターンを作成
        const patternForShapeRendering = /shape-rendering="[^"]*"/g
        // 正規表現でマッチした部分を書き換える
        const updatedSvg = svgString.replace(patternForShapeRendering, `shape-rendering="${value}"`)
        // <textarea>のvalue属性を更新する
        svgStringElement.value = updatedSvg
        // executeSvg2png関数を呼び出す
        executeSvg2png({ target: { value: updatedSvg } })
    })

    ////////////////////////////// Anti-aliasing /////////////////////////////
    //////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////
    //////////////////////////// Width pixel size ////////////////////////////

    // Function to update resvgOpts and convert SVG
    const updateAndConvert = (value) => {
        console.log("Updated value of 'Width pixel size':", value)
        updateState('widthPixelSize', value)  // グローバルステート更新

        Object.assign(resvgOpts, {
            fitTo: {
                mode: 'height',
                value: parseInt(value, 10),
            }
        })
        executeSvg2png({ target: { value: svgStringElement.value.trim() } })
    }

    // Event listener for both png-size-number and png-size-range
    const pngSizeElement = (event) => {
        syncWidthNum(event.target)
        updateAndConvert(event.target.value)
    }

    // Function to handle button clicks
    const handleButtonClick = (step) => {
        const value = adjustWidthNum(step)
        if (value !== null) {
            updateAndConvert(value)
        }
    }

    // Attach event listeners

    // input-box and slider
    document.querySelector('#png-size-number').addEventListener('change', pngSizeElement)
    document.querySelector('#png-size-range').addEventListener('change', pngSizeElement)
    // Increment and decrement buttons
    document.querySelector('#width-size-dec').addEventListener('click', () => handleButtonClick(-1))
    document.querySelector('#width-size-inc').addEventListener('click', () => handleButtonClick(1))

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

    // resvg-js playground original base color picker

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



    // Initialize the 'Width pixel size'
    const setPngSize = async (value) => { // 直接数値を指定するため 上のサイズ変更用関数から 引数 を event から value に変更

            // 引数(value)の値で svg2png() の第二引数となる resvgOpts オブジェクトを新しく更新する
            Object.assign(resvgOpts, {
                fitTo: {
                    mode: 'height',
                    value: value
                }
            })

            // Set the width number of input area with argument value
            document.querySelector('#png-size-number').value = value
            document.querySelector('#png-size-range').value = value
            console.log(`Set 'Width pixel size' initial value as "${value}"`)
    }


    // Startup initialize process
    const init = async () => {

        // Set default options values
        // Read the values from original decoded SVG, then apply them as each option elements.
        await setDefaultValueOfOptions()

        // Set default width size
        // Force to apply '256' as PNG rendering size even if SVG has any grid size.
        // '256' is the half of `<input type="range" max="512">`
        await setPngSize(256)

        // Initial PNG rendering
        await executeSvg2png({ target: { value: svgStringElement.value.trim() } }, resvgOpts)

        // To fit the contents (header + main) height as viewport height
        await adjustBox()

        await setSchemeAsDefaultTheme()
    }
    init()

})() // `(async function () { ... })` 無名即時実行関数


// IIFEの外にDOMContentLoadedイベントリスナーを設定
// 即時実行関数（IIFE: Immediately Invoked Function Expression）
document.addEventListener('DOMContentLoaded', () => {

    // Download buttons for SVG and PNG
    initDownloadButtons()

    // Tab - UI
    initViewScalingSelect()
    initCheckerboardBgCheckbox()
    initTextWrappingCheckbox()
    initThemeColorSelect()

    // Tab - Render
    initWidthValidatorListener()

    // First tab ('Lines') activate
    initTabs()

    // SVG optimization
    initSvgOptModal()
    initSvgOptCheckbox()

})