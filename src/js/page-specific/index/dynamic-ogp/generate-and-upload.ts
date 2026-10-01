import { CLOUDINARY_CONFIG } from "dynamic-ogp/constants";
import {
  getHashForOgImageUrl,
  getYearAndMonth,
} from "dynamic-ogp/params-for-uploading";

/**
 * Main function to generate and upload image
 *
 * The PNG is uploaded as the renderer produced it: no resizing, centering or
 * background compositing is applied here, so the uploaded pixels and the
 * previewed pixels are identical and independent of the UI theme.
 *
 * @param {Uint8Array} pngData - PNG data rendered from the artwork SVG
 * @returns {Promise<string>} Final image URL
 */
export async function generateAndUploadImage(
  pngData: Uint8Array,
): Promise<string> {
  try {
    const imageBlob = new Blob([pngData.slice()], { type: "image/png" });

    // Get 32 characters string hash from
    const hashHexPadded = await getHashForOgImageUrl();

    return await uploadToCloudinary(imageBlob, hashHexPadded);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
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
