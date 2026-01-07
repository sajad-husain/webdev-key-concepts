import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { levelForXp, todayKey } from '@/services/gamification';
import { getStreak } from '@/services/state';
import { useGame } from '@/store/game-provider';

export default function HomeScreen() {
  const { state } = useGame();
  const theme = useTheme();
  const info = levelForXp(state.profile.xp);
  const streak = getStreak(state);
  const openQuests = state.quests.filter((quest) => !quest.done).length;
  const today = todayKey();
  const routinesToday = state.routines.filter((routine) => routine.history.includes(today)).length;
  const winsToday = (state.wins[today] ?? []).length;
  const xpToNext = Math.max(0, info.next - state.profile.xp);

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
          <Button
            title="Log a win"
            variant="secondary"
            style={styles.cta}
            onPress={() => router.navigate('/settings')}
          />
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
});