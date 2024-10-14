import { removeOpacity }              from 'modal/optimize-svg'
import { convertColorFormatForArray } from 'tab-lines/color-format-converter'
import { getGroupColorsValues }       from 'tab-lines/get-colors-from-svg'
import { numbersIncrementByStep }     from 'tab-lines/opacity-steps'
import { getState }                   from 'state/url-state-manager'

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
    console.log(`generateGroupColorsHtmlElements() started. (Opacity step = ${opacitySteps})`)

    const groupColorsValues = getGroupColorsValues(inputSvg)
    const numberOfGroups    = groupColorsValues.get('number_of_groups')
    const stroke            = convertColorFormatForArray(groupColorsValues.get('stroke_array'), colorFormat)
    const opacity           = groupColorsValues.get('opacity_array')
    const strokeOpacity     = groupColorsValues.get('stroke_opacity_array')

    // 挿入先のdiv要素を取得
    const groupColorsDiv = document.getElementById("group-colors-input-and-select")

    // Delete current whole child nodes
    while (groupColorsDiv.firstChild) {
        groupColorsDiv.removeChild(groupColorsDiv.firstChild)
    }

    // マッチした部分の数だけ繰り返す
    for (let i = 0; i < numberOfGroups; i++) {

        // <div>要素を作成
        const optsCellDiv = document.createElement('div')
        // クラスを追加
        optsCellDiv.classList.add('opts-cell-for-group-colors')


        // <label>要素を作成
        const labelElement = document.createElement("label")
        labelElement.setAttribute('for', `group-colors-stroke-${i}`)
        labelElement.textContent = `${i}:`
        labelElement.classList.add('stroke')


        // jscolor カラーピッカー <input> を作成

        // input要素を作成
        const inputElement = document.createElement("input")

        // Input box size defined by css class by color format, 'rgb' or 'hex'
        if (colorFormat === "rgb") {
            inputElement.classList.add('stroke-rgb')
        } else {  // (colorFormat === "hex")
            inputElement.classList.add('stroke-hex')
        }

        inputElement.classList.add('stroke')
        inputElement.autocomplete = "off"
        inputElement.id = `group-colors-stroke-${i}`
        inputElement.setAttribute('value', `${stroke[i]}`)  // value format should be fit to current selected colorFormat
        inputElement.setAttribute("data-jscolor", `{format:'${colorFormat}'}`)  // format:'rgb' or format:'hex'

        // jscolor の初期化
        new jscolor(inputElement)

        // label, input要素を div要素の子として追加
        optsCellDiv.appendChild(labelElement)
        optsCellDiv.appendChild(inputElement)


        // Generate <select> elements for opacity and stroke-opacity

        const opacitySelectElem = generateOpacityElements(i, opacitySteps, 'opacity', opacity[i])
        const strokeOpacitySelectElem = generateOpacityElements(i, opacitySteps, 'stroke-opacity', strokeOpacity[i])
        console.log('opacitySelectElem: ', opacitySelectElem)
        console.log('strokeOpacitySelectElem: ', strokeOpacitySelectElem)
        optsCellDiv.appendChild(opacitySelectElem)
        optsCellDiv.appendChild(strokeOpacitySelectElem)

        groupColorsDiv.appendChild(optsCellDiv)
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
