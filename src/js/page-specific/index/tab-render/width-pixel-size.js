import { getSvgString }   from 'button/download-as-file'
import { resvgOption }    from 'state/resvg-option'
import { adjustWidthNum
       , syncWidthNum }   from 'tab-render/sync-number-and-range'
import { updateState }    from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'

export
    { initWidthPixelSizeInputElements
    , initWidthValidatorListener
    , adjustImageDisplay
    }


// Attach the event listeners to number input, range slider, and inc/dec buttons

function initWidthPixelSizeInputElements() {

    // input-box and slider
    document.querySelector('#png-size-number').addEventListener('change', pngSizeElement)
    document.querySelector('#png-size-range').addEventListener('change', pngSizeElement)
    // Increment and decrement buttons
    document.querySelector('#width-size-dec').addEventListener('click', () => handleButtonClick(-1))
    document.querySelector('#width-size-inc').addEventListener('click', () => handleButtonClick(1))

}

// Attach the event listener to number input

function initWidthValidatorListener() {

    // Constraint validation
    const numberInput = document.getElementById("png-size-number")
    numberInput.addEventListener("change", numberInput.reportValidity) // 入力値が変更されたとき その妥当性を報告する

}


// Update resvgOption with new width size, and convert from SVG to PNG

function updateAndConvert(value) {
    console.log("Updated value of 'Width pixel size':", value);
    updateState('widthPixelSize', value);

    // update the 'resvgOption'
    resvgOption.fitTo.value = parseInt(value, 10);

    executeSvg2png({ target: { value: getSvgString() } }, resvgOption);

    adjustImageDisplay(value)
}

// Event listener for both png-size-number and png-size-range
function pngSizeElement(event) {
    syncWidthNum(event.target);
    updateAndConvert(event.target.value);
}

// Function to handle button clicks
function handleButtonClick(step) {
    const value = adjustWidthNum(step);
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