export
    { compressToEncodedURIComponent
    , decompressFromEncodedURIComponent
    }

// TextEncoderとTextDecoderを遅延初期化する

let textEncoder, textDecoder

function getTextEncoder() {
    if (!textEncoder) {
        textEncoder = new TextEncoder();
    }
    return textEncoder;
}

function getTextDecoder() {
    if (!textDecoder) {
        textDecoder = new TextDecoder();
    }
    return textDecoder;
}



/**
 * Uint8ArrayからReadableStreamを作成する関数
 *
 * @param {Uint8Array} array - 変換するUint8Array
 * @returns {ReadableStream} 作成されたReadableStream
 */
function createUpstream(array) {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(array);
            controller.close();
        }
    });
}



/**
 * 文字列を圧縮してBase64エンコードする非同期関数
 *
 * @param {string} input - 圧縮する文字列
 * @param {string} method - 圧縮方式 ("gzip", "deflate", "deflate-raw")
 * @returns {Promise<string>} Base64エンコードされた圧縮データ
 */
async function compressToBase64(input, method) {
    const textEncoder = getTextEncoder()
    const upstream = createUpstream(textEncoder.encode(input));
    const compression = new CompressionStream(method);
    const stream = upstream.pipeThrough(compression);
    const compressed = await new Response(stream).arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

/**
 * Base64エンコードされた圧縮データを解凍する非同期関数
 *
 * @param {string} input - Base64エンコードされた圧縮データ
 * @param {string} method - 圧縮方式 ("gzip", "deflate", "deflate-raw")
 * @returns {Promise<string>} 解凍されたテキストデータ
 */
async function decompressFromBase64(input, method) {
    const textDecoder = getTextDecoder()
    const compressedBytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
    const upstream = createUpstream(compressedBytes);
    const decompression = new DecompressionStream(method);
    const stream = upstream.pipeThrough(decompression);
    const decompressed = await new Response(stream).arrayBuffer();
    return textDecoder.decode(decompressed);
}

/**
 * 文字列を圧縮し、URIコンポーネントとして安全な形式にエンコードする非同期関数
 *
 * @param {string} input - 圧縮してエンコードする文字列
 * @param {string} method - 圧縮方式 ("gzip", "deflate", "deflate-raw")
 * @returns {Promise<string>} 圧縮され、URIコンポーネントとして安全な形式にエンコードされた文字列
 */
async function compressToEncodedURIComponent(input, method) {
    const withBase64 = await compressToBase64(input, method);
    return withBase64
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

/**
 * URIコンポーネントとして安全な形式でエンコードされた圧縮文字列を解凍する非同期関数
 *
 * @param {string} input - 解凍する圧縮されたURIコンポーネント文字列
 * @param {string} method - 圧縮方式 ("gzip", "deflate", "deflate-raw")
 * @returns {Promise<string>} 解凍された元の文字列
 */
async function decompressFromEncodedURIComponent(input, method) {
    let base64 = input
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    return decompressFromBase64(base64, method);
}





/*

// 圧縮サイクル（圧縮→解凍→検証）をテストし、パフォーマンスを分析する非同期関数
// @param {string} str - テストする文字列

async function validateCompressionCycle(str) {
    const methods = ["gzip", "deflate", "deflate-raw"];

    console.log("Original string:", str);
    console.log("Original string length:", str.length, "characters");
    console.log("Original string size:", new Blob([str]).size, "bytes");

    for (const method of methods) {
        console.log(`\nTesting compression method: ${method}`);
        try {
            console.log("Compressing...");
            const compressed = await compressToEncodedURIComponent(str, method);

            console.log("Compressed and encoded result:");
            console.log(compressed);
            console.log("Compressed string length:", compressed.length, "characters");
            const compressedSize = new Blob([compressed]).size;
            console.log("Compressed string size:", compressedSize, "bytes");

            const compressionRatio = (compressedSize / new Blob([str]).size * 100).toFixed(2);
            console.log("Compression ratio:", Number(compressionRatio) + " %");

            console.log("Decompressing...");
            const decompressed = await decompressFromEncodedURIComponent(compressed, method);
            console.log("Decompressed string length:", decompressed.length, "characters");
            console.log("Decompressed string size:", new Blob([decompressed]).size, "bytes");

            console.log("Verifying...");
            if (str === decompressed) {
                console.log("SUCCESS: The decompressed string matches the original string.");
            } else {
                console.log("FAILURE: The decompressed string does not match the original string.");
                console.log("First difference at position:", firstDifferenceIndex(str, decompressed));
            }
        } catch (error) {
            console.error(`An error occurred during the test with method ${method}:`, error);
        }
    }
}

// 文字列の違いを見つける補助関数
function firstDifferenceIndex(str1, str2) {
    const minLength = Math.min(str1.length, str2.length);
    for (let i = 0; i < minLength; i++) {
        if (str1[i] !== str2[i]) {
            return i;
        }
    }
    if (str1.length !== str2.length) {
        return minLength;
    }
    return -1; // 文字列が完全に一致
}



// テストの実行
const testString = 'A portrait of a woman based on an image from the Unsplash website';

validateCompressionCycle(testString).then(() => {
    console.log("All compression method tests completed");
}).catch((error) => {
    console.error("Test failed:", error);
});

*/