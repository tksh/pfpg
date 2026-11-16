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

function callPage(userAgent: string, fetcher: StubFetcher): Promise<Response> {
  return serveOgPage(
    new Request("https://site.test/index.html?bits=~7", {
      headers: { "user-agent": userAgent },
    }),
    () => new Response("fallback"),
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

function metaResponse(): Response {
  return new Response(JSON.stringify({ imageUrl }), {
    headers: { "content-type": "application/json" },
  });
}

Deno.test("all user agents receive an existing image without rendering", async () => {
  for (
    const userAgent of [
      "Twitterbot/1.0",
      "Googlebot/2.1",
      "Google-Keep-preview/unknown",
      "Mozilla/5.0",
    ]
  ) {
    const calls: Call[] = [];
    const fetcher = stub((url, init) => {
      if (url.endsWith("index-raw.html")) return new Response(html);
      if (url.includes("/ogp/image-meta")) return metaResponse();
      if (init?.method === "HEAD") return new Response(null, { status: 200 });
      throw new Error("OGP page requests must not call the render endpoint");
    }, calls);

    const response = await callPage(userAgent, fetcher);
    const body = await response.text();
    assertStringIncludes(
      body,
      'content="https://site.test/index.html?bits=~7"',
    );
    assertStringIncludes(body, `content="${imageUrl}"`);
    assertEquals(calls.map((call) => call.method), ["GET", "GET", "HEAD"]);
    assert(!calls.some((call) => call.url.includes("/ogp/render")));
  }
});

Deno.test("all user agents omit an image that has not been rendered", async () => {
  for (
    const userAgent of ["Twitterbot", "Google-Keep-preview", "Mozilla/5.0"]
  ) {
    const calls: Call[] = [];
    const fetcher = stub((url, init) => {
      if (url.endsWith("index-raw.html")) return new Response(html);
      if (url.includes("/ogp/image-meta")) return metaResponse();
      if (init?.method === "HEAD") return new Response(null, { status: 404 });
      throw new Error("OGP page requests must not call the render endpoint");
    }, calls);

    const response = await callPage(userAgent, fetcher);
    const body = await response.text();
    assertStringIncludes(
      body,
      'content="https://site.test/index.html?bits=~7"',
    );
    assert(!body.includes('property="og:image"'));
    assert(!calls.some((call) => call.url.includes("/ogp/render")));
  }
});

Deno.test("HEAD failures omit og:image and never call render", async () => {
  const failures: Array<{
    label: string;
    head: () => Response | Promise<Response>;
  }> = [
    { label: "403", head: () => new Response(null, { status: 403 }) },
    { label: "503", head: () => new Response(null, { status: 503 }) },
    {
      label: "timeout",
      head: () => {
        throw new DOMException("deadline", "TimeoutError");
      },
    },
    {
      label: "network error",
      head: () => Promise.reject(new Error("offline")),
    },
  ];

  for (const failure of failures) {
    const calls: Call[] = [];
    const fetcher = stub((url, init) => {
      if (url.endsWith("index-raw.html")) return new Response(html);
      if (url.includes("/ogp/image-meta")) return metaResponse();
      if (init?.method === "HEAD") return failure.head();
      throw new Error(`Unexpected request during ${failure.label}`);
    }, calls);

    const response = await callPage("Google-Keep-preview", fetcher);
    const body = await response.text();
    assertStringIncludes(body, "og:url");
    assert(!body.includes('property="og:image"'));
    assert(!calls.some((call) => call.url.includes("/ogp/render")));
  }
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
  const response = await callPage("Googlebot", fetcher);
  const body = await response.text();
  assertStringIncludes(body, "og:url");
  assert(!body.includes('property="og:image"'));
  assert(!calls.some((call) => call.method === "HEAD"));
});

Deno.test("index fetch failure preserves og:url and omits og:image", async () => {
  const response = await serveOgPage(
    new Request("https://site.test/index.html?bits=~7"),
    () => new Response(html),
    () => Promise.reject(new Error("index unavailable")),
  );
  const body = await response.text();
  assertStringIncludes(body, 'content="https://site.test/index.html?bits=~7"');
  assert(!body.includes('property="og:image"'));
});
