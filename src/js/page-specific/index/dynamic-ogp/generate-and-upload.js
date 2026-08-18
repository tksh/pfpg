import { CLOUDINARY_CONFIG
       , ACTIVE_FORMAT }            from 'dynamic-ogp/constants'
import { getOgImageData
       , getHashForOgImageUrl
       , getBackgroundColorByTheme
       , getYearAndMonth }          from 'dynamic-ogp/params-for-uploading'
import { getState } from 'state/url-state-manager'
import { murmurHash3_x64_128 } from '@timepp/murmurhash';


// IHDR helper to read PNG dimensions from the binary data
function pngSize(buf) {
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
}

/**
 * Main function to generate and upload image
 * @param {Uint8Array} pngData - Raw PNG data to process
 * @returns {Promise<string>} Final image URL
 */
export async function generateAndUploadImage(pngData) {
  try {
    const blobUrl = await createBlobUrlFromPng(pngData);
    const img = await loadImage(blobUrl);

    const canvas = document.getElementById('ogp-image-generation');
    prepareCanvas(canvas, img, pngData);

    const newImageData = canvas.toDataURL('image/png');
    const newBlob = await fetch(newImageData).then(res => res.blob());

    // WIP
    const { artwork, config } = await getOgImageData();
    console.log('artwork, config: ', artwork, config)
    const hashInputStr = JSON.stringify([artwork, config]);
      console.log('hashInputStr', hashInputStr)
      // e.g.: [[["A","08fEKQ-VoisNalNhZy9GsmZzPU"],["0","08cJqY-3JMVTyH83QAsTiL3FDTn ... ,null,"rgb","square",10,1,true,"crispEdges",256]]
      //
      const hashBigInt = murmurHash3_x64_128(hashInputStr)
      const hashHexPadded = hashBigInt.toString(16).padStart(32, '0');
      console.log('hashHexPadded', hashHexPadded)
      // e.g.: 4327a70c6f036487c22f4075c965c9e3

      const configuredArtworkHashHex = await getHashForOgImageUrl();
      console.log('configuredArtworkHashHex', configuredArtworkHashHex)
      // e.g.: 4e4a0b3a2ba55c39cc97f70ad02f1999c6af7658b1a7c76db817030a151e4575

      return await uploadToCloudinary(newBlob, configuredArtworkHashHex);

  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}


/**
 * Creates a blob URL from PNG data
 * @param {Uint8Array} pngData - Raw PNG data
 * @returns {string} Blob URL for the image
 */
async function createBlobUrlFromPng(pngData) {
  return URL.createObjectURL(
    new Blob([pngData], { type: 'image/png' })
  );
}

/**
 * Loads an image from a URL
 * @param {string} url - Image URL to load
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
async function loadImage(url) {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Calculates dimensions to fit image while maintaining aspect ratio
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @returns {Object} New dimensions and position
 */
function calculateImageDimensions(originalWidth, originalHeight) {
  const scale = Math.min(
    ACTIVE_FORMAT.maxImageSize / originalWidth,
    ACTIVE_FORMAT.maxImageSize / originalHeight
  );

  const newWidth = originalWidth * scale;
  const newHeight = originalHeight * scale;

  // Calculate position based on centering configuration
  const xPosition = ACTIVE_FORMAT.centerContent
    ? (ACTIVE_FORMAT.width - newWidth) / 2
    : 0;
  const yPosition = ACTIVE_FORMAT.centerContent
    ? (ACTIVE_FORMAT.height - newHeight) / 2
    : 0;

  return { newWidth, newHeight, xPosition, yPosition, scale };
}

/**
 * Prepares the canvas with image and optional background
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} img - Image to draw
 * @param {Uint8Array} pngData - Original PNG data
 */
function prepareCanvas(canvas, img, pngData) {
  // Set canvas size to target dimensions
  canvas.width = ACTIVE_FORMAT.width;
  canvas.height = ACTIVE_FORMAT.height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Add background if configured
  if (ACTIVE_FORMAT.useBackground) {
    const bgColorViaThemeColor = getState('themeColor');
    ctx.fillStyle = getBackgroundColorByTheme(bgColorViaThemeColor);
    ctx.fillRect(0, 0, ACTIVE_FORMAT.width, ACTIVE_FORMAT.height);
  }

  // Calculate and draw the image using IHDR helper for dimensions
  const { width, height } = pngSize(pngData);
  const dimensions = calculateImageDimensions(width, height);
  ctx.drawImage(
    img,
    dimensions.xPosition,
    dimensions.yPosition,
    dimensions.newWidth,
    dimensions.newHeight
  );
}

/**
 * Uploads an image to Cloudinary
 * @param {Blob} imageBlob - Image blob to upload
 * @param {string} configuredArtworkHashHex - Hash for the image URL
 * @returns {Promise<string>} Uploaded image URL
 */
async function uploadToCloudinary(imageBlob, configuredArtworkHashHex) {
  const uploadUrl = `${CLOUDINARY_CONFIG.baseUploadUrl}/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const { yyyy, yyyymm } = getYearAndMonth();

  const formData = new FormData();
  formData.append('file', imageBlob);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('public_id', configuredArtworkHashHex);
  formData.append('tags', ['pfpg', yyyy, yyyymm]);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error.message);
  }

  return data.secure_url.replace(/\/v[0-9]+\//g, "/");
}
