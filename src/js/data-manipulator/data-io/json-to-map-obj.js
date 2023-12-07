function jsonToMapObj(textareaId) {

    const jsonString = readTextarea(`${textareaId}`)

    const jsonObject = JSON.parse(jsonString);
    const map = new Map(Object.entries(jsonObject));

    return map
}
