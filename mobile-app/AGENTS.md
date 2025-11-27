# AGENTS.md — Life's a game (Expo SDK 57)

Expo has changed a lot across SDKs. **Read the exact versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before writing any code** — do not assume
knowledge from older SDKs.

## Project

- **App**: a small Expo (React Native) + TypeScript companion app — a daily
  scoreboard and to-do list ("Life's a game").
- **Navigation**: Expo Router, file-based routes under `src/app/`, native tabs
  configured in `src/components/app-tabs.tsx`.
- **Persistence**: `@react-native-async-storage/async-storage` via the wrapper in
  `src/services/storage.ts`.
- **Network**: typed `fetch` wrapper in `src/services/api.ts` (JSONPlaceholder demo).

## Commands (run from `mobile-app/`)

| Task          | Command                          |
| ------------- | -------------------------------- |
| Dev server    | `npm start` (`npx expo start`)   |
| Android/iOS   | `npm run android` / `npm run ios`|
| Web           | `npm run web`                    |
| Lint          | `npm run lint` (`expo lint`)     |
| Typecheck     | `npm run typecheck` (`tsc --noEmit`) |
| Tests         | `npm test` (Jest + jest-expo)    |

**Always finish work with lint + typecheck + tests green.**

## Structure

```
mobile-app/
├── src/
│   ├── app/            # routes/screens (index, settings, list, about, _layout)
│   ├── components/     # ThemedText/ThemedView + ui/ (Button, Card, Input)
│   ├── constants/      # theme.ts — Colors, Spacing, Radius, Fonts
│   ├── hooks/          # use-theme, use-color-scheme
│   ├── services/       # storage.ts, api.ts (keep pure — unit test these)
│   ├── types/          # ambient declarations (css.d.ts)
│   └── global.css      # web font variables
├── __tests__/          # Jest unit tests for services
└── docs/               # architecture notes
```

## Conventions

- **Theming**: never hardcode colors. Pull from `@/constants/theme` (light/dark)
  via `useTheme()` and render with `ThemedText` / `ThemedView`.
- **Shared UI**: put reusable, theme-aware components in `src/components/ui/`.
- **Persistence screens**: hydrate once on mount (guard with a `hydrated` flag),
  then write back on every change (see `settings.tsx` / `list.tsx`).
- **Services**: keep `storage.ts` and `api.ts` free of UI/React imports so they
  stay unit-testable. New service logic gets a test in `__tests__/`.
- **Imports**: use path alias `@/*` → `./src/*`; `@/assets/*` → `./assets/*`.
- No `any` unless unavoidable; strict mode is on.

## Theming/tooling notes

- Typed routes (`experiments.typedRoutes`) — route types regenerate when the app
  runs; after adding a route run a start/export once so `.expo/types` refreshes.
- React Compiler is enabled; see the `react-hooks` lint rules for patterns like
  avoiding synchronous `setState` in `useEffect`.

## Git rules (repo context)

- The repo root (`../`) is a separate study repo with its own uncommitted work.
  **Never run `git add -A` / `git add .` from the repo root** — scope adds to
  `mobile-app/` only.
- Do **not** backdate commits. Commits land with real timestamps as work happens.