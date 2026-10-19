import { adjustLayoutIfNotMobile } from "init/adjust-layout";

export function initTabs(): void {
  const tabs = document.querySelectorAll(".tab-link");
  tabs.forEach((tab) => {
    tab.addEventListener(
      "click",
      (event) => openTab(event, (tab as HTMLElement).dataset.tab),
    );
  });

  // Open the first tab when the page loads
  openTab(null, "tab-1");

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
  tabPanel.style.display = "block";
  if (evt) {
    const currentTarget = evt.currentTarget as Element | null;
    if (currentTarget === null) {
      throw new Error("openTab: missing currentTarget");
    }
    currentTarget.classList.add("active"); // Add 'active' class to the clicked tab
  } else {
    // If no event, then it's the initial load, so manually set the first tab link as active
    const firstTabLink = document.querySelector(".tab-link");
    if (firstTabLink === null) {
      throw new Error("openTab: missing element .tab-link");
    }
    firstTabLink.classList.add("active");
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
