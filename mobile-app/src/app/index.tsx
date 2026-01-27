import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { levelForXp, todayKey, weekDaysFor, XP } from '@/services/gamification';
import { impact } from '@/services/haptics';
import { getActiveDays, getStreak, getReviewStreak } from '@/services/state';
import { useGame } from '@/store/game-provider';

export default function HomeScreen() {
  const { state, dispatch, hydrated } = useGame();
  const theme = useTheme();
  const info = levelForXp(state.profile.xp);
  const streak = getStreak(state);
  const reviewStreak = getReviewStreak(state);
  const openQuests = state.quests.filter((quest) => !quest.done).length;
  const today = todayKey();
  const routinesToday = state.routines.filter((routine) => routine.history.includes(today)).length;
  const winsToday = (state.wins[today] ?? []).length;
  const xpToNext = Math.max(0, info.next - state.profile.xp);
  const [questTitle, setQuestTitle] = useState('');

  const quickWin = (points: number) => {
    impact();
    dispatch({ type: 'wins/add', date: today, note: 'A small win', points });
  };

  const addQuest = () => {
    if (!questTitle.trim()) return;
    impact();
    dispatch({ type: 'quests/add', title: questTitle.trim(), xp: XP.questDefault });
    setQuestTitle('');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[theme.tint, theme.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroLogo}>
            <AnimatedIcon />
          </View>
          <ThemedText type="title" style={[styles.title, { color: theme.tintContrast }]}>
            Life&apos;s a game
          </ThemedText>
          <ThemedText type="subtitle" style={{ color: theme.tintContrast }}>
            Level {info.level} {info.title}
          </ThemedText>
        </LinearGradient>

        <ThemedView style={styles.body}>
          {!state.settings.seenGuide && hydrated && (
            <AnimatedRow>
              <Card style={styles.onboardingCard}>
                <ThemedText type="smallBold">New here?</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Learn the loop: earn XP, keep the streak and turn any task into a quest.
                </ThemedText>
                <ThemedView style={styles.onboardingActions}>
                  <Button
                    title="How to play"
                    style={styles.onboardingPrimary}
                    onPress={() => {
                      dispatch({ type: 'settings/markGuideSeen' });
                      router.navigate('/guide');
                    }}
                  />
                  <Button
                    title="Not now"
                    variant="ghost"
                    style={styles.onboardingGhost}
                    onPress={() => dispatch({ type: 'settings/markGuideSeen' })}
                  />
                </ThemedView>
              </Card>
            </AnimatedRow>
          )}

          <AnimatedRow>
            <Card style={styles.xpCard}>
              <ThemedView style={styles.xpHeader}>
                <ThemedText type="smallBold" themeColor="accent">
                  XP
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {state.profile.xp} / {info.next}
                </ThemedText>
              </ThemedView>
              <ProgressBar progress={info.progress} height={12} />
              <ThemedText type="small" themeColor="textSecondary">
                {xpToNext} XP to level {info.level + 1}
              </ThemedText>
            </Card>
          </AnimatedRow>

          <ThemedView style={styles.statsRow}>
            <AnimatedRow delay={60}>
              <Card style={styles.statCard}>
                <ThemedText type="subtitle" themeColor="success">
                  {streak}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  day streak
                </ThemedText>
              </Card>
            </AnimatedRow>
            <AnimatedRow delay={120}>
              <Card style={styles.statCard}>
                <ThemedText type="subtitle" themeColor="gold">
                  {openQuests}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  open quests
                </ThemedText>
              </Card>
            </AnimatedRow>
          </ThemedView>

          <AnimatedRow delay={180}>
            <Card style={styles.statCard}>
              <ThemedText type="subtitle" themeColor="accent">
                {reviewStreak.currentStreak}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                review streak
              </ThemedText>
            </Card>
          </AnimatedRow>

          <AnimatedRow delay={240}>
            <Card style={styles.streakStrip}>
              <ThemedText type="smallBold" themeColor="accent">This week</ThemedText>
              <ThemedView style={styles.streakCells}>
                {weekDaysFor(today).map((day, i) => {
                  const isActive = getActiveDays(state).includes(day);
                  const isToday = day === today;
                  return (
                    <ThemedView
                      key={day}
                      style={[
                        styles.streakCell,
                        isToday && styles.streakCellToday,
                        isActive && styles.streakCellActive,
                      ]}>
                      <ThemedText
                        type="small"
                        style={[
                          styles.streakDayLabel,
                          isActive && styles.streakDayLabelActive,
                          isToday && styles.streakDayLabelToday,
                        ]}>
                        {day.slice(5)}
                      </ThemedText>
                      <ThemedView
                        style={[
                          styles.streakDot,
                          isActive && styles.streakDotActive,
                          isToday && styles.streakDotToday,
                        ]}
                      />
                    </ThemedView>
                  );
                })}
              </ThemedView>
            </Card>
          </AnimatedRow>

          <Card style={styles.todayCard}>
            <ThemedText type="smallBold">Today</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {routinesToday} of {state.routines.length} routines checked
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {winsToday} wins logged
            </ThemedText>
          </Card>

          <Button
            title="Pick a quest"
            style={styles.cta}
            onPress={() => router.navigate('/list')}
          />
          <Card style={styles.quickWinCard}>
            <ThemedText type="smallBold" themeColor="gold">Quick win</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {winsToday} wins today
            </ThemedText>
            <ThemedView style={styles.chipRow}>
              {[5, 10, 15].map((pts) => (
                <Button
                  key={pts}
                  title={`+${pts}`}
                  variant={pts === 10 ? 'primary' : 'secondary'}
                  style={styles.chip}
                  onPress={() => quickWin(pts)}
                />
              ))}
            </ThemedView>
          </Card>

          <Card style={styles.quickQuestCard}>
            <ThemedText type="smallBold" themeColor="accent">Quick quest</ThemedText>
            <ThemedView style={styles.questComposer}>
              <Input
                placeholder="New quest..."
                value={questTitle}
                onChangeText={setQuestTitle}
                returnKeyType="done"
                onSubmitEditing={addQuest}
                style={styles.questInput}
              />
              <Button title="Add" onPress={addQuest} />
            </ThemedView>
          </Card>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
    borderRadius: Radius.lg,
    marginTop: Spacing.three,
  },
  heroLogo: {
    marginBottom: Spacing.two,
  },
  title: {
    textAlign: 'center',
    fontSize: 36,
    lineHeight: 40,
  },
  body: {
    flex: 1,
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  xpCard: {
    gap: Spacing.two,
  },
  onboardingCard: {
    gap: Spacing.two,
  },
  onboardingActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  onboardingPrimary: {
    flex: 1,
  },
  onboardingGhost: {
    flex: 1,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
  },
  todayCard: {
    gap: Spacing.one,
  },
  cta: {
    marginTop: Spacing.one,
  },
  streakStrip: {
    gap: Spacing.two,
  },
  streakCells: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakCell: {
    alignItems: 'center',
    gap: Spacing.half,
    minWidth: 36,
  },
  streakCellToday: {
    transform: [{ scale: 1.1 }],
  },
  streakCellActive: {},
  streakDayLabel: {
    fontSize: 10,
    color: 'inherit',
  },
  streakDayLabelActive: {
    color: 'inherit',
  },
  streakDayLabelToday: {
    fontWeight: '700',
  },
  streakDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'currentColor',
  },
  streakDotActive: {
    backgroundColor: 'currentColor',
  },
  streakDotToday: {
    borderWidth: 2,
  },
  quickWinCard: {
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    flex: 1,
  },
  quickQuestCard: {
    gap: Spacing.two,
  },
  questComposer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  questInput: {
    flex: 1,
  },
});