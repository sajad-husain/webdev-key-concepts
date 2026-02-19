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
- **Effects**: `expo-linear-gradient` (gradient fills/cards), `expo-haptics`
  (web-guarded taps + `heavyImpact` via `src/services/haptics.ts`),
  `@react-native-community/datetimepicker` (native time picker for routine
  reminders) and `expo-document-picker` (game-data import) — all Expo Go-safe.

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
│   ├── app/            # routes/screens (index, list, goals, routines, settings, guide, error)
│   ├── components/     # ThemedText/ThemedView, error-boundary + ui/ (Button, Card, Input, ProgressBar, LevelUpBanner)
│   ├── constants/      # theme.ts — Colors, Spacing, Radius, Fonts
│   ├── hooks/          # use-theme, use-color-scheme
│   ├── services/       # storage.ts, api.ts, gamification.ts, haptics.ts (keep pure — unit test these)
│   ├── store/          # game-provider.tsx (hydration, persistence, level-up detection)
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
- **Backup/restore**: Settings has export (JSON via `Share`) and import
  (`expo-document-picker` + `deserializeState`). Reset clears all slices and
  storage, then hydrates with `createInitialState()`.
- **Error handling**: `src/app/error.tsx` is the route-level error boundary.
  `src/components/error-boundary.tsx` is a reusable class component that wraps
  any subtree.

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

## Flashcard Decks (Spaced Repetition)

- **Algorithm**: SM-2 (Anki classic) with independent scheduling for reverse cards
- **Card format**: Basic + Reversed (auto-create reverse cards)
- **XP**: Base 3 XP + grade bonus (Again=0, Hard=1, Good=2, Easy=4) + daily streak bonus (capped at +5)
- **Session**: All due cards reviewed in a full-screen session with flip animation, grade buttons, XP summary
- **Persistence**: Review logs, streak, and session state persisted via AsyncStorage
- **Notifications**: Daily review reminder at configurable time (default 20:00)
- **Import/Export**: Full deck/card/review state included in Settings backup/restore
- **Statistics**: Per-deck stats screen with grade distribution, ease factor distribution, reviews-over-time chart, retention rate
- **Time-range selector**: Compact selector (7d/30d/90d/all) filters reviews-over-time chart and period-specific stats; uses pure `filterLogsByRange` helper in `gamification.ts` with `todayKey`/`addDaysKey` for timezone-safe date math; chart buckets adapt (daily for 7d/30d, weekly for 90d, monthly for all-time)
- **Session pause/resume**: Session state persisted across app backgrounding
- **Review streak**: Daily streak badge on Home and Decks tab with celebration haptic
- **Error handling**: ErrorBoundary wraps review session; route-level error.tsx boundary

## Recent commits (2026-01-22 → 2026-02-19)

| Date | Commit | Description |
|------|--------|-------------|
| 2026-01-22 | 6983927 | feat: add Card, Deck, ReviewLog, ReviewStreak types to state |
| 2026-01-22 | 1433119 | feat: add SM-2 algorithm to gamification with tests |
| 2026-01-23 | 9be007b | feat: add deck/card/review actions to reducer |
| 2026-01-23 | 34fa266 | feat: add deck/card query helpers to state |
| 2026-01-24 | 52a6241 | feat: add Decks tab to app-tabs with placeholder screen |
| 2026-01-24 | 604cccf | feat: decks list screen with due counts and DeckCard component |
| 2026-01-25 | 01a7cf4 | feat: deck detail screen with card management and CardEditor |
| 2026-01-26 | 199f473 | feat: review session with card flip, grade buttons, and session end |
| 2026-01-26 | b9aa79f | feat: review summary screen with XP breakdown |
| 2026-01-27 | 12c940e | feat: review session pause/resume persistence |
| 2026-01-27 | 7be3a9c | feat: daily review streak badge on Home and Decks |
| 2026-01-28 | 887fb8f | feat: daily review reminder notification |
| 2026-01-29 | 4f8eb9d | test: add import integration tests for bulk card import |
| 2026-02-08 | 2f41caa | feat: add import history tracking and rollback functionality |
| 2026-02-12 | a2727ed | feat: add deckId param to stats route with per-deck statistics |
| 2026-02-12 | d13b58d | feat: build deck stats UI with BarChart and LineChart |
| 2026-02-14 | 3ab7f22 | fix: remove duplicate declarations in stats.tsx |
| 2026-02-15 | c6845ac | feat: add StatsRange type and filterLogsByRange helper |
| 2026-02-15 | 96b7a32 | fix: correct getDeckReviewStats to return computed values |
| 2026-02-16 | b1edddd | test: add filterLogsByRange unit tests (17 tests) |
| 2026-02-17 | (next) | feat: wire time-range selector with dynamic chart bucketing |
| 2026-02-19 | (next) | docs: update AGENTS.md and README.md |