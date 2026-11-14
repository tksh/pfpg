import { renderParamsToSvg } from "../src/js/libpfpg/render.ts";
import {
  normalizeScalarParams,
  readHeightPixelSize,
} from "../src/js/libpfpg/settings.ts";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";
import { svg2rgba } from "svg2ui8a";

export interface OgpRenderResult {
  key: string;
  svg: string;
  pixels: Uint8Array;
  width: number;
  height: number;
}

export class InvalidOgpParamsError extends Error {
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause), { cause });
    this.name = "InvalidOgpParamsError";
  }
}

export async function renderPipeline(
  input: URLSearchParams,
): Promise<OgpRenderResult> {
  const params = normalizeScalarParams(
    new URLSearchParams([...input.entries()].filter(([key]) => key !== "auto")),
  );

  let svg: string;
  let key: string;
  let height: number;
  try {
    svg = await renderParamsToSvg(params);
    key = await getSharedImageKeyHash(params);
    height = readHeightPixelSize(params);
  } catch (error) {
    throw new InvalidOgpParamsError(error);
  }

  const raster = await svg2rgba(svg, { height });
  return {
    key,
    svg,
    pixels: raster.pixels,
    width: raster.width,
    height: raster.height,
  };
}

export function renderFailureResponse(error: unknown): Response {
  const status = error instanceof InvalidOgpParamsError ? 400 : 500;
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }),
    { status, headers: { "content-type": "application/json" } },
  );
}
