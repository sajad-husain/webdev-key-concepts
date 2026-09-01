import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getItem, setItem } from '@/services/storage';

const SCORE_KEY = 'score';

export default function SettingsScreen() {
  const theme = useTheme();
  const [count, setCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getItem<number>(SCORE_KEY, 0).then((value) => {
      setCount(value);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) {
      setItem(SCORE_KEY, count);
    }
  }, [count, hydrated]);

  const adjust = (next: number) => setCount(Math.max(0, next));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.headerSection}>
          <ThemedText type="subtitle">Score today</ThemedText>
          <ThemedText themeColor="textSecondary">
            Life&apos;s a game — keep track of the score.
          </ThemedText>
        </ThemedView>

        <Card style={styles.scoreCard}>
          <ThemedView style={[styles.scoreCircle, { borderColor: theme.border }]}>
            <ThemedText type="title">{count}</ThemedText>
          </ThemedView>
          <ThemedText themeColor="textSecondary" style={styles.scoreLabel}>
            current score
          </ThemedText>

          <ThemedView style={styles.actions}>
            <Button title="– 1" variant="ghost" onPress={() => adjust(count - 1)} />
            <Button title="+ 1" onPress={() => adjust(count + 1)} />
            <Button title="Reset" variant="secondary" onPress={() => adjust(0)} />
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary" style={styles.savedHint}>
            your score is saved on this device
          </ThemedText>
        </Card>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.five,
  },
  headerSection: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  scoreCard: {
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.five,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    textTransform: 'uppercase',
    fontSize: 13,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  savedHint: {
    marginTop: Spacing.two,
  },
});