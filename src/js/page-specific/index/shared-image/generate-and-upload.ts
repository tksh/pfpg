import { CLOUDINARY_CONFIG } from "shared-image/constants";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";
import type { EncodedImage } from "state/image-encoder";

// Year/month of upload, used for Cloudinary tags (e.g. "2026", "2026-10")
function getYearAndMonth(): { yyyy: number; yyyyMm: string } {
  const dt = new Date();
  const yyyy = dt.getFullYear();
  const mm = ("00" + (dt.getMonth() + 1)).slice(-2);
  return { yyyy, yyyyMm: `${yyyy}-${mm}` };
}

/**
 * Main function to upload a rendered image to Cloudinary
 *
 * The encoded image is uploaded as the renderer produced it: no resizing,
 * centering or background compositing is applied here, so the uploaded
 * pixels and the previewed pixels are identical and independent of the
 * UI theme.
 *
 * @param {EncodedImage} image - The rendered artwork in the selected format
 * @returns {Promise<string>} Final image URL
 */
export async function uploadRenderedImage(
  image: EncodedImage,
): Promise<string> {
  try {
    const imageBlob = new Blob([image.bytes.slice()], { type: image.mimeType });

    // Get 32 characters string hash from
    const hashHexPadded = await getSharedImageKeyHash();
    // The key identifies the drawing, so both encodings of the same drawing
    // would collide on one asset name. Suffixing the format lets the PNG and
    // the WebP of a drawing coexist under one key.
    const publicId = `${hashHexPadded}-${image.extension}`;

    const imageUrl = await uploadToCloudinary(imageBlob, publicId, "image");

    // The raw sidecar feeds the history page only; never fail the image URL.
    try {
      await uploadParamsSidecar(publicId, globalThis.location.search);
    } catch (sidecarError) {
      console.error("Error uploading params sidecar:", sidecarError);
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Uploads the URL params that reproduce this customization as a raw asset
 * under the same public_id as the image, so the history page can map a
 * thumbnail back to its reproducing query string.
 * @param {string} publicId - Asset name shared with the uploaded image
 * @param {string} params - Reproducing query string (with leading "?")
 * @returns {Promise<string>} Uploaded raw asset URL
 */
async function uploadParamsSidecar(
  publicId: string,
  params: string,
): Promise<string> {
  const blob = new Blob([params], { type: "text/plain" });
  return await uploadToCloudinary(blob, publicId, "raw");
}

/**
 * Uploads an asset to Cloudinary
 * @param {Blob} blob - Asset blob to upload
 * @param {string} publicId - Asset name to store the asset under
 * @param {"image" | "raw"} resourceType - Cloudinary resource type endpoint
 * @returns {Promise<string>} Uploaded asset URL
 */
async function uploadToCloudinary(
  blob: Blob,
  publicId: string,
  resourceType: "image" | "raw",
): Promise<string> {
  const uploadUrl =
    `${CLOUDINARY_CONFIG.baseUploadUrl}/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;
  const { yyyy, yyyyMm } = getYearAndMonth();
  const tags = ["pfpg", "history", yyyy, yyyyMm].join(",");

  const signResponse = await fetch(CLOUDINARY_CONFIG.signEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId, tags }),
  });
  const signed: unknown = await signResponse.json();
  if (
    !signResponse.ok || typeof signed !== "object" || signed === null ||
    !("timestamp" in signed) || typeof signed.timestamp !== "number" ||
    !("signature" in signed) || typeof signed.signature !== "string"
  ) {
    throw new Error("uploadToCloudinary: failed to obtain upload signature");
  }

  const formData = new FormData();
  formData.append("file", blob, resourceType === "raw" ? "params.txt" : "file");
  formData.append("api_key", CLOUDINARY_CONFIG.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("public_id", publicId);
  // FormData stringifies arrays with commas; join explicitly for the same value
  formData.append("tags", tags);

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
