# Frontend Architecture

AI-powered video editor (VN Editor / CapCut / Premiere Rush class) — Expo + React Native + expo-router + Zustand.

This document describes the architecture only. No business logic, no APIs, and no editing functionality are implemented yet.

## Directory Layout

```
frontend/
├── app/                              # expo-router file-based routes
│   ├── _layout.tsx                   # Root (SafeAreaProvider + ThemeProvider + Stack)
│   ├── index.tsx                     # Entry redirect
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Bottom tabs
│   │   ├── dashboard.tsx
│   │   ├── projects.tsx
│   │   ├── templates.tsx
│   │   ├── assets.tsx
│   │   └── profile.tsx
│   ├── editor/
│   │   ├── _layout.tsx
│   │   └── [projectId].tsx           # Full-screen editor
│   ├── drafts.tsx
│   ├── export-library.tsx
│   ├── settings.tsx
│   ├── subscription.tsx
│   ├── notifications.tsx
│   └── analytics.tsx
└── src/
    ├── theme/                        # tokens.ts (light/dark) + ThemeProvider
    ├── constants/                    # routes, icons, theme, editor, shortcuts, export-presets
    ├── types/                        # user, project, timeline, track, clip, media, export, template, notification, subscription
    ├── stores/                       # zustand stores (auth, user, projects, editor, timeline, media, export, settings, notifications)
    ├── services/                     # empty API service placeholders
    ├── hooks/                        # useProjects, useTimeline, usePlayback, useExport, useMedia, useKeyboard, useShortcuts
    ├── components/
    │   ├── ui/                       # Button, Input, Modal, Dialog, Dropdown, Tabs, Sidebar, Card, Loader,
    │   │                             # Progress, Toast, Avatar, Search, ContextMenu, FileUpload, MediaCard
    │   └── common/                   # ScreenPlaceholder etc.
    └── features/                     # Feature modules
        ├── auth/                     # pages/, components/
        ├── dashboard/                # pages/, components/
        ├── projects/                 # pages/, components/
        ├── media/                    # pages/, components/
        ├── templates/                # pages/, components/
        ├── assets/                   # pages/, components/
        ├── export/                   # pages/, components/
        ├── settings/                 # pages/, components/  (settings, profile, subscription, notifications)
        ├── analytics/                # pages/, components/
        └── editor/
            ├── pages/EditorPage.tsx  # Assembles all editor regions
            └── components/
                ├── top-navigation/
                ├── left-sidebar/
                ├── right-sidebar/
                ├── toolbar/
                ├── canvas/
                ├── bottom-controls/
                ├── playback-controls/
                ├── properties-panel/
                └── timeline/         # EditorTimeline, TimelineRuler, TimelineTracks, TimelineTrack,
                                      # TimelineClip, TimelineMarkers, TimelinePlayhead,
                                      # TimelineSelection, TimelineLayers, TimelineZoomControl
```

## Routes

- Auth (unauth stack): `/(auth)/login`, `/(auth)/register`, `/(auth)/forgot-password`
- Main app (bottom tabs): `/(tabs)/dashboard`, `/(tabs)/projects`, `/(tabs)/templates`, `/(tabs)/assets`, `/(tabs)/profile`
- Editor (full screen stack): `/editor/[projectId]`
- Top-level modals/pages: `/drafts`, `/export-library`, `/settings`, `/subscription`, `/notifications`, `/analytics`

All routes are declared in `src/constants/routes.ts`.

## State (Zustand)

One store per domain in `src/stores/`. Each store exposes a minimal shape only — no side-effects, no API calls.

- `auth.store` — user, tokens, status
- `user.store` — profile, preferences
- `projects.store` — projects list, current project, loading
- `editor.store` — active tool, sidebar visibility, dirty flag
- `timeline.store` — timeline data, undo/redo stacks, playhead, zoom, selection
- `media.store` — library, recent uploads
- `export.store` — jobs, active job
- `settings.store` — theme, autosave, haptics, grid snap, language
- `notifications.store` — items, unread count

## Theme

`src/theme/tokens.ts` defines `darkColors` and `lightColors` token sets plus shared `spacing` and `radius` scales.
`ThemeProvider` selects between the two based on user preference or system, exposing `useTheme()` for consumers.

## Services

Empty placeholders in `src/services/` throwing `Not implemented`. Ready to be wired to the backend later (auth, projects, media, timeline, export, templates, analytics).

## Hooks

Placeholder feature hooks in `src/hooks/` return safe defaults. They act as stable public API surfaces that features can consume today and be filled in later without ripple.

## Future-Ready

The layout supports (but does not implement) all of the following without structural change:

- **AI editing** — `activeTool: "ai"` slot in `editor.store`; `src/features/editor/components/left-sidebar` can add an AI panel.
- **Realtime collaboration** — `timeline.store` snapshot model + `services/*` transport swap.
- **Cloud storage** — `MediaSource: "cloud"` already in `types/media.ts`; `mediaService` transport swap.
- **Payments** — `subscription.tsx` route, `subscription.ts` types, `settings/SubscriptionPage` all present.
- **Authentication** — `(auth)/*` stack + `auth.store` + `authService` all reserved.
- **Backend** — services layer isolates API from UI.
- **Offline mode** — `services/*` can wrap a local queue without changes to stores or pages.
- **Plugins** — feature isolation under `src/features/*` allows registering additional feature bundles.

## Performance

- **Lazy loading & code splitting** — expo-router loads each route file only when navigated.
- **Feature isolation** — each feature owns its pages, components, and barrel export; no cross-feature imports.
- **Reusable components** — shared UI lives under `src/components/ui`, editor-only chrome under `src/features/editor/components`.
- **Scalable folder structure** — clear boundaries between routes (`app/`), features, stores, services, hooks, and types.
