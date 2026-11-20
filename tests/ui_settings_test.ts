import { assertEquals, assertThrows } from "@std/assert";
import { resolveUiSettings } from "../src/js/page-specific/index/state/ui-settings.ts";

Deno.test("resolveUiSettings uses UI defaults for absent keys", () => {
  assertEquals(resolveUiSettings(new URLSearchParams()), {
    themeColor: undefined,
    buttonAction: "download",
    viewScaling: "fit",
    checkerboardBg: true,
    textWrapping: false,
    imageFormat: "png",
  });
});

Deno.test("resolveUiSettings accepts the documented spellings", () => {
  const settings = resolveUiSettings(
    new URLSearchParams(
      "themeColor=dark&buttonAction=copy&viewScaling=actual&" +
        "checkerboardBg=false&textWrapping=true&imageFormat=webp",
    ),
  );
  assertEquals(settings, {
    themeColor: "dark",
    buttonAction: "copy",
    viewScaling: "actual",
    checkerboardBg: false,
    textWrapping: true,
    imageFormat: "webp",
  });
});

Deno.test("resolveUiSettings rejects present-but-invalid values", () => {
  const cases: Array<[string, string]> = [
    ["themeColor", ""],
    ["themeColor", "Dark"],
    ["buttonAction", "copy-paste"],
    ["viewScaling", "fill"],
    ["checkerboardBg", "TRUE"],
    ["checkerboardBg", "1"],
    ["textWrapping", "yes"],
    ["imageFormat", "jpg"],
  ];
  for (const [key, value] of cases) {
    assertThrows(
      () => resolveUiSettings(new URLSearchParams([[key, value]])),
      TypeError,
      key,
      `${key}=${value} must be rejected`,
    );
  }
});
