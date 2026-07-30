export async function main() {
  const files = [
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "apple-touch-icon.png",
    "favicon.ico",
    "favicon.svg",
    "site.webmanifest",
  ];

  // 1. Ensure the destination directory exists to prevent crashes
  try {
    await Deno.mkdir("dist", { recursive: true });
  } catch {
    // Ignore error if the directory already exists
  }

  // 2. Copy each file
  for (const f of files) {
    const src = `src/${f}`;
    const dest = `dist/${f}`;


    try {
      // Deno.copyFile is the native equivalent of `cp` for files
      await Deno.copyFile(src, dest);
    } catch (error) {
      console.error(`❌ Failed to copy ${src} to ${dest}`);
      console.error(error);

      // Mimics the `|| exit 1` behavior from your shell script
      Deno.exit(1);
    }
  }

  console.log("✅ Successfully copied all static assets to dist/");
}

// Only run if this file is executed directly (not imported)
if (import.meta.main) {
  await main();
}
