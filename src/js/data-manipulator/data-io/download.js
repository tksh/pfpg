// function to download encoded url params string
// as `000_0000_31x31.txt` and `000_0000_31x31.txt.zstd`


// function getInputSvg() {

//     // <textarea>の要素を取得
//     const svgElement = document.querySelector('#input-svg') // Select <textarea id="input-svg" ...

//     // <textarea>のvalue属性を取得
//     return svgElement.value.trim() // `.trim()` = 文字列の両端の空白を削除

// }

// Get the artwork ID and gird size string
function getIdAndSize() {

    // Read from textarea
    const rawJson = readTextarea('textarea-artwork-data-uploaded')
    //console.log(rawJson)
    // {
    //     "artwork_id": "202310_002",
    //     "grid_size": "255x255",
    //     "bg_color": "#555C"
    // }

    const artworkDataObj = JSON.parse(rawJson)
    //console.log('artworkDataObj: ', artworkDataObj)
    // {artwork_id: '202310_002', grid_size: '255x255', bg_color: '#555C'}
    // artwork_id: "202310_002"
    // bg_color: "#555C"
    // grid_size: "255x255"
    // [[Prototype]]: Object

    // ID
    const artwork_id_str = artworkDataObj.artwork_id        // 202310_002

    // Size
    const grid_size_str  = artworkDataObj.grid_size

    return new Map([
        ['id', artwork_id_str],
        ['size', grid_size_str]
       ]);
}


// Download as TXT

function downloadUrlParamsAsTxt(textareaId) { // ('textarea-encoded-url-params')

    // Get text content from textarea
    const textContent = document.getElementById(textareaId).value;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;


    // Generate a the filename

    const idAndSize = getIdAndSize() // Map obj returned

    // artwork id
    const artworkId = idAndSize.get('id')

    // grid size
    const gridSizeWxH = idAndSize.get('size')

    // Set the filename
    link.download = `${artworkId}_${gridSizeWxH}.txt`;


    // Click to download
    link.click();
}
// Result:
// 106 chars
// 202304_001-strokeColor_B90000E2-backgroundColor_44FF2A99-trimmedShape_squircleSlimmed-antiAliasing_Off.svg



