export async function generateOgImage(pngData) {
    try {
        // PNGデータからBlob URLを作成
        const blobUrl = URL.createObjectURL(new Blob([pngData.asPng()], { type: 'image/png' }));

        // Imageオブジェクトを作成
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = blobUrl;
        });

        // PNGデータからCanvasに描画
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 元の画像の幅と高さを取得
        const originalWidth = pngData.width;
        const originalHeight = pngData.height;

        // 新しい画像の幅と高さを計算 (1200x840)
        const newWidth = 1200;
        const newHeight = 840;

        // 縦方向に630pxになるように調整
        let scale = Math.min(630 / originalHeight, newWidth / originalWidth);

        // リサイズ後の画像の位置を計算
        const x = (newWidth - originalWidth * scale) / 2;
        const y = (newHeight - originalHeight * scale) / 2;

        // Canvasのサイズを設定
        canvas.width = newWidth;
        canvas.height = newHeight;

        // 背景を透明にする
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, newWidth, newHeight);

        // リサイズした画像を描画
        ctx.drawImage(img, x, y, originalWidth * scale, originalHeight * scale);

        // CanvasからデータURLを取得
//        const dataUrl = canvas.toDataURL('image/png');

        // OGイメージを更新
//        updateOgImage(dataUrl)

        // キャンバスから新しい画像データを取得
        const newImageData = canvas.toDataURL('image/png');

        // 新しい画像データからBlobオブジェクトを作成
        const newBlob = await fetch(newImageData).then(res => res.blob());

        // 新しいBlob URLを作成
        const newBlobUrl = URL.createObjectURL(newBlob);

        // 新しいBlob URLを以降の処理で利用
        console.log(newBlobUrl); // 例: ダウンロード、別のキャンバスへの描画など

        console.log('OG image updated successfully, Blob URL/New is:', blobUrl, newBlobUrl);
//        return dataUrl;

    } catch (error) {
        console.error('Error generating OG image:', error);
    }
}

// OGタグを更新する関数
function updateOgImage(dataUrl) {
    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
    }
    ogImageMeta.content = dataUrl;
}