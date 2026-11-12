# Changelog

## 0.6.2 — 2026-11-12

- Image zoom now sizes against the fitted image instead of the stage width, and the image never flex-shrinks: 20%–600% behaves correctly in both the inline stage and the full-screen layer, zooming out actually shrinks small images, and 600% is reachable for large ones. The fit is re-measured on load, stage resize and full-screen entry/exit.
- The full-screen layer can be dismissed by clicking the backdrop or hint area as well as the image, Enter/Space or Esc; the hint no longer swallows clicks, double-clicking the inline image no longer opens and immediately closes the layer, and the image is keyboard-focusable with focus moved into the layer and restored on exit.
- The image header no longer flashes the previous document's **External** tag and Download action while loading; loading and error cards keep the panel's horizontal padding; Esc now closes overlays before the full-screen layer.
- Removed 16 unused locale keys.

## 0.6.1 — 2026-11-12

- Hidden files (`.env`, `.github`, `.vscode`, …) are no longer listed by the picker, and `read` now rejects hidden dot-segments exactly like `file` and `site` already did; `site` also checks the resolved target, closing the symlink-to-hidden-file gap.
- The fence now rejects the common forwarding headers too (`Forwarded`, `X-Real-IP`, `X-Forwarded-Host`, `X-Forwarded-Proto`), matching the README.
- The image viewer keeps separate refs for the inline stage and the full-screen layer, so Shift+wheel zoom keeps working after entering and leaving full screen.
- The built-in guide now describes click-to-full-screen instead of the old actual-size toggle.
- The external-text fallback truncates on UTF-8 bytes (2 MB), matching the host reader and the README.
- `resolve` answers 405 for non-GET/HEAD requests, like the other routes.
- `read` accepts file names that merely start with `..` (for example `..notes.txt`); only real parent traversal counts as outside the workspace.
- README: `read` is described as returning text content or non-text preview metadata.

## 0.6.0 — 2026-11-12

- Fixed Shift+wheel zoom after entering the image full-screen layer. Windows browsers report Shift+wheel as a horizontal delta (`deltaX`), so the zoom now falls back to `deltaX` when `deltaY` is zero; zooming works in both the inline stage and the full-screen layer.
- Simplified and calmed the image page: a compact header shows the file name, type, size and an **External** tag instead of the long absolute path bar and its notice banner; the image sits on a quiet stage with one hint pill, and the full-screen layer is just the image plus an Esc/click hint.
- Removed the **Reveal** path-bar action, its Host route and its metadata: it could not reliably reach the desktop file manager, and the operating system already offers the same thing from the copied path.
- The image page no longer shows the workspace notice banner; external files carry an **External** tag instead. The full path stays in the filename tooltip and in **Copy**.

## 0.5.2 — 2026-11-12

- Clicking an image now opens it in a full-screen layer instead of switching to actual size. The layer is positioned inside the panel, so in immersive mode it fills the whole screen, while in the normal layout it fills the library panel. Click the image again, press <kbd>Esc</kbd>, or use the floating **Exit full screen** button to leave.
- Shift+wheel keeps zooming (20%–600%) inside the full-screen layer, the current percentage and the exit hint sit at the bottom, and entering/exiting does not disturb the image scale you had set.
- The in-app guide, both READMEs, the plugin metadata and the market description now describe click-to-full-screen.

## 0.5.1 — 2026-11-12

- **Reveal** now works even when the browser Session remote rejects the path or is unavailable. The reader first tries `session.openWorkspacePath({ action: 'reveal' })`; when that fails it calls the new Host route `GET /api/dsh-docdesk/reveal?path=…`, which asks the Host's `sessionController` to reveal the file and otherwise opens the platform file manager natively (`explorer.exe /select,` on Windows, `open -R` on macOS, `xdg-open` on Linux). A failed reveal now reports the reason in the toast.
- The Host gained that route, so restart DSH Desktop once after upgrading; the client half alone cannot open Explorer.

## 0.5.0 — 2026-11-12

- Images zoom smoothly: hold <kbd>Shift</kbd> and scroll the wheel over the image. The scale runs from 20% to 600% in small steps, the note under the image shows the current percentage, and clicking still switches between fit-to-window and actual size.
- Every document path-bar action now carries a short label under its icon — **Reveal**, **Copy**, **Reload**, **Open**, **Download** and **Full** — so the icon row no longer has to be guessed.
- Added **Reveal** to the path bar: it asks the Host to show the current file in the system file manager through `session.openWorkspacePath({ action: 'reveal' })`, with a toast for success or failure.
- The in-app guide, both READMEs, the plugin-manager metadata and the market entry now describe the new controls.

## 0.4.2 — 2026-11-12

- Files added from a delivered file card now open even when their folder is outside every scanned workspace — for example a session directory that went cold after a DSH restart, or a project folder that was never registered as a workspace. Instead of failing with `outside-workspace`, the reader falls back to DSH's browser-authenticated `/api/file` channel, the same one the chat file preview uses.
  - Markdown and text are fetched through that channel and rendered by the existing readers; images, PDF, audio and video use its URL.
  - HTML outside the workspaces cannot load sibling CSS/JS/images through that channel, so it opens as a file card with **Open in new tab**.
  - When an image or media element still fails to load, the reader explains it and offers **Open in new tab** instead of leaving a broken element in place.
- Reads and downloads for files inside the scanned workspaces keep using the plugin's confined routes; nothing about that path changed.

## 0.4.1 — 2026-11-12

- A half-updated plugin now explains itself. A browser refresh only reloads the client half, so when the running Host still predates 0.4, opening an image/HTML/PDF/media file no longer shows the raw `not-markdown` error: the reader says to fully quit and reopen DSH Desktop. The picker shows the same notice above its list when the Host response has no per-file `kind`.
- The document error card gained **Retry** next to **Remove from library**, so a document can be reloaded in place after the Host restart instead of closing and reopening its tab.

## 0.4.0 — 2026-11-12

Multi-format materials library.

- The picker and library now hold Markdown (`.md`, `.markdown`, `.mdx`, `.mdown`, `.mkd`), plain text and code, HTML, images, PDF, audio and video, plus extensionless `README` / `LICENSE` / `Makefile` / `Dockerfile` files.
- Per-type icons on the desktop grid and document tabs; picker rows show a type chip, and filter chips (All / Documents / Images / Web / PDF / Media / Other) sit beside the search box.
- Plain text and code open in a monospace scrolling reader with the 2 MB preview cap. Images fit the window with a one-click actual-size switch. PDF uses the browser's built-in viewer. Audio and video use native players, seekable through HTTP Range.
- HTML renders in a sandboxed iframe in the reading pane: inline CSS/JS runs, but fetch/XHR requests, form submits and top-level navigation are blocked. Relative sibling assets load from the same workspace root through a workspace-confined site route, so an exported HTML report with an `assets/` folder works.
- Bookmarks and line highlights remain Markdown-only. Plain text keeps the last-read position and bar but has no line bookmarks, and the other viewers are read-only.
- Office documents, archives, fonts and unknown binaries cannot be previewed in a browser. The picker does not list them, and the file card's **Add to library** action reports the format as unsupported.
- New host routes: `GET /api/dsh-docdesk/file` (raw bytes, HTTP Range for media, `download=1` for attachments) and `/api/dsh-docdesk/site/<root>/<relative path>` (an HTML file's sibling assets). Every route keeps the loopback / paired-device fence and stays confined to scanned workspace roots; only whitelisted extensions are served and hidden dot-segments are rejected.
- HTML and SVG are served with `Content-Security-Policy: sandbox`, `connect-src 'none'` and `form-action 'none'`.
- The scan still caps at 3,000 files per scan and now also caps image/audio/video/PDF candidates at 1,200 items, so media cannot crowd documents out of the picker.
- Library entries still live in `dsh-docdesk.library.v2` in the browser; disk files are never moved, renamed or deleted.

## 0.3.28 — 2026-11-08

- Raised the declared DSH compatibility floor to `>=0.2.2-rc.1`. Checked the plugin against DSH 0.2.2-rc.1 (Cordis 4.1): it declares no host peer dependencies, and the host/client entry points it uses are unchanged, so no code migration was required.

## 0.3.27 — 2026-11-05

- Added **Highlight this line** to the document line context menu. The highlight is stored per file/block, stays until the same line is toggled off, and renders as a background tint only — no side marker or label.

## 0.3.26 — 2026-11-05

- Press the <kbd>~</kbd> / backquote key on the library home page to go back one folder level. It is ignored while typing or while a picker/dialog/menu is open.

## 0.3.25 — 2026-11-05

- Grid lines, the candidate-cell outline and the pointer point remain visible while dragging, but the R/C/reason/overlap text label has been removed.

## 0.3.24 — 2026-11-05

- The grid debug overlay (grid lines, pointer crosshair, candidate cell and reason/overlap label) is hidden by default. The hit-testing logic and the `window.__dshDocdeskGrid.getTargetCell` debug entry point remain available.

## 0.3.23 — 2026-11-05

- Added a pointer-first grid hit-test (`getTargetCell`) with floor-based cell math, 8px snap threshold, 0.14 hysteresis near boundaries, boundary clamping, and an icon-overlap fallback when the pointer leaves the grid. While dragging, the desktop now draws grid lines, the pointer point, the current candidate cell and a reason/overlap-ratio label for debugging.

## 0.3.22 — 2026-11-05

- Drop-target detection now follows the pointer, not the dragged icon's centre. After grabbing an icon off-centre, crossing more than halfway into an upper cell/folder selects that cell instead of falling through to the row below.

## 0.3.21 — 2026-11-05

- Files **and folders** moved into a folder now highlight when that folder is opened, and the highlight stays until the folder changes. Items released by dissolving or deleting a folder highlight the same way. Newly added files keep the separate one-time fade.

## 0.3.20 — 2026-11-05

- The folder hover card now chooses a free position around the folder (above, below, left, right) and checks every icon rectangle for collisions, so it no longer covers neighbouring file names. If the grid is packed it falls back to an empty corner.

## 0.3.19 — 2026-11-05

- Files moved into a folder or released by dissolving/deleting a folder no longer keep the selection or new-item highlight. Moving an existing file no longer marks it as fresh, and all highlight state is cleared when a move, dissolve or drop completes.

## 0.3.18 — 2026-11-05

- Multi-selection drops now always occupy consecutive slots, including at the right row edge. The group no longer skips past icons sitting at the edge; those icons are pushed into the following slots with the normal blocker chain.

## 0.3.17 — 2026-11-05

- Path-drop mode no longer exits halfway down the screen. Dragging downward keeps the path picker open until the pointer reaches the bottom edge; the left/right edges still exit immediately.

## 0.3.16 — 2026-11-05

- Path-drop mode can now be dismissed without releasing: dragging to the left/right edge or pulling down out of the path area returns to the normal desktop.
- Inserting into an occupied gap now pushes blockers only as far as needed. A free slot behind absorbs the shift; when there is no gap, the blocking icons are carried along the chain instead of shifting the whole tail unconditionally.

## 0.3.15 — 2026-11-05

- The dragged icon now keeps the exact grab offset under the pointer instead of snapping its centre to the cursor, with no follow transition on the anchor.
- Multi-select followers rush behind the anchor and fade out while dragging; they stay hidden until the drop, then immediately appear at their committed positions.

## 0.3.14 — 2026-11-05

- Inserting at an occupied gap now works with any number of following icons: the whole tail shifts backwards by the size of the dragged group, so the file/s can actually be placed into the caret gap instead of flying to the front or back. Dropping into an actual empty cell still moves only the dragged group and leaves the other icons untouched.

## 0.3.13 — 2026-11-05

- Dropping no longer reflows or compacts the other icons at all, including drops directly before/after another icon. The dragged group is placed into the nearest free slots and every other file stays where it is, leaving gaps intact.

## 0.3.12 — 2026-11-05

- **Dissolve folder** is now a danger-red menu item, matching **Delete folder**.
- Dropping a file or group into an empty slot no longer compacts or shifts the icons after it: only the dragged group is placed into the empty slot, so gaps stay where they are. Dropping directly before/after another icon still makes room by inserting.

## 0.3.11 — 2026-11-04

- Folder context menus now have a **Delete folder** action below **Dissolve folder**. Delete removes the folder and its subfolder tree from the library, moves its documents back to the parent folder, and leaves files on disk untouched; it asks for confirmation and shows how many documents will move.

## 0.3.10 — 2026-11-04

- Dragging no longer reflows the other icons. A single-file drag leaves every other file exactly where it is; multi-selection drags move only the selected group (anchored behind the pointer), and the rest stay put until the drop is committed. This supersedes the live reflow added in 0.3.8.

## 0.3.9 — 2026-11-04

- Multi-item drags now queue the selected icons behind the pointer along the current drag direction, with short staggered follow timing; the held icon stays centred under the mouse. Group inserts use the same anchor-first order, while other icons still reflow live into the insertion gap.

## 0.3.8 — 2026-11-04

- Dragging now reflows the other icons live: as the pointer crosses an insertion point, non-dragged files and folders shift to make room with a quick 80 ms transition instead of staying static. Releasing commits the preview; cancelling or entering path/folder mode restores their positions.

## 0.3.7 — 2026-11-04

- Immersive mode keeps the same number of icons per row as the normal desktop, but spreads the cells horizontally to use the extra width. Exiting restores the exact normal positions; no reordering.

## 0.3.6 — 2026-11-04

- Entering and leaving immersive mode no longer reflows or repositions existing icons. Every valid slot is kept exactly as it was; only entries without a valid slot are placed into free slots.

## 0.3.5 — 2026-11-04

- Drop targets now follow the nearest grid cell instead of raw overlap area. A folder is targeted only when the dragged icon's centre is close to that folder's centre; between two folders, or when the icon is closer to a lower row, it becomes an insertion instead of jumping into a folder.

## 0.3.4 — 2026-11-04

- The white insertion caret now appears only in a real gap between two visible icons in the same row; it no longer shows in empty desktop space or at row edges.

## 0.3.3 — 2026-11-04

- Replaced the dashed insertion slot with a white insertion caret between icons: a vertical white line with split, flared ends at the top and bottom, drawn at the actual gap where a file or group will be inserted.

## 0.3.2 — 2026-11-04

- Anchored the folder hover tooltip to the folder's actual screen rectangle: it now appears below the full icon and label (or above when there is no room), so the folder name and its counts no longer overlap the folder content.

## 0.3.1 — 2026-11-04

- File drops now insert relative to the icon under the drag rather than forcing a slot swap; groups insert after the target in their original order, and dropping between two icons inserts at that gap. Target detection uses icon-overlap area, so it switches like desktop icons when the dragged icon is halfway over another.
- Group drag previews follow more quickly, with shorter distance-based trailing delays.
- The sidebar handle is now a hidden centered arrow that only appears on hover and points in the direction the sidebar will move.
- Jump highlights hold for three seconds before a slower fade; new-file folder highlights use the same timing.
- Folder context menus offer **Dissolve folder**, which moves direct files and child folders up one level and removes only the folder itself.
- Path-only drop mode activates only when dragging upward out of the desktop; sideways drags keep normal movement.
- Folder hover tooltips place the name and counts on separate rows below the folder, avoiding overlap.
- A right-drag marquee no longer opens the bulk context menu automatically; right-clicking the selected group afterwards opens it.

## 0.3.0 — 2026-11-04

- The last-read prompt is now a fixed document bar, so it stays visible while scrolling and while the bookmarks panel is open. The bookmark button moved into that bar, directly under the tab bar's Add files action, with an icon and a visible **书签 / Bookmarks** label.
- Added bookmark position marks to the left of the document scrollbar. Hovering or using the wheel over the rail shows the bookmark title, percent, time and note; clicking jumps.
- Right-clicking a rendered line offers **Insert bookmark at this line**; jumps flash the target block for three seconds with a theme-aware highlight that fades out.
- Breadcrumbs now use chevron arrows, wrap before the search field, stop at two lines and scroll vertically when deeper paths exceed that.
- A bundled manual is seeded once on first use as a normal synthetic document. It is kept concise and updated with each release; removing it does not re-add it.
- Entering or leaving immersive mode no longer reorders the desktop. The reflow keeps the previous visual order.
- Dragging centres the grabbed icon under the pointer. Groups follow with distance-based trailing delays, and a failed drop leaves the original order untouched. Successful moves no longer show the **Moved** toast.
- The item context menu gains **Go up one level** before the root destination.
- Hovering a folder for one second shows its direct folder and document counts.
- New files added or moved into a folder get a single three-second highlight the first time that folder is opened.
- Dragging out of the desktop opens a path-only drop mode: large, spaced breadcrumb segments with the current folder marked; hover highlights a segment and releasing moves the selection there.
- Folder-over-folder drops swap positions; right-click while hovering puts the folder inside. Files over a folder still move in on drop, while right-click swaps the group into the folder slot. Group swaps lay items out in their original order, push the folder after them and shift following items.

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
