import { assert, assertEquals } from "@std/assert";
import { excludeStateKeys } from "common-utils/read-url-params";
import { getLocale, resolveLocale, setLocale, t } from "i18n/i18n";
import enJson from "../src/js/i18n/locales/en.json" with { type: "json" };
import jaJson from "../src/js/i18n/locales/ja.json" with { type: "json" };

function isLocaleJson(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every((entry) => typeof entry === "string");
}

function asLocaleJson(value: unknown, label: string): Record<string, string> {
  if (!isLocaleJson(value)) {
    throw new Error(`${label}: expected string values only`);
  }
  return value;
}

const en = asLocaleJson(enJson, "en.json");
const ja = asLocaleJson(jaJson, "ja.json");

Deno.test("locales share an identical key set", () => {
  const enKeys = Object.keys(en).sort();
  const jaKeys = Object.keys(ja).sort();
  assertEquals(jaKeys, enKeys);
});

Deno.test("locale values are non-empty strings in both files", () => {
  for (const key of Object.keys(en)) {
    const enValue = en[key];
    const jaValue = ja[key];
    assert(typeof enValue === "string" && enValue.length > 0, `en: ${key}`);
    assert(typeof jaValue === "string" && jaValue.length > 0, `ja: ${key}`);
  }
});

Deno.test("locale resolution defaults to English and honors ?lang", () => {
  assertEquals(resolveLocale(""), "en");
  assertEquals(resolveLocale("?lang=ja"), "ja");
  assertEquals(resolveLocale("?lang=JA"), "ja");
  assertEquals(resolveLocale("?lang=zh"), "en");
  assertEquals(resolveLocale("?lang="), "en");
  assertEquals(resolveLocale("?foo=2&title=~202401_001"), "en");
});

Deno.test("resolution ignores neighboring artwork state params", () => {
  assertEquals(
    resolveLocale("?lang=ja&bits=~7&title=~202401_001&themeColor=black"),
    "ja",
  );
  assertEquals(
    resolveLocale("?bits=~5&pathMode=relativeMerged"),
    "en",
  );
});

// The artwork-param filter must drop `lang` too: stln-codec rejects unknown
// keys, and the shared-image key must describe pixels, which a language
// choice cannot change. (Regression: with `&lang=ja` in the URL the decode
// threw and the output area rendered empty.)
Deno.test("artwork-param filter drops lang but keeps artwork params", () => {
  const artwork = excludeStateKeys(
    new URLSearchParams(
      "?bits=~7&title=~202401_001&desc=x&themeColor=black&lang=ja",
    ),
  );
  assertEquals(artwork.get("bits"), "~7");
  assertEquals(artwork.get("title"), "~202401_001");
  assertEquals(artwork.get("desc"), "x");
  assertEquals(artwork.get("lang"), null);
  assertEquals(artwork.get("themeColor"), null);
});

Deno.test("t() serves the current locale and falls back to English", () => {
  setLocale("en");
  assertEquals(t("ui.themeColor"), "Theme color: ");
  setLocale("ja");
  assertEquals(t("ui.themeColor"), "テーマカラー:");
  assertEquals(getLocale(), "ja");
  setLocale("en");
});

Deno.test("t() returns the key itself for unknown keys", () => {
  assertEquals(t("no.such.key"), "no.such.key");
});

Deno.test("interpolation leaves messages untouched without matching vars", () => {
  assertEquals(t("ui.themeColor", {}), "Theme color: ");
  assertEquals(t("ui.themeColor", { unrelated: 3 }), "Theme color: ");
});

// The marked-up strings this test reads are the source of truth for which keys
// the index page needs: JSON-side keys used only by TS (t()-calls) are checked
// by review, but every HTML key must exist in the default locale.
const INDEX_HTML_URL = new URL("../src/index.html", import.meta.url);

Deno.test("every data-i18n key marked in index.html exists in en.json", async () => {
  const html = await Deno.readTextFile(INDEX_HTML_URL);
  const keyPattern =
    /data-i18n(?:-html|-aria|-title|-placeholder|-alt)?="([^"]+)"/g;
  const markedKeys = new Set<string>();
  for (const match of html.matchAll(keyPattern)) {
    const key = match[1];
    if (key !== undefined) markedKeys.add(key);
  }
  assert(markedKeys.size > 40, `only ${markedKeys.size} keys found in HTML`);
  for (const key of markedKeys) {
    const enValue = en[key];
    assert(
      typeof enValue === "string",
      `index.html marks unknown key "${key}"`,
    );
  }
});
