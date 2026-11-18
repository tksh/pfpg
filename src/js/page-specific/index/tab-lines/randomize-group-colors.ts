import { getSvgString } from "button/download-as-file";
import { convertToRgbArr } from "libpfpg/color-format";
import { oklchToRgb } from "color-formatter/oklch-to-rgb";
import { randomizeOklch } from "color-formatter/randomize-oklch";
import type {
  OffsetDistribution,
  Oklch,
  OklchSpread,
} from "color-formatter/randomize-oklch";
import { rgbToOklch } from "color-formatter/rgb-to-oklch";
import { resolveAnchorStrokes } from "color-formatter/resolve-anchor-strokes";
import type { BaseMode } from "color-formatter/resolve-anchor-strokes";
import {
  getOpacity,
  getStroke,
  getStrokeOpacity,
  regexMatchesOfGroupColors,
} from "libpfpg/group-colors";
import { rgbStringify } from "libpfpg/color-hex";
import { rgbObjToHex } from "libpfpg/color-rgb";
import { svg2pngOption } from "state/resvg-option";
import {
  adjustInputValueViaButton,
  syncInputNumberAndRange,
} from "tab-render/sync-number-and-range";
import { getState, updateState } from "state/url-state-manager";
import { commitRender } from "state/render-commit";
import { generateGroupColorsHtmlElements } from "tab-lines/group-colors-generator";
import { addEventListenerForGroupColorsInputs } from "tab-lines/group-colors-listener";
import { getNumberOfGroups } from "libpfpg/group-colors";

export { initRandomizeGroupColors, rememberArtworkLineStrokes };

// The artwork's own line colors, captured once at decode time from the decoded
// SVG *before* the `groupColors` override is applied.
//
// This is what 'Anchor: Original line colors' anchors to. It is captured
// unconditionally rather than from the decoded `groupColors` array: that array
// is the override, not the artwork, and capturing it conditionally — inside
// `if (groupColors)` — left this null on any URL without that key, so a
// fallback read the live value, which advances with every click, and repeated
// clicks random-walked the palette.
let artworkLineStrokes: string[] | null = null;

function rememberArtworkLineStrokes(svgString: string): void {
  artworkLineStrokes = regexMatchesOfGroupColors(svgString).map(
    (match, gId) => {
      const stroke = getStroke(match);
      if (stroke === undefined) {
        throw new Error(
          `rememberArtworkLineStrokes: no stroke for group ${gId}: ${match}`,
        );
      }
      return stroke;
    },
  );
}

function initRandomizeGroupColors(): void {
  initSpreadControls();
  initBaseColorsSelect();
  initRandomizeButtonListener();
}

// The base is only consulted when the button is pressed, so the listener exists
// to keep a stale value from being applied if the element were ever repainted.
// It deliberately does nothing else: the two dropdowns need no cross-wiring.
function initBaseColorsSelect(): void {
  const select = document.getElementById("randomization-base");
  if (select === null) {
    throw new Error(
      "initBaseColorsSelect: element not found: #randomization-base",
    );
  }
  select.addEventListener("change", () => {
    // Read on each click; nothing to do on change.
  });
}

// A thumb position alone does not make the exact value obvious, so each channel
// gets the same controls the 'Height pixel size:' setting uses: a number input
// beside the label, a slider below it, and -/+ buttons on either side of the
// slider.
function initSpreadControls(): void {
  for (const channel of SPREAD_CHANNELS) {
    const number = getNumberInput(channel);
    number.addEventListener("change", (event: Event) => {
      syncNumberAndRange(channel, event);
      // Constraint validation
      number.reportValidity();
    });
    getRangeInput(channel).addEventListener("change", (event: Event) => {
      syncNumberAndRange(channel, event);
    });
    getStepButton(channel, "dec").addEventListener("click", () => {
      adjustInputValueViaButton(channel, -1);
    });
    getStepButton(channel, "inc").addEventListener("click", () => {
      adjustInputValueViaButton(channel, 1);
    });
  }
}

// Keep the number input and the slider showing the same figure. The slider is
// the one that clamps, so its value is read back into the number box: a figure
// typed past the slider's range must not leave the two controls disagreeing.
function syncNumberAndRange(channel: string, event: Event): void {
  syncInputNumberAndRange(event.target as HTMLInputElement);
  const number = getNumberInput(channel);
  number.value = getRangeInput(channel).value;
}

function initRandomizeButtonListener(): void {
  const button = document.getElementById("randomize-colors");
  if (button === null) {
    throw new Error(
      "initRandomizeButtonListener: element not found: #randomize-colors",
    );
  }
  button.addEventListener("click", randomizeEveryGroupColor);
}

function randomizeEveryGroupColor(): void {
  const spread = readSpreadFromSliders();
  const distribution = readDistributionFromSelect();
  const colorFormat = getState("colorFormat") as string;

  const svgString = getSvgString();
  const matches = regexMatchesOfGroupColors(svgString);

  const currentStrokes = matches.map((match, gId) => {
    const stroke = getStroke(match);
    if (stroke === undefined) {
      throw new Error(
        `randomizeEveryGroupColor: could not parse a stroke at group ${gId}: ${match}`,
      );
    }
    return stroke;
  });

  if (artworkLineStrokes === null) {
    throw new Error(
      "randomizeEveryGroupColor: artwork snapshot was never taken",
    );
  }

  const anchors = resolveAnchorStrokes(
    readBaseFromSelect(),
    artworkLineStrokes,
    currentStrokes,
  );

  // Opacity and stroke-opacity are carried over untouched; only the stroke is
  // regenerated.
  const groupColorsByGroups = matches.map((match, gId) => {
    const anchor = anchors[gId];
    if (anchor === undefined) {
      throw new Error(
        `randomizeEveryGroupColor: no anchor color for group ${gId}`,
      );
    }
    return [
      undefined, // [0] = undefined, as the rest of the group-color pipeline expects
      randomizeStroke(anchor, spread, distribution, colorFormat),
      getOpacity(match), // [2] = opacity, unchanged
      getStrokeOpacity(match), // [3] = stroke-opacity, unchanged
    ];
  });

  // The sliders themselves are not written to the URL - a shared link must not
  // re-randomize - but the resulting colors are, through the same 'groupColors'
  // key a manual color change uses. Writing it before rendering means the
  // renderer sees the new colors without any extra plumbing.
  updateState(
    "groupColors",
    joinOverridesHex(groupColorsByGroups),
  );

  // The pickers hold their own colour state, so they are rebuilt from the new
  // SVG rather than patched.
  const svg = commitRender();
  generateGroupColorsHtmlElements(
    svg,
    colorFormat,
    Number(getState("opacitySteps")),
  );
  addEventListenerForGroupColorsInputs(
    getNumberOfGroups(svg),
    svg2pngOption,
    "opacity",
  );
  addEventListenerForGroupColorsInputs(
    getNumberOfGroups(svg),
    svg2pngOption,
    "stroke-opacity",
  );
}

// Join the per-group [stroke, opacity, stroke-opacity] triples into the
// compact form the 'groupColors' URL param uses.
function joinOverridesHex(
  groupColorsByGroups: Array<Array<string | number | undefined>>,
): string {
  return groupColorsByGroups
    .map((entry) => {
      const stroke = String(entry[1] ?? "");
      const hex = stroke.startsWith("#")
        ? stroke.slice(1).padEnd(6, stroke.slice(-1))
        : (stroke.match(/\d+/g) ?? []).slice(0, 3)
          .map((n) => Number(n).toString(16).padStart(2, "0"))
          .join("");
      const byte = (value: string | number | undefined) =>
        Math.round(Number(value ?? 1) * 255).toString(16).padStart(2, "0");
      return `${hex}${byte(entry[2])}${byte(entry[3])}`;
    })
    .join("_");
}

// One group's color: its anchor taken to OKLCH, perturbed around itself, and
// mapped back to sRGB. The result is emitted in whichever color format is
// currently selected, so the SVG and the pickers agree.
function randomizeStroke(
  anchor: string,
  spread: OklchSpread,
  distribution: OffsetDistribution,
  colorFormat: string,
): string {
  const rgbArr = convertToRgbArr(anchor);
  const { lightness, chroma, hue } = rgbToOklch(
    Number(rgbArr[0]),
    Number(rgbArr[1]),
    Number(rgbArr[2]),
  );

  const randomized: Oklch = randomizeOklch(
    lightness,
    chroma,
    hue,
    spread,
    distribution,
    Math.random,
  );
  const rgb = oklchToRgb(
    randomized.lightness,
    randomized.chroma,
    randomized.hue,
  );

  return colorFormat === "rgb"
    ? rgbStringify([rgb.r, rgb.g, rgb.b])
    : "#" + rgbObjToHex(rgb);
}

function readSpreadFromSliders(): OklchSpread {
  return {
    lightness: readRangeValue("lightness"),
    chroma: readRangeValue("chroma"),
    hue: readRangeValue("hue"),
  };
}

function readRangeValue(channel: string): number {
  return Number(getRangeInput(channel).value);
}

// The three OKLCH coordinates the sliders widen, in the order they are shown.
const SPREAD_CHANNELS = ["lightness", "chroma", "hue"];

function getRangeInput(channel: string): HTMLInputElement {
  return getSpreadInput(`${channel}-range`);
}

function getNumberInput(channel: string): HTMLInputElement {
  return getSpreadInput(`${channel}-number`);
}

function getStepButton(channel: string, direction: "dec" | "inc"): HTMLElement {
  const id = `${channel}-${direction}`;
  const button = document.getElementById(id);
  if (button === null) {
    throw new Error(`getStepButton: element not found: #${id}`);
  }
  return button;
}

function getSpreadInput(id: string): HTMLInputElement {
  const input = document.getElementById(id);
  if (input === null) {
    throw new Error(`getSpreadInput: element not found: #${id}`);
  }
  return input as HTMLInputElement;
}

function readDistributionFromSelect(): OffsetDistribution {
  const select = document.getElementById("randomization-distribution");
  if (select === null) {
    throw new Error(
      "readDistributionFromSelect: element not found: #randomization-distribution",
    );
  }
  return (select as HTMLSelectElement).value === "triangular"
    ? "triangular"
    : "uniform";
}

// Which set of line colors the ranges are applied around. Anything other than an
// explicit "current" is treated as "original", so an unrecognised value cannot
// silently select the drifting anchor.
function readBaseFromSelect(): BaseMode {
  const select = document.getElementById("randomization-base");
  if (select === null) {
    throw new Error(
      "readBaseFromSelect: element not found: #randomization-base",
    );
  }
  return (select as HTMLSelectElement).value === "current"
    ? "current"
    : "original";
}
