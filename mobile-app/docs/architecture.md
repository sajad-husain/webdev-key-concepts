# Architecture

Short tour of how the app is put together.

## Routing (Expo Router)

- Every file in [`src/app/`](../src/app/) is a route. The tab navigator is
  defined in [`src/app/_layout.tsx`](../src/app/_layout.tsx) together with the
  theme provider and status bar.
- Native tabs are configured in
  [`src/components/app-tabs.tsx`](../src/components/app-tabs.tsx) — each
  `<NativeTabs.Trigger>` maps to a route file by name.

| Route          | Tab    | Purpose                    |
| -------------- | ------ | -------------------------- |
| `index`        | Home   | Landing + quick tour       |
| `settings`     | Score  | Persisted daily counter    |
| `list`         | List   | Persisted to-do items      |
| `about`        | About  | App notes + live API demo  |

## Theming

- All tokens live in [`src/constants/theme.ts`](../src/constants/theme.ts):
  `Colors` (light/dark), `Spacing`, `Radius`, `Fonts`.
- `useTheme()` returns the palette for the current color scheme.
- Shared building blocks live in [`src/components/ui/`](../src/components/ui/):
  `Button`, `Card`, `Input`. Screens combine them with `ThemedText` /
  `ThemedView` so colors follow the system light/dark mode.

## Services

- [`src/services/storage.ts`](../src/services/storage.ts) — tiny JSON-safe
  wrapper around AsyncStorage (namespaced keys, best-effort writes).
- [`src/services/api.ts`](../src/services/api.ts) — `fetch` wrapper with a typed
  `request<T>` helper and typed endpoints (currently a JSONPlaceholder demo).

## Screens & state

Screens keep local state with `useState`. Persisted screens hydrate once on
mount (`hydrated` flag) and write back on every change — a small, predictable
pattern used by both the Score and List tabs.

## Tests

Jest runs against the two pure service modules:

- `storage.test.ts` exercises the AsyncStorage wrapper via its official Jest
  mock.
- `api.test.ts` stubs `globalThis.fetch` to verify parsing and error handling.

No network or native API calls are made during tests.