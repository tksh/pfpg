import { ACTIVE_FORMAT, CLOUDINARY_CONFIG } from "dynamic-ogp/constants";
import {
  getBackgroundColorByTheme,
  getHashForOgImageUrl,
  getYearAndMonth,
} from "dynamic-ogp/params-for-uploading";
import { getState } from "state/url-state-manager";

/**
 * Main function to generate and upload image
 * @param {Uint8Array} pngData - Raw PNG data to process
 * @returns {Promise<string>} Final image URL
 */
export async function generateAndUploadImage(
  pngData: Uint8Array,
): Promise<string> {
  try {
    const blobUrl = createBlobUrlFromPng(pngData);
    const img = await loadImage(blobUrl);

    const canvasElem = document.getElementById("ogp-image-generation");
    if (canvasElem === null) {
      throw new Error(
        "generateAndUploadImage: missing element #ogp-image-generation",
      );
    }
    const canvas = canvasElem as HTMLCanvasElement;
    prepareCanvas(canvas, img, pngData);

    const newImageData = canvas.toDataURL("image/png");
    const newBlob = await fetch(newImageData).then((res: Response) =>
      res.blob()
    );

    // Get 32 characters string hash from
    const hashHexPadded = await getHashForOgImageUrl();

    return await uploadToCloudinary(newBlob, hashHexPadded);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Creates a blob URL from PNG data
 * @param {Uint8Array} pngData - Raw PNG data
 * @returns {string} Blob URL for the image
 */
function createBlobUrlFromPng(pngData: Uint8Array): string {
  return URL.createObjectURL(
    new Blob([pngData as BlobPart], { type: "image/png" }),
  );
}

/**
 * Loads an image from a URL
 * @param {string} url - Image URL to load
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  return new Promise<HTMLImageElement>((resolve, reject) => {
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
interface ImageDimensions {
  newWidth: number;
  newHeight: number;
  xPosition: number;
  yPosition: number;
  scale: number;
}

function calculateImageDimensions(
  originalWidth: number,
  originalHeight: number,
): ImageDimensions {
  const scale = Math.min(
    ACTIVE_FORMAT.maxImageSize / originalWidth,
    ACTIVE_FORMAT.maxImageSize / originalHeight,
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
function prepareCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  pngData: Uint8Array,
): void {
  // Set canvas size to target dimensions
  canvas.width = ACTIVE_FORMAT.width;
  canvas.height = ACTIVE_FORMAT.height;

  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("prepareCanvas: 2d context unavailable");
  }
  ctx.imageSmoothingEnabled = false;

  // Add background if configured
  if (ACTIVE_FORMAT.useBackground) {
    const bgColorViaThemeColor: string = getState("themeColor") as string;
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
    dimensions.newHeight,
  );
}

// IHDR helper to read PNG dimensions from the binary data
function pngSize(buf: Uint8Array): { width: number; height: number } {
  const dv = new DataView(
    buf.buffer as ArrayBuffer,
    buf.byteOffset,
    buf.byteLength,
  );
  return { width: dv.getUint32(16), height: dv.getUint32(20) };
}

/**
 * Uploads an image to Cloudinary
 * @param {Blob} imageBlob - Image blob to upload
 * @param {string} configuredArtworkHashHex - Hash for the image URL
 * @returns {Promise<string>} Uploaded image URL
 */
async function uploadToCloudinary(
  imageBlob: Blob,
  configuredArtworkHashHex: string,
): Promise<string> {
  const uploadUrl =
    `${CLOUDINARY_CONFIG.baseUploadUrl}/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const { yyyy, yyyymm } = getYearAndMonth();

  const formData = new FormData();
  formData.append("file", imageBlob);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("public_id", configuredArtworkHashHex);
  // FormData stringifies arrays with commas; join explicitly for the same value
  formData.append("tags", ["pfpg", yyyy, yyyymm].join(","));

  const response: Response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const data: unknown = await response.json();
  if (!response.ok) {
    let message = "uploadToCloudinary: upload failed";
    if (typeof data === "object" && data !== null && "error" in data) {
      const err: unknown = data.error;
      if (
        typeof err === "object" && err !== null && "message" in err &&
        typeof err.message === "string"
      ) {
        message = err.message;
      }
    }
    throw new Error(message);
  }
  if (
    typeof data !== "object" || data === null || !("secure_url" in data) ||
    typeof data.secure_url !== "string"
  ) {
    throw new Error("uploadToCloudinary: missing secure_url");
  }

  return data.secure_url.replace(/\/v[0-9]+\//g, "/");
}
