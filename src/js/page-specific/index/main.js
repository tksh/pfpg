import { initDownloadButtons }                  from 'button/init-download-buttons'
import { initButtonActionSelect }               from 'button/update-button-text'
import { isOnDataManipulatorPage }              from 'common-utils/select-output-textarea'
import { decodeUrlToSvg }                       from 'decode/decode'
import { adjustBox }                            from 'init/adjust-output-boxes-size'
import { initTabs }                             from 'init/tab-setup'
import { initSvgOptimizationModalToggle
       , initResetSettingsModalToggle }         from 'modal/modal-toggle'
import { initSvgOptimization }                  from 'modal/optimize-svg'
import { initResetSettings }                    from 'modal/reset-settings'
import { applyImageCustomization
       , applyUiConfiguration
       , applySvgOptimization }                 from 'state/apply-url-state'
import { resvgOption }                          from 'state/resvg-option'
import { getState
       , updateState }                          from 'state/url-state-manager'
import { executeSvg2png }                       from 'svg-to-png'
import { initShapeToTrimSelect
       , initWidthNarrownessSelect
       , initTopHeavyRatioSelect
       , initCropSideMarginsCheckbox }          from 'tab-canvas/shape-to-trim-listener'
import { initColorFormatSelect }                from 'tab-lines/color-format'
import { initGroupColorsInputs }                from 'tab-lines/group-colors-listener'
import { initOpacityStepsSelect }               from 'tab-lines/opacity-steps'
import { initPathModeSelect }                   from 'tab-lines/path-mode'
import { replaceShapeRendering }                from 'tab-render/shape-rendering'
import { initWidthPixelSizeInputElements
       , initWidthValidatorListener }           from 'tab-render/width-pixel-size'
import { initCheckerboardBgCheckbox }           from 'tab-ui/checkerboard-bg'
import { initTextWrappingCheckbox }             from 'tab-ui/text-wrapping'
import { initThemeColorSelect }                 from 'tab-ui/theme-color'
import { initViewScalingSelect }                from 'tab-ui/view-scaling'


(async function () {
    // If there is no url params to decode at index.html, fetch the alternative text from the HTML element and insert it as sample url params.
    if (!window.location.search) {
        console.log("There is no url params, sample one will be inserted.")
        const sampleUrlParamsStr = document.getElementById("sample-artwork-encoded-string").textContent
        window.history.pushState({}, '', window.location.pathname + sampleUrlParamsStr)
    }


    // Initial decoding from url param to svg

    // Get the path-mode value
    // If there is no url param of 'pathMode', use 'absoluteSeparated' as default.
    const isRelative = getState('pathMode') === 'relativeMerged'
    console.log('isRelative: ', isRelative)
    document.getElementById("path-mode").value = isRelative ? 'relativeMerged' : 'absoluteSeparated'

    // Decode the SVG from url params
    const initialDecodedSvgString = decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
    console.log('initialDecodedSvgString: ', initialDecodedSvgString)

    // Apply the settings states from url param to initial decoded svg string
    // - if there is no param in url, use default value retrieve from SETTINGS_DEFAULTS map
    const svgString = applyImageCustomization(initialDecodedSvgString, resvgOption)

    // Insert the decoded svg string to textarea
    const svgTextarea = document.querySelector('#svg-string') // <textarea id="svg-string" ... >
    //console.log('svgTextarea.value.trim(): ', svgTextarea.value.trim()) // <svg xmlns="http://www.w3.org/2000/svg" ... </svg>
    svgTextarea.value = svgString

    // Initial PNG rendering
    await resvg.initWasm(fetch('./wasm/index_bg.2.6.2.wasm'))  // Path that relative from index.html
    executeSvg2png({ target: { value: svgString } }, resvgOption)

    // Restore SVG string optimization
    // This processes does not affect any changes for rendering result
    // So just update the svg textarea value
    const optimizedSvg = applySvgOptimization(svgString)
    svgTextarea.value = optimizedSvg



    // Add event listeners

    // Options for 'Render' tab ///////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Anti-aliasing /////////////////////////////

    // Event listeners for 'shape-rendering' type changes
    document.getElementById("shape-rendering").addEventListener("change", (event) => {
        // 選択された値を取得
        const shapeRendering = event.target.value // 'geometricPrecision' | 'crispEdges'
        console.log("Updated value of 'Anti-aliasing (shape-rendering)': ", shapeRendering)
        updateState('shapeRendering', shapeRendering)

        // <textarea>のvalue属性を取得
        const svgString = svgTextarea.value

        // 選択された値に SVG文字列を 置き換える
        const updatedSvg = replaceShapeRendering(svgString, shapeRendering)

        // <textarea>のvalue属性を更新する
        svgTextarea.value = updatedSvg

        // // Rendering the PNG with updated SVG
        executeSvg2png({ target: { value: updatedSvg } }, resvgOption)
    })

    ////////////////////////////// Anti-aliasing /////////////////////////////
    //////////////////////////////////////////////////////////////////////////



    // Layout /////////////////////////////////////////////////////////////////////////////////////////////

    // Startup layout initialize process
    const initLayout = async () => {
        // To fit the contents (header + main) height as viewport height
        await adjustBox()
    }
    initLayout()

})() // `(async function () { ... })` 無名即時実行関数


// IIFEの外にDOMContentLoadedイベントリスナーを設定
// 即時実行関数（IIFE: Immediately Invoked Function Expression）
document.addEventListener('DOMContentLoaded', () => {

    // Download buttons for SVG and PNG
    initDownloadButtons()

    // Tab - Lines
    initGroupColorsInputs()
    initPathModeSelect()
    initOpacityStepsSelect()
    initColorFormatSelect()

    // Tab - Canvas
    initShapeToTrimSelect()
    initWidthNarrownessSelect()
    initTopHeavyRatioSelect()
    initCropSideMarginsCheckbox()

    // Tab - UI
    initViewScalingSelect()
    initCheckerboardBgCheckbox()
    initTextWrappingCheckbox()
    initButtonActionSelect()
    initThemeColorSelect()

    // Apply the UI configuration values retrieved from url params.
    // if there is no url param for specific attr,
    // get the default value from 'SETTINGS_DEFAULTS'
    // or detect the default value from data or environment.
    applyUiConfiguration()

    // Tab - Render
    initWidthPixelSizeInputElements()
    initWidthValidatorListener()

    // Get first tab ('Lines') activated
    initTabs()

    // Modal - SVG optimization
    initSvgOptimizationModalToggle()
    initSvgOptimization()

    // Modal - Reset settings
    initResetSettingsModalToggle()
    initResetSettings()

})