# Life's a game

A small Expo (React Native) + TypeScript app that treats everyday life like a
game — earn XP for quests, goals, routines, daily wins, and flashcard reviews,
then watch your level and streak grow. Built as a companion project to the
`webdev-key-concepts` full-stack backend course.

## What it does

- **Home** — dashboard with your level, animated XP bar, day streak, this-week
  streak strip, quick-win chips (+5/+10/+15), quick-add quest, and a
  first-launch onboarding card.
- **Quests** — short-term goals with a per-quest XP picker (5/20/50). Finish
  one and bank the XP.
- **Goals** — long-term goals broken into milestones, each with +10 XP and an
  animated progress bar.
- **Routines** — daily habits you check off; optional native time picker for
  local notification reminders (Android/iOS) with a web text-input fallback.
- **Wins** — log the day's small wins (+5/+10/+15 XP) straight into your
  level. Export/import your game data as JSON and reset when needed.
- **Guide** — how-to-play screen explaining the XP loop, habits, streaks and
  the level table.
- **Decks** — spaced-repetition flashcards (SM-2 algorithm) with independent
  scheduling for reverse cards. Review sessions with card flip animation,
  4-grade buttons (Again/Hard/Good/Easy), XP rewards, streak tracking,
  pause/resume, and statistics. Per-deck stats include grade distribution,
  ease factor distribution, retention rate, and reviews-over-time chart with
  a compact time-range selector (7 Days / 30 Days / 90 Days / All Time) that
  dynamically re-buckets the chart (daily/weekly/monthly) and filters all
  period-specific metrics.

## Tech stack

| Area          | Choice                                             |
| ------------- | -------------------------------------------------- |
| Framework     | Expo (React Native) — SDK 57                       |
| Language      | TypeScript (strict)                                |
| Navigation    | Expo Router (file-based) + native tabs             |
| State         | Reducer + React context (`src/store/game-provider.tsx`) |
| Persistence   | `@react-native-async-storage/async-storage` via `src/services/storage.ts` |
| Reminders     | `expo-notifications` local daily notifications     |
| Native picker | `@react-native-community/datetimepicker`           |
| Import/backup | `expo-document-picker` + `Share`                   |
| Charts        | `react-native-chart-kit` + `react-native-svg`      |
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
│   │   ├── index.tsx   # Home tab — level/XP/streak/quick actions dashboard
│   │   ├── list.tsx    # Quests tab (short-term goals + XP picker)
│   │   ├── goals.tsx   # Goals tab (milestones + progress bar)
│   │   ├── routines.tsx# Routines tab (daily habits + native time picker)
│   │   ├── settings.tsx# Wins tab (daily wins log + backup/restore/reset)
│   │   ├── guide.tsx   # Guide tab (how-to-play + XP table)
│   │   ├── decks/      # Decks tab (flashcards + SM-2 SRS)
│   │   │   ├── index.tsx       # Decks list + due counts + create/edit
│   │   │   ├── [deckId].tsx    # Deck detail + card management + review CTA
│   │   │   ├── review.tsx      # Review session (flip, grade, XP)
│   │   │   ├── summary.tsx     # Review summary (XP breakdown)
│   │   │   └── stats.tsx       # Per-deck statistics (charts + time-range selector)
│   ├── error.tsx     # Route-level error boundary
│   ├── components/     # ThemedText/ThemedView, error-boundary, app tabs, ui/ (Button, Card, Input, ProgressBar, LevelUpBanner, DeckCard, CardEditor, ReviewProgress, GradeButtons, ImportCardsModal…)
│   ├── constants/      # theme tokens (Colors, Spacing, Radius, Fonts)
│   ├── hooks/          # color scheme + theme hooks
│   ├── services/       # storage, api, gamification, state reducer, notifications, haptics, csv-parser
│   ├── store/          # game context provider (hydration + persistence + level-up detection)
│   ├── types/          # ambient type declarations (CSS modules)
│   └── global.css      # web font variables
└── __tests__/          # Jest unit tests (gamification, streak math, storage, api, deck/card/review)
└── docs/               # architecture notes
```

## Testing

```bash
npm test
```

Covers the pure service modules: the gamification engine (levels, streak math,
date helpers, level-up detection, week-days selector, SM-2 algorithm), state
serialization and sanitization, CSV parsing, import/export, the AsyncStorage
wrapper, and the API client (parsing and error handling). See
[`docs/architecture.md`](docs/architecture.md) for how the pieces fit together.

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
- [x] How-to-play guide tab + onboarding card
- [x] Versioned game-data serialization + backup/restore/reset
- [x] Native time picker for routine reminders
- [x] Level-up banner + heavy haptic celebration
- [x] This-week streak strip on Home
- [x] Quick log-win chips + quick-add quest on Home
- [x] Per-quest XP picker (5/20/50)
- [x] Route-level error boundary + reusable ErrorBoundary
- [x] Flashcard decks (SM-2 SRS) with reverse cards
- [x] Review session (flip, grade, XP, streak, pause/resume)
- [x] Deck statistics (grade/ease distribution, retention, trend chart)
- [x] Daily review reminder notification
- [x] Import/export/rollback for deck data
- [x] Time-range selector on stats screen (7d/30d/90d/all with dynamic chart bucketing)
- [x] Review streak heatmap calendar
- [x] Share stats as image
- [x] Previous period comparison
- [x] Duplicate card detection on import
- [x] Card tags/folders