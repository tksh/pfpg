import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { serveOgPage } from "../functions/lib/og-page.ts";

const imageUrl = "https://res.cloudinary.com/demo/image/upload/sample-png.png";
const html =
  '<html><head><meta property="og:url" content="" /><meta property="og:image" content="" /></head></html>';

type Call = { url: string; method: string; init?: RequestInit };
type StubFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

function callPage(
  userAgent: string,
  env: { OGP_METHOD_A?: string; OGP_SHARED_SECRET?: string },
  fetcher: StubFetcher,
): Promise<Response> {
  return serveOgPage(
    new Request("https://site.test/index.html?bits=~7", {
      headers: { "user-agent": userAgent },
    }),
    () => new Response("fallback"),
    env,
    fetcher,
  );
}

function stub(
  resolve: (url: string, init?: RequestInit) => Response | Promise<Response>,
  calls: Call[],
): StubFetcher {
  return async (input, init) => {
    const url = String(input);
    calls.push({ url, method: init?.method ?? "GET", init });
    return await resolve(url, init);
  };
}

Deno.test("method A stays off by default and does no HEAD for human UAs", async () => {
  const calls: Call[] = [];
  const fetcher = stub(
    (url) =>
      url.endsWith("index-raw.html")
        ? new Response(html)
        : new Response(JSON.stringify({ imageUrl }), {
          headers: { "content-type": "application/json" },
        }),
    calls,
  );
  const response = await callPage("Mozilla/5.0", {}, fetcher);
  const body = await response.text();
  assertStringIncludes(body, `content="${imageUrl}"`);
  assertStringIncludes(body, "og:url");
  assertEquals(calls.length, 2);
  assert(!calls.some((call) => call.method === "HEAD"));
});

Deno.test("allowlisted crawler renders only after a 404 and sends auto secret", async () => {
  const calls: Call[] = [];
  const fetcher = stub((url, init) => {
    if (url.endsWith("index-raw.html")) return new Response(html);
    if (url.includes("/ogp/image-meta")) {
      return new Response(JSON.stringify({ imageUrl }), {
        headers: { "content-type": "application/json" },
      });
    }
    if (init?.method === "HEAD") return new Response(null, { status: 404 });
    return new Response(JSON.stringify({ imageUrl }), {
      headers: { "content-type": "application/json" },
    });
  }, calls);
  const response = await callPage("Googlebot/2.1", {
    OGP_METHOD_A: "on",
    OGP_SHARED_SECRET: "shared-secret",
  }, fetcher);
  assertStringIncludes(await response.text(), `content="${imageUrl}"`);
  const head = calls.find((call) => call.method === "HEAD");
  const post = calls.find((call) => call.method === "POST");
  assert(head);
  assert(post);
  assert(post.url.includes("auto=1"));
  assertEquals(
    new Headers(post.init?.headers).get("x-ogp-shared-secret"),
    "shared-secret",
  );
  assert(post.init?.signal instanceof AbortSignal);
});

Deno.test("method A does not recover on a non-404 HEAD and removes og:image", async () => {
  const calls: Call[] = [];
  const fetcher = stub((url, init) => {
    if (url.endsWith("index-raw.html")) return new Response(html);
    if (url.includes("/ogp/image-meta")) {
      return new Response(JSON.stringify({ imageUrl }));
    }
    if (init?.method === "HEAD") return new Response(null, { status: 503 });
    throw new Error("POST must not be sent");
  }, calls);
  const response = await callPage(
    "Discordbot",
    { OGP_METHOD_A: "on" },
    fetcher,
  );
  const body = await response.text();
  assertStringIncludes(body, "og:url");
  assert(!body.includes('property="og:image"'));
  assert(!calls.some((call) => call.method === "POST"));
});

Deno.test("non-allowlisted agents stay on URL-only behavior when method A is on", async () => {
  const calls: Call[] = [];
  const fetcher = stub(
    (url) =>
      url.endsWith("index-raw.html")
        ? new Response(html)
        : new Response(JSON.stringify({ imageUrl })),
    calls,
  );
  const response = await callPage(
    "Blueskybot/1.0",
    { OGP_METHOD_A: "on", OGP_SHARED_SECRET: "shared-secret" },
    fetcher,
  );
  assertStringIncludes(await response.text(), `content="${imageUrl}"`);
  assert(
    !calls.some((call) => call.method === "HEAD" || call.method === "POST"),
  );
});

Deno.test("image-meta failure omits the complete og:image tag", async () => {
  const calls: Call[] = [];
  const fetcher = stub(
    (url) =>
      url.endsWith("index-raw.html")
        ? new Response(html)
        : new Response("unavailable", { status: 503 }),
    calls,
  );
  const response = await callPage(
    "Googlebot",
    { OGP_METHOD_A: "off" },
    fetcher,
  );
  const body = await response.text();
  assertStringIncludes(body, "og:url");
  assert(!body.includes('property="og:image"'));
});

Deno.test("crawler HEAD timeout omits the image and never sends render POST", async () => {
  const calls: Call[] = [];
  const fetcher = stub((url, init) => {
    if (url.endsWith("index-raw.html")) return new Response(html);
    if (url.includes("/ogp/image-meta")) {
      return new Response(JSON.stringify({ imageUrl }));
    }
    if (init?.method === "HEAD") {
      throw new DOMException("deadline", "TimeoutError");
    }
    throw new Error("POST must not be sent");
  }, calls);
  const response = await callPage("Googlebot", { OGP_METHOD_A: "on" }, fetcher);
  assert(!(await response.text()).includes('property="og:image"'));
  assert(!calls.some((call) => call.method === "POST"));
});

Deno.test("missing render secret omits og:image after a crawler sees a 404", async () => {
  const calls: Call[] = [];
  const fetcher = stub((url, init) => {
    if (url.endsWith("index-raw.html")) return new Response(html);
    if (url.includes("/ogp/image-meta")) {
      return new Response(JSON.stringify({ imageUrl }));
    }
    if (init?.method === "HEAD") return new Response(null, { status: 404 });
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 403,
    });
  }, calls);
  const response = await callPage("Googlebot", { OGP_METHOD_A: "on" }, fetcher);
  assert(!(await response.text()).includes('property="og:image"'));
  assert(calls.some((call) => call.method === "POST"));
});

Deno.test("existing image on HEAD success is reused without rendering", async () => {
  const calls: Call[] = [];
  const fetcher = stub((url, init) => {
    if (url.endsWith("index-raw.html")) return new Response(html);
    if (url.includes("/ogp/image-meta")) {
      return new Response(JSON.stringify({ imageUrl }));
    }
    if (init?.method === "HEAD") return new Response(null, { status: 200 });
    throw new Error("POST must not be sent");
  }, calls);
  const response = await callPage(
    "LinkedInBot",
    { OGP_METHOD_A: "on" },
    fetcher,
  );
  assertStringIncludes(await response.text(), `content="${imageUrl}"`);
  assert(!calls.some((call) => call.method === "POST"));
});
