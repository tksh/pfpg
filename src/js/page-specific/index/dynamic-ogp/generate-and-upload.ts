import { CLOUDINARY_CONFIG } from "dynamic-ogp/constants";
import {
  getHashForOgImageUrl,
  getYearAndMonth,
} from "dynamic-ogp/params-for-uploading";
import type { EncodedImage } from "state/image-encoder";

/**
 * Main function to generate and upload image
 *
 * The encoded image is uploaded as the renderer produced it: no resizing,
 * centering or background compositing is applied here, so the uploaded
 * pixels and the previewed pixels are identical and independent of the
 * UI theme.
 *
 * @param {EncodedImage} image - The rendered artwork in the selected format
 * @returns {Promise<string>} Final image URL
 */
export async function generateAndUploadImage(
  image: EncodedImage,
): Promise<string> {
  try {
    const imageBlob = new Blob([image.bytes.slice()], { type: image.mimeType });

    // Get 32 characters string hash from
    const hashHexPadded = await getHashForOgImageUrl();
    // The key identifies the drawing, so both encodings of the same drawing
    // would collide on one asset name. Suffixing the format lets the PNG and
    // the WebP of a drawing coexist under one key.
    const publicId = `${hashHexPadded}-${image.extension}`;

    return await uploadToCloudinary(imageBlob, publicId);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Uploads an image to Cloudinary
 * @param {Blob} imageBlob - Image blob to upload
 * @param {string} publicId - Asset name to store the image under
 * @returns {Promise<string>} Uploaded image URL
 */
async function uploadToCloudinary(
  imageBlob: Blob,
  publicId: string,
): Promise<string> {
  const uploadUrl =
    `${CLOUDINARY_CONFIG.baseUploadUrl}/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const { yyyy, yyyymm } = getYearAndMonth();

  const formData = new FormData();
  formData.append("file", imageBlob);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("public_id", publicId);
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
