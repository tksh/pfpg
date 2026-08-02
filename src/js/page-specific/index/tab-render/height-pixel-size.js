import { getSvgString }            from 'button/download-as-file'
import { svg2pngOption }           from 'state/resvg-option'
import { adjustInputValueViaButton
       , syncInputNumberAndRange } from 'tab-render/sync-number-and-range'
import { updateState }             from 'state/url-state-manager'
import { executeSvg2png }          from 'svg-to-png'

export
    { initHeightPixelSizeInputElements
    , initNumberInputValidatorListener
    , adjustImageDisplay
    }


// Attach the event listeners to number input, range slider, and inc/dec buttons

function initHeightPixelSizeInputElements() {

    // input-box and slider
    document.querySelector('#png-size-number').addEventListener('change', pngSizeElement)
    document.querySelector('#png-size-range').addEventListener('change', pngSizeElement)
    // Increment and decrement buttons
    document.querySelector('#png-size-dec').addEventListener('click', () => handleButtonClick(-1))
    document.querySelector('#png-size-inc').addEventListener('click', () => handleButtonClick(1))

}

// Attach the event listener to number input

function initNumberInputValidatorListener() {

    // Constraint validation
    const numberInput = document.getElementById("png-size-number")
    numberInput.addEventListener("change", numberInput.reportValidity) // 入力値が変更されたとき その妥当性を報告する

}


// Update svg2pngOption with new height size, and convert from SVG to PNG

function updateAndConvert(value) {
    console.log("Updated value of 'Height pixel size':", value);
    updateState('heightPixelSize', value);

    // update the 'svg2pngOption'
    svg2pngOption.height = parseInt(value, 10);

    executeSvg2png({ target: { value: getSvgString() } }, svg2pngOption);

    adjustImageDisplay(value)
}

// Event listener for both png-size-number and png-size-range
function pngSizeElement(event) {
    syncInputNumberAndRange(event.target);
    updateAndConvert(event.target.value);
}

// Function to handle button clicks
function handleButtonClick(step) {
    const value = adjustInputValueViaButton(step);
    if (value !== null) {
        updateAndConvert(value);
    }
}


// Additional class for .actual-image-size
function adjustImageDisplay(value) {
    const imgBox = document.getElementById("img-box");

    // 画像サイズを取得
    const boxWidth = imgBox.clientWidth;
    console.log('value, boxWidth: ', value, boxWidth)

    if (value <= boxWidth) {
        // 小さい画像の場合は中央揃え
        imgBox.classList.add('small-image');
    } else {
        // 大きい画像の場合はスクロール
        imgBox.classList.remove('small-image');
    }

}
