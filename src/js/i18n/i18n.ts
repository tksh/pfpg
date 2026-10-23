import { LOCALE_URL_PARAM } from "constants";
import zhJson from "./locales/zh.json" with { type: "json" };
import enJson from "./locales/en.json" with { type: "json" };
import esJson from "./locales/es.json" with { type: "json" };
import idJson from "./locales/id.json" with { type: "json" };
import jaJson from "./locales/ja.json" with { type: "json" };
import ptJson from "./locales/pt.json" with { type: "json" };
import frJson from "./locales/fr.json" with { type: "json" };
import ruJson from "./locales/ru.json" with { type: "json" };
import deJson from "./locales/de.json" with { type: "json" };

// Adding a language = one JSON file under ./locales, one entry here, and one
// <option> for the Language select in index.html. Nothing else.
// Mirrors the <option> order in index.html (top-ten languages by internet
// users, endonym-labeled).
const SUPPORTED_LOCALES = [
  "en",
  "zh",
  "es",
  "id",
  "pt",
  "fr",
  "ja",
  "ru",
  "de",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: Locale = "en";
const LANGUAGE_SELECT_ID = "language";

type LocaleData = Readonly<Record<string, string>>;

function isLocaleData(value: unknown): value is LocaleData {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every((entry) => typeof entry === "string");
}

function validatedLocaleData(locale: Locale, json: unknown): LocaleData {
  if (!isLocaleData(json)) {
    throw new Error(
      `i18n: locales/${locale}.json must hold string values only`,
    );
  }
  return json;
}

const localeData = new Map<Locale, LocaleData>([
  ["en", validatedLocaleData("en", enJson)],
  ["zh", validatedLocaleData("zh", zhJson)],
  ["es", validatedLocaleData("es", esJson)],
  ["id", validatedLocaleData("id", idJson)],
  ["pt", validatedLocaleData("pt", ptJson)],
  ["fr", validatedLocaleData("fr", frJson)],
  ["ja", validatedLocaleData("ja", jaJson)],
  ["ru", validatedLocaleData("ru", ruJson)],
  ["de", validatedLocaleData("de", deJson)],
]);

// Pure so the resolution rules stay unit-testable without a DOM.
export function resolveLocale(search: string): Locale {
  const requested = new URLSearchParams(search).get(LOCALE_URL_PARAM);
  if (requested === null) return DEFAULT_LOCALE;
  const normalized = requested.trim().toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(normalized)
    ? normalized as Locale
    : DEFAULT_LOCALE;
}

let currentLocale: Locale = DEFAULT_LOCALE;

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

const missingKeysWarned = new Set<string>();

/**
 * Looks up a message for the current locale, falling back to the default
 * locale and then to the key itself. A lookup must never throw: a missing key
 * would otherwise disable a whole render path, so each miss warns exactly once
 * and keeps the UI alive instead.
 */
export function t(
  key: string,
  vars?: Readonly<Record<string, string | number>>,
): string {
  const message = localeData.get(currentLocale)?.[key] ??
    localeData.get(DEFAULT_LOCALE)?.[key];
  if (message === undefined) {
    if (!missingKeysWarned.has(key)) {
      missingKeysWarned.add(key);
      console.warn(`i18n: no entry for key "${key}"`);
    }
    return key;
  }
  return vars === undefined ? message : interpolate(message, vars);
}

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

function interpolate(
  message: string,
  vars: Readonly<Record<string, string | number>>,
): string {
  return message.replace(
    PLACEHOLDER_PATTERN,
    (token: string, name: string): string => {
      const value = vars[name];
      // An unknown placeholder stays visible so the gap is obvious on screen.
      return value === undefined ? token : String(value);
    },
  );
}

// Every attribute that can carry a translatable key, paired with the DOM
// attribute whose value it overrides. Plain text uses data-i18n (textContent)
// and data-i18n-html (innerHTML, for the few strings that contain markup).
const DATA_I18N_ATTRIBUTES: Readonly<Record<string, string>> = {
  "data-i18n-aria": "aria-label",
  "data-i18n-title": "title",
  "data-i18n-placeholder": "placeholder",
  "data-i18n-alt": "alt",
};

const I18N_MARKED_SELECTOR = [
  "[data-i18n]",
  "[data-i18n-html]",
  ...Object.keys(DATA_I18N_ATTRIBUTES),
].join(",");

export function applyI18n(): void {
  for (const element of document.querySelectorAll(I18N_MARKED_SELECTOR)) {
    const htmlElement = element as HTMLElement;
    const textKey = htmlElement.getAttribute("data-i18n");
    if (typeof textKey === "string") {
      htmlElement.textContent = t(textKey);
    }
    const htmlKey = htmlElement.getAttribute("data-i18n-html");
    if (typeof htmlKey === "string") {
      htmlElement.innerHTML = t(htmlKey);
    }
    for (
      const [dataAttribute, targetAttribute] of Object.entries(
        DATA_I18N_ATTRIBUTES,
      )
    ) {
      const attributeKey = htmlElement.getAttribute(dataAttribute);
      if (typeof attributeKey === "string") {
        htmlElement.setAttribute(targetAttribute, t(attributeKey));
      }
    }
  }
  document.documentElement.lang = currentLocale;
}

export function applyLocaleFromUrl(): void {
  currentLocale = resolveLocale(globalThis.location.search);
  applyI18n();
}

export function initLanguageSelector(): void {
  const selectElement = document.getElementById(LANGUAGE_SELECT_ID);
  if (!(selectElement instanceof HTMLSelectElement)) {
    throw new Error(`i18n: missing element #${LANGUAGE_SELECT_ID}`);
  }
  selectElement.value = currentLocale;
  selectElement.addEventListener("change", () => {
    // resolveLocale also validates the option value, so no hand-built URL can
    // carry a locale the app does not ship.
    const locale = resolveLocale(`?${LOCALE_URL_PARAM}=${selectElement.value}`);
    const url = new URL(globalThis.location.href);
    url.searchParams.set(LOCALE_URL_PARAM, locale);
    // The page URL is the artwork's state container, so a reload is how every
    // language change happens; all current URL params are preserved.
    globalThis.location.assign(url);
  });
}
