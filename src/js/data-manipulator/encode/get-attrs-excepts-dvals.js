function getEncodedAttrsExceptsDvals() {
    return {
        widthAndCounts: encodeWidthAndCounts(),
        groupColors: encodeGroupColors()
    }
}