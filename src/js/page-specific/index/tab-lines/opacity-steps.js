import { getGroupColorsValues }       from 'tab-lines/group-colors'
import { generateGroupColorsSvgTags } from 'tab-lines/group-colors'
import { getNumberOfGroups }          from 'utils/get-number-of-groups'
import { replaceAtIndex }             from 'utils/replace-at-index'
import { getInputSvg }                from 'download'
import { formatAsFloatString }        from 'common-utils/format-as-float'

export
    { changeOpacitySelectOptionsAsNewStep
    , replaceToNewStepOptions
    , updateSvgForNewStep
    , getElementValueById
    , numbersIncrementByStep
    }

// For event listener of Opacity steps <select>

// 'opacity' and 'stroke-opacity' values of entire groups will be changed as selected new steps.
function changeOpacitySelectOptionsAsNewStep(opacitySteps) {
    const groupColorsValues = getGroupColorsValues(getInputSvg())
    const numberOfGroups = groupColorsValues.get('number_of_groups')
    const opacity        = groupColorsValues.get('opacity_array')
    const strokeOpacity  = groupColorsValues.get('stroke_opacity_array')

    // group colors の数だけ繰り返す
    for (let i = 0; i < numberOfGroups; i++) {
        // 新しい opacitySteps の <option>に 置き換える
        // selected は 新しい<option>の中から 現在の値に一番近いものに 変更する
        replaceToNewStepOptions(i, opacitySteps, 'opacity', opacity)
        replaceToNewStepOptions(i, opacitySteps, 'stroke-opacity', strokeOpacity)
    }
}

function replaceToNewStepOptions(i, opacitySteps, attrName, attrValueArray) {

    // Get the elem to append the new <option>
    const selectElement = document.getElementById(`group-colors-${attrName}-${i}`)

    // Delete current whole child <option> nodes
    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild)
    }


    // Add new <option>

    // 選択肢となる数値のリストを作成
    const values = numbersIncrementByStep(opacitySteps)

    // 現在の値を設定
    let currentValue = attrValueArray[i]

    // 現在の値に最も近い値を見つけ出す
    let closestValue = values.reduce((prev, curr) => Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev)

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
}

// Get the strings array of incremental numbers for selector option value
function numbersIncrementByStep(step) {
    let numbers = []
    // 0から100までの整数を (step * 100)の間隔で 配列に格納
    for (let i = 0; i <= 100; i += step * 100) {
        // 整数を100で割って小数に戻す
        numbers.push((i / 100))
    }
    return formatAsFloatString(numbers.reverse()) // `.reverse()`で 一番上に表示される選びやすい<option>が 0 ではなく 1 になるように 逆順にする
}
// console.log(numbersIncrementByStep(0.04))
// console.log(numbersIncrementByStep(0.1))
// console.log(numbersIncrementByStep(0.2))
// Array(26) [ "1.0", "0.96", "0.92", "0.88", "0.84", "0.8", "0.76", "0.72", "0.68", "0.64", … "0.0" ]
// Array(11) [ "1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", … "0.0" ]
// Array (6) [ "1.0", "0.8", "0.6", "0.4", "0.2", "0.0" ]



// Update SVG

function updateSvgForNewStep(inputSvg) {

//    // Get the SVG string value
//    let inputSvg = getInputSvg()

    // Get the number of groups
    const numberOfGroups = getNumberOfGroups(inputSvg)

    // Loop by group ID: Extract the values from UI tab HTML elements => Replace the <textarea> string

    // Function to process each group
    const processGroup = (inputSvg, gId) => {

        // Get 'stroke' value
        const strokeElementId = `group-colors-stroke-${gId}`
        const stroke = getElementValueById(strokeElementId)

        // Get 'opacity' value
        const opacityElementId = `group-colors-opacity-${gId}`
        const opacity = getElementValueById(opacityElementId)

        // Get 'stroke-opacity' value
        const strokeOpacityElementId = `group-colors-stroke-opacity-${gId}`
        const strokeOpacity = getElementValueById(strokeOpacityElementId)

        // Generate the array like regex 'match' object with input value
        const groupColorsArr = [
            undefined,    // [0] = undefined
            stroke,       // [1] = value of stroke
            opacity,      // [2] = value of opacity
            strokeOpacity // [3] = value of stroke-opacity
        ]

        // Generate new group colors <g> element
        const changedGroupElem = generateGroupColorsSvgTags(groupColorsArr)

        // Replace the <g> elements via group ID
        const pattern = /<g stroke=[^>]*>/g
        return replaceAtIndex(inputSvg, pattern, changedGroupElem, gId)
    }

    // Process each group and update svgString
    const updatedSvg = Array.from({ length: numberOfGroups }, (_, gId) => gId)
    .reduce((acc, gId) => processGroup(acc, gId), inputSvg)

    return updatedSvg
}

// Function to get element value by ID
function getElementValueById(id) {
    return document.getElementById(id).value
}
