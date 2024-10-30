import { getSvgString }                         from 'button/download-as-file'
import { resvgOption }                          from 'state/resvg-option'
import { getState
       , updateState }                          from 'state/url-state-manager'
import { updateSvgAsNewColorFormat }            from 'tab-lines/update-svg-color-format'
import { generateGroupColorsHtmlElements }      from 'tab-lines/group-colors-generator'
import { addEventListenerForGroupColorsInputs } from 'tab-lines/group-colors-listener'
import { getNumberOfGroups }                    from 'utils/get-number-of-groups'


export function initColorFormatSelect() {
    //  Event listeners for 'Color format' selection changes
    document.getElementById("color-format").addEventListener("change", (event) => {

        // 選択されたセレクトメニューの値を 取得
        const colorFormat = event.target.value  // rgb | hex
        console.log('Color format: ', colorFormat)

        // グローバルステートを 更新
        updateState('colorFormat', colorFormat)

        // HTMLを 新しい表示フォーマットの js-color input に更新
        const svgString = getSvgString()
        generateGroupColorsHtmlElements(svgString, colorFormat, getState('opacitySteps'))

        // Get the number of groups
        const numberOfGroups = getNumberOfGroups(svgString)

        // Add event listener for new format js-color inputs and opacity selectors
        addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke')
        addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'opacity')
        addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke-opacity')


        // 新しいセレクトメニューでの 値 を取得して <g stroke=" ... >部分のSVG文字列を 生成し 置き換える
        const updatedSvg = updateSvgAsNewColorFormat(colorFormat)

        // Update the textarea content
        document.querySelector('#svg-string').value = updatedSvg

        // Only update the SVG strings in the textarea.
        // No need to execute `executeSvg2png()`,
        // because the color-format does not affect the appearance of the artwork.
    })
}