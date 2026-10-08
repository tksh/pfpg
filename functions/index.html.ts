import { serveOgPage } from "../functions/lib/og-page.ts";

interface EventContext {
  request: Request;
  env: {
    ASSETS: { fetch: (request: Request) => Promise<Response> | Response };
  };
}

export function onRequestGet(context: EventContext): Promise<Response> {
  return serveOgPage(
    context.request,
    () => context.env.ASSETS.fetch(context.request),
  );
}
