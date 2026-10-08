export { adjustLayoutIfNotMobile, initViewportLister };

function initViewportLister(): void {
  const viewport = globalThis.visualViewport;
  if (viewport === null) {
    throw new Error("initViewportLister: globalThis.visualViewport is null");
  }
  viewport.addEventListener("resize", () => {
    console.log("viewport changed.");
    adjustLayoutIfNotMobile();
  });
}

function adjustLayoutIfNotMobile(_reason?: string): void {
  const newOutputBoxSize = getNewOutputBoxSize();

  // ウィンドウサイズによって 適用するかどうかを判定する
  if (globalThis.innerWidth > 512) { // モバイルではない場合 JSで レイアウトを調節する
    console.log(
      "window.innerWidth > 512, window.innerWidth, window.innerHeight: ",
      globalThis.innerWidth,
      globalThis.innerHeight,
    );
    resizeOutputRectBoxes(newOutputBoxSize);
  } else { // モバイルの場合 何もしない (CSSだけで レイアウトは 機能している)
    console.log(`window.innerWidth < 512`);
  }
}

function resizeOutputRectBoxes(newOutputBoxSize: number): void {
  // PNG画像と SVGテキストエリアの boxの それぞれ 縦と横のサイズを 全て同じ値に変更する => ２つの 同じサイズの 正方形div が 並ぶ
  const imgBoxElem = document.getElementById("img-box");
  if (imgBoxElem === null) {
    throw new Error("resizeOutputRectBoxes: missing element #img-box");
  }
  const textareaBoxElem = document.getElementById("textarea-box");
  if (textareaBoxElem === null) {
    throw new Error("resizeOutputRectBoxes: missing element #textarea-box");
  }

  imgBoxElem.style.height = newOutputBoxSize + "px";
  imgBoxElem.style.width = newOutputBoxSize + "px";
  textareaBoxElem.style.height = newOutputBoxSize + "px";
  textareaBoxElem.style.width = newOutputBoxSize + "px";
}

function getNewOutputBoxSize(): number {
  // Get the element rect sizes

  // window.innerHeightを使用してビューポートの高さを取得
  const windowInnerHeight = globalThis.innerHeight;
  console.log("windowInnerHeight: ", windowInnerHeight);

  // <body>
  const bodyElem = document.querySelector("body");
  if (bodyElem === null) {
    throw new Error("getNewOutputBoxSize: missing element body");
  }
  const bodyRect = bodyElem.getBoundingClientRect();
  console.log("body: ", bodyRect.width, bodyRect.height);

  // <header>
  const headerElem = document.querySelector("header");
  if (headerElem === null) {
    throw new Error("getNewOutputBoxSize: missing element header");
  }
  const headerRect = headerElem.getBoundingClientRect();
  console.log("headerRect.height: ", headerRect.height);

  // <main>
  const mainElem = document.querySelector("main");
  if (mainElem === null) {
    throw new Error("getNewOutputBoxSize: missing element main");
  }
  const mainRect = mainElem.getBoundingClientRect();
  console.log("main: ", mainRect.width, mainRect.height);

  // <div id="img-box">
  const imgBoxElem = document.getElementById("img-box");
  if (imgBoxElem === null) {
    throw new Error("getNewOutputBoxSize: missing element #img-box");
  }
  const imgBoxRect = imgBoxElem.getBoundingClientRect();
  console.log("img-box: ", imgBoxRect.width, imgBoxRect.height);

  // Result size will be same as above "img-box" rect
  // <div id="textarea-box">
  const textareaBoxElem = document.getElementById("textarea-box");
  if (textareaBoxElem === null) {
    throw new Error("getNewOutputBoxSize: missing element #textarea-box");
  }
  const textareaBoxRect = textareaBoxElem.getBoundingClientRect();
  console.log("textarea-box: ", textareaBoxRect.width, textareaBoxRect.height);

  // Calc

  // About Height

  // header + main の height を算出
  const headerAndMainHeight = headerRect.height + mainRect.height;
  console.log("headerAndMainHeight (header + main):", headerAndMainHeight);

  // window.innerHeight と比較してどちらが 大きい数値か？ (画面から はみ出ているか？ そうではないか？)
  // はみ出ていたら diffHeight の分だけ 正方形 (imgBoxElem, textareaBoxElem) の box を小さくする
  const diffHeight = Math.round(globalThis.innerHeight - headerAndMainHeight);
  console.log(
    `diffHeight (window.innerHeight - headerAndMainHeight) = ${globalThis.innerHeight} - ${headerAndMainHeight} = ${diffHeight}`,
  );

  // 'img-box', 'textarea=box' に適用すべき imgBoxHeightNew を算出
  const imgBoxHeightNew = Math.round(imgBoxRect.height + diffHeight);
  console.log(
    "imgBoxRect.height => imgBoxHeightNew: ",
    imgBoxRect.height,
    imgBoxHeightNew,
  );

  // About Width

  // Get the info header size to define the width limit

  // <div id="png-info">
  const pngInfoElem = document.getElementById("png-info");
  if (pngInfoElem === null) {
    throw new Error("getNewOutputBoxSize: missing element #png-info");
  }
  const pngInfoRect = pngInfoElem.getBoundingClientRect();
  console.log("pngInfo: ", pngInfoRect.width, pngInfoRect.height);

  // Width limit
  // Browser default root font size = 1 rem = 16px
  // Each side has `1rem` spaces (in not mobile view, window.innerWidth > 512)
  const imgWidthLimit = pngInfoRect.width - (16 * 2);

  // imgWidthLimit と比較してどちらが 大きい数値か？ (画面から はみ出ているか？ そうではないか？)
  // はみ出ていたら diffWidth の分だけ 正方形 (imgBoxElem, textareaBoxElem) の box を小さくする
  const diffWidth = Math.round(imgWidthLimit - imgBoxHeightNew);
  console.log(
    `diffWidth (imgWidthLimit - imgBoxHeightNew) = ${imgWidthLimit} - ${imgBoxHeightNew} = ${diffWidth}`,
  );

  // 'img-box', 'textarea=box' に適用すべき imgBoxWidthNew を算出
  const imgBoxWidthNew = Math.round(imgBoxHeightNew + diffWidth);
  console.log(
    "imgBoxHeightNew, imgBoxWidthNew: ",
    imgBoxHeightNew,
    imgBoxWidthNew,
  );

  // Calculated size for adjusting boxes
  // 2つの数値を比較し 小さい方を 新しい変数に代入
  const newOutputBoxSize = imgBoxHeightNew < imgBoxWidthNew
    ? imgBoxHeightNew
    : imgBoxWidthNew;

  console.log(
    "imgBoxRect.width, imgBoxRect.height, newOutputBoxSize, textareaBoxRect.width, textareaBoxRect.height, newOutputBoxSize: ",
    imgBoxRect.width,
    imgBoxRect.height,
    textareaBoxRect.width,
    textareaBoxRect.height,
    newOutputBoxSize,
  );
  return newOutputBoxSize;
}
