import { getState
       , stateList }            from 'state/state-as-map-obj'
import { getGroupColorsValues } from 'tab-lines/group-colors'

// getInitialOpacitySteps() function used twice at main.js ...
//
//   1.
//     For generating the group colors <select> html elements
//       at main.js: async function () < generateGroupColorsHtmlElements(getInitialOpacitySteps())
//
//   2.
//     For setting the default opacity steps
//       at main.js: async function () < init() < setDefaultValueOfOptions() < setDefaultOfOpacitySteps() < getInitialOpacitySteps()

// Get initial opacity steps detected from original decoded SVG
export function getInitialOpacitySteps(svgString) {

    let steps

    if (getState('opacitySteps')) {
        // Get the value from url param
        steps = getState('opacitySteps')

    } else {// If there is no 'opacitySteps' state in url param

        // get whole group 'opacity(op)' and 'stroke-opacity(so)' values
        const groupColorsValues = getGroupColorsValues(svgString)
        const opNumArray = groupColorsValues.get('opacity_array').map(value => Number(value))
        const soNumArray = groupColorsValues.get('stroke_opacity_array').map(value => Number(value))

        // Find largest step selected from [0.2, 0.1, 0.04] for each attr
        const opLargestStep = findLargestStep(opNumArray)
        const soLargestStep = findLargestStep(soNumArray)

        // Select smaller step value to get 'opacity steps' value for this artwork
        steps = Math.min(opLargestStep, soLargestStep)

        // Set as default values map
        stateList.set('opacitySteps', steps)
    }

    return steps
}


// Find largest step from number array, selected from [0.2, 0.1, 0.04]
function findLargestStep(numberArray) {
    // 値を整数に変換する
    const intValues = numberArray.map(v => Math.round(v * 100))

    let maxStep = 0.2
    let currentGCD = 0

    // 要素が0.2、0.1、0.04のいずれかで割り切れるかを確認する
    for (let i = 0; i < intValues.length; i++) {
        // 要素が20で割り切れる場合
        if (intValues[i] % 20 === 0) {
            // 現在の最大公約数と20の最大公約数を求める
            currentGCD = gcd(currentGCD, 20)
        }
        // 要素が10で割り切れる場合
        else if (intValues[i] % 10 === 0) {
            // 現在の最大公約数と10の最大公約数を求める
            currentGCD = gcd(currentGCD, 10)
        }
        // 要素が4で割り切れる場合
        else if (intValues[i] % 4 === 0) {
            // 現在の最大公約数と4の最大公約数を求める
            currentGCD = gcd(currentGCD, 4)
        }
    }

    // 最大公約数に応じて、最大ステップサイズを決定する
    if (currentGCD === 20) {
        maxStep = 0.2
    } else if (currentGCD === 10) {
        maxStep = 0.1
    } else if (currentGCD === 4) {
        maxStep = 0.04
    }

    // 最大ステップサイズを返す
    return maxStep
}

// 最大公約数を求める関数
function gcd(a, b) {
    // 2つの数の最大公約数を求める
    // ユークリッドの互除法を使用
    while (b !== 0) {
        // bが0でなければ、aをbで割った余りをbに代入する
        [a, b] = [b, a % b]
    }
    // aが最大公約数となる
    return Math.abs(a)
}

