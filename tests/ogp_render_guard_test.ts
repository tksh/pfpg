import { assertEquals } from "@std/assert";
import { renderGuardResponse } from "../server/ogp-render-guard.ts";

Deno.test("render rejects missing or invalid secret before inspecting params", () => {
  const noSecret = new Request("https://example.test/ogp/render", {
    method: "POST",
  });
  const hasSecret = new Request("https://example.test/ogp/render", {
    method: "POST",
    headers: { "x-ogp-shared-secret": "secret" },
  });
  const url = new URL("https://example.test/ogp/render?opacitySteps=0.2");
  assertEquals(renderGuardResponse(noSecret, url, "secret")?.status, 403);
  assertEquals(renderGuardResponse(hasSecret, url, undefined)?.status, 403);
  assertEquals(renderGuardResponse(hasSecret, url, "wrong")?.status, 403);
});

Deno.test("authorized render rejects opacitySteps and allows it to be absent", () => {
  const request = new Request("https://example.test/ogp/render", {
    method: "POST",
    headers: { "x-ogp-shared-secret": "secret" },
  });
  assertEquals(
    renderGuardResponse(
      request,
      new URL(
        "https://example.test/ogp/render?opacitySteps=0.1&opacitySteps=0.2",
      ),
      "secret",
    )?.status,
    400,
  );
  assertEquals(
    renderGuardResponse(
      request,
      new URL("https://example.test/ogp/render?bits=~7"),
      "secret",
    ),
    null,
  );
});
