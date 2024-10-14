import { updateBasicDataKeysCheckboxStates, parseBasicData} from 'enc-and-dec/basic-data/basic-data-enc'
export function selectFileToInput(selectFileId, textAreaId){const selectFiles = document.querySelector(`#${selectFileId}`).files
const file = selectFiles[0]
const reader = new FileReader()
reader.readAsText(file)
reader.onload = () => {document.querySelector(`#${textAreaId}`).innerHTML = reader.result
if (textAreaId === 'textarea-basic-data-uploaded') {const basicData = parseBasicData()
updateBasicDataKeysCheckboxStates(basicData)}}
reader.onerror = () => {}}