import { murmurHash3_x64_128 } from "@timepp/murmurhash";
import {
  BASIC_DATA_KEYS,
  SETTINGS_DEFAULTS,
  type SettingValue,
  VISUAL_CONFIG_DEFAULTS,
} from "constants";

export { getHashForOgImageUrl, getYearAndMonth };

/**
 * Generates a unique hash for an OG image URL by combining artwork and configuration hashes.
 *
 * @async
 * @function getHashForOgImageUrl
 * @returns {Promise<string>} A 32-character hexadecimal string representing the final hash
 */
async function getHashForOgImageUrl(): Promise<string> {
  // Hash string of artwork data and its visual config settings
  const { artwork, config } = await getOgImageData();
  console.log("artwork, config: ", artwork, config);

  const hashInputStr = JSON.stringify([artwork, config]);
  console.log("hashInputStr", hashInputStr);
  // e.g.: [[["A","08fEKQ-VoisNalNhZy9GsmZzPU"],["0","08cJqY-3JMVTyH83QAsTiL3FDTn ... ,null,"rgb","square",10,1,true,"crispEdges",256]]

  const hashBigInt = murmurHash3_x64_128(hashInputStr);
  console.log("hashBigInt", hashBigInt);
  // e.g.: 323066209079833201260614758727406931990n

  const hashHexPadded = hashBigInt.toString(16).padStart(32, "0");
  console.log("hashHexPadded", hashHexPadded);
  // e.g.: 4327a70c6f036487c22f4075c965c9e3

  return hashHexPadded;
}

function getOgImageData(): {
  artwork: string[][];
  config: Array<SettingValue | null>;
} {
  const params = new URLSearchParams(globalThis.location.search);
  console.log("params for OGP: ", params);

  const artwork: string[][] = [];

  for (const [key, value] of params) {
    if (
      !SETTINGS_DEFAULTS.has(key) &&
      !(BASIC_DATA_KEYS as readonly string[]).includes(key)
    ) { // Extract the lines data only
      artwork.push([key, value]);
    }
  }

  const config: Array<SettingValue | null> = [];
  // Exclude opacitySteps from the hash input: it describes the opacity selector's
  // step granularity rather than a rendered value, and it defaults to undefined
  // at initial load, so the same appearance could hash differently once detected.
  const visualConfigForHash = new Map(
    [...VISUAL_CONFIG_DEFAULTS].filter(([key]) => key !== "opacitySteps"),
  );
  for (const [key, defaultValue] of visualConfigForHash) {
    config.push(params.has(key) ? params.get(key) : defaultValue);
  }

  return { artwork, config };
}

function getYearAndMonth(): { yyyy: number; yyyymm: string } {
  const dt = new Date();

  const yyyy = dt.getFullYear();
  console.log("yyyy: ", yyyy); // e.g.: 2024

  const mm = ("00" + (dt.getMonth() + 1)).slice(-2); // getMonth() 関数は １月を 0 として返却するので １を加算
  console.log("mm: ", mm); // e.g.: 12

  const yyyymm = `${yyyy}${mm}`;
  console.log("yyyymm: ", yyyymm); // e.g.: 202412

  return { yyyy, yyyymm };
}
