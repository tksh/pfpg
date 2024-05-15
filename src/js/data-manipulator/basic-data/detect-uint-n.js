function getUintNPortrayForDec() {
  const isDataManipulatorOrIndexBool = isDataManipulatorOrIndex()

  const params = new URLSearchParams(window.location.search)

  let artworkParam = []

  if (params != 0) {                           // Decode if URL Params exists
    const paramsArray = [...params.entries()]; // entries()メソッドでキーと値のペアを取得
    artworkParam = paramsArray[0]              // e.g.: (2) ['202308_001', '31x31-9999']

  } else if (isDataManipulatorOrIndexBool === false) { // No URL Params at index.html, Get the encoded string from '<script type="text/plain"> with id
    const sampleArtworkEncodedStr = document.getElementById("sample-artwork-encoded-string").textContent
    const paramsArray = parseStrAsUrlParams(sampleArtworkEncodedStr)
    artworkParam = paramsArray[0]

  } else { // No URL Params at data-manipulator.html, Do nothing
    return null
  }

  const gridSize = artworkParam[1].split("-")[0] // e.g.: 31x31
  const splitByX = gridSize.split('x')           // e.g.: (2) ['31', '31']
  const max = Math.max(...splitByX)              // e.g.: 255
  const uintN = getUintN(max)                    // e.g.: 5 (2 の 何乗か？)
  return uintN
}


