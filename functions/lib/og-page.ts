// Shared helper for the Pages-level OGP meta injection on Cloudflare Pages
// (`functions/_middleware.ts`) and Netlify (`netlify/functions/index-html-og.ts`):
// both platforms intercept `GET /index.html?...` and must
//
//  - serve the plain static index.html as-is when there is no artwork query,
//  - otherwise take the CURRENT site's own `/index-raw.html` build artifact
//    and inject an `og:image` URL computed by the Deno Deploy helper API
//    `/ogp/image-meta`, plus the visitor's original URL in `og:url`.
//
// Proxying the Deno Deploy /share HTML would embed Cloudflare's bundle hashes,
// which then 404 on Netlify (and vice versa), so each platform injects into
// its own copy of the shell instead.
export async function serveOgPage(
  req: Request,
  fallback: () => Promise<Response> | Response,
): Promise<Response> {
  const url = new URL(req.url);
  const search = url.search;

  if (search === "" || search === "?") {
    return await fallback();
  }

  try {
    const pageResp = await fetch(`${url.origin}/index-raw.html`);
    if (!pageResp.ok) {
      return await fallback();
    }
    const baseHtml = await pageResp.text();

    const metaResp = await fetch(
      `https://pfpg-ogp.tksh.deno.net/ogp/image-meta${search}`,
    );
    const meta: unknown = await metaResp.json();
    let imageUrl: string | null = null;
    if (
      typeof meta === "object" && meta !== null && "imageUrl" in meta &&
      typeof (meta as { imageUrl: unknown }).imageUrl === "string"
    ) {
      imageUrl = (meta as { imageUrl: string }).imageUrl;
    }

    let html = baseHtml;
    html = html.replace(
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${url.toString()}" />`,
    );
    if (imageUrl !== null) {
      html = html.replace(
        /<meta property="og:image" content="[^"]*"\s*\/>/,
        `<meta property="og:image" content="${imageUrl}" />`,
      );
    }
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return await fallback();
  }
}
