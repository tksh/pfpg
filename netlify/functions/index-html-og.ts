import { serveOgPage } from "../../functions/lib/og-page.ts";

interface NetlifyEvent {
  httpMethod: string;
  path: string;
  rawUrl?: string;
  headers: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string>;
}

interface NetlifyResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export async function handler(
  event: NetlifyEvent,
): Promise<NetlifyResponse> {
  const forwardedProto = event.headers["x-forwarded-proto"] ?? "https";
  const host = event.headers["host"] ?? "pfpg.netlify.app";
  const proto = forwardedProto.split(",")[0];
  const base = `${proto}://${host}`;

  // Prefer rawUrl (full query preserved); fall back to reconstruction
  const fullUrl = event.rawUrl ??
    `${base}${event.path}${
      Object.entries(event.queryStringParameters ?? {}).length > 0 ? "?" : ""
    }${
      Object.entries(event.queryStringParameters ?? {})
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    }`;

  const req = new Request(fullUrl, {
    method: event.httpMethod,
    headers: event.headers as HeadersInit,
  });

  const response = await serveOgPage(req, async () => {
    const fallback = await fetch(`${base}/index-raw.html`);
    const body = await fallback.text();
    return new Response(body, {
      status: fallback.status,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  });

  return {
    statusCode: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "text/html",
    },
    body: await response.text(),
  };
}
