interface GoldenCandidate {
  source: string;
  target: string;
}

interface Manifest {
  cases: GoldenCandidate[];
  browserName: string;
  browserVersion: string;
  date: string;
  command: string;
}

if (import.meta.main) {
  await freezeGoldens(Deno.args);
}

async function freezeGoldens(args: string[]): Promise<void> {
  const candidateDirectory = args.find((arg) => !arg.startsWith("--"));
  if (candidateDirectory === undefined || !args.includes("--human-reviewed")) {
    throw new Error(
      "Usage: deno run --allow-read --allow-write scripts/freeze_goldens.ts <candidate-directory> --human-reviewed",
    );
  }

  const root = await Deno.realPath(candidateDirectory);
  const manifestText = await Deno.readTextFile(`${root}/manifest.json`);
  const manifest = parseManifest(manifestText);
  const targets = new Set<string>();
  const candidates: Array<{ target: string; bytes: Uint8Array }> = [];
  for (const item of manifest.cases) {
    if (!/^[a-zA-Z0-9_-]+\.svg$/.test(item.source)) {
      throw new Error(`Invalid candidate filename: ${item.source}`);
    }
    if (!/^[a-zA-Z0-9_-]+\.svg$/.test(item.target)) {
      throw new Error(`Invalid target filename: ${item.target}`);
    }
    if (targets.has(item.target)) {
      throw new Error(`Duplicate target filename: ${item.target}`);
    }
    targets.add(item.target);
    const bytes = await Deno.readFile(`${root}/${item.source}`);
    const svg = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!svg.startsWith("<svg") || !svg.includes("</svg>")) {
      throw new Error(`Candidate does not look like an SVG: ${item.source}`);
    }
    candidates.push({ target: `tests/fixtures/${item.target}`, bytes });
  }

  for (const candidate of candidates) {
    try {
      await Deno.stat(candidate.target);
      throw new Error(`Refusing to overwrite golden: ${candidate.target}`);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }

  for (const candidate of candidates) {
    const file = await Deno.open(candidate.target, {
      createNew: true,
      write: true,
    });
    try {
      let offset = 0;
      while (offset < candidate.bytes.length) {
        offset += await file.write(candidate.bytes.subarray(offset));
      }
    } finally {
      file.close();
    }
  }

  console.log(
    `Froze ${candidates.length} SVG candidates. Record provenance in tests/fixtures/README.md: ${manifest.browserName} ${manifest.browserVersion}, ${manifest.date}; ${manifest.command}`,
  );
}

function parseManifest(text: string): Manifest {
  const value: unknown = JSON.parse(text);
  if (typeof value !== "object" || value === null) {
    throw new Error("manifest.json must contain an object");
  }
  const manifest = value as Partial<Manifest>;
  if (
    !Array.isArray(manifest.cases) || manifest.cases.length === 0 ||
    typeof manifest.browserName !== "string" ||
    typeof manifest.browserVersion !== "string" ||
    typeof manifest.date !== "string" || typeof manifest.command !== "string"
  ) {
    throw new Error("manifest.json is missing cases or capture provenance");
  }
  for (const item of manifest.cases) {
    if (
      typeof item !== "object" || item === null ||
      typeof item.source !== "string" || typeof item.target !== "string"
    ) {
      throw new Error("manifest cases must have source and target filenames");
    }
  }
  return manifest as Manifest;
}
