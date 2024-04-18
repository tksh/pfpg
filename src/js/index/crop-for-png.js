// 画像をロードする
function loadImage(url, callback) {
    var img = new Image();
    img.onload = function () {
        callback(img);
    };
    img.src = url;
}


// 画像の左右の透明な余白をクロップする
function cropTransparentEdges(img) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    console.log('canvas.width: ', canvas.width)   //// 256
    console.log('canvas.height: ', canvas.height) //// 256

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    var left = 0, right = img.width;
    var i, j;

    // 左側の余白を検出
    leftEdge: for (i = 0; i < img.width; i++) {
        for (j = 0; j < img.height; j++) {
            if (data[(j * img.width + i) * 4 + 3] !== 0) {
                left = i;
                break leftEdge;
            }
        }
    }

    // 右側の余白を検出
    rightEdge: for (i = img.width - 1; i >= left; i--) {
        for (j = 0; j < img.height; j++) {
            if (data[(j * img.width + i) * 4 + 3] !== 0) {
                right = i;
                break rightEdge;
            }
        }
    }

    // クロップされた領域を新しいcanvasに描画
    var width = right - left;
    var croppedCanvas = document.createElement('canvas');
    var croppedCtx = croppedCanvas.getContext('2d');

    croppedCanvas.width = width;
    croppedCanvas.height = img.height;
    croppedCtx.putImageData(ctx.getImageData(left, 0, width, img.height), 0, 0);

    console.log('croppedCanvas.width: ', croppedCanvas.width)   //// 229
    console.log('croppedCanvas.height: ', croppedCanvas.height) //// 256
    console.log('croppedCanvas: ', croppedCanvas)               //// <canvas width="229" height="256">

    return croppedCanvas;
}

