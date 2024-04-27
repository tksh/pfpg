function adjustBox(headerRectHeight) {

    // Get the element rect sizes

    // window.innerHeightを使用してビューポートの高さを取得
    const windowInnerHeight = window.innerHeight;
    console.log('windowInnerHeight: ', windowInnerHeight) // 1004

    // <body>
    const bodyElem = document.querySelector('body');
    const bodyRect = bodyElem.getBoundingClientRect();
    console.log('body: ', bodyRect.width, bodyRect.height);

    // <header>
    console.log('headerRectHeight: ', headerRectHeight)

    // <main>
    const mainElem = document.querySelector('main');
    const mainRect = mainElem.getBoundingClientRect();
    console.log('main: ', mainRect.width, mainRect.height);

    // Get the output rect boxes to resize

    // <div id="img-box">
    const imgBoxElem = document.getElementById('img-box');
    const imgBoxRect = imgBoxElem.getBoundingClientRect();
    console.log('img-box: ', imgBoxRect.width, imgBoxRect.height);

    // <div id="textarea-box">
    const textareaBoxElem = document.getElementById('textarea-box');
    const textareaBoxRect = textareaBoxElem.getBoundingClientRect();
    console.log('textarea-box: ', textareaBoxRect.width, textareaBoxRect.height);


    // Calc

    // header + main の height を算出
    const headerAndMainHeight = headerRectHeight + mainRect.height
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

    // ウィンドウサイズによって適用するかどうかを判定する
    if (window.innerWidth > 512        // モバイルではない 場合
        && window.innerHeight > 720) { // 縦の幅が狭くない 場合

            console.log('window.innerWidth and window.innerHeight (window.innerWidth > 512 && window.innerHeight > 720): ', window.innerWidth, window.innerHeight)

        // outputの正方形の一辺よりも 計算で導き出した 画像表示の縦の長さ が 同じか もしくは 短かった 場合
        // => id="img-box" と id="textarea-box" の正方形divの一辺 を 計算で導き出した 縦の長さ とする

        // if (newBoxHeightSize <= imgBoxRect.height) { // 一旦画面サイズを小さくしてから大きくリサイズしたときに 小さいまま
        // if (newBoxHeightSize !== imgBoxRect.height) { // 下の else if も満たしてしまい 大きくなりすぎる
        if (imgBoxHeightNew <= (window.innerWidth / 2) && imgBoxHeightNew !== imgBoxRect.height) {
            // ウィンドウサイズの半分以下 という条件を付ければ 大きくなり過ぎることは なくなった

            console.log('imgBoxHeightNew <= imgBoxRect.height')
            // styleプロパティのheightに新しい値を設定する
            // id="img-box" と id="textarea-box" に オーバフローしたサイズ分を マイナスした imgBoxHeightNew を適用する
            // 新しいサイズが現在のサイズよりも大きいときにだけ適用する
            // そうしないと縦の幅が狭いときに画像の比率が変わってまで画面サイズに合わせてしまう (1/1の比率が保たれない)
            if (imgBoxElem.style.height < imgBoxHeightNew) {
                console.log('imgBoxRect.height < imgBoxHeightNew: ', imgBoxRect.height + ' < ' + imgBoxHeightNew) // 480 < 443

                // PNG画像と SVGテキストエリアの それぞれ 縦と横のサイズを 全て同じ値に変更する => 二つの同じサイズの正方形が出来る
                imgBoxElem.style.height = imgBoxHeightNew + "px"
                textareaBoxElem.style.height = imgBoxHeightNew + "px"
                imgBoxElem.style.width = imgBoxHeightNew + "px"
                textareaBoxElem.style.width = imgBoxHeightNew + "px"
            }
            // outputの正方形の一辺よりも 計算で導き出した 画像表示の縦の長さ が長かった場合
            // => 何もしない (CSSだけで機能している)

        } else if (imgBoxHeightNew > imgBoxRect.height) {
            console.log('imgBoxHeightNew > imgBoxRect.height')
        }

    } else { // モバイル & 縦の幅が狭い 場合
        console.log('window.innerWidth < 512 => Mobile view mode, or window.innerHeight < 720 => The display height is too small to fit the output area.')
        // => 何もしない (CSSだけで機能している)

    }

}
// ウィンドウのサイズ変更検知に関係なく最初に一度行う  imgBoxElem, textareaBoxElem のリサイズ
// adjustBox()

// 以下の サイズ変更を監視して常に動的に画面サイズにフィットさせる機能は disableする
// 上手く動かないことが多いのと モバイル端末でソフトウェアキーボードが出るたびに画面サイズが変更されたと判断されて いちいち処理が走ってしまうのを避けるため
// 初回起動時以外で 画面サイズを変更するには リロードをする必要がある


// ResizeObserver でウィンドウのサイズ変更を検知する

//// 背景色をランダムに決める関数
//function getRandomColor() {
//  // 16進数の色コードを生成
//  let color = "#";
//  for (let i = 0; i < 6; i++) {
//    // 0から15までのランダムな数値を取得
//    let num = Math.floor(Math.random() * 16);
//    // 数値を16進数に変換して色コードに追加
//    color += num.toString(16);
//  }
//  return color;
//}


//// ResizeObserverインスタンスを作成
//const resizeObserver = new ResizeObserver(entries => {
//    // entriesは監視対象の要素の配列
//    console.log('entries: ', entries)
//    // [ResizeObserverEntry]
//    // 0: ResizeObserverEntry {target: body, contentRect: DOMRectReadOnly, contentBoxSize: Array(1), borderBoxSize: Array(1), devicePixelContentBoxSize: Array(1)}
//    // length: 1
//    // [[Prototype]]: Array(0)
//
//    for (const entry of entries) {
//        console.log('entry: ', entry)
//        // ResizeObserverEntry {target: body, contentRect: DOMRectReadOnly, contentBoxSize: Array(1), borderBoxSize: Array(1), devicePixelContentBoxSize: Array(1)}
//
//        // // pngInfoElem 要素の背景色をランダムに変更
//        // const pngInfoElem = document.getElementById('png-info');
//        // pngInfoElem.style.baseColor = getRandomColor();
//
//        // ウィンドウのサイズ変更を検知するたびに 計算して imgBoxElem, textareaBoxElem をリサイズする
//        adjustBox()
//    }
//});
//
//// body要素の監視を開始
//const bodyElem = document.querySelector('body');
//const bodyRect = bodyElem.getBoundingClientRect();
//resizeObserver.observe(bodyElem);
