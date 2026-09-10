import { decodeBase64, encodeBase64 } from "jsr:@std/encoding/base64";
import { decodeBase64Url, encodeBase64Url } from "jsr:@std/encoding/base64url";

export {
  compressToBlob,
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
};

// TextEncoderとTextDecoderを遅延初期化する

let textEncoder: TextEncoder | undefined;
let textDecoder: TextDecoder | undefined;

function getTextEncoder(): TextEncoder {
  if (!textEncoder) {
    textEncoder = new TextEncoder();
  }
  return textEncoder;
}

function getTextDecoder(): TextDecoder {
  if (!textDecoder) {
    textDecoder = new TextDecoder();
  }
  return textDecoder;
}

// Start pulling before writing: the transform applies backpressure, so
// awaiting the write with an idle read side deadlocks.
async function runThrough(
  data: Uint8Array<ArrayBuffer>,
  transform: CompressionStream | DecompressionStream,
): Promise<ArrayBuffer> {
  const result = new Response(transform.readable).arrayBuffer();
  const writer = transform.writable.getWriter();
  await writer.write(data);
  await writer.close();
  return await result;
}

/**
 * 文字列を CompressionStream で圧縮し Blob を返す非同期関数
 *
 * @param input - 圧縮する文字列
 * @param method - 圧縮方式 ("gzip", "deflate", "deflate-raw", "brotli")
 * @param mimeType - Blob の MIME type
 * @returns 圧縮されたデータ
 */
async function compressToBlob(
  input: string,
  method: string,
  mimeType = "application/octet-stream",
): Promise<Blob> {
  const textEncoder = getTextEncoder();
  const buffer = await runThrough(
    textEncoder.encode(input),
    new CompressionStream(method as CompressionFormat),
  );
  return new Blob([buffer], { type: mimeType });
}

/**
 * 文字列を圧縮してBase64エンコードする非同期関数
 *
 * @param input - 圧縮する文字列
 * @param method - 圧縮方式 ("gzip", "deflate", "deflate-raw", "brotli")
 * @returns Base64エンコードされた圧縮データ
 */
async function compressToBase64(
  input: string,
  method: string,
): Promise<string> {
  const buffer = await runThrough(
    getTextEncoder().encode(input),
    new CompressionStream(method as CompressionFormat),
  );
  const compressed = new Uint8Array(buffer);
  return encodeBase64(compressed);
}

/**
 * Base64エンコードされた圧縮データを解凍する非同期関数
 *
 * @param input - Base64エンコードされた圧縮データ
 * @param method - 圧縮方式 ("gzip", "deflate", "deflate-raw", "brotli")
 * @returns 解凍されたテキストデータ
 */
async function decompressFromBase64(
  input: string,
  method: string,
): Promise<string> {
  const textDecoder = getTextDecoder();
  const compressedBytes = decodeBase64(input);
  const buffer = await runThrough(
    compressedBytes,
    new DecompressionStream(method as CompressionFormat),
  );
  return textDecoder.decode(buffer);
}

/**
 * 文字列を圧縮し、URIコンポーネントとして安全な形式にエンコードする非同期関数
 *
 * @param input - 圧縮してエンコードする文字列
 * @param method - 圧縮方式 ("gzip", "deflate", "deflate-raw", "brotli")
 * @returns 圧縮され、URIコンポーネントとして安全な形式にエンコードされた文字列
 */
async function compressToEncodedURIComponent(
  input: string,
  method: string,
): Promise<string> {
  const buffer = await runThrough(
    getTextEncoder().encode(input),
    new CompressionStream(method as CompressionFormat),
  );
  const compressed = new Uint8Array(buffer);
  return encodeBase64Url(compressed);
}

/**
 * URIコンポーネントとして安全な形式でエンコードされた圧縮文字列を解凍する非同期関数
 *
 * @param input - 解凍する圧縮されたURIコンポーネント文字列
 * @param method - 圧縮方式 ("gzip", "deflate", "deflate-raw", "brotli")
 * @returns 解凍された元の文字列
 */
async function decompressFromEncodedURIComponent(
  input: string,
  method: string,
): Promise<string> {
  const compressedBytes = decodeBase64Url(input);
  const buffer = await runThrough(
    compressedBytes,
    new DecompressionStream(method as CompressionFormat),
  );
  return getTextDecoder().decode(buffer);
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
