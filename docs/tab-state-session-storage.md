# Tab state (sessionStorage)

The index page remembers which customization tab was open by storing its DOM id
in `sessionStorage`. This document describes the implemented mechanism: the
storage contract, the DOM contract, the restore path, and the boundary of what
is persisted.

## Where it lives

- `src/js/page-specific/index/init/tab-setup.ts` — storage key, restore and save
  helpers, click and keyboard handling, and the `openTab()` switch.
- `src/index.html` — the `.tab-link` buttons with `data-tab="tab-N"` and the
  matching `.tab-content#tab-N` panels.
- `src/js/page-specific/index/main.ts` — calls `initTabs()` from the
  `DOMContentLoaded` handler.
- `src/js/i18n/i18n.ts` — the language selector changes the `lang` URL param and
  reloads the page. It has no knowledge of the tab storage.
- `src/js/page-specific/index/init/adjust-layout.ts` — called after each tab
  switch as `adjustLayoutIfNotMobile("tabChanged")`.

## Current tabs

| DOM id  | Link                          | Label  |
| ------- | ----------------------------- | ------ |
| `tab-1` | `.tab-link[data-tab="tab-1"]` | Lines  |
| `tab-2` | `.tab-link[data-tab="tab-2"]` | Canvas |
| `tab-3` | `.tab-link[data-tab="tab-3"]` | Render |
| `tab-4` | `.tab-link[data-tab="tab-4"]` | UI     |

`tab-5` belongs to the reset action (`#reset-icon`). It is an `.icon-tab-link`,
not a `.tab-link`, and has no `.tab-content`; it is not part of tab persistence.

## Storage contract

| Item    | Value                                                             |
| ------- | ----------------------------------------------------------------- |
| Key     | `pfpg.activeTab`                                                  |
| Value   | The active tab's DOM id: `tab-1`, `tab-2`, `tab-3`, or `tab-4`    |
| Storage | `sessionStorage`                                                  |
| Default | `tab-1` when nothing valid is stored                              |
| URL     | No `tab` query or fragment; tab state is not part of the page URL |

`sessionStorage` is scoped to the origin and the top-level browsing context. It
survives reloads and same-tab navigation, but is not shared between separate
browser tabs. Only the tab id is stored; panel settings, scroll position, and
artwork state remain in the URL or in the panel itself.

## DOM contract

A persisted tab has both:

1. a `.tab-link` whose `data-tab` is the tab id, and
2. a `.tab-content` element whose `id` is the same tab id.

The `.active` class on a `.tab-link` is the visual selection marker. The restore
check deliberately requires the target element to have the `tab-content` class,
so the reset action (`tab-5`) can never be restored as a tab even if its id is
written to storage.

## Restore and switch flow

1. `DOMContentLoaded` fires, and `main.ts` calls `initTabs()`.
2. `initTabs()` attaches click handlers to every `.tab-link`, then calls
   `openTab(null, readInitialTabName())`, then registers the keyboard handler.
3. `readInitialTabName()` reads `pfpg.activeTab`. It returns the stored id only
   when `document.getElementById(storedId)` exists and has the `tab-content`
   class; otherwise it returns `tab-1`.
4. `openTab()` hides all `.tab-content` elements, removes `active` from the tab
   links, validates the requested tab id and panel, and writes the id back with
   `rememberTabName()`.
5. `openTab()` shows the selected panel and marks the matching `.tab-link` as
   `active`. For a click or keyboard switch the clicked element is the active
   link; for restore the matching link is found by `data-tab`.
6. `adjustLayoutIfNotMobile("tabChanged")` runs after the panel is visible.

Clicks and keyboard shortcuts both go through `openTab()`, so every switch
updates the stored value. The shortcuts are `A` for Lines, `S` for Canvas, `D`
for Render, and `F` for UI.

## Language changes and reloads

The language selector is inside `tab-4`. Changing it sets the `lang` URL param
and calls `location.assign(url)`, which performs a full reload while preserving
the other URL params. The next `DOMContentLoaded` cycle runs the restore flow
above, so the page returns to the tab that was open before the language change.
Language application and tab restoration are independent: i18n controls the
document language and text, while the tab storage only controls which panel is
visible.

Because this uses `sessionStorage`, the same tab is also kept across ordinary
reloads, the Reset Settings reload, and navigation to another artwork in the
same browser tab. That broader persistence is the current behavior, not a
language-specific exception.

## Failure behavior

| Situation                                          | Behavior                                                       |
| -------------------------------------------------- | -------------------------------------------------------------- |
| No stored value                                    | Open `tab-1`.                                                  |
| Stored value is unknown or its panel is gone       | Open `tab-1`.                                                  |
| `sessionStorage.getItem()` throws                  | Ignore the error and open `tab-1`.                             |
| `sessionStorage.setItem()` throws                  | Keep the current tab open; skip persistence.                   |
| Stored panel exists but its `.tab-link` is missing | `openTab()` throws because the DOM contract is broken.         |
| `tab-5` is stored                                  | Reject it: the restore check requires `.tab-content`.          |
| A new browser tab or window is opened              | Start with an empty session storage, normally opening `tab-1`. |
| The browser tab is closed                          | Its session storage is discarded.                              |

## What is not persisted

- The tab for each artwork separately: one tab choice applies to every artwork
  opened in the same browser tab.
- Scroll position, focus, or panel-local state.
- A URL query or fragment for the tab.
- Cross-tab synchronization or `localStorage`.
- The reset action (`tab-5`) as a selectable tab.

## Adding or removing a tab

To add a tab, add a `.tab-link[data-tab="tab-N"]` and a matching
`.tab-content#tab-N`, and add a shortcut to `keyMap` in `handleKeyPress()` if
one is wanted. The restore path needs no separate allowlist: it validates the
stored id against the DOM.

Removing a tab requires no storage migration. An old stored id no longer matches
a `.tab-content`, so the next load falls back to `tab-1` and writes that value.
