import { BASIC_DATA_KEYS } from "constants";
import { outputToTextarea } from "common-utils/output-to-textarea";
import { readTextarea } from "common-utils/read-textarea";
import { isOnDataManipulatorPage } from "common-utils/select-output-textarea";
import { showProcessingTime } from "common-utils/show-processing-time";
import { showStringSize } from "encode/show-result";
import { showBestMixResult } from "encode/show-best-mix-result";
import {
  type BasicData,
  type BasicDataKey,
  bestMixEncode,
  defaultMethodsForUintN,
  encodeBasicData as encodeBasicDataWithCodec,
  type EncodedGroup,
  encodeGroupColors,
  encodeGroupsBigint64,
  encodeGroupsBruteforce53,
  encodeGroupsFour16,
  encodeGroupsSwap63,
  encodeWidthsAndCounts,
  ENCODING_METHOD_FLAGS,
  type EncodingMethodName,
  joinWithAmpersand,
  type MethodEncodeArgs,
  parseAggregatedLinesData,
  parseBasicData as parseBasicDataWithCodec,
  parseLinesData,
  tryDecompress,
} from "@tksh/stln-codec";

export {
  encodeBasicDataHandler,
  encodeBestMixHandler,
  encodeBigint64Handler,
  encodeBruteforce53Handler,
  encodeFour16Handler,
  encodeSwap63Handler,
  parseBasicDataFromTextarea,
  updateBasicDataKeysCheckboxStates,
  updateEncodingMethodsCheckboxStates,
};

// DOM-facing handlers for the data-manipulator encoding buttons.
// Pure codec work lives in stln-codec; this module only translates
// textareas/checkboxes to library inputs and results back to the page.

// Parse the basic-data JSON from its textarea (throws on invalid JSON).
function parseBasicDataFromTextarea(): BasicData {
  return parseBasicDataWithCodec(
    JSON.parse(readTextarea("textarea-basic-data-uploaded")),
  );
}

function getCheckedIncludes(): BasicDataKey[] {
  return Array.from(
    document.querySelectorAll(
      '#basic-data-options input[type="checkbox"]:checked',
    ),
  )
    .map((cb) =>
      (cb as HTMLInputElement).id.replace("include-", "") as BasicDataKey
    );
}

function encodeBasicDataHandler(): void {
  const startTime = performance.now();
  const functionName = "encodeBasicData()";

  const data = parseBasicDataFromTextarea();
  const dataAsUrlParams = encodeBasicDataWithCodec(data, {
    include: getCheckedIncludes(),
  });

  outputToTextarea(dataAsUrlParams, "textarea-basic-data-encoded");
  showStringSize(functionName, dataAsUrlParams, "encoded-basic-data-size");

  const endTime = performance.now();
  const elapsedTime = Math.floor(endTime - startTime);
  showProcessingTime(
    functionName,
    elapsedTime,
    "encoded-basic-data-time",
    isOnDataManipulatorPage(),
  );
}

function updateBasicDataKeysCheckboxStates(basicData: BasicData): void {
  BASIC_DATA_KEYS.forEach((key) => {
    if (key !== "bits") { // Skip 'bits' as it's always required
      const checkboxElem = document.getElementById(`include-${key}`);
      if (checkboxElem === null) {
        throw new Error(
          `updateBasicDataKeysCheckboxStates: missing element #include-${key}`,
        );
      }
      const checkbox = checkboxElem as HTMLInputElement;
      const label = checkbox.nextElementSibling;
      if (label === null) {
        throw new Error(
          `updateBasicDataKeysCheckboxStates: missing label for #include-${key}`,
        );
      }

      if (!(key in basicData) || basicData[key] === "") {
        checkbox.checked = false;
        checkbox.disabled = true;
        label.textContent = `${key} (value not found in JSON)`;
      } else {
        checkbox.checked = true;
        checkbox.disabled = false;
        label.textContent = key;
      }
    }
  });
}

// Shared inputs for the lines-data method encoders.
async function getMethodEncodeArgs(): Promise<MethodEncodeArgs> {
  const basicData = parseBasicDataFromTextarea();
  const uintN = Number(await tryDecompress(basicData.bits));
  const lines = parseLinesData(
    JSON.parse(readTextarea("textarea-lines-data-uploaded")),
  );
  const agg = parseAggregatedLinesData(
    JSON.parse(readTextarea("textarea-agg-data-for-comp-uploaded")),
  );
  return {
    lines,
    agg,
    uintN,
    widthsAndCounts: encodeWidthsAndCounts(agg),
    groupColors: encodeGroupColors(lines),
  };
}

function showLinesDataResult(
  encodingMethodName: string,
  startTime: number,
  byGroups: Map<number, EncodedGroup>,
): void {
  const joined = joinWithAmpersand(
    new Map<number, string>(
      [...byGroups].map((
        [gId, group],
      ): [number, string] => [gId, group.kvPair]),
    ),
  );
  outputToTextarea(joined, "textarea-lines-data-encoded");
  showStringSize(
    `Lines Data encoding via '${encodingMethodName}Enc()'`,
    joined,
    "encoded-lines-data-size",
  );

  const endTime = performance.now();
  const elapsedTime = Math.floor(endTime - startTime);
  showProcessingTime(
    `${encodingMethodName}Enc()`,
    elapsedTime,
    "encoded-lines-data-time",
    isOnDataManipulatorPage(),
  );
}

async function encodeBruteforce53Handler(): Promise<void> {
  const startTime = performance.now();
  showLinesDataResult(
    "bruteforce53",
    startTime,
    await encodeGroupsBruteforce53(await getMethodEncodeArgs()),
  );
}

async function encodeBigint64Handler(): Promise<void> {
  const startTime = performance.now();
  showLinesDataResult(
    "bigint64",
    startTime,
    await encodeGroupsBigint64(await getMethodEncodeArgs()),
  );
}

async function encodeSwap63Handler(): Promise<void> {
  const startTime = performance.now();
  showLinesDataResult(
    "swap63",
    startTime,
    await encodeGroupsSwap63(await getMethodEncodeArgs()),
  );
}

async function encodeFour16Handler(): Promise<void> {
  const startTime = performance.now();
  showLinesDataResult(
    "four16",
    startTime,
    await encodeGroupsFour16(await getMethodEncodeArgs()),
  );
}

// Method ids in legacy ENCODING_METHODS order (also the tie-break order).
const ENCODING_IDS: EncodingMethodName[] = [
  "bruteforce53",
  "bigint64",
  "swap63",
  "four16",
];

function getCheckedEncodingMethodNames(): EncodingMethodName[] {
  return ENCODING_IDS
    .filter((id) => {
      const checkboxElem = document.getElementById(`apply-${id}`);
      if (checkboxElem === null) {
        throw new Error(
          `getCheckedEncodingMethodNames: missing element #apply-${id}`,
        );
      }
      return (checkboxElem as HTMLInputElement).checked;
    });
}

async function encodeBestMixHandler(): Promise<void> {
  const checkedMethodNames = getCheckedEncodingMethodNames();
  const args = await getMethodEncodeArgs();
  const { params: shortestJoined, byGroup: shortestByGroups } =
    await bestMixEncode(args, checkedMethodNames);

  outputToTextarea(shortestJoined, "textarea-lines-data-encoded");
  const inputDataTitle = `Lines Data encoding via 'bestMixEnc()' includes ${
    checkedMethodNames.join(", ")
  }`;
  showStringSize(inputDataTitle, shortestJoined, "encoded-lines-data-size");
  showBestMixResult(
    detailsByGroups(shortestByGroups),
    "encoded-lines-data-size",
  );
  // Clear the processing time display
  const timeElem = document.getElementById("encoded-lines-data-time");
  if (timeElem === null) {
    throw new Error(
      "encodeBestMixHandler: missing element #encoded-lines-data-time",
    );
  }
  timeElem.innerHTML = "";
}

// Per-group table for showBestMixResult, shaped like the legacy
// showDetailsByGroups() output (parallel arrays per attribute).
function detailsByGroups(
  byGroups: Map<number, EncodedGroup>,
): Map<string, Array<string | number>> {
  const keys = [...byGroups.keys()];
  const kvPairs = [...byGroups.values()].map((group) => group.kvPair);
  const methods = [...byGroups.values()].map((group) => group.method);
  const colors: string[] = [];
  const lengths: number[] = [];
  const flags: string[] = [];
  const flag1s: string[] = [];
  for (const kvPair of kvPairs) {
    const sepIndex = kvPair.indexOf("=");
    if (sepIndex === -1) {
      throw new Error(
        `detailsByGroups: malformed kvPair without "=": ${kvPair}`,
      );
    }
    colors.push(kvPair.slice(0, sepIndex));
    lengths.push(kvPair.length);
    const flag = kvPair.slice(sepIndex + 1);
    flags.push(flag);
    const flag1 = flag[0];
    if (flag1 === undefined) {
      throw new Error(
        `detailsByGroups: malformed kvPair with empty flag: ${kvPair}`,
      );
    }
    flag1s.push(flag1);
  }
  return new Map<string, Array<string | number>>([
    ["gId", keys],
    ["colors", colors],
    ["length", lengths],
    ["flags", flags],
    ["flag1", flag1s],
    ["flag2", methods.map((method) => ENCODING_METHOD_FLAGS[method])],
  ]);
}

// Checkboxes to enable each encoding method (gated by grid size).
async function updateEncodingMethodsCheckboxStates(
  basicData: BasicData,
): Promise<void> {
  const uintN = Number(await tryDecompress(basicData.bits));
  const available = defaultMethodsForUintN(uintN);

  for (const id of ENCODING_IDS) {
    const checkboxElem = document.getElementById(`apply-${id}`);
    if (checkboxElem === null) {
      throw new Error(
        `updateEncodingMethodsCheckboxStates: missing element #apply-${id}`,
      );
    }
    const checkbox = checkboxElem as HTMLInputElement;
    const enabled = available.includes(id);
    checkbox.checked = enabled;
    checkbox.disabled = !enabled;
  }
}
