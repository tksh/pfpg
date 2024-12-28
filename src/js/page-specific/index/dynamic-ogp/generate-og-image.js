import { ARTWORK_ID_AND_CONFIG_HASH_MAP }           from 'constants'
import { getStateUrlsAsMapExcludesSvgOptimization } from 'state/url-state-manager'
import { sha256HashHexFromMap
       , strToSha256 }                              from 'utils/hashing'
import { calculateArtworkId }                       from 'init/calc-artwork-id'
import { getStateUrlsAsMapExcludesSvgOptimization
       , getState }                                 from 'state/url-state-manager'

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
    const canvas = document.getElementById('ogp-image-generation');
    const ctx = canvas.getContext('2d');

    // Set imageSmoothing value as 'false' to avoid the unnecessary anti-alias process
    ctx.imageSmoothingEnabled = false;


    // Set the background color based on theme color

    // テーマカラーに基づいて背景色のRGBA値を取得する
    const bgColorViaThemeColor = getState('themeColor')

    ctx.fillStyle = getBackgroundColorByTheme(bgColorViaThemeColor);

    // 新しいOGP画像の幅と高さ
    const ogpImageWidth = 1200;
    const ogpImageHeight = 840;

    // 背景色で塗りつぶす
    ctx.fillRect(0, 0, ogpImageWidth, ogpImageHeight);


    // Resize the image

    const imageLongerSide = 630

    // 元の画像の幅と高さを取得
    const originalWidth = pngData.width
    const originalHeight = pngData.height

    // 長辺が 630px になるように調整
    const scale = Math.min(imageLongerSide / originalHeight, imageLongerSide / originalWidth);
    console.log("scale: ", scale,  `Math.min( ${imageLongerSide} / ${originalWidth}, ${imageLongerSide} / ${originalHeight} )`)

    // リサイズ後の 画像の サイズ(W,H)を 計算
    const newWidth  = originalWidth  * scale
    const newHeight = originalHeight * scale

    // リサイズ後の 画像の 位置(X,Y)を 計算
    const xPosition = ( ogpImageWidth  - newWidth ) / 2
    const yPosition = ( ogpImageHeight - newHeight) / 2
    console.log("xPosition, yPosition: ", xPosition, yPosition, )

    // リサイズした画像を描画
    ctx.drawImage(img, xPosition, yPosition, newWidth, newHeight);


    // キャンバスから新しい画像データを取得
    const newImageData = canvas.toDataURL('image/png');

    // 新しい画像データからBlobオブジェクトを作成
    const newBlob = await fetch(newImageData).then(res => res.blob());

    // CloudinaryのアップロードURL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log("uploadUrl: ", uploadUrl)


    // Define the public_id
    // - It's hashed from the artwork ID and configuration states
    const  { artworkId, configHash } = await getHashForOgImageUrl()
    console.log("artworkId, configHash: ", artworkId, configHash)
    // result(data.secure_url) like: https://res.cloudinary.com/ddoy3pmjg/image/upload/v1734106822/glin1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs.png

    // Tags
    const tagsList = [artworkId, getDateAsYyyyMm()]

    // FormDataを構築
    // https://cloudinary.com/documentation/image_upload_api_reference
    const formData = new FormData();
    formData.append('file', newBlob);
    formData.append('upload_preset', uploadPreset);
    formData.append("public_id", `pfpg1${configHash}`); // String
    formData.append("tags", tagsList);                  // Array of strings

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

  return { artworkId, configHash }
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


function getDateAsYyyyMm() {
  const dt = new Date();

  const y = dt.getFullYear();
  console.log("y: ", y)  // e.g.: 2024

  const m = ("00" + (dt.getMonth() + 1)).slice(-2);  // getMonth() 関数は １月を 0 として返却するので １を加算
  console.log("m: ", m)  // e.g.: 12

  const yearAndMonth = `${y}${m}`
  console.log("yearAndMonth: ", yearAndMonth)  // e.g.: 202412

  return yearAndMonth
}