import { getState } from "state/url-state-manager";

export { getImageFormat, IMAGE_FORMATS, type ImageFormat };

// Image file formats the rendered artwork can be encoded into.
// The rasterizer (`svg2ui8a`) only produces pixels, so the format is
// decided here and applied by the encoder (see `image-encoder.ts`).

type ImageFormat = "png" | "webp";

interface ImageFormatConfig {
  /** MIME type used for the preview blob, the clipboard item and the upload */
  mimeType: string;
  /** File extension without the leading dot */
  extension: string;
}

const IMAGE_FORMATS: Record<ImageFormat, ImageFormatConfig> = {
  png: { mimeType: "image/png", extension: "png" },
  webp: { mimeType: "image/webp", extension: "webp" },
};

// Read the selected format from the URL state.
// An unknown value falls back to PNG instead of failing, so a hand-edited
// URL keeps rendering. A value the encoder cannot produce is reported by
// the browser, not silently swapped here.
function getImageFormat(): ImageFormat {
  return getState("imageFormat") === "webp" ? "webp" : "png";
}
