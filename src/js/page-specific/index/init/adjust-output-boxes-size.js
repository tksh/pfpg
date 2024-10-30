export async function initLayout() {
    // To fit the contents (header + main) height as viewport height
    await adjustOutputBoxSize()
}

async function adjustOutputBoxSize() {

    // Get the element rect sizes

    // window.innerHeightを使用してビューポートの高さを取得
    const windowInnerHeight = window.innerHeight
    console.log('windowInnerHeight: ', windowInnerHeight) // 1004

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

    // Get the output rect boxes to resize

    // <div id="img-box">
    const imgBoxElem = document.getElementById('img-box')
    const imgBoxRect = imgBoxElem.getBoundingClientRect()
    console.log('img-box: ', imgBoxRect.width, imgBoxRect.height)

    // <div id="textarea-box">
    const textareaBoxElem = document.getElementById('textarea-box')
    const textareaBoxRect = textareaBoxElem.getBoundingClientRect()
    console.log('textarea-box: ', textareaBoxRect.width, textareaBoxRect.height)


    // Calc

    // header + main の height を算出
    const headerAndMainHeight = headerRect.height + mainRect.height
    console.log('headerAndMainHeight (header + main):', headerAndMainHeight)

    // window.innerHeight と比較してどちらが 大きい数値か？ (画面から はみ出ているか？ そうではないか？)
    // はみ出ていたら diffHeight の分だけ 正方形 (imgBoxElem, textareaBoxElem) の box を小さくする
    const diffHeight = Math.round(window.innerHeight - headerAndMainHeight)
    console.log(`diffHeight (window.innerHeight - headerAndMainHeight) = ${window.innerHeight} - ${headerAndMainHeight} = ${diffHeight}`)
    // e.g.: 1004 - 1297 =  -293

    // 'img-box', 'textarea=box' に適用すべき imgBoxHeightNew を算出
    const imgBoxHeightNew = Math.round(imgBoxRect.height + diffHeight)
    console.log('imgBoxRect.height => imgBoxHeightNew: ', imgBoxRect.height, imgBoxHeightNew) //  480 443


    // Adjust

    // ウィンドウサイズによって 適用するかどうかを判定する
    if (window.innerWidth > 512         // モバイルではなく
        && window.innerHeight >= 720) { // 縦の幅が狭くない (HDディスプレイ以上) 場合

        console.log('window.innerWidth and window.innerHeight (window.innerWidth > 512 && window.innerHeight >= 720): ', window.innerWidth, window.innerHeight)

        // 計算で導き出した 縦の幅で ２つのoutput正方形divサイズを 大きく出来る 場合
        // => id="img-box" と id="textarea-box" の output正方形divを 計算で導き出したサイズに 変更する

        if (imgBoxHeightNew < imgBoxRect.width) { // 計算で導き出した output正方形divサイズの 横の幅が 元々の output正方形divサイズの幅 よりも 小さい場合

            console.log(`Increase the height of img and textarea boxes: ${imgBoxRect.height} => ${imgBoxHeightNew}`)

            // PNG画像と SVGテキストエリアの boxの それぞれ 縦と横のサイズを 全て同じ値に変更する => ２つの 同じサイズの 正方形div が 並ぶ
            imgBoxElem.style.height      = imgBoxHeightNew + "px"
            imgBoxElem.style.width       = imgBoxHeightNew + "px"
            textareaBoxElem.style.height = imgBoxHeightNew + "px"
            textareaBoxElem.style.width  = imgBoxHeightNew + "px"
        }

        // 計算で導き出した output正方形divサイズの 横の幅が 元々の output正方形divサイズの幅 よりも 大きい場合
        // すでに 横幅の50%を使っているので 大きく出来る余地がない
        // => 何もしない (CSSだけで機能している)

    } else { // モバイル or 画面の縦の幅が 狭すぎる 場合
        console.log(`window.innerWidth < 512 => Mobile view mode, or window.innerHeight < 720 => The display height ${window.innerHeight} is too small to fit the output area.`)
        // => 何もしない (CSSだけで機能している)
        // 'window.innerHeight < 720' のような 縦の幅が狭すぎる画面のときは 無理にフィットさせると 画像表示エリアが 小さくなり過ぎるので そのまま横幅の50%の表示サイズから 変更せずに スクロールで見るようにする
    }

}
