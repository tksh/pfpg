import { getState } from "state/url-state-manager";
import {
  changeThemeColor,
  getDefaultThemeViaPrefersColorScheme,
  initThemeColorSelect,
} from "history/theme-color";

interface HistoryEntry {
  publicId: string;
  createdAt: string;
  params: string;
  imageUrl: string;
}

async function init(): Promise<void> {
  // Theme: prefer the URL param, fall back to the browser preference.
  initThemeColorSelect();
  const themeColor = getState("themeColor") ??
    getDefaultThemeViaPrefersColorScheme();
  changeThemeColor(themeColor as string);
  const themeColorSelect = document.getElementById("theme-color");
  if (themeColorSelect) {
    (themeColorSelect as HTMLSelectElement).value = themeColor as string;
  }

  await loadHistory();
}

async function loadHistory(): Promise<void> {
  const grid = document.getElementById("history-grid");
  if (!grid) throw new Error("Element 'history-grid' not found");

  let entries: HistoryEntry[];
  try {
    const response = await fetch("/api/list-history");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (
      typeof data !== "object" || data === null || !("resources" in data) ||
      !Array.isArray(data.resources)
    ) {
      throw new Error("Unexpected response shape");
    }
    entries = data.resources as HistoryEntry[];
  } catch (error) {
    grid.textContent = `Failed to load history: ${
      error instanceof Error ? error.message : error
    }`;
    return;
  }

  if (entries.length === 0) {
    grid.textContent = "No customizations recorded yet.";
    return;
  }

  grid.innerHTML = "";
  for (const entry of entries) {
    const link = document.createElement("a");
    // The stored params already start with "?"; they replay the exact
    // customization on the index page.
    link.href = `index.html${entry.params}`;
    link.title = entry.createdAt;

    const img = document.createElement("img");
    img.src = entry.imageUrl;
    img.alt = `Customized image (${entry.createdAt})`;
    img.loading = "lazy";
    img.width = 256;
    img.height = 256;

    link.appendChild(img);
    grid.appendChild(link);
  }
}

init().catch((error) => {
  console.error(error);
});
