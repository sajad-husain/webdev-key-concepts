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
- **Reminders**: `expo-notifications` local notifications. Daily reminders use a
  `DAILY` trigger (no `repeats` field in SDK 57); a one-off test alarm uses a
  `TIME_INTERVAL` trigger (`src/services/notifications.ts`).
- **Effects**: `expo-linear-gradient` (gradient fills/cards) and `expo-haptics`
  (web-guarded taps via `src/services/haptics.ts`) — both Expo Go-safe.

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
│   ├── app/            # routes/screens (index, list, goals, routines, settings, guide)
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
  via `useTheme()` and render with `ThemedText` / `ThemedView`. New palette keys
  (`tint`, `accent`, `gold`, ...) autofill the `ThemeColor` union — add new keys
  in both light and dark before using them.
- **Shared UI**: put reusable, theme-aware components in `src/components/ui/`.
- **Persistence screens**: hydrate once on mount (guard with a `hydrated` flag),
  then write back on every change (see `settings.tsx` / `list.tsx`).
- **Services**: keep `storage.ts` and `api.ts` free of UI/React imports so they
  stay unit-testable. New service logic gets a test in `__tests__/`.
- **Imports**: use path alias `@/*` → `./src/*`; `@/assets/*` → `./assets/*`.
- No `any` unless unavoidable; strict mode is on.
- **Alarms**: audible alerts need `shouldPlaySound` + `sound: 'default'` and a
  HIGH-importance Android channel. Exact-time delivery requires
  `android.permissions.SCHEDULE_EXACT_ALARM` in `app.json` (baked at build time —
  not active in Expo Go) and Android 13+ users may need to allow "Alarms &
  reminders" in system settings.
- **Feedback**: row toggles and button taps should route through
  `src/services/haptics.ts` (`tap` / `impact`) so the web build stays a no-op.

## Theming/tooling notes

- Typed routes (`experiments.typedRoutes`) — route types regenerate when the app
  runs; after adding a route run a start/export once so `.expo/types` refreshes.
- React Compiler is enabled; see the `react-hooks` lint rules for patterns like
  avoiding synchronous `setState` in `useEffect`.

## Git rules (repo context)

- The repo root (`../`) is a separate study repo with its own uncommitted work.
  **Never run `git add -A` / `git add .` from the repo root** — scope adds to
  `mobile-app/` only.
- **Curated (backdated) timeline**: this repo presents the work as a believable
  dev history. Commits are authored on a real calendar date with
  `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` set (format `2026-01-05T11:20:00+05:00`),
  in ascending order — never a backdate earlier than the previous commit. Per
  batch: set the env vars, `git add mobile-app`, commit, then
  `Remove-Item Env:GIT_AUTHOR_DATE, Env:GIT_COMMITTER_DATE`. Push exactly once,
  when the whole batch is green.

## Reminder about SDK 57 specifics

- Local notifications (banners/sounds) work in Expo Go; **remote push does not**
  (Android, since SDK 53) and exact alarm delivery needs a development or EAS
  build with the permissions baked in.
- `addNotificationReceivedListener` fires while the app is foregrounded — handy
  for the in-app alarm overlay (`src/app/routines.tsx`).