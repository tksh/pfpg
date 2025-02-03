import { initDownloadButtons }                  from 'button/init-download-buttons'
import { initButtonActionSelect }               from 'button/update-button-text'
import { isOnDataManipulatorPage }              from 'common-utils/select-output-textarea'
import { decodeUrlToSvg }                       from 'decode/decode'
import { adjustOutputBoxSize
       , initViewportLister }                   from 'init/adjust-output-boxes-size'
import { storeArtworkId }                       from 'init/calc-artwork-id'
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
import { initOptionDetailsToggleListener }      from 'tab-lines/details-toggle-listener'
import { initGroupColorsInputs }                from 'tab-lines/group-colors-listener'
import { initOpacityStepsSelect }               from 'tab-lines/opacity-steps'
import { initPathModeSelect }                   from 'tab-lines/path-mode'
import { initWidthPixelSizeInputElements
       , initWidthValidatorListener }           from 'tab-render/width-pixel-size'
import { initShapeRenderingSelect }             from 'tab-render/shape-rendering'
import { initCheckerboardBgCheckbox }           from 'tab-ui/checkerboard-bg'
import { initTextWrappingCheckbox }             from 'tab-ui/text-wrapping'
import { getDefaultThemeViaPrefersColorScheme
       , initThemeColorSelect }                 from 'tab-ui/theme-color'
import { initViewScalingSelect }                from 'tab-ui/view-scaling'

(async function () {

       // Initialize sample artwork data.

       // If no URL parameters are present (e.g., on initial page load),
       // select a random artwork from the .artwork-item in 'Showcase' section and update the URL.
       if (!window.location.search) {
              console.log("No URL parameters found. Selecting a random sample artwork.");

              // Retrieve query strings from showcase artwork links.
              const hrefArray = Array.from(document.querySelectorAll('figure .artworks-container .artwork-item a'))
                     .map(a => {
                            const url = new URL(a.href);
                            return url.search; // Extract the query string (including the '?').
                     });
              // e.g.: Array ["?n=~7&title=~202401_001&desc=001kObPF...jpKYE_m9iQ", ..., "?n=~5&title=~202412_001&B=~231b...6jCW"]

              // Select a random query string.
              const randomIndex = Math.floor(Math.random() * hrefArray.length);
              const randomQueryString = hrefArray[randomIndex];

              // Update the browser's history and URL with the selected query string.
              window.history.pushState({}, '', window.location.pathname + randomQueryString);
       }

       // Initial decoding from url param to svg

       // Get the path-mode value
       // - If there is no url param of 'pathMode', use 'absoluteSeparated' as default.
       const isRelative = getState('pathMode') === 'relativeMerged'
       console.log('isRelative: ', isRelative)
       document.getElementById("path-mode").value = isRelative ? 'relativeMerged' : 'absoluteSeparated'

       // Decode the SVG from url params
       const initialDecodedSvgString = decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
       console.log('initialDecodedSvgString: ', initialDecodedSvgString)

       // Initialize default UI theme from OS preference and cache in settings
       // Must run before applyImageCustomization() to provide theme for color picker initialization
       const themeColor = getDefaultThemeViaPrefersColorScheme()
       updateState('themeColor', themeColor)

       // Apply URL params to customize SVG, falling back to SETTINGS_DEFAULTS when empty
       const svgString = applyImageCustomization(initialDecodedSvgString, resvgOption)


       // Initial PNG rendering
       await resvg.initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'))  // From CDN
       executeSvg2png({ target: { value: svgString } }, resvgOption)


       // Restore SVG string optimization
       // - This processes doesn't affect the rendering result
       // - It only updates the SVG string
       const optimizedSvg = applySvgOptimization(svgString)

       // Insert the SVG string to textarea
       const svgTextarea = document.querySelector('#svg-string')
       svgTextarea.value = optimizedSvg


       // Startup layout initialization process must be executed before 'DOMContentLoaded'
       adjustOutputBoxSize('pageLoaded')

})() // `(async function () { ... })` 無名即時実行関数



// IIFEの外にDOMContentLoadedイベントリスナーを設定
// - 即時実行関数（IIFE: Immediately Invoked Function Expression）

// DOMContentLoadedイベント
// - HTMLのパースが完了し DOMツリーが構築された時点で発火する

// 'Group colors', 'Opacity steps' などのインプットHTMLタグ要素は
// 最初の即実行関数内のSVGデコード時に URLパラメータのデータから 動的に生成されるので
// それを待ってからイベントリスナーを設定する

document.addEventListener('DOMContentLoaded', () => {
       const imageUrl = "https://res.cloudinary.com/ddoy3pmjg/image/upload/v1734026224/cld-sample-3.jpg"
       document.querySelector('meta[property="og:image"]').content = imageUrl;

       // Get first tab ('Lines') activated
       initTabs()

       // Tab - Lines
       initGroupColorsInputs()
       initPathModeSelect()
       initOpacityStepsSelect()
       initColorFormatSelect()
       initOptionDetailsToggleListener()

       // Tab - Canvas
       initShapeToTrimSelect()
       initWidthNarrownessSelect()
       initTopHeavyRatioSelect()
       initCropSideMarginsCheckbox()

       // Tab - Render
       initShapeRenderingSelect()
       initWidthPixelSizeInputElements()
       initWidthValidatorListener()

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


       // Buttons for SVG and PNG
       initDownloadButtons()


       // Modal - SVG optimization
       initSvgOptimizationModalToggle()
       initSvgOptimization()

       // Modal - Reset settings
       initResetSettingsModalToggle()
       initResetSettings()

       //   // Get the artwork ID for OG image generation
       //     storeArtworkId()

       // Add event lister to viewport for continuous resizing the output boxes (PNG and SVG)
       initViewportLister()
})