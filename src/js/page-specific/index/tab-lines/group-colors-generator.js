import { removeOpacity }              from 'modal/optimize-svg'
import { getState }                   from 'state/url-state-manager'
import { convertColorFormatForArray } from 'tab-lines/color-format-converter'
import { getGroupColorsValues }       from 'tab-lines/get-colors-from-svg'
import { numbersIncrementByStep }     from 'tab-lines/opacity-steps'
import { replaceAndRender }           from 'tab-lines/group-colors-listener'
import { tryDeleteHash }  from 'color-formatter/hex-shorten'

import { resvgOption } from 'state/resvg-option'

//import Alwan from 'libs/alwan'; // Alwanをインポート


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

    const groupColorsDiv = document.getElementById("group-colors-input-and-select");

    // Delete current whole child nodes
    while (groupColorsDiv.firstChild) {
        groupColorsDiv.removeChild(groupColorsDiv.firstChild);
    }

    for (let gId = 0; gId < numberOfGroups; gId++) {
        const optsCellDiv = document.createElement('div');
        optsCellDiv.classList.add('opts-cell-for-group-colors');

        const labelElement = document.createElement("label");
        labelElement.setAttribute('for', `group-colors-stroke-${gId}`);
        labelElement.textContent = `${gId}:`;
        labelElement.classList.add('stroke');

        // Alwan用のdivを作成。input要素は不要
        const alwanContainer = document.createElement('div');
        alwanContainer.id = `group-colors-stroke-${gId}`;
        alwanContainer.classList.add('alwan-container'); // Alwan用のクラスを追加

        // label, alwanContainer要素を div要素の子として追加
        optsCellDiv.appendChild(labelElement);
        optsCellDiv.appendChild(alwanContainer);


        // Alwanインスタンスを生成
        const inputsOptionValue = colorFormat === 'rgb'
            ? { hex: false, rgb: true, hsl: false }
            : { hex: true, rgb: false, hsl: false }

        const alwan = new Alwan(alwanContainer, {
            format: colorFormat,       // format:'rgb' or format:'hex'
            color: stroke[gId],       // Set the color value
            inputs: inputsOptionValue,
            opacity: false,             // Disable the alpha channel settings UI elements
            theme: 'dark'
        });
        console.log('typeof(alwan): ', typeof(alwan))
        console.log('alwan: ', alwan)

        // 色が変更された時のイベントリスナー
        alwan.on('change', (color) => {
            console.log(`Color changed for group ${gId}:`, color.rgb, color.hex)
            //e.g: Color changed for group 0: rgb(0, 0, 0) #000000

            // Get color value as current selected color format (rgb or hex(without "#"))
            const inputValue = colorFormat === 'rgb' ? color.rgb : tryDeleteHash(color.hex)

            // 色の変更を反映する処理
            // @attrName = 'stroke'
            replaceAndRender(inputValue, 'stroke', gId, resvgOption)
        });

        // Generate <select> elements for opacity and stroke-opacity
        const opacitySelectElem = generateOpacityElements(gId, opacitySteps, 'opacity', opacity[gId]);
        const strokeOpacitySelectElem = generateOpacityElements(gId, opacitySteps, 'stroke-opacity', strokeOpacity[gId]);

        optsCellDiv.appendChild(opacitySelectElem);
        optsCellDiv.appendChild(strokeOpacitySelectElem);

        groupColorsDiv.appendChild(optsCellDiv);
    }
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
    selectElement.id   = `group-colors-${attrName}-${i}`
    selectElement.classList.add('opacity')

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
