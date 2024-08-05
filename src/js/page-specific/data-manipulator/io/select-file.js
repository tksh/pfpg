export function selectFileToInput(selectFileId, textAreaId){
    // FileListオブジェクト取得
    const selectFiles = document.querySelector(`#${selectFileId}`).files

    // Fileオブジェクト取得
    const file = selectFiles[0]

    // FileReaderオブジェクト取得
    const reader = new FileReader()
    reader.readAsText(file)

    // ファイル読み込み完了時の処理
    reader.onload = () => {
        document.querySelector(`#${textAreaId}`).innerHTML = reader.result
    }

    // ファイル読み込みエラー時の処理
    reader.onerror = () => {
        console.log("Failed to read the file")
    }
}
