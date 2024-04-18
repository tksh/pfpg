async function cropSvg() {
    // SVG のクロップ処理
    viewBoxSlimmed();
}



async function cropPng() {
    // PNG のクロップ処理
    var imgElement = document.getElementById('img');
    loadImage(imgElement.src, function (img) {
        var croppedCanvas = cropTransparentEdges(img);
        console.log('croppedCanvas: ', croppedCanvas) //// <canvas width="229" height="256">

        // クロップされた画像を表示する
        imgElement.src = croppedCanvas.toDataURL();
    });
}
