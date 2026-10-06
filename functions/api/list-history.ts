import { listHistoryEntries } from "../lib/list-history.ts";

interface Env {
  CLOUDINARY_API_SECRET?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet(
  context: { env: Env },
): Promise<Response> {
  const apiSecret = context.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return json({ error: "CLOUDINARY_API_SECRET is not configured" }, 500);
  }

  try {
    const resources = await listHistoryEntries(apiSecret);
    return json({ resources });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "list failed" },
      500,
    );
  }
}

// Any method other than GET
export function onRequest(): Response {
  return json({ error: "Method Not Allowed" }, 405);
}
