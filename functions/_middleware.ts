import { type OgPageEnv, serveOgPage } from "./lib/og-page.ts";

interface EventContext {
  request: Request;
  next: () => Promise<Response> | Response;
  env: OgPageEnv;
}

// Intercept `/` and `/index.html` so only crawler requests can opt into
// synchronous image recovery; OGP_METHOD_A remains off unless explicitly set.
// Keep aligned with netlify/functions/index-html-og.ts.
export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  if (
    (url.pathname === "/index.html" || url.pathname === "/") &&
    url.search !== "" && url.search !== "?"
  ) {
    return await serveOgPage(
      context.request,
      () => context.next(),
      context.env,
    );
  }
  return context.next();
}
