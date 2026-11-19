import { type AllowedOpacityStep, isAllowedOpacityStep } from "constants";
import { getState } from "state/url-state-manager";

export { getOpacitySteps };

/**
 * The opacity step the URL asks for, as a number.
 *
 * URL params arrive as strings and `getState()` returns them unchanged, so
 * handing that straight to a numeric helper throws. Converting here keeps the
 * coercion in one place instead of repeating `Number(getState(...))` at every
 * call site.
 *
 * Returns `fallback` when the URL carries no supported step, which is the
 * "unspecified" case. The fallback is the artwork-derived default, passed in by
// the caller rather than read from a mutable global, so this stays usable
// without the page's startup side effects.
 */
function getOpacitySteps(fallback: number): number;
function getOpacitySteps(fallback?: undefined): AllowedOpacityStep | undefined;
function getOpacitySteps(fallback?: number): number | undefined {
  const value = getState("opacitySteps");
  if (value !== undefined) {
    const step = Number(value);
    if (isAllowedOpacityStep(step)) return step;
  }
  return fallback;
}
