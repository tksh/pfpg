/**
 * The locales the app actually ships, in `<option>` order.
 *
 * Kept free of JSON imports and DOM so the URL validator and the OGP server can
 * use the same closed set without pulling the whole i18n module into a request.
 */
export const SUPPORTED_LOCALES = [
  "en",
  "zh",
  "es",
  "ar",
  "id",
  "pt",
  "fr",
  "ja",
  "ru",
  "de",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * Only an absent key falls back to the default. A present value must match a
 * supported locale exactly — `JA`, `""` and `xx` are errors, not coercions.
 */
export function parseLocale(value: string | null): Locale {
  if (value === null) return DEFAULT_LOCALE;
  if ((SUPPORTED_LOCALES as readonly string[]).includes(value)) {
    return value as Locale;
  }
  throw new TypeError(`Invalid lang: ${value}`);
}
