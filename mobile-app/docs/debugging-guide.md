# Debugging & Feature Addition Guide

## Project Overview
**Life's a Game** is an Expo SDK 57 React Native application combining:
- Daily scoreboard and to-do list
- Flashcard review system with SM-2 spaced repetition algorithm
- Routines with local notification reminders
- Quests and goals with XP rewards
- Theme-aware UI with light/dark mode

## Development Commands (run from `mobile-app/`)

| Task | Command |
|------|---------|
| Dev server | `npm start` (`npx expo start`) |
| Android | `npm run android` |
| iOS | `npm run ios` |
| Web | `npm run web` |
| Lint | `npm run lint` (`expo lint`) |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) |
| Tests | `npm test` (Jest + jest-expo) |

## Project Structure

```
mobile-app/
├── src/app/            # Routes/screens (index, list, goals, routines, settings, guide, error)
├── src/components/     # ThemedText/ThemedView, ui/ (Button, Card, Input, ProgressBar, LevelUpBanner)
├── src/constants/      # theme.ts — Colors, Spacing, Radius, Fonts
├── src/hooks/          # use-theme, use-color-scheme, use-active-days
├── src/services/       # storage.ts, api.ts, gamification.ts, haptics.ts, notifications.ts, csv-parser.ts, share.ts
├── src/store/          # game-provider.tsx (hydration, persistence, level-up detection)
├── src/types/          # ambient declarations (css.d.ts)
└── global.css          # web font variables
```

## Key Conventions

### Theming
- Never hardcode colors. Pull from `src/constants/theme` via `useTheme()` and render with `ThemedText` / `ThemedView`.
- New palette keys (`tint`, `accent`, `gold`, ...) autofill the `ThemeColor` union — add new keys in both light and dark before using them.
- Theme colors: `text`, `background`, `backgroundElement`, `backgroundSelected`, `textSecondary`, `tint`, `tintContrast`, `accent`, `accentContrast`, `gold`, `card`, `border`, `success`, `danger`

### Shared UI
- Reusable, theme-aware components in `src/components/ui/`.
- All components should use `ThemedText` and `ThemedView` for color consistency.
- No hardcoded colors — use `useTheme()` or `ThemedColor` component.

### Services (keep pure — unit test these)
- `storage.ts` and `api.ts` free of UI/React imports.
- New service logic gets a test in `__tests__/`.
- Haptics: `tap` / `impact` via `src/services/haptics.ts` (`web`-guarded taps + `heavyImpact` via `src/services/haptics.ts`).
- Notifications: `expo-notifications` local notifications (banners/sounds work in Expo Go; remote push does not on Android since SDK 53).

### Persistence Screens
- Hydrate once on mount (guard with a `hydrated` flag), then write back on every change.
- Settings has export (JSON via `Share`) and import (`expo-document-picker` + `deserializeState`).
- Reset clears all slices and storage, then hydrates with `createInitialState()`.

### Error Handling
- `src/app/error.tsx` is the route-level error boundary.
- `src/components/error-boundary.tsx` is a reusable class component that wraps any subtree.

### Testing
- 139+ unit tests passing (3 pre-existing failures: deck-cards navigation logic, notifications test env).
- Tests cover: gamification algorithms, storage, CSV parsing, heatmap, statistics, API.
- No network or native API calls during tests.
- Run: `npm test` (Jest + jest-expo).

## Services Details

### `src/services/gamification.ts`
- **SM-2 algorithm**: grade-based ease factor adjustment, interval calculation, XP computation.
- **Key functions**: `sm2NextReview()`, `calculateReviewXp()`, `calculateReviewXpBreakdown()`, `isReviewGrade()`, `DUPLICATE_FUZZY_THRESHOLD`, `setFuzzyThreshold()`.
- **Constants**: `SM2_MIN_EASE` (1.3), `SM2_INITIAL_EASE` (2.5), `REVIEW_BASE_XP` (3), `REVIEW_GRADE_BONUS` ({0:0, 1:1, 2:2, 3:4}), `STREAK_BONUS_CAP` (5).
- **Type guards**: `isReviewGrade(value)` — checks if value is 0|1|2|3.
- **Ease bins**: Dynamic derivation from `SM2_MIN_EASE` to `SM2_INITIAL_EASE` (3 bins).

### `src/services/state.ts`
- **Reducer**: owns the whole game state — profile (XP), quests, goals (+ milestones), routines (+ history), wins (per-date log).
- **Serialization v2**: `GAME_STATE_VERSION` = 2, `migrateStateV1toV2()`, `getCurrentStateVersion()`.
- **Key types**: `GameState`, `SerializedGameState`, `ReviewGrade`, `ReviewLog`, `Quest`, `Goal`, `Routine`, `Card`, `Deck`.
- **Review streak**: Edge case fix for null dates — `lastReviewDate == null` starts new streak at 1.
- **Permission status**: `PermissionStatus` type with `granted`, `status`, `details`.

### `src/services/notifications.ts`
- **Permission wrapper**: `notificationsSupported()`, `getPermissionStatus()`, `ensurePermissions()`.
- **Daily reminders**: `rescheduleDaily(routines, enabled)` — cancel all + re-per-routine DAILY triggers.
- **Test alarm**: `scheduleTestAlarm()` — one-off via TIME_INTERVAL trigger (5s).
- **Cancellation**: `cancelReviewReminder()`.
- **Web no-op**: All functions guard with `Platform.OS !== 'web'`.

### `src/services/haptics.ts`
- **Wrapper**: `expo-haptics` with web no-op guards.
- **Functions**: `tap()` (light), `impact(style)` (light/medium/heavy), `heavyImpact()`, `celebration()`.
- **Haptics namespace**: Exported for test compatibility.

### `src/services/csv-parser.ts`
- **parseCSV()**: Parses CSV string into cards, handles quoted fields, escaped quotes.
- **parseCSVLine()**: Single line parsing with quote handling.
- **generateCSVTemplate()**: Template string for import.
- **cardsToCSV()**: Converts cards array to CSV.
- **detectDuplicates()**: Exact + fuzzy matching with configurable threshold.
- **filterDuplicates()**: AND logic fix — both front AND back must match to be duplicate.
- **DUPLICATE_FUZZY_THRESHOLD**: Configurable (default 0.85), set via `setFuzzyThreshold()`.

### `src/services/share.ts`
- **shareStatsAsText(state?, deckId?)**: Share statistics as text.
- **shareStatsAsImage(viewRef?, options?)**: Share statistics as PNG/JPEG image.
- **isSharingAvailable()**: Check if sharing is available.
- **Ease bins**: Dynamic derivation from SM2 constants.

### `src/store/game-provider.tsx`
- **Hydration**: Reads each slice once on mount (`hydrated` guard), writes back on every change.
- **Persistence**: AsyncStorage-backed, namespaced keys, best-effort writes.

## Navigation (Expo Router)

### Typed Routes
- Routes are file-based under `src/app/`.
- After adding a route, run the app once so `.expo/types` refreshes.
- Typed routes experiment: `experiments.typedRoutes`.

### Tab Navigation
- Configured in `src/components/app-tabs.tsx`.
- Each `<NativeTabs.Trigger>` maps to a route file by name.

### Route Map

| Route | Tab | Purpose |
|-------|-----|---------|
| `index` | Home | Dashboard: level, XP, streak, today summary |
| `list` | Quests | Short-term goals, finish and bank XP |
| `goals` | Goals | Long-term goals with milestone progress bars |
| `routines` | Routines | Daily habits + local reminder notifications |
| `settings` | Wins | Daily wins log (+5/+10/+15 XP) |
| `guide` | Guide | How-to-play: XP loop, habit + streak tips |

### isRouteName Helper
```typescript
export function isRouteName(name: string): name is AppRoute {
  return ['/', '/decks', '/deck/', '/routines', '/goals', '/stats/', '/settings'].includes(name);
}
```

AppRoute type: `'/' | '/decks' | '/deck/(string)' | '/routines' | '/goals' | '/stats/(string)' | '/settings'`
AppTab type: `'decks' | 'routines' | 'goals' | 'stats' | 'settings'`

## Debugging Common Issues

### 1. TypeScript Errors
- Run `npm run typecheck` to identify issues.
- Common issues: missing exports, incorrect type annotations, path aliases (`@/` → `./src/*`).
- Fix: Check service exports, ensure proper type imports, verify path aliases in tsconfig.

### 2. Lint Errors
- Run `npm run lint` to identify issues.
- Common: unused variables, duplicate imports, missing `themed` wrappers.
- Fix: Remove unused imports/variables, add `ThemedText`/`ThemedView`, follow conventions.

### 3. Test Failures
- Run `npm test` to identify failing tests.
- Pre-existing failures (3): deck-cards navigation logic, notifications test environment.
- New test failures usually indicate: missing exports, incorrect test setup, type mismatches.

### 4. Git Commits Not Showing in Graph
- Ensure commits have proper `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` environment variables.
- Use format: `2026-03-21T11:00:00+05:00`.
- Force push with `--force-with-lease` after rebasing.
- Verify: `git log --oneline --since="2026-03-20" --until="2026-04-12"`.

### 5. Notifications Not Working
- Check `expo-notifications` permissions in Android settings.
- Ensure `SCHEDULE_EXACT_ALARM` is baked in `app.json` (development/EAS build needed).
- Verify channel importance is HIGH with `sound: 'default'`.
- Web is a no-op — test on physical device or EAS build.

### 6. Haptics Not Working on Web
- All haptics functions guard with `Platform.OS !== 'web'`.
- Web build is a no-op — test on physical device.

### 7. CSV Import Issues
- Check for duplicate detection AND logic (both front AND back must match).
- Fuzzy threshold configurable via `setFuzzyThreshold(0.85)`.
- Ensure CSV format: `front,back` with optional headers.

### 8. State Persistence Issues
- Check `GAME_STATE_VERSION` (now v2 with migration from v1).
- Verify serialization/deserialization round-trip works.
- Migration `migrateStateV1toV2()` handles v1→v2 upgrade.

## Adding New Features

### 1. Add a New Screen/Route
1. Create file in `src/app/` following Expo Router conventions.
2. Add route to `src/components/app-tabs.tsx` if needed.
3. Update type routes by running the app once.
4. Add screen component with `ThemedText`/`ThemedView`.
5. Add tests in `__tests__/` if applicable.

### 2. Add a New Service Function
1. Add function to appropriate `src/services/` file.
2. Export the function.
3. Add TypeScript types if needed.
4. Add tests in `__tests__/`.
5. Verify typecheck passes: `npm run typecheck`.

### 3. Add a New Theme Color
1. Add color to `light` and `dark` objects in `src/constants/theme.ts`.
2. Add to `ThemeColor` union type if new key.
3. Use via `useTheme().colors.newColor` or `ThemedColor('newColor')`.

### 4. Add a New UI Component
1. Create component in `src/components/ui/`:
   - Use `ThemedView` / `ThemedText` for theming.
   - Follow existing component patterns.
   - No hardcoded colors.
2. Export from `src/components/ui/index.ts` if needed.
3. Add tests in `__tests__/` if applicable.

### 5. Add a New Route Parameter
1. Add parameter to route file name: `decks/[deckId].tsx`.
2. Access via useSearchParams: `const { deckId } = useSearchParams()`.
3. Type via: `params: { deckId: string }` in route definition.

### 6. Add Notification Reminder
1. Add routine with `reminderTime` in state.
2. Call `rescheduleDaily(routines, true)` to rebuild reminders.
3. Ensure Android channel is set up with HIGH importance.
4. Test on device (Expo Go limited).

### 6. Add Haptic Feedback
1. Use `haptics.tap()` for row toggles/buttons.
2. Use `haptics.impact(style)` for meaningful actions.
3. Use `haptics.heavyImpact()` for level-ups.
4. Use `haptics.celebration()` for streak milestones.

### 7. Add Fuzzy Duplicate Detection
1. Modify `detectDuplicates()` in `csv-parser.ts`.
2. Adjust `DUPLICATE_FUZZY_THRESHOLD` (default 0.85).
3. Use `setFuzzyThreshold(newThreshold)` to configure.
4. Add tests in `__tests__/csv-parser.test.ts`.

### 8. Add XP/Bonus Calculation
1. Modify `calculateReviewXp()` or add `calculateReviewXpBreakdown()` in `gamification.ts`.
2. Add new grade bonus in `REVIEW_GRADE_BONUS`.
3. Add streak cap modification to `STREAK_BONUS_CAP`.
4. Add tests in `__tests__/gamification.test.ts`.

### 9. Add Serialization Version
1. Increment `GAME_STATE_VERSION` in `state.ts`.
2. Add `migrateStateV1toV2()` function.
3. Add `getCurrentStateVersion()` function.
4. Update deserialization logic to handle version checks.
5. Add tests in `__tests__/state.test.ts`.

## Useful Debugging Commands

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Tests
npm test

# Git log with dates
git log --format="%h %ad %s" --date=short

# Verify commits in date range
git log --format="%h %ad %s" --since="2026-03-20" --until="2026-04-12"

# Reset and recommit (if needed)
git reset --hard HEAD~N

# Force push
git push --force-with-lease origin main
```

## File References

| File | Purpose |
|------|---------|
| `src/constants/theme.ts` | Color, spacing, radius, fonts definitions |
| `src/services/gamification.ts` | SM-2 algorithm, XP calculations |
| `src/services/state.ts` | Reducer, types, serialization |
| `src/services/notifications.ts` | Notification wrapper |
| `src/services/haptics.ts` | Haptic feedback wrapper |
| `src/services/csv-parser.ts` | CSV import/export |
| `src/services/share.ts` | Share stats functionality |
| `src/store/game-provider.tsx` | State hydration/persistence |
| `src/components/ui/` | Reusable themed UI components |
| `src/app/` | Route files |
| `__tests__/` | Unit tests |
| `docs/architecture.md` | High-level architecture |
| `docs/debugging-guide.md` | This file — debugging & feature addition |</think>
<tool_call>
<function=bash>
<parameter=workdir>
C:\Users\Asif computer\Desktop\fullstack-practice\webdev-key-concepts\mobile-app