import { listHistoryEntries } from "../../functions/lib/list-history.ts";

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
  if (event.httpMethod !== "GET") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  // `process.env` at runtime, without importing "node:process" (see
  // netlify/functions/sign-cloudinary-upload.ts for the reason).
  const processEnv: Record<string, string | undefined> =
    (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env ?? {};
  const apiSecret = processEnv.CLOUDINARY_API_SECRET;
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
