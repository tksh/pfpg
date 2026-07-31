// scripts/dev_server.ts
const DIST = "./dist";
const clients = new Set<ReadableStreamDefaultController>();

function sse(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      req.signal.addEventListener("abort", () => clients.delete(controller));
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}

function broadcastReload() {
  const msg = new TextEncoder().encode(`data: reload\n\n`);
  for (const c of clients) {
    try { c.enqueue(msg); } catch { /* 切断済み */ }
  }
}

async function waitForDir(path: string) {
  while (true) {
    try {
      const stat = await Deno.stat(path);
      if (stat.isDirectory) return;
    } catch { /* まだ存在しない */ }
    await new Promise((r) => setTimeout(r, 100));
  }
}

(async () => {
  await waitForDir(DIST);
  console.log(`[dev-server] watching: ${await Deno.realPath(DIST)}`);
  let timer: number | undefined;
  for await (const _event of Deno.watchFs(DIST)) {
    clearTimeout(timer);
    timer = setTimeout(broadcastReload, 100);
  }
})();

const LIVE_RELOAD_SCRIPT = `
<script>
  new EventSource("/__livereload").onmessage = () => location.reload();
</script>`;

const CONTENT_TYPES: Record<string, string> = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
};

console.log(`[dev-server] cwd: ${Deno.cwd()}`);

Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);
  if (url.pathname === "/__livereload") return sse(req);

  const path = url.pathname === "/" ? "/index.html" : url.pathname;
  const fullPath = `${DIST}${path}`;
  console.log(`[dev-server] request: ${url.pathname} -> ${fullPath}`);

  try {
    const bytes = await Deno.readFile(fullPath);
    const ext = path.slice(path.lastIndexOf("."));
    if (ext === ".html") {
      const html = new TextDecoder().decode(bytes)
        .replace("</body>", `${LIVE_RELOAD_SCRIPT}</body>`);
      return new Response(html, { headers: { "content-type": "text/html" } });
    }
    return new Response(bytes, {
      headers: { "content-type": CONTENT_TYPES[ext] ?? "application/octet-stream" },
    });
  } catch (err) {
    console.error(`[dev-server] NOT FOUND: ${fullPath}`, err); // ← ここで本当の原因がわかる
    return new Response("Not found", { status: 404 });
  }
});