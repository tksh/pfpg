import { ARTWORK_ID_AND_CONFIG_HASH_MAP }           from 'constants'
import { getStateUrlsAsMapExcludesSvgOptimization } from 'state/url-state-manager'
import { sha256HashHexFromMap
       , strToSha256 }                              from 'utils/hashing'
import { calculateArtworkId }                       from 'init/calc-artwork-id'
import { getStateUrlsAsMapExcludesSvgOptimization } from 'state/url-state-manager'
import { getState }                                 from 'state/url-state-manager'

export async function generateAndUploadOgImage(pngData) {

  // Cloudinaryの情報
  const cloudName = 'ddoy3pmjg';
  const uploadPreset = 'pfpg_ogp_preset';
  console.log("cloudName, uploadPreset: ", cloudName, uploadPreset)

  try {
    // PNGデータからBlob URLを作成
    const blobUrl = URL.createObjectURL(new Blob([pngData.asPng()], { type: 'image/png' }));
    console.log("blobUrl: ", blobUrl)

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

    // Set imageSmoothing type
    // - crispEdges         => imageSmoothingEnabled: false
    // - geometricPrecision => imageSmoothingEnabled: true
    const imageSmoothingViaShapeRendering = getState('shapeRendering') !== 'crispEdges'
    ctx.imageSmoothingEnabled = imageSmoothingViaShapeRendering;

    // 元の画像のサイズで一度描画
    ctx.drawImage(img, 0, 0);

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

    // 背景を 設定する

    // // 背景を 透明にする
    // ctx.fillStyle = 'rgba(255, 255, 255, 0)';

    // テーマカラーに基づいて背景色のRGBA値を取得する
    const bgColorViaThemeColor = getState('themeColor')
    ctx.fillStyle = getBackgroundColorByTheme(bgColorViaThemeColor);

    ctx.fillRect(0, 0, newWidth, newHeight);

    // リサイズした画像を描画
    ctx.drawImage(img, x, y, originalWidth * scale, originalHeight * scale);

    // キャンバスから新しい画像データを取得
    const newImageData = canvas.toDataURL('image/png');

    // 新しい画像データからBlobオブジェクトを作成
    const newBlob = await fetch(newImageData).then(res => res.blob());

    // CloudinaryのアップロードURL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log("uploadUrl: ", uploadUrl)


    // Define the public_id
    // - It's hashed from the artwork ID and configuration states
    const publicId = await getHashForOgImageUrl()  // 'pfpg1xxxxx ... xxxxx'
    console.log("publicId: ", publicId)
    // result(data.secure_url) like: https://res.cloudinary.com/ddoy3pmjg/image/upload/v1734106822/glin1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs.png

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
      console.log('OG image updated successfully to Cloudinary, URL(data.secure_url):', data.secure_url);
      //alert(`Image uploaded successfully: ${data.secure_url}`);
    } else {
      throw new Error(data.error.message);
    }

    // Remove the path section of versioning '/vxxxxxxxx/'
    // To generate the final OGP image URL deterministically

    const urlOriginal = data.secure_url
    console.log("urlOriginal: ", urlOriginal)
    const urlWithoutVersionPath = urlOriginal.replace(/\/v[0-9]+\//g, "/");  // .replace(/\/v\d+\//g, '/');
    console.log("urlWithoutVersionPath: ", urlWithoutVersionPath)
    // before: https://res.cloudinary.com/ddoy3pmjg/image/upload/v1734106822/pfpg1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs.png
    // after: https://res.cloudinary.com/ddoy3pmjg/image/upload/pfpg1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs.png

    return urlWithoutVersionPath;

  } catch (error) {
    console.error('Error generating OG image:', error);
  }
}


/*
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
*/

async function getHashForOgImageUrl() {
  // Artwork ID ('glin1' + bech32m encoded string)
  const calculatedIds = await calculateArtworkId()
  const artworkId = calculatedIds.bech32mHash

  // Config Hash calculated from only the status related about visual effects.
  const configStatesAboutVisualEffects = getStateUrlsAsMapExcludesSvgOptimization()
  console.log("configStatesAboutVisualEffects: ", configStatesAboutVisualEffects)
  const configHash = await sha256HashHexFromMap(configStatesAboutVisualEffects)
  console.log("configHash: ", configHash)

  // Merge 'Artwork ID' and 'Config Hash', then get its hash(sha256) with 'pfpg1' prefix
  const merged = artworkId + configHash
  const { hashArray, hashHex } = await strToSha256(merged)
  return `pfpg1${hashHex}`
}


// Get the bg fill color as themeColor's `--color-bg` via css/index/color.css
// - white: white    = #ffffff = rgba(255, 255, 255, 1)
// - light: darkgray = #a9a9a9 = rgba(169, 169, 169, 1)
// - dark : #222     = #222222 = rgba( 34,  34,  34, 1)
// - black: #000     = #000000 = rgba(  0,   0,   0, 1)

// テーマカラーに基づいて背景色のRGBA値を取得する関数
function getBackgroundColorByTheme(themeName) {
  const themeColors = {
      'white': 'rgba(255, 255, 255, 1)',
      'light': 'rgba(169, 169, 169, 1)',
      'dark': 'rgba(34, 34, 34, 1)',
      'black': 'rgba(0, 0, 0, 1)'
  };

  return themeColors[themeName] || 'rgba(255, 255, 255, 0)'; // デフォルトは透明
}