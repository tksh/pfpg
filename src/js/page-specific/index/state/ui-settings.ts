import { type SettingValue, UI_CONFIG_DEFAULTS } from "constants";
import { readLastParam } from "libpfpg/settings";

export { resolveUiSettings };

export type ThemeColor = "white" | "light" | "dark" | "black";
export type ButtonAction = "download" | "copy";
export type ViewScaling = "fit" | "actual";
export type ImageFormat = "png" | "webp";

/**
 * Settings that change the page, not the drawing.
 *
 * `themeColor` stays optional: when the URL omits it the page derives one from
 * the browser's colour scheme instead of picking a value here.
 */
export interface UiSettings {
  themeColor: ThemeColor | undefined;
  buttonAction: ButtonAction;
  viewScaling: ViewScaling;
  checkerboardBg: boolean;
  textWrapping: boolean;
  imageFormat: ImageFormat;
}

const THEME_COLORS: readonly ThemeColor[] = [
  "white",
  "light",
  "dark",
  "black",
];
const BUTTON_ACTIONS: readonly ButtonAction[] = ["download", "copy"];
const VIEW_SCALINGS: readonly ViewScaling[] = ["fit", "actual"];
const IMAGE_FORMATS: readonly ImageFormat[] = ["png", "webp"];

function defaultValue(key: string): SettingValue {
  return UI_CONFIG_DEFAULTS.get(key);
}

function requiredEnumDefault<T extends string>(
  key: string,
  allowed: readonly T[],
): T {
  const value = defaultValue(key);
  if (typeof value === "string" && allowed.includes(value as T)) {
    return value as T;
  }
  throw new TypeError(`Invalid default for ${key}`);
}

function optionalEnumDefault<T extends string>(
  key: string,
  allowed: readonly T[],
): T | undefined {
  const value = defaultValue(key);
  if (value === undefined) return undefined;
  if (typeof value === "string" && allowed.includes(value as T)) {
    return value as T;
  }
  throw new TypeError(`Invalid default for ${key}`);
}

function boolDefault(key: string): boolean {
  const value = defaultValue(key);
  if (typeof value === "boolean") return value;
  throw new TypeError(`Invalid default for ${key}`);
}

function readEnum<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T;
function readEnum<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T | undefined,
): T | undefined;
function readEnum<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T | undefined,
): T | undefined {
  const value = readLastParam(params, key);
  if (value === null) return fallback;
  if (allowed.includes(value as T)) return value as T;
  throw new TypeError(`Invalid ${key}: ${value}`);
}

function readBool(
  params: URLSearchParams,
  key: string,
  fallback: boolean,
): boolean {
  const value = readLastParam(params, key);
  if (value === null) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new TypeError(`Invalid ${key}: ${value}`);
}

/**
 * Validate and resolve the app-only UI settings from URL params.
 *
 * These keys never reach `libpfpg` or the shared-image key: they change the
 * page, not the drawing. They still have to be validated on every path — the
 * OGP endpoints call this before hashing — so a present-but-invalid UI value
 * cannot slip through as a 200 with an otherwise valid picture.
 */
function resolveUiSettings(params: URLSearchParams): UiSettings {
  return {
    themeColor: readEnum(
      params,
      "themeColor",
      THEME_COLORS,
      optionalEnumDefault("themeColor", THEME_COLORS),
    ),
    buttonAction: readEnum(
      params,
      "buttonAction",
      BUTTON_ACTIONS,
      requiredEnumDefault("buttonAction", BUTTON_ACTIONS),
    ),
    viewScaling: readEnum(
      params,
      "viewScaling",
      VIEW_SCALINGS,
      requiredEnumDefault("viewScaling", VIEW_SCALINGS),
    ),
    checkerboardBg: readBool(
      params,
      "checkerboardBg",
      boolDefault("checkerboardBg"),
    ),
    textWrapping: readBool(
      params,
      "textWrapping",
      boolDefault("textWrapping"),
    ),
    imageFormat: readEnum(
      params,
      "imageFormat",
      IMAGE_FORMATS,
      requiredEnumDefault("imageFormat", IMAGE_FORMATS),
    ),
  };
}
