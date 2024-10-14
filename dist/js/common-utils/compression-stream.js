export
{ compressToEncodedURIComponent, decompressFromEncodedURIComponent}
let textEncoder, textDecoder
function getTextEncoder() {if (!textEncoder) {textEncoder = new TextEncoder()}
return textEncoder}
function getTextDecoder() {if (!textDecoder) {textDecoder = new TextDecoder()}
return textDecoder}
function createUpstream(array) {return new ReadableStream({start(controller) {controller.enqueue(array)
controller.close()}})}
async function compressToBase64(input, method) {const textEncoder = getTextEncoder()
const upstream = createUpstream(textEncoder.encode(input))
const compression = new CompressionStream(method)
const stream = upstream.pipeThrough(compression)
const compressed = await new Response(stream).arrayBuffer()
return btoa(String.fromCharCode(...new Uint8Array(compressed)))}
async function decompressFromBase64(input, method) {const textDecoder = getTextDecoder()
const compressedBytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0))
const upstream = createUpstream(compressedBytes)
const decompression = new DecompressionStream(method)
const stream = upstream.pipeThrough(decompression)
const decompressed = await new Response(stream).arrayBuffer()
return textDecoder.decode(decompressed)}
async function compressToEncodedURIComponent(input, method) {const withBase64 = await compressToBase64(input, method)
return withBase64
.replace(/\+/g, "-")
.replace(/\//g, "_")
.replace(/=+$/, "")}
async function decompressFromEncodedURIComponent(input, method) {let base64 = input
.replace(/-/g, "+")
.replace(/_/g, "/")
while (base64.length % 4) {base64 += "="}
return decompressFromBase64(base64, method)}