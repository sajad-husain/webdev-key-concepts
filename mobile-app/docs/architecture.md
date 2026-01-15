# Architecture

Short tour of how the app is put together.

## Routing (Expo Router)

- Every file in [`src/app/`](../src/app/) is a route. The root
  [`src/app/_layout.tsx`](../src/app/_layout.tsx) wires up the theme provider,
  status bar, the game store and a notification deep-link to Routines.
- Native tabs are configured in
  [`src/components/app-tabs.tsx`](../src/components/app-tabs.tsx) (web variant
  in `app-tabs.web.tsx`) — each `<NativeTabs.Trigger>` maps to a route file by
  name.

| Route      | Tab      | Purpose                                      |
| ---------- | -------- | -------------------------------------------- |
| `index`    | Home     | Dashboard: level, XP, streak, today summary  |
| `list`     | Quests   | Short-term goals, finish and bank XP         |
| `goals`    | Goals    | Long-term goals with milestone progress bars |
| `routines` | Routines | Daily habits + local reminder notifications  |
| `settings` | Wins     | Daily wins log (+5/+10/+15 XP)               |
| `guide`    | Guide    | How-to-play: XP loop, habit + streak tips    |

## Theming

- All tokens live in [`src/constants/theme.ts`](../src/constants/theme.ts):
  `Colors` (light/dark), `Spacing`, `Radius`, `Fonts`.
- `useTheme()` returns the palette for the current color scheme.
- Shared building blocks live in [`src/components/ui/`](../src/components/ui/):
  `Button`, `Card`, `Input`, plus animated `ProgressBar` and `AnimatedRow`.
  Screens combine them with `ThemedText` / `ThemedView` so colors follow the
  system light/dark mode.
- Palette keys beyond the base tokens: `tint`, `accent` (sky) and `gold` give
  the scoreboard its color-coded accents (dashboard hero gradient, quest row
  dots, win points, reminder chips, XP bar gradient).
- Gradient fills use `expo-linear-gradient` (hero card, XP bar via
  `Animated.createAnimatedComponent`).

## State (game store)

- One reducer in [`src/services/state.ts`](../src/services/state.ts) owns the
  whole game: profile (XP), quests, goals (+ milestones), routines (+ history)
  and wins (a per-date log). Actions carry the XP math, so awarding and
  revoking points stays consistent.
- [`src/store/game-provider.tsx`](../src/store/game-provider.tsx) exposes
  `useGame()` and handles hydration + persistence: it reads each slice once on
  mount (`hydrated` guard) and writes back on every change.
- Derived values like `getActiveDays`/`getStreak` are pure functions on state.

## Services

- [`src/services/gamification.ts`](../src/services/gamification.ts) — pure
  engine: `levelForXp`, `streakFor`, date-key helpers and XP constants.
- [`src/services/state.ts`](../src/services/state.ts) — reducer + types.
- [`src/services/notifications.ts`](../src/services/notifications.ts) —
  `expo-notifications` wrapper: handler (`shouldPlaySound`), permissions, a
  HIGH-importance sound channel and `rescheduleDaily` (cancel-all +
  re-per-routine DAILY triggers). `scheduleTestAlarm` fires a one-off test
  notification via a TIME_INTERVAL trigger. Web is a no-op.
- [`src/services/haptics.ts`](../src/services/haptics.ts) — `expo-haptics`
  wrapper (`tap` / `impact`) so toggles get light feedback on device while the
  web build stays a no-op.
- [`src/services/storage.ts`](../src/services/storage.ts) — tiny JSON-safe
  wrapper around AsyncStorage (namespaced keys, best-effort writes).
- [`src/services/api.ts`](../src/services/api.ts) — `fetch` wrapper with a typed
  `request<T>` helper and typed endpoints (currently a JSONPlaceholder demo, no
  longer wired to any screen).

## Alarms & reminders

- Daily routine reminders fire a local notification at the set `HH:MM` using a
  DAILY trigger (SDK 57 has no `repeats` field on that trigger type). Reminders
  are rebuilt on every change via `rescheduleDaily`.
- Alarms are audible (`sound: 'default'`) and Android uses a HIGH-importance
  channel; exact-time delivery lists `SCHEDULE_EXACT_ALARM` in `app.json`
  `android.permissions` (baked at build time, not active in Expo Go).
- While the app is foregrounded, `addNotificationReceivedListener` pops the
  in-app alarm overlay in Routines; the "Test alarm" button fires a 5s test
  notification.

## Animations

- XP and milestone bars animate via a shared reanimated `ProgressBar`; list
  rows mount/unmount through `AnimatedRow` (staggered `FadeInUp`). Both respect
  the system reduce-motion setting.

## Tests

Jest runs against the pure modules (no UI, no native calls):

- `gamification.test.ts` — level thresholds, date helpers, streak math
  (including the pending-today/regression case for the missed-day fix).
- `storage.test.ts` — the AsyncStorage wrapper via its official Jest mock.
- `api.test.ts` — stubs `globalThis.fetch` to verify parsing and error handling.

No network or native API calls are made during tests.