const OGP_SERVICE = "https://pfpg-ogp.tksh.deno.net";
// Per-hop budgets keep the full index + meta + HEAD + render path under the
// current Netlify Functions request ceiling; staging measurements remain the gate.
const INDEX_HTML_TIMEOUT_MS = 2_000;
const META_TIMEOUT_MS = 2_000;
const IMAGE_HEAD_TIMEOUT_MS = 1_500;
const RENDER_TIMEOUT_MS = 4_000;
const CRAWLER_USER_AGENTS = [
  "Googlebot",
  "Bingbot",
  "Twitterbot",
  "facebookexternalhit",
  "Slackbot",
  "Discordbot",
  "TelegramBot",
  "LinkedInBot",
  "WhatsApp",
  "iMessage",
  "Pinterest",
];

export interface OgPageEnv {
  OGP_METHOD_A?: string;
  OGP_SHARED_SECRET?: string;
}

type Fetcher = typeof fetch;

// Shared by Cloudflare Pages and Netlify. Keep both entry points aligned so
// crawler recovery cannot behave differently by deployment platform.
export async function serveOgPage(
  req: Request,
  fallback: () => Promise<Response> | Response,
  env: OgPageEnv,
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

  // OGP_METHOD_A is deliberately opt-in. The UA check limits unsolicited work;
  // it is a friendliness gate, not an authentication or abuse control.
  if (
    env.OGP_METHOD_A !== "on" ||
    !isCrawlerUserAgent(req.headers.get("user-agent") ?? "")
  ) return htmlResponse(injectOgUrl(baseHtml, url));

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
    return htmlResponse(injectOgUrl(removeOgImage(baseHtml), url));
  }

  try {
    const renderUrl = new URL(`${OGP_SERVICE}/ogp/render${url.search}`);
    renderUrl.searchParams.set("auto", "1");
    const renderResp = await fetcher(renderUrl, {
      method: "POST",
      headers: { "x-ogp-shared-secret": env.OGP_SHARED_SECRET ?? "" },
      signal: AbortSignal.timeout(RENDER_TIMEOUT_MS),
    });
    if (!renderResp.ok) {
      console.log(
        renderResp.status === 403 ? "ogp: secret-rejected" : "ogp: render-fail",
      );
      return htmlResponse(injectOgUrl(removeOgImage(baseHtml), url));
    }
    const renderResult: unknown = await renderResp.json();
    if (
      typeof renderResult !== "object" || renderResult === null ||
      !("imageUrl" in renderResult) ||
      typeof (renderResult as { imageUrl: unknown }).imageUrl !== "string"
    ) throw new Error("render response is missing imageUrl");
    return htmlResponse(
      injectOgUrl(
        baseHtml,
        url,
        (renderResult as { imageUrl: string }).imageUrl,
      ),
    );
  } catch (error) {
    logFetchFailure(error, "render-fail");
    return htmlResponse(injectOgUrl(removeOgImage(baseHtml), url));
  }
}

function isCrawlerUserAgent(userAgent: string): boolean {
  const folded = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some((crawler) =>
    folded.includes(crawler.toLowerCase())
  );
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
