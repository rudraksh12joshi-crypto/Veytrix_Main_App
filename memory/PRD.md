# AI Video Editor — Frontend Architecture (No Implementation)

## Goal
Scaffold the complete frontend architecture for a professional AI-powered mobile video editor (VN Editor / CapCut / Premiere Rush class). This iteration produces **architecture only** — no backend, no APIs, no business logic, no UI polish.

## Deliverables Delivered
- expo-router route tree (auth stack, bottom-tabs main app, full-screen editor, top-level pages).
- Feature-based folder organization under `src/features/*` with `pages/` and `components/` per module.
- Editor architecture (top nav, left/right sidebars, toolbar, canvas, bottom controls, playback controls, properties panel, and full timeline sub-components: ruler, tracks, track, clip, markers, playhead, selection, layers, zoom).
- Zustand stores for auth, user, projects, editor, timeline (with undo/redo), media, export, settings, notifications.
- TypeScript interfaces for User, Project, Timeline, Track, Clip, Media, Export, Template, Notification, Subscription.
- Empty service files for auth, projects, media, timeline, export, templates, analytics.
- Placeholder hooks: useProjects, useTimeline, usePlayback, useExport, useMedia, useKeyboard, useShortcuts.
- Constants: routes, icons, theme, editor, shortcuts, export-presets.
- Theme layer with light/dark tokens and `ThemeProvider` (system default).
- Reusable UI components: Button, Input, Modal, Dialog, Dropdown, Tabs, Sidebar, Card, Loader, Progress, Toast, Avatar, Search, ContextMenu, FileUpload, MediaCard.
- `ARCHITECTURE.md` documenting the full layout and future-ready hooks.

## Constraints Honored
- No backend, no API implementation, no business logic.
- No UI features beyond minimal placeholder titles required to make routes visible.
- No unnecessary code or comments; files are minimal and modular.
- Existing icon-font prewarm logic in root `_layout.tsx` preserved.
