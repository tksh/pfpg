// Shared helper for the Pages-level OGP meta injection on Cloudflare Pages
// (`functions/index.html.ts`) and Netlify (`netlify/functions/...`): both
// platforms intercept `GET /index.html?...` and must
//
//  - serve the plain static index.html as-is when there is no artwork query,
//  - otherwise proxy the Deno Deploy /share route (which returns the same
//    index.html shell with `og:image` / `og:url` baked in), and then rewrite
//    the `og:url` meta to the actual origin URL the user shared.
//
// The `fallback` returns the static index.html when no query is present;
// platform providers wire it differently because their asset serving differs.
export async function serveOgPage(
  req: Request,
  fallback: () => Promise<Response> | Response,
): Promise<Response> {
  const url = new URL(req.url);
  const search = url.search;

  if (search === "" || search === "?") {
    const res = await fallback();
    // Netlify/Cloudflare functions respond well to a plain Response, but a
    // proxied or computed fallback already has the right content-type
    return res;
  }

  const upstream = await fetch(
    `https://pfpg-ogp.tksh.deno.net/share${search}`,
  );
  if (!upstream.ok) {
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  }

  let html = await upstream.text();
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${url.toString()}" />`,
  );

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
