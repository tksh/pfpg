import { parseBasicData,
         updateBasicDataKeysCheckboxStates } from 'enc-and-dec/basic-data/basic-data-enc'

export function selectFileToInput(selectButtonId, textAreaId){
    // FileListオブジェクト取得
    const selectFiles = document.querySelector(`#${selectButtonId}`).files

    // Fileオブジェクト取得
    const file = selectFiles[0]

    // FileReaderオブジェクト取得
    const reader = new FileReader()
    reader.readAsText(file)

    // ファイル読み込み完了時の処理
    reader.onload = () => {
        document.querySelector(`#${textAreaId}`).innerHTML = reader.result

        // Update checkboxes status for Basic Data decoding
        if (textAreaId === 'textarea-basic-data-uploaded') {
            // Update checkbox status based on data
            const basicData = parseBasicData()
            updateBasicDataKeysCheckboxStates(basicData)
        }
    }

    // ファイル読み込みエラー時の処理
    reader.onerror = () => {
        console.log("Failed to read the file")
    }
}
