import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { levelForXp } from '@/services/gamification';
import { useGame } from '@/store/game-provider';

const XP_TABLE = [
  { label: 'Routine checked', points: '+5' },
  { label: 'Milestone done', points: '+10' },
  { label: 'Quest finished', points: '+20' },
  { label: 'Win logged', points: '+5 / +10 / +15' },
] as const;

export default function GuideScreen() {
  const { state } = useGame();
  const theme = useTheme();
  const info = levelForXp(state.profile.xp);
  const xpToNext = Math.max(0, info.next - state.profile.xp);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <AnimatedRow>
            <ThemedView style={styles.headerSection}>
              <ThemedText type="subtitle">How to play</ThemedText>
              <ThemedText themeColor="textSecondary">
                Turn everyday tasks into XP, levels and streaks. Do the thing, bank the points,
                keep the chain alive.
              </ThemedText>
            </ThemedView>
          </AnimatedRow>

          <AnimatedRow delay={40}>
            <Card style={styles.section}>
              <ThemedText type="smallBold" themeColor="tint">
                The loop
              </ThemedText>
              <ThemedText>
                Every action you check off earns XP. Hit a threshold and you level up; keep playing
                most days and your streak climbs.
              </ThemedText>
              <ThemedView style={styles.xpTable}>
                {XP_TABLE.map((row, index) => (
                  <ThemedView
                    key={row.label}
                    style={[styles.xpRow, index > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                    <ThemedText type="small">{row.label}</ThemedText>
                    <ThemedText type="smallBold" themeColor="gold">
                      {row.points}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </Card>
          </AnimatedRow>

          <AnimatedRow delay={80}>
            <Card style={styles.section}>
              <ThemedText type="smallBold" themeColor="accent">
                Build your routine
              </ThemedText>
              <ThemedText>Start with 1 – 3 daily habits. That&apos;s enough.</ThemedText>
              <ThemedText>
                Add an optional reminder time (HH:MM) and the app will ping you at that hour.
              </ThemedText>
              <ThemedText>
                Check them off every day. Consistency beats intensity — a small habit, kept daily,
                is a level machine.
              </ThemedText>
            </Card>
          </AnimatedRow>

          <AnimatedRow delay={120}>
            <Card style={styles.section}>
              <ThemedText type="smallBold" themeColor="gold">
                Gamify any task
              </ThemedText>
              <ThemedText>
                Big tasks live in the Goals tab: break them into milestones and bank +10 for each
                one you finish.
              </ThemedText>
              <ThemedText>
                Medium, one-off tasks live in the Quests tab — complete them to bank +20.
              </ThemedText>
              <ThemedText>
                XP is earned once and never taken back: un-checking a row won&apos;t refund your
                points.
              </ThemedText>
            </Card>
          </AnimatedRow>

          <AnimatedRow delay={160}>
            <Card style={styles.section}>
              <ThemedText type="smallBold" themeColor="success">
                Log your wins
              </ThemedText>
              <ThemedText>
                In the Wins tab, jot down what went well and take +5, +10 or +15 points for it.
              </ThemedText>
              <ThemedText>
                It&apos;s the fastest way to build momentum — and any win counts as an active day.
              </ThemedText>
            </Card>
          </AnimatedRow>

          <AnimatedRow delay={200}>
            <Card style={styles.section}>
              <ThemedText type="smallBold" themeColor="tint">
                Keep the streak
              </ThemedText>
              <ThemedText>
                Any day you check a routine, finish a quest or milestone, or log a win counts as
                active.
              </ThemedText>
              <ThemedText>
                Missing a full calendar day resets your streak. A today still in progress isn&apos;t
                missed — finish it and it protects the chain.
              </ThemedText>
            </Card>
          </AnimatedRow>

          <AnimatedRow delay={240}>
            <Card style={styles.section}>
              <ThemedView style={styles.levelHeader}>
                <ThemedText type="smallBold" themeColor="gold">
                  Your level
                </ThemedText>
                <ThemedText type="subtitle">
                  {info.level} {info.title}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.levelStats}>
                <ThemedText type="small" themeColor="textSecondary">
                  {state.profile.xp} / {info.next} XP
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {xpToNext} XP to level {info.level + 1}
                </ThemedText>
              </ThemedView>
              <ProgressBar progress={info.progress} height={12} />
            </Card>
          </AnimatedRow>

          <AnimatedRow delay={280}>
            <ThemedView style={styles.ctaRow}>
              <Button
                title="Set up your first routine"
                style={styles.cta}
                onPress={() => router.navigate('/routines')}
              />
              <Button
                title="Add a quest"
                variant="secondary"
                style={styles.cta}
                onPress={() => router.navigate('/list')}
              />
            </ThemedView>
          </AnimatedRow>
        </ScrollView>
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
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  headerSection: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  section: {
    gap: Spacing.two,
  },
  xpTable: {
    marginTop: Spacing.one,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  levelHeader: {
    gap: Spacing.half,
  },
  levelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaRow: {
    gap: Spacing.two,
  },
  cta: {
    width: '100%',
  },
});