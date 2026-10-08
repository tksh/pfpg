import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import { decodeBase64Url, encodeBase64Url } from "@std/encoding/base64url";

export {
  compressToBase64,
  compressToBlob,
  compressToEncodedURIComponent,
  decompressFromBase64,
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
