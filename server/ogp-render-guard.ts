export { renderGuardResponse };

function renderGuardResponse(
  request: Request,
  url: URL,
  sharedSecret: string | undefined,
): Response | null {
  if (
    sharedSecret === undefined || sharedSecret === "" ||
    request.headers.get("x-ogp-shared-secret") !== sharedSecret
  ) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  if (url.searchParams.has("opacitySteps")) {
    return new Response(
      JSON.stringify({ error: "opacitySteps is temporarily unsupported" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
  return null;
}
