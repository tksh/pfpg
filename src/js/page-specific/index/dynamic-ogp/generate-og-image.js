export async function generateOgImage(pngData) {
    // Cloudinaryの情報
    const cloudName = 'ddoy3pmjg';
    const uploadPreset = 'pfpg_ogp_preset';

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

        // キャンバスから新しい画像データを取得
        const newImageData = canvas.toDataURL('image/png');

        // 新しい画像データからBlobオブジェクトを作成
        const newBlob = await fetch(newImageData).then(res => res.blob());

        // CloudinaryのアップロードURL
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        // Define the public_id to form the result OGP image URL as deterministically
        const publicId = "pfpg1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs"
        // result(data.secure_url) like: https://res.cloudinary.com/ddoy3pmjg/image/upload/v1734106822/uinp1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs.png

        // FormDataを構築
        const formData = new FormData();
        formData.append('file', newBlob);
        formData.append('upload_preset', uploadPreset);
        formData.append("public_id", publicId); // 任意の公開ID

        // アップロードリクエスト
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        // レスポンスを処理
        const data = await response.json();
        if (response.ok) {
          console.log('Uploaded URL(data.secure_url) for <meta property="og:image" content"...">:', data.secure_url);
          //alert(`Image uploaded successfully: ${data.secure_url}`);
        } else {
          throw new Error(data.error.message);
        }

        console.log('OG image updated successfully, Uploaded Url:', data.secure_url);

        // OGイメージを更新
        updateOgImage(data.secure_url)

        return data.secure_url;

    } catch (error) {
        console.error('Error generating OG image:', error);
    }
}

// OGタグを更新する関数
function updateOgImage(dataSecureUrl) {
    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
    }
    ogImageMeta.content = dataSecureUrl;
}