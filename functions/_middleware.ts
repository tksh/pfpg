import { serveOgPage } from "./lib/og-page.ts";

interface EventContext {
  request: Request;
  next: () => Promise<Response> | Response;
}

// Intercept `/` and `/index.html`: when an artwork query string is present,
// serve the Deno Deploy-rendered HTML with injected og:image/og:url.
export async function onRequest(
  context: EventContext,
): Promise<Response> {
  const url = new URL(context.request.url);
  if (url.pathname === "/index.html" || url.pathname === "/") {
    const search = url.search;
    if (search !== "" && search !== "?") {
      return await serveOgPage(context.request, () => context.next());
    }
  }
  return context.next();
}
