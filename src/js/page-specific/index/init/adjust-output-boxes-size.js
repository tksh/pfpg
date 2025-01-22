export async function adjustOutputBoxSize(context) {

    // Get the element rect sizes

    // window.innerHeightを使用してビューポートの高さを取得
    const windowInnerHeight = window.innerHeight
    console.log('windowInnerHeight: ', windowInnerHeight)

    // Dev only ///////////////////////////////////////////////////////////

    // JavaScriptを使用してCSSのDVH（デバイスビューポートハイト）で得られるビューポートの高さの数値を取得
    const vv = window.visualViewport;
    const height = vv.height;
    console.log("///window.visualViewport height: ", height); // ビューポートの高さをピクセル単位で表示

    window.visualViewport.addEventListener('resize', () => {
        const wvvh = window.visualViewport.height;
        console.log('///New viewport height:', wvvh);
        // ここで必要な処理を行う（例：CSS変数の更新）
        const wvvhValueBtn = document.getElementById('wvvh_value')
        wvvhValueBtn.textContent = `wvvh: ${wvvh}`
    });


    const wvvhValueBtn = document.getElementById('wvvh_value')
    wvvhValueBtn.textContent = `wvvh: ${windowInnerHeight}`

    const wihValueBtn = document.getElementById('wih_value')
    wihValueBtn.textContent = `wih: ${windowInnerHeight}`
    // Dev only ///////////////////////////////////////////////////////////


    // <body>
    const bodyElem = document.querySelector('body')
    const bodyRect = bodyElem.getBoundingClientRect()
    console.log('body: ', bodyRect.width, bodyRect.height)

    // <header>
    const headerElem = document.querySelector('header')
    const headerRect = headerElem.getBoundingClientRect()
    console.log('headerRect.height: ', headerRect.height)

    // <main>
    const mainElem = document.querySelector('main')
    const mainRect = mainElem.getBoundingClientRect()
    console.log('main: ', mainRect.width, mainRect.height)

    // <div id="img-box">
    const imgBoxElem = document.getElementById('img-box')
    const imgBoxRect = imgBoxElem.getBoundingClientRect()
    console.log('img-box: ', imgBoxRect.width, imgBoxRect.height)

    // Result size will be same as above "img-box" rect
    // <div id="textarea-box">
    const textareaBoxElem = document.getElementById('textarea-box')
    const textareaBoxRect = textareaBoxElem.getBoundingClientRect()
    console.log('textarea-box: ', textareaBoxRect.width, textareaBoxRect.height)


    // Calc

    // About Height

    // header + main の height を算出
    const headerAndMainHeight = headerRect.height + mainRect.height
    console.log('headerAndMainHeight (header + main):', headerAndMainHeight)

    // window.innerHeight と比較してどちらが 大きい数値か？ (画面から はみ出ているか？ そうではないか？)
    // はみ出ていたら diffHeight の分だけ 正方形 (imgBoxElem, textareaBoxElem) の box を小さくする
    const diffHeight = Math.round(window.innerHeight - headerAndMainHeight)
    console.log(`diffHeight (window.innerHeight - headerAndMainHeight) = ${window.innerHeight} - ${headerAndMainHeight} = ${diffHeight}`)

    // 'img-box', 'textarea=box' に適用すべき imgBoxHeightNew を算出
    const imgBoxHeightNew = Math.round(imgBoxRect.height + diffHeight)
    console.log('imgBoxRect.height => imgBoxHeightNew: ', imgBoxRect.height, imgBoxHeightNew)

    // About Width

    // Get the info header size to define the width limit

    // <div id="png-info">
    const pngInfoElem = document.getElementById('png-info')
    const pngInfoRect = pngInfoElem.getBoundingClientRect()
    console.log('pngInfo: ', pngInfoRect.width, pngInfoRect.height)

    // Width limit
    // Browser default root font size = 1 rem = 16px
    // Each side has `1rem` spaces (in not mobile view, window.innerWidth > 512)
    const imgWidthLimit = pngInfoRect.width - (16 * 2)

    // imgWidthLimit と比較してどちらが 大きい数値か？ (画面から はみ出ているか？ そうではないか？)
    // はみ出ていたら diffWidth の分だけ 正方形 (imgBoxElem, textareaBoxElem) の box を小さくする
    const diffWidth = Math.round(imgWidthLimit - imgBoxHeightNew)
    console.log(`diffWidth (imgWidthLimit - imgBoxHeightNew) = ${imgWidthLimit} - ${imgBoxHeightNew} = ${diffWidth}`)

    // 'img-box', 'textarea=box' に適用すべき imgBoxWidthNew を算出
    const imgBoxWidthNew = Math.round(imgBoxHeightNew + diffWidth)
    console.log('imgBoxHeightNew, imgBoxWidthNew: ', imgBoxHeightNew, imgBoxWidthNew)

    // Calculated size for adjusting boxes
    // 2つの数値を比較し 小さい方を 新しい変数に代入
    const imgBoxSizeNew = imgBoxHeightNew < imgBoxWidthNew ? imgBoxHeightNew : imgBoxWidthNew;


    // Adjust

    // ウィンドウサイズによって 適用するかどうかを判定する
    if (
        window.innerWidth > 512         // モバイルではなく
        && window.innerHeight >= 720    // 縦の幅が狭くない (HDディスプレイ以上) 場合
    ) {

        console.log('window.innerWidth and window.innerHeight (window.innerWidth > 512 && window.innerHeight >= 720): ', window.innerWidth, window.innerHeight)
        console.log(`Output boxes (${imgBoxRect.width} x ${imgBoxRect.height} px) resized to ${imgBoxSizeNew} x ${imgBoxSizeNew} px`)
        resizeOutputRectBoxes(imgBoxElem, textareaBoxElem, imgBoxSizeNew)


    } else { // モバイル or 画面の縦の幅が 狭すぎる (HDディスプレイ以下) 場合
        console.log(`window.innerWidth < 512 => Mobile view mode, or window.innerHeight < 720 => The display height ${window.innerHeight} is too small to fit the output area.`)
        // => 何もしない (CSSだけで機能している)
        // 'window.innerHeight < 720' のような 縦の幅が狭すぎる画面のときは 無理にフィットさせると 画像表示エリアが 小さくなり過ぎるので そのまま横幅の50%の表示サイズから 変更せずに スクロールで見るようにする
    }

}

function resizeOutputRectBoxes(imgBoxElem, textareaBoxElem, newHeightSize) {
            // PNG画像と SVGテキストエリアの boxの それぞれ 縦と横のサイズを 全て同じ値に変更する => ２つの 同じサイズの 正方形div が 並ぶ
            imgBoxElem.style.height      = newHeightSize + "px"
            imgBoxElem.style.width       = newHeightSize + "px"
            textareaBoxElem.style.height = newHeightSize + "px"
            textareaBoxElem.style.width  = newHeightSize + "px"
}