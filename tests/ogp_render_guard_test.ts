import { assertEquals } from "@std/assert";
import { renderGuardResponse } from "../server/ogp-render-guard.ts";

Deno.test("render rejects missing or invalid secret", () => {
  const noSecret = new Request("https://example.test/ogp/render", {
    method: "POST",
  });
  const hasSecret = new Request("https://example.test/ogp/render", {
    method: "POST",
    headers: { "x-ogp-shared-secret": "secret" },
  });
  assertEquals(renderGuardResponse(noSecret, "secret")?.status, 403);
  assertEquals(renderGuardResponse(hasSecret, undefined)?.status, 403);
  assertEquals(renderGuardResponse(hasSecret, "wrong")?.status, 403);
});

Deno.test("authorized render accepts snapped opacitySteps", () => {
  const request = new Request("https://example.test/ogp/render", {
    method: "POST",
    headers: { "x-ogp-shared-secret": "secret" },
  });
  assertEquals(
    renderGuardResponse(
      request,
      "secret",
    ),
    null,
  );
});
