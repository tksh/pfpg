import { API_KEY, CLOUD_NAME } from "./sign-upload.ts";

export interface HistoryEntry {
  publicId: string;
  createdAt: string;
  params: string;
  imageUrl: string;
}

interface RawResource {
  public_id: string;
  secure_url: string;
  created_at: string;
  format?: string;
}

/**
 * Lists the raw sidecar assets via the Cloudinary Admin API and, for each,
 * fetches its text body (the reproducing query string). The image URL is
 * derived from the shared public_id (`<hash>-<imageExtension>`).
 */
export async function listHistoryEntries(
  apiSecret: string,
): Promise<HistoryEntry[]> {
  const auth = btoa(`${API_KEY}:${apiSecret}`);
  const listUrl =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/raw/upload?max_results=100`;
  const response = await fetch(listUrl, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!response.ok) {
    throw new Error(`Admin API list failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" || data === null || !("resources" in data) ||
    !Array.isArray(data.resources)
  ) {
    throw new Error("Admin API list: missing resources");
  }

  const entries: HistoryEntry[] = [];
  for (const resource of data.resources as unknown[]) {
    if (typeof resource !== "object" || resource === null) continue;
    const r = resource as Partial<RawResource>;
    if (
      typeof r.public_id !== "string" || typeof r.secure_url !== "string" ||
      typeof r.created_at !== "string"
    ) continue;

    const textResponse = await fetch(r.secure_url);
    if (!textResponse.ok) continue;

    // Raw public_ids come back with the txt extension appended
    // (e.g. "<hash>-png.txt"). Strip it so the image URL can be derived:
    // "<hash>-png" -> "<hash>-png.png".
    const suffix = typeof r.format === "string" && r.format.length > 0
      ? `.${r.format}`
      : ".txt";
    const baseId = r.public_id.endsWith(suffix)
      ? r.public_id.slice(0, -suffix.length)
      : r.public_id;
    const imageExtension = baseId.split("-").pop();
    entries.push({
      publicId: baseId,
      createdAt: r.created_at,
      params: (await textResponse.text()).trim(),
      imageUrl:
        `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${baseId}.${imageExtension}`,
    });
  }

  return entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
