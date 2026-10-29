import { adjustLayoutIfNotMobile } from "init/adjust-layout";

const TAB_STORAGE_KEY = "pfpg.activeTab";
const DEFAULT_TAB_NAME = "tab-1";

function readInitialTabName(): string {
  try {
    const storedTabName = sessionStorage.getItem(TAB_STORAGE_KEY);
    if (storedTabName !== null) {
      const storedTabPanel = document.getElementById(storedTabName);
      if (storedTabPanel?.classList.contains("tab-content")) {
        return storedTabName;
      }
    }
  } catch {
    // sessionStorage can be unavailable (for example, blocked by browser
    // settings). Tab persistence is a convenience, so fall back quietly.
  }
  return DEFAULT_TAB_NAME;
}

function rememberTabName(tabName: string): void {
  try {
    sessionStorage.setItem(TAB_STORAGE_KEY, tabName);
  } catch {
    // Never block tab switching just because persistence failed.
  }
}

function findTabLink(tabName: string): HTMLElement | null {
  const tabLinks = document.getElementsByClassName("tab-link");
  for (let i = 0; i < tabLinks.length; i++) {
    const link = tabLinks[i];
    if (link === undefined) {
      continue;
    }
    const linkElement = link as HTMLElement;
    if (linkElement.dataset.tab === tabName) {
      return linkElement;
    }
  }
  return null;
}

export function initTabs(): void {
  const tabs = document.querySelectorAll(".tab-link");
  tabs.forEach((tab) => {
    tab.addEventListener(
      "click",
      (event) => openTab(event, (tab as HTMLElement).dataset.tab),
    );
  });

  // Restore the tab that was open before the reload; fall back to the first tab.
  openTab(null, readInitialTabName());

  // Add keyboard event listener
  document.addEventListener("keydown", handleKeyPress);
}

function openTab(
  evt: Event | { currentTarget: Element } | null,
  tabName: string | undefined,
): void {
  const tabContent = document.getElementsByClassName("tab-content");
  const tabLinks = document.getElementsByClassName("tab-link");
  for (let i = 0; i < tabContent.length; i++) {
    const content = tabContent[i];
    if (content === undefined) {
      throw new Error("openTab: unreachable tab content index");
    }
    (content as HTMLElement).style.display = "none";
  }
  for (let i = 0; i < tabLinks.length; i++) {
    const link = tabLinks[i];
    if (link === undefined) {
      throw new Error("openTab: unreachable tab link index");
    }
    const linkElem = link as HTMLElement;
    linkElem.className = linkElem.className.replace(" active", "");
  }
  if (tabName === undefined) {
    throw new Error("openTab: missing tab name");
  }
  const tabPanel = document.getElementById(tabName);
  if (tabPanel === null) {
    throw new Error(`openTab: missing element #${tabName}`);
  }
  rememberTabName(tabName);
  tabPanel.style.display = "block";
  if (evt) {
    const currentTarget = evt.currentTarget as Element | null;
    if (currentTarget === null) {
      throw new Error("openTab: missing currentTarget");
    }
    currentTarget.classList.add("active"); // Add 'active' class to the clicked tab
  } else {
    // Without an event, this is a restore or initial load, so mark the
    // matching tab link as active.
    const activeTabLink = findTabLink(tabName);
    if (activeTabLink === null) {
      throw new Error(`openTab: missing .tab-link for ${tabName}`);
    }
    activeTabLink.classList.add("active");
  }
  adjustLayoutIfNotMobile("tabChanged");
}

function handleKeyPress(event: KeyboardEvent): void {
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    return;
  }

  const key = event.key.toLowerCase();
  if (key === "r") {
    event.preventDefault();
    const modal = document.getElementById("reset-settings-modal");
    if (!(modal instanceof HTMLDialogElement)) {
      throw new Error(
        "handleKeyPress: missing or invalid #reset-settings-modal",
      );
    }
    if (!modal.open) {
      modal.showModal();
    }
    return;
  }
  if (key === "e") {
    event.preventDefault();
    const randomizeButton = document.getElementById("randomize-colors");
    if (!(randomizeButton instanceof HTMLButtonElement)) {
      throw new Error(
        "handleKeyPress: missing or invalid #randomize-colors",
      );
    }
    randomizeButton.click();
    return;
  }

  const keyMap: Record<string, string> = {
    "a": "tab-1",
    "s": "tab-2",
    "d": "tab-3",
    "f": "tab-4",
  };

  if (key in keyMap) {
    event.preventDefault(); // Prevent default key behavior
    const tabName = keyMap[key];
    if (tabName === undefined) {
      throw new Error(`handleKeyPress: unknown key ${key}`);
    }
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab) {
      openTab({ currentTarget: tab }, tabName);
    }
  }
}
