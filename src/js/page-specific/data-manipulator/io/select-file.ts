export function selectFileToInput(
  selectButtonId: string,
  textAreaId: string,
): void {
  // FileListオブジェクト取得
  const inputElem = document.querySelector(`#${selectButtonId}`);
  if (inputElem === null) {
    throw new Error(`selectFileToInput: missing element #${selectButtonId}`);
  }
  const selectFiles = (inputElem as HTMLInputElement).files;
  if (selectFiles === null) {
    throw new Error(`selectFileToInput: missing files in #${selectButtonId}`);
  }

  // Fileオブジェクト取得
  const file = selectFiles[0];
  if (file === undefined) {
    throw new Error(
      `selectFileToInput: no file selected in #${selectButtonId}`,
    );
  }

  // FileReaderオブジェクト取得
  const reader = new FileReader();
  reader.readAsText(file);

  // ファイル読み込み完了時の処理
  reader.onload = () => {
    const textareaElem = document.querySelector(
      `#${textAreaId}`,
    ) as HTMLTextAreaElement | null;
    if (textareaElem === null) {
      throw new Error(`selectFileToInput: missing element #${textAreaId}`);
    }
    const result = reader.result;
    if (typeof result !== "string") {
      throw new Error(
        "selectFileToInput: expected text result from FileReader",
      );
    }
    textareaElem.value = result;
    textareaElem.dispatchEvent(new Event("input", { bubbles: true }));
  };

  // ファイル読み込みエラー時の処理
  reader.onerror = () => {
    console.log("Failed to read the file");
  };
}
