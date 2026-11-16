const OGP_SERVICE = "https://pfpg-ogp.tksh.deno.net";
// Per-hop budgets keep the index + metadata + asset check within platform limits.
const INDEX_HTML_TIMEOUT_MS = 2_000;
const META_TIMEOUT_MS = 2_000;
const IMAGE_HEAD_TIMEOUT_MS = 1_500;

type Fetcher = typeof fetch;

// Shared by Cloudflare Pages and Netlify so existing-asset checks stay aligned.
export async function serveOgPage(
  req: Request,
  fallback: () => Promise<Response> | Response,
  fetcher: Fetcher = fetch,
): Promise<Response> {
  const url = new URL(req.url);
  if (url.search === "" || url.search === "?") return await fallback();

  let baseHtml: string;
  try {
    const pageResp = await fetcher(`${url.origin}/index-raw.html`, {
      signal: AbortSignal.timeout(INDEX_HTML_TIMEOUT_MS),
    });
    if (!pageResp.ok) throw new Error(`index-raw returned ${pageResp.status}`);
    baseHtml = await pageResp.text();
  } catch (error) {
    logFetchFailure(error, "meta-fetch-fail");
    return noImageFallback(fallback, url);
  }

  let imageUrl: string;
  try {
    const metaResp = await fetcher(
      `${OGP_SERVICE}/ogp/image-meta${url.search}`,
      { signal: AbortSignal.timeout(META_TIMEOUT_MS) },
    );
    if (!metaResp.ok) throw new Error(`image-meta returned ${metaResp.status}`);
    const meta: unknown = await metaResp.json();
    if (
      typeof meta !== "object" || meta === null || !("imageUrl" in meta) ||
      typeof (meta as { imageUrl: unknown }).imageUrl !== "string"
    ) throw new Error("image-meta response is missing imageUrl");
    imageUrl = (meta as { imageUrl: string }).imageUrl;
  } catch (error) {
    logFetchFailure(error, "meta-fetch-fail");
    return htmlResponse(injectOgUrl(removeOgImage(baseHtml), url));
  }

  let head: Response;
  try {
    head = await fetcher(imageUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(IMAGE_HEAD_TIMEOUT_MS),
    });
  } catch (error) {
    logFetchFailure(error, "head-non-404");
    return htmlResponse(injectOgUrl(removeOgImage(baseHtml), url));
  }
  if (head.ok) return htmlResponse(injectOgUrl(baseHtml, url, imageUrl));
  if (head.status !== 404) {
    console.log("ogp: head-non-404");
  }
  return htmlResponse(injectOgUrl(removeOgImage(baseHtml), url));
}

function logFetchFailure(error: unknown, fallbackCategory: string): void {
  console.log(
    error instanceof DOMException && error.name === "TimeoutError"
      ? "ogp: timeout"
      : `ogp: ${fallbackCategory}`,
  );
}

async function noImageFallback(
  fallback: () => Promise<Response> | Response,
  url: URL,
): Promise<Response> {
  try {
    const response = await fallback();
    return htmlResponse(
      injectOgUrl(removeOgImage(await response.text()), url),
      response.status,
    );
  } catch {
    return htmlResponse(injectOgUrl(removeOgImage(""), url), 502);
  }
}

function injectOgUrl(html: string, url: URL, imageUrl?: string): string {
  let output = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${escapeAttribute(url.toString())}" />`,
  );
  output = imageUrl === undefined ? removeOgImage(output) : output.replace(
    /<meta property="og:image" content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${escapeAttribute(imageUrl)}" />`,
  );
  return output;
}

function removeOgImage(html: string): string {
  return html.replace(/\s*<meta property="og:image"[^>]*\/?\s*>\s*/g, "\n");
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll(
    "<",
    "&lt;",
  );
}

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
