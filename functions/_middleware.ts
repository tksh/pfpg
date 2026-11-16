import { serveOgPage } from "./lib/og-page.ts";

interface EventContext {
  request: Request;
  next: () => Promise<Response> | Response;
}

// Keep aligned with netlify/functions/index-html-og.ts. OGP tags use only
// assets that already exist; page requests never start image rendering.
export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  if (
    (url.pathname === "/index.html" || url.pathname === "/") &&
    url.search !== "" && url.search !== "?"
  ) {
    return await serveOgPage(
      context.request,
      () => context.next(),
    );
  }
  return context.next();
}
