export function initializeViewScaleListener() {

    // セレクトメニューの要素を取得
    const selectOfViewScale = document.getElementById("view-scale");
    console.log('selectOfViewScale.length is ', selectOfViewScale.length);

    // changeイベントを設定
    selectOfViewScale.addEventListener("change", () => {

        // チェックされたセレクトメニューの値を取得
        const value = selectOfViewScale.value;
        //console.log('selectOfViewScale.value is ', value); // fit|actual

        // img要素を取得
        const img = document.querySelector("img");

        // Switch the class for img
        if (value == "fit") {
            console.log('selectOfViewScale.value is ', selectOfViewScale.value)
            img.classList.add("fit-to-display-area");
            img.classList.remove("actual-image-size");
        } else if (value == "actual") {
            console.log('selectOfViewScale.value is ', selectOfViewScale.value)
            img.classList.add("actual-image-size");
            img.classList.remove("fit-to-display-area");
        }
    });

}


