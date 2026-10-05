import {
  createSignedUpload,
  parseSignedUploadRequest,
} from "../../functions/lib/sign-upload.ts";

// `process.env` at runtime, without importing "node:process": pulling in
// @types/node would hijack the import-map specifier "constants" (a Node
// builtin) across the whole `deno check` run.
const processEnv: Record<string, string | undefined> =
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env ?? {};

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

function json(body: unknown, statusCode = 200): NetlifyResponse {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(
  event: NetlifyEvent,
): Promise<NetlifyResponse> {
  if (event.httpMethod !== "POST") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  const apiSecret = processEnv.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return json({ error: "CLOUDINARY_API_SECRET is not configured" }, 500);
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "");
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = parseSignedUploadRequest(body);
  if (!parsed) {
    return json({ error: "Expected { publicId: string, tags: string }" }, 400);
  }

  return json(await createSignedUpload(parsed, apiSecret));
}
