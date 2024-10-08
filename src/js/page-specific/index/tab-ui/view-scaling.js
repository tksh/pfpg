import { updateState } from 'state/settings-defaults'

export function initViewScalingSelect() {

    // セレクトメニューの要素を取得
    const selectOfViewScaling = document.getElementById("view-scaling")

    // changeイベントを設定
    selectOfViewScaling.addEventListener("change", () => {

        // チェックされたセレクトメニューの値を取得
        const viewScaling = selectOfViewScaling.value
        //console.log('selectOfViewScaling.value is ', value) // fit|actual

        // Update the state
        updateState('viewScaling', viewScaling)

        // Apply to img elem
        switchViewScaling(viewScaling)
    })
}

export function switchViewScaling(viewScaling) {
        // PNG img要素を 取得
        const img = document.querySelector("img")

        // Toggle the classes for img elem
        if (viewScaling == "fit") {
            //console.log('viewScaling value is ', viewScaling)
            img.classList.add("fit-to-display-area")
            img.classList.remove("actual-image-size")
        } else if (viewScaling == "actual") {
            //console.log('viewScaling value is ', viewScaling)
            img.classList.add("actual-image-size")
            img.classList.remove("fit-to-display-area")
        }
}


