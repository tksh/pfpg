export { renderGuardResponse };

function renderGuardResponse(
  request: Request,
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
  return null;
}
