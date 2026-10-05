// Shared Cloudinary signed-upload helper used by both the Cloudflare Pages
// Function and the Netlify Function, so the signature algorithm stays in one
// place.

export const CLOUD_NAME = "ddoy3pmjg";
export const API_KEY = "919944758277722";
export const UPLOAD_PRESET = "pfpg-history-signed";

export interface SignedUploadRequest {
  publicId: string;
  tags: string;
  timestamp?: number;
}

export interface SignedUploadResponse {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;
}

/**
 * Cloudinary signs the `key=value` pairs of every upload parameter except
 * `file`, `api_key`, `signature`, `cloud_name` and `resource_type`, sorted
 * alphabetically and joined with `&`, with the API secret appended.
 */
export function buildStringToSign(params: Record<string, string>): string {
  return Object.entries(params)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSignedUpload(
  req: SignedUploadRequest,
  apiSecret: string,
): Promise<SignedUploadResponse> {
  const timestamp = req.timestamp ?? Math.floor(Date.now() / 1000);
  const toSign = buildStringToSign({
    public_id: req.publicId,
    tags: req.tags,
    timestamp: String(timestamp),
    upload_preset: UPLOAD_PRESET,
  }) + apiSecret;

  return {
    timestamp,
    signature: await sha1Hex(toSign),
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET,
  };
}

export function parseSignedUploadRequest(
  body: unknown,
): SignedUploadRequest | null {
  if (typeof body !== "object" || body === null) return null;
  if (!("publicId" in body) || typeof body.publicId !== "string") return null;
  if (!("tags" in body) || typeof body.tags !== "string") return null;
  if ("timestamp" in body && typeof body.timestamp !== "number") return null;

  const req: SignedUploadRequest = { publicId: body.publicId, tags: body.tags };
  if ("timestamp" in body && typeof body.timestamp === "number") {
    req.timestamp = body.timestamp;
  }
  return req;
}
