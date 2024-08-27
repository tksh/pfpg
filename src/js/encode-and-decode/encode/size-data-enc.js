import { jsonToMapObj }      from 'encode/json-to-map-obj'
import { calculateCanvasSize }      from 'decode/size-data-dec'


export function sizeDataEnc() {
    const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')
    /*
    Map(3) {'0' => {…}, '1' => {…}, '2' => {…}}
    [[Entries]]
        0: {"0" => Object}
        key: "0"
        value: d: {absolute: {…}, relative: {…}}
            g_id: 0
            g_opacity: 255
            g_stroke: {r: 170, g: 170, b: 170}
            g_stroke_opacity: 255
            id: (2) [0, 0]
            stroke_width: (2) [127, 127]
            [[Prototype]]: Object
        ...
    */
    const zeroIndexedGroupObj = linesDataMap.get('0')
    // const zeroIndexedGroupObj = [...linesDataMap.values()][0]
    const absDvalsObj = zeroIndexedGroupObj.d.absolute
    const { width, height } = calculateCanvasSize(absDvalsObj)

    return {
        width,
        height
    }
}