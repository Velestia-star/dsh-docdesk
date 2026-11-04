# Changelog

## 0.2.9 — 2026-11-04

- Added reading bookmarks: press `B` or use the bookmark button in the document path bar to mark the current position. Each document keeps its own list with percent, timestamp, title and optional note.
- Added an automatic last-read position per document, saved while scrolling. When a document is reopened, a banner shows where you left off with a **Resume reading** action; the bookmark panel also has a last-read card.
- Bookmarks can be jumped to, renamed, annotated, deleted and counted; the automatic reading position can be cleared.
- Bookmark positions and notes are stored in the browser under `dsh-docdesk.bookmarks.v1`; Markdown files on disk are untouched.
- Bookmarks and the resume banner work in normal and immersive reading modes.

## 0.2.8 — 2026-11-01

- Immersive mode is now available from the library home page, not only from an open document. The home toolbar has a **沉浸 / Immersive** button.
- `F` toggles immersive mode on both the home page and the reader; `Esc` and the floating exit button still leave it.
- Switching from an immersive document to the Home tab keeps immersive mode active, so the library desktop stays full-bleed.
- The enter guard now checks that the plugin panel is visible instead of requiring an open document.

## 0.2.7 — 2026-10-31

- Moved the floating **Exit immersive** control left so it no longer overlaps the tab bar's Add files action or the right-edge scrollbar.

## 0.2.6 — 2026-10-31

Immersive full-screen reading mode.

- A new expand button in the document path bar toggles immersive mode; `F` enters/exits and `Esc` exits. A floating **Exit immersive** button stays visible while reading.
- The panel becomes a fixed `100vw × 100vh` layer at `z-index: 9999`, requests native fullscreen when the platform allows it, and falls back cleanly when it does not.
- The official host `layout.toggleSidebar()` collapses the sidebar on entry and is toggled again after leaving native fullscreen, restoring the user's sidebar state. The immersive layer covers the sidebar rail either way.
- Page scroll is locked while immersive; the previous `body`/`html` overflow and the panel geometry are restored on exit. Native fullscreen exit (for example via the browser's Esc) is synchronized with the plugin state.
- Closing the document or leaving the panel restores scroll locks and the host sidebar through the same cleanup path.

## 0.2.5 — 2026-10-31

Bulk moves from a marquee selection into folders.

- After marquee-selecting several items, right-click a selected item and pick a destination under **Put N items into**; or drag the selected group onto a folder icon.
- The whole selection (files and folders) moves together. The selected folder itself and its descendants are never offered as destinations.
- Folder move actions skip any invalid destination instead of blocking the valid items.
- Folder badges and the root list refresh immediately; a moved selection is cleared.

## 0.2.4 — 2026-10-31

Compatibility with the current DSH Host service-injection rules.

- The Host half now declares the services it uses (`webServer`, `workspaceRegistry`, `workingDirectory`, `agents`, `sessionQuery`, `workspaceFiles`), so it loads reliably in newer DSH builds. This fixes the picker's `扫描失败: HTTP 404` after a DSH update, where the routes were never registered because the Web server was not visible at apply time.
- Existing routes, list/read/resolve behavior, Mermaid asset serving and the client UI are unchanged.

## 0.2.3 — 2026-10-31

Mermaid diagrams and GFM tables in the reader.

- Fenced `mermaid` blocks now render to SVG through a bundled Mermaid 12.2.0 runtime, including Gantt timelines, `xychart-beta` charts and the usual flowchart/sequence/class/state/ER diagrams. The runtime is lazy-loaded from the plugin host, never from a CDN, and runs with Mermaid's strict security level.
- GitHub-style pipe tables render as real tables with alignment support, instead of a flattened paragraph.
- Wide Gantt timelines scroll horizontally inside their figure and show a short scroll hint; xycharts size to their content so axis labels are not clipped.
- The Mermaid runtime is vendored under `vendor/` with its MIT license.

## 0.2.2 — 2026-10-30

Marquee selection, a first-screen-aware desktop, and rendered charts.

- Right-drag on empty desktop space to draw a selection box. Selected icons can be dragged as a group and removed with `Delete` / `Backspace`, the toolbar selection pill, or the right-click menu.
- Icons can be placed anywhere in the visible first screen. The desktop grows and scrolls only after the visible slots are full; this repeats for every subsequent row.
- Fenced `chart` blocks (`chart`, `chart:bar`, `chart:line`, `chart:area`, `chart:pie`, `chart:donut`) render to SVG from JSON or simple `label,value` lines. Rendering is local; no external scripts or arbitrary code execution.
- Added a chart screenshot and chart documentation.
- Fixed the confirm dialog's Cancel label using an untranslated key.

## 0.2.1 — 2026-10-30

A fixed-grid desktop instead of free-floating icons.

- Icons snap to fixed desktop slots; every position is aligned to a 96 × 104 grid.
- Two icons can never share a slot: dropping onto an occupied slot swaps the two icons, and new icons fill the first free slot.
- When there are more icons than fit in the visible frame, the desktop scrolls vertically instead of overlapping.
- Resizing the panel reflows the grid to the new column count without overlaps.
- Removed the sunflower-spiral placement and free-form drag clamp.

## 0.2.0 — 2026-10-30

Reworked the library around explicit adds and browser-style reading.

- The library starts empty; documents are added from a workspace picker instead of being auto-listed.
- A file action and a right-click menu on delivered file cards add the file to the library.
- Icons are constrained to a fixed desktop frame; new icons are scattered on a sunflower spiral, not laid out in rows.
- Documents open full-screen with browser-style Home and document tabs; tabs can be switched and closed.
- A middle-edge sidebar handle collapses and restores the sidebar.
- Removed the auto-hide/restore and tidy controls; the library is now add-only and free-form.
- Robustness: strip a leading BOM before rendering Markdown; persist library changes synchronously.

## 0.1.0 — 2026-10-30

First public release.

- 资料区 sidebar entry and main panel.
- Workspace scan for `.md`, `.markdown` and `.mdx` files across registered workspaces, the default working directory and live agent working directories.
- Free icon placement with persisted positions.
- Virtual folders with drag-to-file and nested navigation.
- Rename files and folders; tidy the current page.
- Vertical scrolling for large libraries.
- Read-only Markdown preview with headings, lists, quotes, links and code blocks.
- Search, hide and restore.
- Bilingual UI and theme-token styling.
