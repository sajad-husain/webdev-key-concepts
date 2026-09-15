# Life's a game

A small Expo (React Native) + TypeScript app that treats everyday life like a
scoreboard — keep the score, keep the list, keep going. Built as a companion
project to the `webdev-key-concepts` full-stack backend course.

## What it does

- **Home** — a quick tour of the app with one tap to start scoring.
- **Score** — a daily counter you can bump up and down; the value survives
  restarts (AsyncStorage).
- **List** — add and remove items, persisted on-device.
- **About** — a live example that pulls real posts through the app's own API
  client.

## Tech stack

| Area        | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | Expo (React Native) — SDK 57                       |
| Language    | TypeScript (strict)                                |
| Navigation  | Expo Router (file-based) + native tabs             |
| Persistence | `@react-native-async-storage/async-storage`        |
| API         | built-in `fetch` via a small typed API client      |
| Testing     | Jest + jest-expo                                   |

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
├── app.json            # Expo config (name, slug, icons, splash)
├── src/
│   ├── app/            # routes/screens (Expo Router file-based routing)
│   │   ├── _layout.tsx # root layout + status bar
│   │   ├── index.tsx   # Home tab
│   │   ├── settings.tsx# Score tab (persisted counter)
│   │   ├── list.tsx    # List tab (add/remove items)
│   │   └── about.tsx   # About tab (live API example)
│   ├── components/     # themed UI: Button, Card, Input + screen helpers
│   ├── constants/      # theme tokens (Colors, Spacing, Radius, Fonts)
│   ├── hooks/          # color scheme + theme hooks
│   ├── services/       # storage + api client
│   ├── types/          # ambient type declarations (CSS modules)
│   └── global.css      # web font variables
└── __tests__/          # Jest unit tests (storage, api)
```

## Testing

```bash
npm test
```

Covers the two service modules: the AsyncStorage wrapper (fallback, read/write,
remove) and the API client (parsing and error handling). See
[`docs/architecture.md`](docs/architecture.md) for how the pieces fit together.

## Roadmap (2026)

- [x] Expo scaffold + app config (`Life's a game`, `lifes-a-game`)
- [x] Theme tokens & shared UI components
- [x] Navigation + home screen
- [x] Counter/settings screen
- [x] AsyncStorage persistence
- [x] List screen with add/remove
- [x] API client + example fetch
- [x] Polish: layout, status bar, tests