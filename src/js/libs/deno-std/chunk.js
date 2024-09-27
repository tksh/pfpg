// Convert to Javascript from Deno standard library chunk.ts

// https://github.com/denoland/deno_std/blob/main/collections/chunk.ts
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

export function chunk(array, size) {
    if (size <= 0 || !Number.isInteger(size)) {
        throw new Error(
            `Expected size to be an integer greater than 0 but found ${size}`,
        )
    }

    if (array.length === 0) {
        return []
    }

    const ret = Array.from({ length: Math.ceil(array.length / size) })
    let readIndex = 0
    let writeIndex = 0

    while (readIndex < array.length) {
        ret[writeIndex] = array.slice(readIndex, readIndex + size)

        writeIndex += 1
        readIndex += size
    }

    return ret
}

// Test
// const array = [1, 2, 3, 4, 5, 6, 7, 8]
// const size = 3
// const result = chunk(array, size)
// console.log(result) // [[1, 2, 3], [4, 5, 6], [7, 8]]

// console.log(chunk("357956327150778", size)); ['357', '956', '327', '150', '778']
// console.log(chunk("01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710", 2))
// (76) ['01', '04', '07', '06', '08', '07', '19', '25', '24', '28', '30', '17', '04', '22', '26', '22', '22', '23', '23', '00', '00', '00', '15', '20', '05', '00', '00', '15', '00', '00', '28', '24', '00', '11', '16', '19', '22', '08', '01', '04', '06', '10', '08', '11', '24', '26', '24', '28', '30', '20', '08', '24', '23', '22', '24', '31', '26', '26', '25', '23', '21', '23', '00', '05', '24', '22', '25', '27', '31', '22', '09', '17', '20', '23', '27', '10']
// console.log(chunk("001004007006008007019025024028030017004022026022022023023", 3))
// (19) ['001', '004', '007', '006', '008', '007', '019', '025', '024', '028', '030', '017', '004', '022', '026', '022', '022', '023', '023']
