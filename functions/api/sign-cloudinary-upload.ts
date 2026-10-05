import {
  createSignedUpload,
  parseSignedUploadRequest,
} from "../lib/sign-upload.ts";

interface Env {
  CLOUDINARY_API_SECRET?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(
  context: { request: Request; env: Env },
): Promise<Response> {
  const apiSecret = context.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return json({ error: "CLOUDINARY_API_SECRET is not configured" }, 500);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = parseSignedUploadRequest(body);
  if (!parsed) {
    return json({ error: "Expected { publicId: string, tags: string }" }, 400);
  }

  return json(await createSignedUpload(parsed, apiSecret));
}

// Any method other than POST
export function onRequest(): Response {
  return json({ error: "Method Not Allowed" }, 405);
}
