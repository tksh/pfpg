export
    { isOnDataManipulatorPage
    , selectOutputTextareaId
    }

// Get the SVG output textarea ID from URL for decodeUrlToSvg()
// index           : 'svg-string'
// data-manipulator: 'textarea-decoded-svg'

function isOnDataManipulatorPage(): boolean {
    // 現在のURLを取得する
    const url = window.location.href // url: 検索対象の文字列

    const target = 'data-manipulator' // target: 検索したい文字列
    return url.includes(target)
}


// Select the ID text via two booleans

function selectOutputTextareaId(isRelative: boolean, isDataManipulatorPage: boolean): string | undefined {

    if (isDataManipulatorPage === true) {          // on: data-manipulator.html
        if (isRelative === true) {                 //      path style: relative-and-merged
            return 'textarea-decoded-svg-as-rel'
        } else if (isRelative === false) {         //      path style: absolute-and-separated
            return 'textarea-decoded-svg-as-abs'
        }
    } else if (isDataManipulatorPage === false) {  // on: index.html
        return 'svg-string'
    }

}