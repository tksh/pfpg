import { getSvgString } from "button/download-as-file";
import { convertToRgbArr } from "color-formatter/format-converter";
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
} from "group-colors-svg/group-colors-svg";
import { rgbStringify } from "color-formatter/normalized-from-hex";
import { rgbObjToHex } from "color-formatter/normalized-to-hex";
import { applyGroupColors } from "tab-lines/apply-group-colors";
import { getGroupColorsAsJoinedHex } from "tab-lines/encode-colors-as-hex";
import { svg2pngOption } from "state/resvg-option";
import {
  adjustInputValueViaButton,
  syncInputNumberAndRange,
} from "tab-render/sync-number-and-range";
import { getState, updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";

export { initRandomizeGroupColors, rememberArtworkLineStrokes };

// The artwork's own line colors, captured once at decode time from the decoded
// SVG *before* the `groupColors` override is applied.
//
// This is what 'Base colors: Original line colors' anchors to. It is captured
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

// `0`, `0.1`, `0.4` and `30` are not inferable from a thumb position, so each
// channel gets the same control the 'Height pixel size:' setting uses: a number
// input beside the label, a slider below it, and -/+ buttons on either side of
// the slider.
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

  // applyGroupColors() is the same multi-group rewrite the initial decode runs:
  // it rebuilds every <g> element, regenerates the pickers (the Alwan instances
  // hold their own color state and would otherwise desync from the thumbnails),
  // and re-binds the opacity selectors.
  const updatedSvg = applyGroupColors(
    svgString,
    svg2pngOption,
    groupColorsByGroups,
    getState("opacitySteps") as number,
  );

  const svgTextarea = document.querySelector("#svg-string");
  if (svgTextarea === null) {
    throw new Error(
      "randomizeEveryGroupColor: element not found: #svg-string",
    );
  }
  (svgTextarea as HTMLTextAreaElement).value = updatedSvg;

  // The sliders themselves are not written to the URL - a shared link must not
  // re-randomize - but the resulting colors are, through the same 'groupColors'
  // key a manual color change uses.
  updateState("groupColors", getGroupColorsAsJoinedHex(updatedSvg));

  executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption);
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
