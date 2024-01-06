// Parse the string into array of KV pairs array like decoding from URL params
function parseStrAsUrlParams(str) {
    console.log("str: ", str)
    const deleteQustion = deleteQustionAtStartIfExists(str.trim())
    const splitByAmpersand = deleteQustion.split('&')
    console.log("splitByAmpersand: ", splitByAmpersand)
    const splitByEqual = splitByAmpersand.map(entry => entry.split('='))
    return splitByEqual
}

function deleteQustionAtStartIfExists(str) {
    // 文字列の先頭が?ならば削除する
    if (str.startsWith("?")) {
        // 先頭の1文字を除いた文字列を取得する
        return str.slice(1);
    } else {
        return str
    }
}


// Test
// const strLikeUrlParams = '?202308_001=31x31-9999&0=10Y9CSIjM0hFn0qrg-RJkDWLROrn0O4DC-Tn8ByWt2FEcQVgmhbipoBva1MaH0sRfPC87mH6Xb43lEzyiuFnFYim5qG-NrEA6o5b2ftqDjKcUbkvBPpYE&0=10h9z6K7aRG1ePjlqHkklYKUEMEjGkNSz9U-PuBXfRw2WKVoIxKAjGQqxINvD-5-euxHLWATXsCg0h2I_O0nh6YXFTE891ME4&0=10W9hkhadFgzFpMPaCAgWFtWK9NpTQLkaRJyXTsAbFEc2Go9qJSLPJGy0GMRId7I_f0LShEhwr0FEhmdIZNBvHzOm2qxbsis0VGhHpleGr45ooMAoDSsos2KuhByNU7fm1E5XFyDCSL69x9XezOczD7MUUZvTpv21R5CCwroh-BBQ5wiFWtiCY-SirXjqnuykkGsGYXH8UeM2DsD9aRwk7nYQuV9HNjIdurlSOuQkyPU2nSsxYj1OVCJzcg3hlk0tJq7Y9B61&e=10Z9iSK1btqjNLbHSDcCCyxwQw46Z2u6lsVs1JWpJnOoQ-K_a47g6rOP5VDRrhnamKpXE_ttV2RTjt55gZ-3juoD_E9MUkCMjatQHZL6k8N&f=10Y9gyKycX8MI1Y9A9KXmJiccEDRpsw2JzIzNnnn3AhkNfP'
// console.log(parseStrAsUrlParams(strLikeUrlParams))
// (6) [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2)]
//     0: (2) ['202308_001', '31x31-9999']
//     1: (2) ['0', '10Y9CSIjM0hFn0qrg-RJkDWLROrn0O4DC-Tn8ByWt2FEcQVgmh…7mH6Xb43lEzyiuFnFYim5qG-NrEA6o5b2ftqDjKcUbkvBPpYE']
//     2: (2) ['0', '10h9z6K7aRG1ePjlqHkklYKUEMEjGkNSz9U-PuBXfRw2WKVoIxKAjGQqxINvD-5-euxHLWATXsCg0h2I_O0nh6YXFTE891ME4']
//     3: (2) ['0', '10W9hkhadFgzFpMPaCAgWFtWK9NpTQLkaRJyXTsAbFEc2Go9qJ…QuV9HNjIdurlSOuQkyPU2nSsxYj1OVCJzcg3hlk0tJq7Y9B61']
//     4: (2) ['e', '10Z9iSK1btqjNLbHSDcCCyxwQw46Z2u6lsVs1JWpJnOoQ-K_a4…DRrhnamKpXE_ttV2RTjt55gZ-3juoD_E9MUkCMjatQHZL6k8N']
//     5: (2) ['f', '10Y9gyKycX8MI1Y9A9KXmJiccEDRpsw2JzIzNnnn3AhkNfP']