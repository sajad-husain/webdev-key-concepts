# Life's a game

A small Expo (React Native) + TypeScript app — a companion project to the
`webdev-key-concepts` backend course. It demos the core Expo/React Native stack:

- file-based routing (Expo Router)
- themed shared UI components
- local persistence with AsyncStorage
- fetching from a public API

## Tech stack

| Area        | Choice                              |
| ----------- | ----------------------------------- |
| Framework   | Expo (React Native)                 |
| Language    | TypeScript                          |
| Navigation  | Expo Router (file-based)            |
| Persistence | `@react-native-async-storage/async-storage` |
| API         | built-in `fetch`, small api client module |

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
npm start        # start the Expo dev server
npm run android  # open on an Android emulator/device
npm run ios      # open on an iOS simulator
npm run web      # open in the browser
npm run lint     # lint the project
npm run typecheck  # run the TypeScript compiler (add via tsc --noEmit)
```

## Project structure

```
mobile-app/
├── app/         # routes/screens (Expo Router file-based routing)
├── components/  # shared, themed UI components
├── constants/   # theme tokens (colors, spacing, type scale)
├── services/    # api client + storage helpers
├── app.json     # Expo app config (name, slug, icons)
└── tsconfig.json
```

## Roadmap

- [x] Expo scaffold + app config (`Life's a game`, `lifes-a-game`)
- [x] Theme tokens & shared UI components
- [x] Navigation + home screen
- [ ] Counter/settings screen
- [ ] AsyncStorage persistence
- [ ] List screen with add/remove
- [ ] API client + example fetch
- [ ] Polish: layout, status bar, tests