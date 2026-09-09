import { isOnDataManipulatorPage } from "common-utils/select-output-textarea";
import { showProcessingTime } from "common-utils/show-processing-time";
import { outputToTextarea } from "common-utils/output-to-textarea";
import { decodeUrlToSvg, type PathMode } from "@tksh/stln-codec";
import { getUrlParamsExceptsStates } from "common-utils/read-url-params";
import {
  encodeBasicDataHandler,
  encodeBestMixHandler,
  encodeBigint64Handler,
  encodeBruteforce53Handler,
  encodeFour16Handler,
  encodeSwap63Handler,
  parseBasicDataFromTextarea,
  updateBasicDataKeysCheckboxStates,
  updateEncodingMethodsCheckboxStates,
} from "data-manipulator/encode-adapters";
import { mergeBasicDataAndLinesData } from "io/download-url-params";
import { setupCopyButtons } from "io/copy-textarea";
import { selectFileToInput } from "io/select-file";

// Decode from url params to SVG when page loaded.
// If there is no url params at index.html, Decode from sample hidden text.

const isDataManipulatorPage = isOnDataManipulatorPage();

// Decode via stln-codec, preserving the verification display:
// relative- and absolute-style SVGs into each textarea with size ratios.
if (globalThis.location.search) {
  for (const isRelative of [true, false]) {
    const pathMode: PathMode = isRelative
      ? "relativeMerged"
      : "absoluteSeparated";
    const startTime = performance.now();
    const { svg: svgString } = await decodeUrlToSvg(
      getUrlParamsExceptsStates(),
      { pathMode },
    );

    const postfix = isRelative ? "rel" : "abs";
    const outputTextareaId = isRelative
      ? "textarea-decoded-svg-as-rel"
      : "textarea-decoded-svg-as-abs";
    outputToTextarea(svgString, outputTextareaId);

    // Compare the data size of url params and generated SVG
    const queryString = globalThis.location.search;
    const compRatio = queryString.length / svgString.length;
    const resultTextElem = document.getElementById(
      `encoded-size-compare-for-${postfix}`,
    );
    if (resultTextElem === null) {
      throw new Error(`missing element #encoded-size-compare-for-${postfix}`);
    }
    const text =
      `Size of url params: <b>${queryString.length}</b> characters (bytes)<br>
        Size of SVG string: <b>${svgString.length}</b> characters (bytes)<br>
        Ratio: ${queryString.length} / ${svgString.length} = <b>${compRatio}</b>`;
    resultTextElem.innerHTML = text;

    const endTime = performance.now();
    const elapsedTime = Math.floor(endTime - startTime);
    showProcessingTime(
      "SVG decoding",
      elapsedTime,
      `encoded-lines-data-time-for-${postfix}`,
      isDataManipulatorPage,
    );
  }
}

// Attach event listener

function initEncodeButtons(
  buttonId: string,
  functionName: () => void | Promise<void>,
): void {
  const buttonElem = document.getElementById(`${buttonId}`);
  if (buttonElem === null) {
    throw new Error(`initEncodeButtons: missing element #${buttonId}`);
  }
  buttonElem.addEventListener("click", functionName);
}

function initUploadButtons(inputId: string, textareaId: string): void {
  const fileInput = document.getElementById(inputId);
  if (fileInput === null) {
    throw new Error(`initUploadButtons: missing element #${inputId}`);
  }
  fileInput.addEventListener("change", function (): void {
    selectFileToInput(inputId, textareaId);
  });
}

function initBasicDataTextarea(): void {
  const textareaElem = document.getElementById("textarea-basic-data-uploaded");
  if (textareaElem === null) {
    throw new Error(
      "initBasicDataTextarea: missing element #textarea-basic-data-uploaded",
    );
  }
  textareaElem.addEventListener("input", async () => {
    const basicData = parseBasicDataFromTextarea();
    updateBasicDataKeysCheckboxStates(basicData);
    await updateEncodingMethodsCheckboxStates(basicData);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Buttons to upload
  initUploadButtons("select-file-basic-data", "textarea-basic-data-uploaded");
  initUploadButtons("select-file-lines-data", "textarea-lines-data-uploaded");
  initUploadButtons(
    "select-file-agg-data-for-comp",
    "textarea-agg-data-for-comp-uploaded",
  );

  // Buttons to encode
  initEncodeButtons("encode-basic-data", encodeBasicDataHandler);
  initEncodeButtons(
    "encode-lines-data-via-bruteforce53",
    encodeBruteforce53Handler,
  );
  initEncodeButtons("encode-lines-data-via-bigint64", encodeBigint64Handler);
  initEncodeButtons("encode-lines-data-via-swap63", encodeSwap63Handler);
  initEncodeButtons("encode-lines-data-via-four16", encodeFour16Handler);
  initEncodeButtons("encode-lines-data-via-best-mix", encodeBestMixHandler);

  // Buttons to merge
  initEncodeButtons(
    "button-to-merge-as-url-params",
    mergeBasicDataAndLinesData,
  );

  // Buttons to copy the text value of textarea of
  //   - 'Encoded url params',
  //   - 'Decode SVG String (relative)' and
  //   - 'Decode SVG String (absolute)'
  setupCopyButtons();

  // Initialize checkbox status based on pre-inputted sample Basic Data json
  const basicData = parseBasicDataFromTextarea();
  updateBasicDataKeysCheckboxStates(basicData);
  await updateEncodingMethodsCheckboxStates(basicData);

  // textarea of Basic Data
  initBasicDataTextarea();
});
