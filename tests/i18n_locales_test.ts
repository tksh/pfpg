import { assert, assertEquals } from "@std/assert";
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
