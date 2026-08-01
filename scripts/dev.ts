// scripts/dev.ts
import { TextLineStream } from "jsr:@std/streams/text-line-stream";

const DIST = "./dist";
const clients = new Set<ReadableStreamDefaultController>();

function broadcastReload() {
  const msg = new TextEncoder().encode(`data: reload\n\n`);
  for (const c of clients) {
    try { c.enqueue(msg); } catch { /* 切断済み */ }
  }
}

async function runPostprocessing() {
  console.log("[dev] running postprocessing...");
  const cmd = new Deno.Command("deno", {
    args: ["task", "postprocessing"],
    stdout: "inherit",
    stderr: "inherit",
  });
  const { success } = await cmd.output();
  if (!success) {
    console.error("[dev] postprocessing failed");
    return;
  }
  console.log("[dev] postprocessing done, reloading browser");
  broadcastReload();
}

// --- deno bundle --watch を子プロセスとして起動し、出力を監視する ---
async function startBundleWatch() {
  const cmd = new Deno.Command("deno", {
    args: [
      "bundle",
      "--watch",
      "src/index.html",
      "--platform=browser",
      "--outdir",
      "dist/",
    ],
    stdout: "inherit", // 使わないのでそのまま表示だけしておく
    stderr: "piped",   // ← ここを監視する
  });
  const child = cmd.spawn();

  const lines = child.stderr
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  for await (const line of lines) {
    console.log("[bundle]", line); // デバッグ用: 生のログを必ず表示
    if (line.includes("Bundled") && line.includes("modules")) {
  await runPostprocessing();
}
  }
}

startBundleWatch();

// --- 静的ファイル配信 + SSEでのライブリロード ---
const LIVE_RELOAD_SCRIPT = `
<script>
  new EventSource("/__livereload").onmessage = () => location.reload();
</script>`;

const CONTENT_TYPES: Record<string, string> = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
};

Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/__livereload") {
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

  const path = url.pathname === "/" ? "/index.html" : url.pathname;
  const fullPath = `${DIST}${path}`;
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
  } catch {
    return new Response("Not found", { status: 404 });
  }
});