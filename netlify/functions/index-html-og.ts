import { type OgPageEnv, serveOgPage } from "../../functions/lib/og-page.ts";

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

interface NetlifyRuntime {
  env?: { get: (key: string) => string | undefined };
}
interface ProcessRuntime {
  env?: Record<string, string | undefined>;
}

// This file mirrors the Cloudflare middleware's method-A behavior. Read the
// Edge Functions API when present and the serverless Functions process env
// for the current Lambda-style handler.
function runtimeOgpEnv(): OgPageEnv {
  const runtime = globalThis as typeof globalThis & {
    Netlify?: NetlifyRuntime;
    process?: ProcessRuntime;
  };
  const read = (name: string): string | undefined =>
    runtime.Netlify?.env?.get(name) ?? runtime.process?.env?.[name];
  return {
    OGP_METHOD_A: read("OGP_METHOD_A"),
    OGP_SHARED_SECRET: read("OGP_SHARED_SECRET"),
  };
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const forwardedProto = event.headers["x-forwarded-proto"] ?? "https";
  const host = event.headers["host"] ?? "pfpg.netlify.app";
  const proto = forwardedProto.split(",")[0];
  const base = `${proto}://${host}`;

  // Prefer rawUrl (full query preserved); fall back to reconstruction.
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

  const response = await serveOgPage(
    req,
    async () => {
      const fallback = await fetch(`${base}/index-raw.html`, {
        signal: AbortSignal.timeout(2_000),
      });
      return new Response(await fallback.text(), {
        status: fallback.status,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    },
    runtimeOgpEnv(),
  );

  return {
    statusCode: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "text/html",
    },
    body: await response.text(),
  };
}
