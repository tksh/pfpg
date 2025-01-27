import { convertColorFormatForArray
       , convertToRgbArr }            from 'color-formatter/format-converter'
import { convertRgbCommaToSpace }     from 'color-formatter/rgb-comma-to-space'
import { rgbToLch }                   from 'color-formatter/rgb-to-lch'
import { removeOpacity }              from 'modal/optimize-svg'
import { getState }                   from 'state/url-state-manager'
import { executeSvg2png }             from 'svg-to-png'
import { getGroupColorsValues }       from 'tab-lines/get-colors-from-svg'
import { numbersIncrementByStep }     from 'tab-lines/opacity-steps'
import { updateSvgWithNewColorValue } from 'tab-lines/group-colors-listener'

import { resvgOption } from 'state/resvg-option'

// Import Alwan JS and CSS from node_modules
import Alwan from 'alwan';
import 'alwan/dist/css/alwan.min.css';

export
    { generateGroupColorsHtmlElements
    , generateGroupColorsSvgTags
    }


// SVG

// Generate the strokes group colors SVG <g> tag strings

function generateGroupColorsSvgTags(matches) {
    //console.log('matches: ', matches) // e.g.: (4) [undefined, '#4E8D09', '0.6', '1.0']

    const stroke        = matches[1]                                     // e.g.: "rgb(0,0,0)" | "#FFF"
    const opacity       = matches[2] !== undefined ? matches[2] : "1.0"  // opacity が明示的に指定されていない場合は 1.0 とみなす
    const strokeOpacity = matches[3] !== undefined ? matches[3] : "1.0"  // strokeOpacity が明示的に指定されていない場合は 1.0 とみなす
    const groupElem = `<g stroke="${stroke}" opacity="${opacity}" stroke-opacity="${strokeOpacity}">`

    // Apply 'removeOpacity()' if 'removeOpacity=true'
    const isOpacityRemoved = getState('removeOpacity')
    if (isOpacityRemoved) {
        return removeOpacity(groupElem)  // e.g.: <g stroke="#4E8D09">
    } else {
        return groupElem                 // e.g.: <g stroke="#4E8D09" opacity="0.6" stroke-opacity="1.0">
    }
}


// HTML

// Generate the strokes group colors customize HTML elements
// Each lines group has a <div> that contains below four elements
//  - <label>  - group ID
//  - <input>  - stroke
//  - <select> - opacity
//  - <select> - stroke-opacity

function generateGroupColorsHtmlElements(inputSvg, colorFormat, opacitySteps) {
    console.log(`generateGroupColorsHtmlElements() started. (Opacity step = ${opacitySteps})`);

    const groupColorsValues = getGroupColorsValues(inputSvg);
    const numberOfGroups = groupColorsValues.get('number_of_groups');
    const stroke = convertColorFormatForArray(groupColorsValues.get('stroke_array'), colorFormat);
    const opacity = groupColorsValues.get('opacity_array');
    const strokeOpacity = groupColorsValues.get('stroke_opacity_array');

    const groupColorsDiv = document.getElementById("group-colors-container");

    // Delete current whole child nodes
    while (groupColorsDiv.firstChild) {
        groupColorsDiv.removeChild(groupColorsDiv.firstChild);
    }

    for (let gId = 0; gId < numberOfGroups; gId++) {
        const optsCellDiv = document.createElement('div');
        optsCellDiv.classList.add('opts-cell-for-group-colors');

        const labelElement = document.createElement("span");
        labelElement.id = `group-colors-id-${gId}`
        labelElement.textContent = `${gId}:`;
        labelElement.classList.add('group-id-text');

        // Alwan用のdivを作成。input要素は不要
        const alwanContainer = document.createElement('div');  // For hiding the alwan <button>
        alwanContainer.id = `group-colors-stroke-container-${gId}`;
        const alwanButton = document.createElement('div');
        alwanButton.id = `group-colors-stroke-alwan-${gId}`;
        //alwanButton.classList.add('alwan-container'); // Alwan用のクラスを追加
        alwanContainer.appendChild(alwanButton);

        // Alwan入力要素を非表示に
        alwanContainer.style.display = 'none';

        // label, alwanContainer要素を div要素の子として追加
        optsCellDiv.appendChild(labelElement);
        optsCellDiv.appendChild(alwanContainer);

        // Generate <div> element to indicate the color with text
        const colorIndicatorDiv = document.createElement('div')
        colorIndicatorDiv.id = `group-colors-stroke-indicator-${gId}`
        colorIndicatorDiv.classList.add('stroke-indicator')
        colorIndicatorDiv.innerHTML = `${stroke[gId]}`
        colorIndicatorDiv.style.backgroundColor = stroke[gId]

        // Set text color with calculated lightness for optimal contrast
        const textLightness = getTextLightness(stroke[gId])
        colorIndicatorDiv.style.color = `lch(${textLightness} 0 0)`


        // Input box size defined by css class by color format, 'rgb' or 'hex'
        if (colorFormat === "rgb") {
            colorIndicatorDiv.classList.add('stroke-rgb')
        } else {  // (colorFormat === "hex")
            colorIndicatorDiv.classList.add('stroke-hex')
        }

        // Alwanインスタンスを生成
        const inputsOptionValue = colorFormat === 'rgb'
            ? { hex: false, rgb: true, hsl: false }  // RGB enabled
            : { hex: true, rgb: false, hsl: false }  // HEX enabled

        const alwan = new Alwan(alwanButton, {
            format: colorFormat,       // format:'rgb' or format:'hex'
            color: stroke[gId],       // Set the color value
            inputs: inputsOptionValue, // Show only the format selected currently
            opacity: false,             // Remove the alpha channel settings UI elements
            copy: false,             // Remove a copy button
            theme: 'dark',
            target: colorIndicatorDiv,
            // target: `#group-colors-stroke-indicator-${gId}`,
            //toggle: false, // デフォルトのトグルボタンを非表示に
            popover: true
        });
        console.log('typeof(alwan): ', typeof(alwan))
        console.log('alwan: ', alwan)

        // 生成したDiv要素にクリックイベントを追加
        colorIndicatorDiv.addEventListener('click', () => {
            alwan.open();
        });

        // 色が変更された時のイベントリスナー
        alwan.on('change', (color) => {
            console.log(`Color changed for group ${gId}:`, color.rgb, color.hex)
            // e.g: Color changed for group 0: rgb(255, 255, 255) #ffffff

            // Refine the color format
            const rgbAsSpaceDelimited = convertRgbCommaToSpace(color.rgb)  // e.g.: rgb(255, 255, 255) => rgb(255,255,255)
            const hexInUpperCase = color.hex.toUpperCase();           // e.g.: #ffffff => #FFFFFF

            // Get color value as current selected color format (RGB(remove ",") or HEX)
            const inputValue = colorFormat === 'rgb' ? rgbAsSpaceDelimited : hexInUpperCase


            // Apply the value to HTML (color indicator element)
            const colorIndicatorDiv = document.getElementById(`group-colors-stroke-indicator-${gId}`)
            colorIndicatorDiv.style.backgroundColor = inputValue  // Fill with selected color
            colorIndicatorDiv.innerHTML = inputValue  // Add text
            const textLightness = getTextLightness(inputValue)  // Get text color
            colorIndicatorDiv.style.color = `lch(${textLightness} 0 0)`   // Apply text color

            // Apply the value to SVG string
            // @attrName = 'stroke'
            const updatedSvg = updateSvgWithNewColorValue(inputValue, 'stroke', gId)

            // Render new PNG
            executeSvg2png({ target: { value: updatedSvg } }, resvgOption)
        });


        // Generate <select> elements for opacity and stroke-opacity
        const opacitySelectElem = generateOpacityElements(gId, opacitySteps, 'opacity', opacity[gId])
        const strokeOpacitySelectElem = generateOpacityElements(gId, opacitySteps, 'stroke-opacity', strokeOpacity[gId])

        optsCellDiv.appendChild(colorIndicatorDiv);
        optsCellDiv.appendChild(opacitySelectElem);
        optsCellDiv.appendChild(strokeOpacitySelectElem);

        groupColorsDiv.appendChild(optsCellDiv);
    }
}

/**
 * Get text color with calculated lightness for optimal contrast
 * @param {string} colorString - RGB|HEX color value string, e.g.: "rgb(0 0 0)"|"#000000"
 * @return {number} - Lightness value for LCH, [0-100]
 */
function getTextLightness(colorString) {
    const rgbArr = convertToRgbArr(colorString)
    const lch = rgbToLch(rgbArr[0], rgbArr[1], rgbArr[2])  // r, g, b UInt8 [0-255]
    const fillLightness = Math.round(lch.lightness)  // Integer [0-100]
    const textLightness = calculateContrast(fillLightness)
    console.log('colorString, fillLightness, textLightness: ', colorString, fillLightness, textLightness)
    return textLightness
}

function calculateContrast(fillLightness) {
    const contrastDiff = 50
    return fillLightness <= 50
        ? fillLightness + contrastDiff
        : fillLightness - contrastDiff
}


function generateOpacityElements(i, step, attrName, attrValue) {

    // 選択肢となる数値のリストを作成
    const values = numbersIncrementByStep(step)
    console.log('values: ', values)
    // e.g.: 0.2  => //  (6) [0, 0.2, 0.4, 0.6, 0.8, 1]

    // 現在の値を設定
    let currentValue = attrValue

    // 現在の値に最も近い値を見つけ出す
    let closestValue = values.reduce((prev, curr) => Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev)

    // select要素を作成
    let selectElement = document.createElement("select")
    selectElement.name = `group-colors-${attrName}-${i}`
    selectElement.id = `group-colors-${attrName}-${i}`
    selectElement.classList.add('opacities-selector')

    // 各選択肢を作成し、それぞれにvalue属性を設定
    values.forEach((value) => {
        let optionElement = document.createElement("option")
        optionElement.value = value
        optionElement.text = value

        // 現在の値に最も近い値に対応するオプションに 'selected' 属性を設定
        if (value === closestValue) {
            optionElement.setAttribute('selected', 'selected')
        }

        selectElement.appendChild(optionElement)
    })
    return selectElement
}
