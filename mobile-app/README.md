# Life's a game

A small Expo (React Native) + TypeScript app that treats everyday life like a
game — earn XP for quests, goals, routines and daily wins, then watch your
level and streak grow. Built as a companion project to the `webdev-key-concepts`
full-stack backend course.

## What it does

- **Home** — dashboard with your level, animated XP bar, day streak and a
  quick look at today.
- **Quests** — short-term goals. Finish one and bank the XP.
- **Goals** — long-term goals broken into milestones, each with +10 XP and an
  animated progress bar.
- **Routines** — daily habits you check off; optional local notification
  reminders at a time you pick.
- **Wins** — log the day's small wins (+5/+10/+15 XP) straight into your level.

## Tech stack

| Area          | Choice                                             |
| ------------- | -------------------------------------------------- |
| Framework     | Expo (React Native) — SDK 57                       |
| Language      | TypeScript (strict)                                |
| Navigation    | Expo Router (file-based) + native tabs             |
| State         | Reducer + React context (`src/store/game-provider.tsx`) |
| Persistence   | `@react-native-async-storage/async-storage` via `src/services/storage.ts` |
| Reminders     | `expo-notifications` local daily notifications     |
| Animation     | `react-native-reanimated` (reduce-motion aware)    |
| API           | built-in `fetch` via a small typed API client      |
| Testing       | Jest + jest-expo                                   |

## Getting started

```bash
# from the repo root
cd mobile-app
npm install
npx expo start
```

Then:

1. Install **Expo Go** on your phone (Play Store / App Store).
2. Connect the phone to the **same Wi-Fi** as the computer.
3. Scan the QR code shown in the terminal (Android camera / iOS Expo Go).
4. On first start, allow Node through the Windows firewall for private networks.

## Scripts

```bash
npm start           # start the Expo dev server
npm run android     # open on an Android emulator/device
npm run ios         # open on an iOS simulator
npm run web         # open in the browser
npm run lint        # lint the project (expo lint)
npm run typecheck   # TypeScript compiler check (tsc --noEmit)
npm test            # run the Jest test suite
```

## Project structure

```
mobile-app/
├── app.json            # Expo config (name, slug, icons, plugins)
├── src/
│   ├── app/            # routes/screens (Expo Router file-based routing)
│   │   ├── _layout.tsx # root layout: providers, splash, notification deep link
│   │   ├── index.tsx   # Home tab — level/XP/streak dashboard
│   │   ├── list.tsx    # Quests tab (short-term goals)
│   │   ├── goals.tsx   # Goals tab (milestones + progress bar)
│   │   ├── routines.tsx# Routines tab (daily habits + reminders)
│   │   └── settings.tsx# Wins tab (daily wins log)
│   ├── components/     # ThemedText/ThemedView, app tabs, ui/ (Button, Card, Input, ProgressBar…)
│   ├── constants/      # theme tokens (Colors, Spacing, Radius, Fonts)
│   ├── hooks/          # color scheme + theme hooks
│   ├── services/       # storage, api, gamification, state reducer, notifications
│   ├── store/          # game context provider (hydration + persistence)
│   ├── types/          # ambient type declarations (CSS modules)
│   └── global.css      # web font variables
└── __tests__/          # Jest unit tests (gamification, streak math, storage, api)
```

## Testing

```bash
npm test
```

Covers the pure service modules: the gamification engine (levels, streak math,
date helpers), the AsyncStorage wrapper, and the API client (parsing and error
handling). See [`docs/architecture.md`](docs/architecture.md) for how the pieces
fit together.

## Roadmap (2026)

- [x] Expo scaffold + app config (`Life's a game`, `lifes-a-game`)
- [x] Theme tokens & shared UI components
- [x] Navigation + home screen
- [x] AsyncStorage persistence
- [x] API client + example fetch (JSONPlaceholder demo)
- [x] Gamification engine: XP, levels, streaks
- [x] Quests (short-term goals)
- [x] Goals with milestones + progress bars
- [x] Routines with daily reminder notifications
- [x] Daily wins log
- [x] Reanimated motion pass (reduce-motion aware)
- [x] Tests, lint, typecheck green