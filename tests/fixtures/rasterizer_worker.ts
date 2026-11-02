import { initSvg2rgba, svg2rgba } from "svg2ui8a";

interface Request {
  mode: "valid" | "invalid";
  wasmBytes: Uint8Array;
  svg: string;
}

interface Success {
  ok: true;
  width: number;
  height: number;
  firstPixel: number[];
}

interface Failure {
  ok: false;
  message: string;
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage: (message: Success | Failure) => void;
  close: () => void;
};

scope.onmessage = async (event) => {
  try {
    const { mode, wasmBytes, svg } = event.data;
    await initSvg2rgba({
      wasmBytes: mode === "valid" ? wasmBytes : new Uint8Array([0, 1, 2, 3]),
    });
    const result = await svg2rgba(svg, { height: 4 });
    scope.postMessage({
      ok: true,
      width: result.width,
      height: result.height,
      firstPixel: [...result.pixels.slice(0, 4)],
    });
  } catch (error) {
    scope.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    scope.close();
  }
};
