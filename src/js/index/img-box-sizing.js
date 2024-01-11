function adjustBox() {

    // Get elements sizes

    // window.innerHeightを使用してビューポートの高さを取得
    const windowInnerHeight = window.innerHeight;
    console.log('windowInnerHeight: ', windowInnerHeight) // 1004

    // viewport (Not accurate :/)
    const viewport = document.documentElement;
    const viewportRect = viewport.getBoundingClientRect();
    console.log('viewport: ', viewportRect.width, viewportRect.height); // 1850 1297
    // kの方法で得た viewportRect.height の数値は 1297 で
    // 実際の表示ディスプレイの縦の高さ 1080 を超えてしまって 実際の数値を取得出来ていない
    // window.innerHeight を使うべき

    // <body>
    const bodyElem = document.querySelector('body');
    const bodyRect = bodyElem.getBoundingClientRect();
    console.log('body: ', bodyRect.width, bodyRect.height);

    // <header>
    const headerElem = document.querySelector('header');
    const headerRect = headerElem.getBoundingClientRect();
    console.log('header: ', headerRect.width, headerRect.height);

    // <main>
    const mainElem = document.querySelector('main');
    const mainRect = mainElem.getBoundingClientRect();
    console.log('main: ', mainRect.width, mainRect.height);

    // <div id="artwork-customization">
    const artworkCustomizationElem = document.getElementById('artwork-customization');
    const artworkCustomizationRect = artworkCustomizationElem.getBoundingClientRect();
    console.log('artwork-customization: ', artworkCustomizationRect.width, artworkCustomizationRect.height);


    // <div id="input-and-output">
    const inputAndOutputElem = document.getElementById('input-and-output');
    const inputAndOutputRect = inputAndOutputElem.getBoundingClientRect();
    console.log('input-and-output: ' + inputAndOutputRect.width + ' x ' + inputAndOutputRect.height);

    // <div id="input">
    const inputElem = document.getElementById('input');
    const inputRect = inputElem.getBoundingClientRect();
    console.log('input: ' + inputRect.width, inputRect.height);
    // <div id="output">
    const outputElem = document.getElementById('output');
    const outputRect = outputElem.getBoundingClientRect();
    console.log('output: ' + outputRect.width, outputRect.height);

    // <div id="img-box">
    const imgBoxElem = document.getElementById('img-box');
    const imgBoxRect = imgBoxElem.getBoundingClientRect();
    console.log('img-box: ', imgBoxRect.width, imgBoxRect.height);
    // <div id="textarea-box">
    const textareaBoxElem = document.getElementById('textarea-box');
    const textareaBoxRect = textareaBoxElem.getBoundingClientRect();
    console.log('textarea-box: ', textareaBoxRect.width, textareaBoxRect.height);

    // <div id="img">
    const imgElem = document.getElementById('img');
    const imgRect = imgElem.getBoundingClientRect();
    console.log('img: ', imgRect.width, imgRect.height);
    // <div id="input-svg">
    const textareaElem = document.getElementById('input-svg');
    const textareaRect = textareaElem.getBoundingClientRect();
    console.log('input-svg: ', textareaRect.width, textareaRect.height);

    // <div class="header-info">
    const headerInfoElements = document.getElementsByClassName('header-info');
    const headerInfoElemPng = headerInfoElements[0]
    const headerInfoElemSvg = headerInfoElements[1]

    const headerInfoRectPng = headerInfoElemPng.getBoundingClientRect()
    const headerInfoRectSvg = headerInfoElemSvg.getBoundingClientRect()
    console.log('headerInfoRectPng: ', headerInfoRectPng.width, headerInfoRectPng.height)
    console.log('headerInfoRectSvg: ', headerInfoRectSvg.width, headerInfoRectSvg.height)
    //for (let i = 0; i < headerInfoElements.length; i++) {
    //    const headerInfoRect = headerInfoElements[i].getBoundingClientRect();
    //    console.log(`headerInfoElements [${i}]: `, headerInfoRect.width, headerInfoRect.height)
    //}

    // <div class="download-button">
    const downloadButtonElements = document.getElementsByClassName('download-button');
    const downloadButtonElemPng = downloadButtonElements[0]
    const downloadButtonElemSvg = downloadButtonElements[1]
    const downloadButtonRectPng = downloadButtonElemPng.getBoundingClientRect();
    const downloadButtonRectSvg = downloadButtonElemSvg.getBoundingClientRect();
    console.log('downloadButtonRectPng: ', downloadButtonRectPng.width, downloadButtonRectPng.height);
    console.log('downloadButtonRectSvg: ', downloadButtonRectSvg.width, downloadButtonRectSvg.height);

    // <div id="interface-settings">
    const interfaceSettingsElem = document.getElementById('interface-settings');
    const interfaceSettingsRect = interfaceSettingsElem.getBoundingClientRect();
    console.log('settings: ', interfaceSettingsRect.width, interfaceSettingsRect.height);

    // <footer>
    const footerElem = document.querySelector('footer');
    const footerRect = footerElem.getBoundingClientRect();
    console.log('footer: ', footerRect.width, footerRect.height);


    // Calc

    // 全体の height を算出
    const totalHeight = headerRect.height + mainRect.height + footerRect.height
    console.log('totalHeight (header + main + footer):', totalHeight)

    // window.innerHeight と比較してどちらが 大きい数値か？ (画面からはみ出ているか？そうじゃないか？)
    // はみ出ていたら diffHeight の分だけ 正方形の box を小さくする
    const diffHeight = Math.round(window.innerHeight - totalHeight)
    console.log(`diffHeight (window.innerHeight - totalHeight) = ${window.innerHeight} - ${totalHeight} = `, diffHeight)
    //  1004 - 1297 =  -293


    // xxxxx.style.height と xxxxxRect.height の 値が同じかどうか確認しようとしたけど無理だった
    // xxxxx.style.heightの結果は `<empty string>` になってしまう
    // `.style.height` は インラインスタイルのみを取得する
    // もし高さが CSSファイル内で スタイルとして定義されている場合 この方法では取得できない
    // `window.getComputedStyle()` を使用して計算されたスタイルを取得する必要がある
    console.log('imgBoxElem.style.height: ', imgBoxElem.style.height) // <empty string>
    console.log('textareaBoxElem.style.height: ', textareaBoxElem.style.height) // <empty string>
    console.log('imgBoxRect.height: ', imgBoxRect.height) // 343
    console.log('textareaBoxRect.height: ', textareaBoxRect.height) // 343


    // boxSizeCalculated から overflowedHeightSize を引いて
    // 実際に 'img-box', 'textarea=box' に適用すべき 縮小させた imgBoxHeightNew を算出
    //const newBoxHeightSize = Math.round(boxSizeCalculated - overflowedHeightSize)
    const imgBoxHeightNew = Math.round(imgBoxRect.height + diffHeight)
    //const newBoxHeightSize = Math.round(boxSizeCalculated)// 算出したそのままの数値を適用
    console.log('imgBoxRect.height => imgBoxHeightNew: ', imgBoxRect.height, imgBoxHeightNew) //  480 443

    // ウィンドウサイズによって適用するかどうかを判定する
    if ((window.innerWidth) > 512) { // モバイルではない場合
        console.log('window.innerWidth: ', window.innerWidth)
        console.log('window.innerWidth > 512 => Not mobile view mode')

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
                imgBoxElem.style.height      = imgBoxHeightNew + "px"
                textareaBoxElem.style.height = imgBoxHeightNew + "px"
                imgBoxElem.style.width       = imgBoxHeightNew + "px"
                textareaBoxElem.style.width  = imgBoxHeightNew + "px"
            }
            // outputの正方形の一辺よりも 計算で導き出した 画像表示の縦の長さ が長かった場合
            // => 何もしない (CSSだけで機能している)
        } else if (imgBoxHeightNew > imgBoxRect.height) {
            console.log('imgBoxHeightNew > imgBoxRect.height')


        }
    } else { // モバイルの場合
        console.log('window.innerWidth < 512 => Mobile view mode')
        // => 何もしない (CSSだけで機能している)

    }

}
// ウィンドウのサイズ変更検知に関係なく最初に一度行う  imgBoxElem, textareaBoxElem のリサイズ
adjustBox()

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
//        // pngInfoElem.style.backgroundColor = getRandomColor();
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
