import { FLAGS_MAP } from "constants";
import { zip } from "@std/collections/zip";

// For best mix [2|3] encoding by each group
export function showBestMixResult(
  dataToShow: Map<string, Array<string | number>>,
  textareaId: string,
): void {
  // Generate text content
  const entireGroupInfo: string[] = [
    ["Group ID", " Length of string", " Compression method", " Encoding method"]
      .join(","),
  ];
  let totalLength = 0;

  // Transpose the data as each array represents each group's result info.
  const transposed = zip(...Array.from(dataToShow.values()));

  // Generate the text contents of encoded result, by group.
  transposed.map((v) => {
    totalLength += Number(v[2]);
    // const lengthPadded = v[2].toString().padStart(6, ' ').replace(/ /g, '&nbsp')
    const compressionMethodName = FLAGS_MAP.get("rev_1st")?.get(`${v[4]}`); // flag => name
    const encodingMethodName = FLAGS_MAP.get("rev_2nd")?.get(`${v[5]}`); // flag => name
    entireGroupInfo.push(
      `${v[0]}, ${v[2]}, ${compressionMethodName}, ${encodingMethodName} `,
    );
  });

  // Output to html
  totalLength += transposed.length - 1; // Add the value of (group number - 1) for counting '&' sign chars
  const totalLengthText =
    "Result length of Lines Data encoding via bestMixEnc(): " + totalLength +
    " characters (bytes)"; // Total size
  const detailsByGroups = "Details by groups:";
  const joined = totalLengthText + "<br><br>" + detailsByGroups + "<br>" +
    entireGroupInfo.join("<br>");
  const outputTextElem = document.getElementById(textareaId);
  if (outputTextElem === null) {
    throw new Error(`showBestMixResult: missing element #${textareaId}`);
  }
  outputTextElem.innerHTML = joined;
}
